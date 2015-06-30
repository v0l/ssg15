var fs = require('fs');
var Redis = require('ioredis');
var Protobuf = require('protocol-buffers');
var async = require('async');

var Room = require('./room');
var RoomManager = require('./roommanager');
var ssg15 = require('./globals');
var comm = Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'cfg/messages.proto'));

module.exports = function (id) {
	this._redis = new Redis();
	this.id = id;
	this._redisKey = 'player:'+id;

	this._data = {
		roomId: 0,
		steamId: null,
		displayName: null,
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
		instance._redis.set(instance._redisKey, JSON.stringify(instance._data));
	};
	
	this.FlushPipeline = function(p)
	{
		p.set(instance._redisKey, JSON.stringify(instance._data));
	};

	this.Load = function(cb){
		instance._redis.get(instance._redisKey, function(err, res)
		{
			if(!err)
			{
				if(res !== undefined && res !== null)
				{
					instance._data = JSON.parse(res);
				}
				else
				{
					console.log('Player load failed: ' + instance.id);
				}
				 cb();
			}
			else
			{
				console.log(err);
			}
		});
	};

	this.JoinRoom = function(room,cb)
	{
		if(instance._data.roomId == 0)
		{
			RoomManager.GetRoom(room,function(rm){
				if(rm._data.players.length < ssg15.Config.MaxPlayers)
				{
					//yay! - join le room
					rm.JoinPlayerToRoom(instance, function(r){ 
						cb(r);
					});
				}
				else
				{
					cb({ msg: 'This room is full', ok: false });
				}
			});
		}
		else
		{
			//player is already in a room
			cb({ msg: 'You are already in a room!', ok: false });
		}
	};

	this.HandleMessage = function(msg, cb)
	{
		switch(msg.type){
			case 0:{
				//get game data
				RoomManager.GetRoom(instance._data.roomId, function (rm) {
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
						rsp_d.GetGameData_Response.game_data = rm._data.data;
						rsp_d.GetGameData_Response.stats = rm._data.stats;
					}
					else
					{
						console.log('Room '+instance._data.roomId+' does not exist');
					}

					var rsp = comm.CTowerAttack_Response.encode(rsp_d);
					cb(rsp);
				});
				break;
			}
			case 1:{
				//get player names
				RoomManager.GetRoom(instance._data.roomId,function(rm){
					rm.GetPlayerListFull(function(list){
						var rsp_d = {
							id: msg.id,
							type: msg.type,
							GetPlayerNames_Response: [ ]
						};
						
						for(var x=0;x<list.playerlist.length;x++){
							var pl = list.playerlist[x];
							
							rsp_d.GetPlayerNames_Response[rsp_d.GetPlayerNames_Response.length] = { accountid: pl.steamId, name: pl.displayName };
						}
						
						var rsp = comm.CTowerAttack_Response.encode(rsp_d);
						cb(rsp);
					});
				});
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
					switch(ab.ability){
						case comm.ETowerAttackAbility.k_ETowerAttackAbility_ChangeLane: {
							instance._data.data.current_lane = ab.new_lane;
							break;
						}
						case comm.ETowerAttackAbility.k_ETowerAttackAbility_Attack: {
							RoomManager.GetRoom(instance._data.roomId,function(rm){
								rm.ProcessAbility(instance, ab);
							});
							break;
						}
						case comm.ETowerAttackAbility.k_ETowerAttackAbility_ChangeTarget: {
							console.log("Change target!");
							break;
						}
						default: {
							console.log(req);
						}
					}
				}

				//send player data back
				instance.Flush();
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
