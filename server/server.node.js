var ssg15 = require('./globals.js');
var WebSocketServer = require('websocket').server;
var fs = require('fs');
var http = require('http');
var comm = ssg15.Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'/cfg/messages.proto'));

// Have a local file server and other things when testing
var fileServer = null;
if (ssg15.Config.Enviroment == "dev") {
	fileServer = new ssg15.NodeStatic.Server(ssg15.Config.PublicDir, {cache: false });
}

var server = http.createServer(function(request, response) {
	if (ssg15.Config.Enviroment == "dev") {
    	fileServer.serve(request, response);
    }else{
		response.writeHead(404);
		response.end();
	}
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080' + (ssg15.Config.Enviroment == "dev" ? " (dev mode)" : ""));
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
			id: ssg15.UUID.v4(),
			data: {
				hp: 1000,
				current_lane: 0,
				target: undefined,
				time_died: undefined,
				gold: 69,
				active_abilities_bitfield: undefined,
				active_abilities: [],
				crit_damage: 0,
				loot: []
			},
			tech_tree: {
				upgrades: [],
				badge_points: 0,
				ability_items: [],
				base_dps: 10,
				max_hp: 1000,
				dps: 10
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
					var rsp_d = {
						id: msg.id,
						type: msg.type,
						GetGameData_Response: {
							game_data: {
								level: 1,
								lanes: [
									{
										enemies: [],
										dps: 0,
										gold_dropped: 0,
										active_player_abilities: [],
										player_hp_buckets: [],
										element: comm.ETowerAttackElement.Fire
									}, 
									{
										enemies: [
										{
											id: 1,
											type: comm.ETowerAttackEnemyType.k_ETowerAttackEnemyType_Tower,
											hp: 120000,
											max_hp: 1200000,
											dps: 10,
											timer: 0,
											gold: 999
										}],
										dps: 0,
										gold_dropped: 0,
										active_player_abilities: [],
										player_hp_buckets: [],
										element: comm.ETowerAttackElement.Fire
									}, 
									{
										enemies: [],
										dps: 0,
										gold_dropped: 0,
										active_player_abilities: [],
										player_hp_buckets: [],
										element: comm.ETowerAttackElement.Fire
									}
								],
								timestamp: new Date().getTime(),
								status: comm.EMiniGameStatus.k_EMiniGameStatus_Running,
								events: [],
								timestamp_game_start: new Date().getTime() - 9000,
								timestamp_level_start: new Date().getTime()
							},
							stats:{
								num_players: 69,
								num_mobs_killed: 0,
								num_towers_killed: 0,
								num_minibosses_killed: 0,
								num_bosses_killed: 0,
								num_clicks: 0,
								num_abilities_activated: 0,
								num_players_reaching_milestone_level: 0,
								num_ability_items_activated: 0,
								num_active_players: 1,
								time_simulating: 0,
								time_saving: 0
							}
						}						
					};
					
					var rsp = comm.CTowerAttack_Response.encode(rsp_d);
					connection.sendBytes(rsp);
					break;
				}
				case 1:{
					//get player names
					var rsp_d = {
						id: msg.id,
						type: msg.type,
						GetPlayerNames_Response: 
							[
								{ accountid: 1234, name: "Kieran" }
							]
						
					};
					
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
							connection.session.data.current_lane = ab.new_lane;
							console.log("New lane is: " + ab.new_lane);
						}
					}
					
					//send player data back
					var rsp_d = {
						id: msg.id,
						type: msg.type,
						UseAbilities_Response:{
							player_data: connection.session.data,
							tech_tree: connection.session.tech_tree
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
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
