var fs = require('fs');
var Protobuf = require('protocol-buffers');
var async = require('async');

var T = require('./tuningdata');
var M = require('./manager');
var ssg15 = require('./globals');
var comm = Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'cfg/messages.proto'));

var _player = function (id) {
	this.id = id;
	this._redisKey = 'player:'+id;

	this._data = {
		roomId: 0,
		steamId: null,
		displayName: null,
		data: {
			hp: T.player.hp,
			current_lane: 0,
			target: 0,
			time_died: 0,
			gold: 0,
			active_abilities_bitfield: 0,
			active_abilities: [],
			crit_damage: 0,
			damage_multiplier_fire: T.player.damage_multiplier_fire,
			damage_multiplier_water: T.player.damage_multiplier_water,
			damage_multiplier_air: T.player.damage_multiplier_air,
			damage_multiplier_earth: T.player.damage_multiplier_earth,
			damage_multiplier_crit: T.player.damage_multiplier_crit,
			crit_percentage: T.player.crit_percentage,
			loot: []
		},
		tech: {
			upgrades: [],
			badge_points: 0,
			ability_items: [],
			base_dps: 2,
			max_hp: T.player.hp,
			damage_per_click: T.player.damage_per_click,
			dps: T.player.dps
		}
	};
	
	var instance = this;
		
	this.Flush = function()
	{
		global.redis.set(instance._redisKey, JSON.stringify(instance._data));
	};
	
	this.FlushPipeline = function(p)
	{
		p.set(instance._redisKey, JSON.stringify(instance._data));
	};
	
	this.AddGold = function(g) {
		instance._data.data.gold += g;
		instance.Flush();
	};

	this.UpdateStats = function() {
		//calc click damage type 2
		instance._data.tech.damage_per_click = T.player.damage_per_click; //reset to base
		instance._data.tech.max_hp = T.player.hp; //reset to base
		
		for(var x=0;x<instance._data.tech.upgrades.length;x++){
			var u = instance._data.tech.upgrades[x];
			var u_t = T.upgrades[u.upgrade];
			
			if(u_t.type == 2){
				instance._data.tech.damage_per_click = instance._data.tech.damage_per_click * (u_t.multiplier * (1 + u.level));
			}else if(u_t.type == 0){
				instance._data.data.hp = instance._data.tech.max_hp = instance._data.tech.max_hp * (u_t.multiplier * (1 + u.level));
			}
		}
	}
	
	this.Load = function(cb){
		global.redis.get(instance._redisKey, function(err, res)
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
			M.GetRoom(room,function(rm){
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
	
	this.BuyUpgrade = function(id){
		var up = T.upgrades[id];
		
		//check if upgrade exists in list
		var hadUpgrade = false;
		for(var x=0;x<instance._data.tech.upgrades.length;x++){
			var u = instance._data.tech.upgrades[x];

			if(u.upgrade === id){
				//check if we have enough money
				var next_cost = T.CalcCost(up.cost, up.cost_exponential_base, u.level);
				if(next_cost <= instance._data.data.gold){
					instance._data.data.gold -= next_cost;
					u.level++;
				}

				hadUpgrade = true;
				break;
			}
		}
		
		if(!hadUpgrade){
			var upg = {
				upgrade: id,
				level: 0
			};
			var next_cost = T.CalcCost(up.cost, up.cost_exponential_base, upg.level);
			if(next_cost <= instance._data.data.gold){
				instance._data.data.gold -= next_cost;
				upg.level++;
			}
			
			instance._data.tech.upgrades[instance._data.tech.upgrades.length] = upg;
		}
		
		instance.UpdateStats();
	}
	
	this.HandleMessage = function(msg, cb)
	{
		switch(msg.type){
			case 0:{
				//get game data
				M.GetRoom(instance._data.roomId, function (rm) {
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
				M.GetRoom(instance._data.roomId,function(rm){
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
							M.GetRoom(instance._data.roomId,function(rm){
								rm.ProcessAbility(instance, ab);
							});
							break;
						}
						case comm.ETowerAttackAbility.k_ETowerAttackAbility_ChangeTarget: {
							instance._data.data.target = ab.new_target;
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
				for(var x=0;x<msg.ChooseUpgrade_Request.upgrades.length;x++){
					var u = msg.ChooseUpgrade_Request.upgrades[x];
					instance.BuyUpgrade(u);
				}
				
				instance.Flush();
				var rsp_d = {
					id: msg.id,
					type: msg.type,
					ChooseUpgrade_Response:{
						player_data: instance._data.data,
						tech_tree: instance._data.tech
					}
				};
				var rsp = comm.CTowerAttack_Response.encode(rsp_d);
				cb(rsp);
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

module.exports = _player;
