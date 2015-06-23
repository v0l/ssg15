var fs = require('fs');
var http = require('http');

var Redis = require('ioredis');
var ByteBuffer = require("bytebuffer");
var Protobuf = require('protocol-buffers');
var UUID = require("uuid");
var NodeStatic = require("node-static");
var WebSocketServer = require('websocket').server;

var Room = require('./room');
var Player = require('./player');
var ssg15 = require('./globals');
var comm = Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'/cfg/messages.proto'));

// Have a local file server and other things when testing
var fileServer = null;
if (ssg15.Config.Enviroment == "dev") 
{
	fileServer = new NodeStatic.Server(ssg15.Config.PublicDir, {cache: false });
}

var server = http.createServer(function(request, response) 
{
	if (ssg15.Config.Enviroment == "dev") 
	{
    	fileServer.serve(request, response);
    }
    else
    {
		response.writeHead(404);
		response.end();
	}
});
server.listen(8080, function() 
{
    console.log((new Date()) + ' Server is listening on port 8080' + (ssg15.Config.Enviroment == "dev" ? " (dev mode)" : ""));
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) 
{
  return true;
}
 
wsServer.on('request', function(request) 
{
    if (!originIsAllowed(request.origin)) 
    {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept();
    connection.session = {
		id: UUID.v4()
	};
	
	var npl = new Player(connection.session.id);
	ssg15.Players[connection.session.id] = npl;
	
    console.log((new Date()) + ' Connection accepted.('+request.origin+')');
    connection.on('message', function(message) {

        if (message.type === 'utf8') 
        {
            console.log('Received Message: ' + message.utf8Data);
        }
        else if (message.type === 'binary') 
        {
            var msg = comm.CTowerAttack_Request.decode(message.binaryData);
            console.log('Got msg: '+msg.id+'-'+msg.type+' ('+connection.session.id+')');
            
            //get player object 
            var pl = ssg15.Players[connection.session.id];
            
            if(pl == undefined)
            {
				console.log('Server error, player data is null!');
			}
			else
			{
				switch(msg.type){
					case 0:{
						//get game data
						var rm = ssg15.Rooms[pl._roomId];
						var rsp_d = {
							id: msg.id,
							type: msg.type,
							GetGameData_Response: {
								game_data: null,
								stats: null
							}						
						};
						
						if(rm !== undefined)
						{
							rsp_d.GetGameData_Response.game_data = rm._data;
							rsp_d.GetGameData_Response.stats = rm._stats;
						}
						else
						{
							console.log('Room '+pl._roomId+' does not exist');
						}
						
						var rsp = comm.CTowerAttack_Response.encode(rsp_d);
						connection.sendBytes(rsp);
						break;
					}
					case 1:{
						//get player names
						var rsp_d = {
							id: msg.id,
							type: msg.type,
							GetPlayerNames_Response: [ ]
						};
						
						for(var x=0;x<ssg15.Players.length;x++){
							var p = ssg15.Players[x];
							
							if(p._roomId == pl._roomId){
								rsp_d.GetPlayerNames_Response.push({
									accountid: pl.id,
									name: pl.name
								});
							}
						}
						
						var rsp = comm.CTowerAttack_Response.encode(rsp_d);
						connection.sendBytes(rsp);
						break;
					}
					case 2:{
						//get player data
						var rsp_d = {
							id: msg.id,
							type: msg.type,
							GetPlayerData_Response:{
								player_data: connection.session.data,
								tech_tree: msg.GetPlayerData_Request.include_tech_tree ? connection.session.tech_tree : undefined
							}
						};
						var rsp = comm.CTowerAttack_Response.encode(rsp_d);
						connection.sendBytes(rsp);
						break;
					}
					case 3:{
						//use abilities
						var req = msg.UseAbilities_Request;
						for(var x=0;x<req.requested_abilities.length;x++){
							var ab = req.requested_abilities[x];
							if(ab.ability == comm.ETowerAttackAbility.k_ETowerAttackAbility_ChangeLane){
								pl._data.current_lane = ab.new_lane;
							}
						}
						
						//send player data back 
						var rsp_d = {
							id: msg.id,
							type: msg.type,
							UseAbilities_Response:{
								player_data: pl._data,
								tech_tree: pl._tech
							}
						};
						var rsp = comm.CTowerAttack_Response.encode(rsp_d);
						connection.sendBytes(rsp);
						break;
					}
					case 4:{
						//choose upgrade
						
						break;
					}
					case 5:{
						//get tuning data
						
						break;
					}
					case 6:{
						//get daily stats rollup
						
						break;	
					}
					case 7:{
						//handle game event
						break;
					}
					case 8:{
						//use badge points
						
						break;
					}
					case 9:{
						//quit game
						
						break;
					}
					default:{
						console.log("Unknown type: "+msg.type);
						break;
					}
				}
			}
        }
    });
    connection.on('close', function(reasonCode, description) 
    {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
