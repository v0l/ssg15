var fs = require('fs');
var Redis = require('ioredis');
var Protobuf = require('protocol-buffers');

var ssg15 = require('./globals');
var comm = Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'cfg/messages.proto'));

module.exports = function (id) {
	this._redis = new Redis();
	this._roomId = id;
	this._redisKey = 'room:'+id;
	
	//set room object to defaults
	this._data = {
		data: {
			level: 0,
			lanes: [
				{
					enemies: [], 
					dps: 0,
					gold_dropped: 0,
					active_player_abilities: [],
					player_hp_buckets: [],
					element: comm.ETowerAttackElement.k_ETowerAttackElement_Invalid
				}, 
				{
					enemies: [],
					dps: 0,
					gold_dropped: 0,
					active_player_abilities: [],
					player_hp_buckets: [],
					element: comm.ETowerAttackElement.k_ETowerAttackElement_Invalid
				}, 
				{
					enemies: [],
					dps: 0,
					gold_dropped: 0,
					active_player_abilities: [],
					player_hp_buckets: [],
					element: comm.ETowerAttackElement.k_ETowerAttackElement_Invalid
				}
			],
			timestamp: new Date().getTime(),
			status: comm.EMiniGameStatus.k_EMiniGameStatus_Invalid,
			events: [],
			timestamp_game_start: new Date().getTime(),
			timestamp_level_start: new Date().getTime()
		},
		stats: {
			num_players: 0,
			num_mobs_killed: 0,
			num_towers_killed: 0,
			num_minibosses_killed: 0,
			num_bosses_killed: 0,
			num_clicks: 0,
			num_abilities_activated: 0,
			num_players_reaching_milestone_level: 0,
			num_ability_items_activated: 0,
			num_active_players: 0,
			time_simulating: 0,
			time_saving: 0
		},
		players: []
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
		this._redis.get(this._redisKey, function(err, res)
		{
			if(!err)
			{
				if(res !== undefined && res !== null)
				{
					//room exists, copy res to this._data
					console.log('Loading room data...('+instance._roomId+')');
					console.log(res);
					instance._data = JSON.parse(res);
				}
				cb();
			}
			else
			{
				console.log(err);
			}
		});
	};
	
	this.JoinPlayerToRoom = function(player, cb)
	{
		if(instance._roomId !== 0)
		{
			if(instance._data.data.status == comm.EMiniGameStatus.k_EMiniGameStatus_Invalid){
				instance._data.data.status = comm.EMiniGameStatus.k_EMiniGameStatus_WaitingForPlayers;
				instance._data.data.level = 1;
			}
			player._data.roomId = instance._roomId;
			instance._data.players.push(player.id);
			instance._data.stats.num_players = instance._data.players.length;
			
			var p = instance._redis.pipeline();
			
			instance.FlushPipeline(p);
			player.FlushPipeline(p);
			
			p.exec(function(err, results) {
				var rooms = results[0];
				var pls = results[1];
				
				if(rooms[0]){
					cb({ msg: '[ERROR] Room flush failed, data is corrupted', ok: false });
				}
				if(pls[0]){
					cb({ msg: '[ERROR] Player flush failed, data is corrupted', ok: false })
				}
				if(!rooms[0] && !pls[0])
				{
					cb({msg: null, ok: true });
				}
				
			});
		}
		else
		{
			cb({ msg: 'You cant join a null room', ok: false });
		}
	};
	
	this.GetPlayerListBasic = function()
	{
		return instance._data.players;
	};
	
	this.GetPlayerListFull = function (cb)
	{
		var rm = this.GetPlayerListBasic();
		var out = {
			timestamp: new Date().getTime(),
			info: instance._data,
			playerlist: []
		};
		
		var cmds = [];
		
		for(var x=0;x<rm.length;x++)
		{
			cmds.push(['get', 'player:'+rm[x]]);
		}
		
		if(cmds.length > 0)
		{
			instance._redis.pipeline(cmds).exec(function(err, result){
				for(var x=0;x<result.length;x++)
				{
					var rm_id = result[x];
					
					if(!rm[0]){
						rds.get(rm_id, function(er, res) {
							if(!er)
							{
								out.playerlist.push(res);
							}
						});
					}
				}
				
				if(cb !== undefined)
				{
					cb(out);
				}
			});	
		}
		else
		{
			if(cb !== undefined)
			{
				cb(out);
			}
		}
	};
	
	this.HandlePlayerMessage = function(playerData, Message) 
	{
		
		instance._Flush();
	};

	this.Tick = function(deltaTime) 
	{

		instance._Flush();
	};
};
module.exports.GetAll = function(cb){
	var redis = new Redis();

	redis.keys('room*', function(err, result){
		if(!err)
		{
			var out = {
				timestamp: new Date().getTime(),
				roomlist: []
			};
			
			for(var x=0;x<result.length;x++)
			{
				var rm_id = result[x].split(':')[1];
				var rm = new module.exports(rm_id);
				var data = rm._data;
				data.id = rm_id;
				out.roomlist[out.roomlist.length] = data;
			}
			
			if(cb !== undefined)
			{
				cb(out);
			}
		}
		else
		{
			console.log('Failed to get room list: '+err);
		}
	});
};

