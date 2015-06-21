var WebSocketServer = require('websocket').server;
var fs = require('fs');
var http = require('http');
var RDS = require('ioredis');
var redis = new RDS();
var ByteBuffer = require("bytebuffer");
var protobuf = require('protocol-buffers')
var comm = protobuf(fs.readFileSync('../cfg/messages.proto'))
var UUID = require("uuid")
var Room = require('./room.js')

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept();
    connection.session = { 
			name: "Unknown",
			id: UUID.v4(),
			data: {
				hp: undefined,
				current_lane: undefined,
				target: undefined,
				time_died: undefined,
				gold: 0,
				active_abilities_bitfield: undefined,
				active_abilities: [],
				crit_damage: undefined,
				loot: []
			}
	};
	
    console.log((new Date()) + ' Connection accepted.('+request.origin+')');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
        }
        else if (message.type === 'binary') {
            var msg = comm.CTowerAttack_Request.decode(message.binaryData);
            console.log("Got msg: "+msg.id+"/"+msg.type);
            
            switch(msg.type){
				case 0:{
					//get game data
					
					break;
				}
				case 1:{
					//get player names
					var rsp_d = {
						id: msg.id,
						type: msg.type,
						GetPlayerNames_Response: 
							[
								{ id: 1234, name: "Kieran" }
							]
						
					};
					
					var rsp = comm.CTowerAttack_Response.encode(rsp_d);
					connection.sendBytes(rsp.toArrayBuffer());
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
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
