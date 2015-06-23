var fs = require('fs');
var Redis = require('ioredis');
var Protobuf = require('protocol-buffers');

var ssg15 = require('./globals');
var comm = Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'/cfg/messages.proto'));

module.exports = function (id) {
	this._redis = new Redis();
	this.name = 'Unknown';
	this.id = id;
	this._redisKey = 'player:'+id;
	
	this._data = {
		roomId: 0,
		data: {
			hp: 1000,
			current_lane: 0,
			target: 0,
			time_died: 0, 
			gold: 0,
			active_abilities_bitfield: 0,
			active_abilities: [],
			crit_damage: 0,
			loot: []
		},
		tech: {
			upgrades: [],
			badge_points: 0,
			ability_items: [],
			base_dps: 10,
			max_hp: 1000,
			dps: 10
		}
	};
	
	var instance = this;
	
	this.Flush = function()
	{
		instance._redis.set(instance._redisKey, instance._data);
	};
	
	//check if player exists in redis
	this._redis.get(this._redisKey, function(err, res)
	{
		if(!err)
		{
			if(res !== undefined && res !== null)
			{
				//player exists, copy res to this._data
				console.log('Loading player data...('+instance.id+')');
				instance._data = res;
			}
			else
			{
				//this is a new player, flush the empty player data
				console.log('New player created! ('+instance.id+')');
				instance.Flush();
			}
		}
		else
		{
			console.log(err);
		}
	});
	
	this.JoinRoom = function(room)
	{
		if(instance._data.roomId == 0)
		{
			var rm = ssg15.Rooms[room];
			
			//check there is room... in the room
			if(rm._players.length < ssg15.Config.MaxPlayers)
			{
				//yay! - join le room
				return rm.JoinPlayerToRoom(instance);
			}
		}
		else
		{
			//player is already in a room
			return { msg: 'You are already in a room!', ok: false };
		}
	};
	
	this.HandleMessage = function(msg, cb)
	{
		switch(msg.type){
			case 0:{
				//get game data
				var rm = ssg15.Rooms[instance._data.roomId];
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
					console.log('Room '+instance._data.roomId+' does not exist');
				}
				
				var rsp = comm.CTowerAttack_Response.encode(rsp_d);
				cb(rsp);
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
					
					if(p._roomId == instance._data.roomId){
						rsp_d.GetPlayerNames_Response.push({
							accountid: instance.id,
							name: instance.name
						});
					}
				}
				
				var rsp = comm.CTowerAttack_Response.encode(rsp_d);
				cb(rsp);
				break;
			}
			case 2:{
				//get player data
				var rsp_d = {
					id: msg.id,
					type: msg.type,
					GetPlayerData_Response:{
						player_data: instance._data.data,
						tech_tree: msg.GetPlayerData_Request.include_tech_tree ? instance._data.tech : undefined
					}
				};
				var rsp = comm.CTowerAttack_Response.encode(rsp_d);
				cb(rsp);
				break;
			}
			case 3:{
				//use abilities
				var req = msg.UseAbilities_Request;
				for(var x=0;x<req.requested_abilities.length;x++){
					var ab = req.requested_abilities[x];
					if(ab.ability == comm.ETowerAttackAbility.k_ETowerAttackAbility_ChangeLane){
						instance._data.data.current_lane = ab.new_lane;
					}
				}
				
				//send player data back 
				var rsp_d = {
					id: msg.id,
					type: msg.type,
					UseAbilities_Response:{
						player_data: instance._data.data,
						tech_tree: instance._data.tech
					}
				};
				var rsp = comm.CTowerAttack_Response.encode(rsp_d);
				cb(rsp);
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
	};
};
