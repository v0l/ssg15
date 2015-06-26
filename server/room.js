var fs = require('fs');
var Redis = require('ioredis');
var Protobuf = require('protocol-buffers');
var UUID = require('UUID');
var async = require('async');

var ssg15 = require('./globals');
var comm = Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'cfg/messages.proto'));

module.exports = function (id) {
	this._redis = new Redis();
	this._redisKey = function() { return 'room:'+this._data.id; };
	
	//set room object to defaults
	this._data = {
		roomId: id,
		data: {
			level: 0,
			enemyIndex: 0,
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
		instance._redis.set(instance._redisKey(), JSON.stringify(instance._data));
	};
	
	this.FlushPipeline = function(p)
	{
		p.set(instance._redisKey(), JSON.stringify(instance._data));
	};
	
	this.Load = function(cb){
		instance._redis.get(instance._redisKey(), function(err, res)
		{
			if(!err)
			{
				if(res !== undefined && res !== null)
				{
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
		if(instance._data.roomId !== 0)
		{
			if(instance._data.data.status == comm.EMiniGameStatus.k_EMiniGameStatus_Invalid){
				instance._data.data.status = comm.EMiniGameStatus.k_EMiniGameStatus_Running;
				instance._data.data.level = 1;
			}
			player._data.roomId = instance._data.roomId;
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
		var rm = instance.GetPlayerListBasic();
		var cmds = [];
		
		for(var x=0;x<rm.length;x++)
		{
			cmds.push(['get', 'player:'+rm[x]]);
		}
		
		if(cmds.length > 0)
		{
			instance._redis.pipeline(cmds).exec(function(err, result){

				var out = {
					timestamp: new Date().getTime(),
					info: instance._data,
					playerlist: []
				};
				
				for(var x=0;x<result.length;x++)
				{
					var rm_id = result[x];
					
					if(!rm[0]){
						out.playerlist[out.playerlist.length] = JSON.parse(rm_id[1]);
					}
				}

				cb(out);
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
		instance.Flush();
	};

	this.Tick = function() 
	{
		//console.log("Room Tick");
		//instance.Flush();
	};

	// Spawn functions
	this.GetNewEntityID = function() {
		instance._data.enemyIndex++;
		return instance._data.enemyIndex;
	}

	this.SpawnLane = function (lane) {
		var level = instance._data.data.level;

		// Boss wave
		if (level % 10 == 0) {

		} 
		else {
			//addspawner and 3 random types
			async.parallel([
				function() { instance.SpawnEnemy(0, comm.ETowerAttackEnemyType.k_ETowerAttackEnemyType_Tower); },
				function() { instance.SpawnEnemy(1, comm.ETowerAttackEnemyType.k_ETowerAttackEnemyType_Tower); },
				function() { instance.SpawnEnemy(2, comm.ETowerAttackEnemyType.k_ETowerAttackEnemyType_Tower); }
			]);
		}
	};

	this.NextLevel = function(cb) {
		//clear lanes
		var lane1 = instance._data.data.lanes[0];
		var lane2 = instance._data.data.lanes[1];
		var lane3 = instance._data.data.lanes[2];
		
		lane1.dps = lane2.dps = lane3.dps = 0;
		lane1.enemies = [];
		lane2.enemies = [];
		lane3.enemies = [];

		lane1.active_player_abilities = [];
		lane2.active_player_abilities = [];
		lane3.active_player_abilities = [];

		instance._data.data.level++;
		
		instance.SpawnLane(0);
		instance.SpawnLane(1);
		instance.SpawnLane(2);

		instance.Flush();
	};
	
	this.SpawnEnemy = function (lane, enemy) {
		var enemyData = {
			id: instance.GetNewEntityID(),
			type: enemy,
			hp: 120000,
			max_hp: 1200000,
			dps: 10,
			timer: 0,
			gold: 999
		};
		
		var e = instance._data.data.lanes[lane];
		instance._data.data.lanes[lane].element = comm.ETowerAttackElement.k_ETowerAttackElement_Fire;
		
		if(instance._data.data.lanes[lane].enemies.length >= 3){
			instance._data.data.lanes[lane].enemies[instance._data.data.lanes[lane].enemies.length] = enemyData;
			console.log("Spawned Enemy");
		}else{
			console.log(instance._data.data.lanes[lane].enemies[0]);
			console.log("this lane is already full of mobs");
		}
	};
};
module.exports.GetAll = function(cb){
	var redis = new Redis();

	redis.keys('room*', function(err, result){
		if(!err)
		{
			var cmd = [];
			for(var x=0;x<result.length;x++)
			{
				cmd[x] = ['get', result[x]];
			}
			
			redis.pipeline(cmd).exec(function(e, res){
				var out = {
					timestamp: new Date().getTime(),
					roomlist: []
				};
				for(var x=0;x<res.length;x++){
					var rm = JSON.parse(res[x][1]);
					
					if(rm !== null && rm !== undefined){
						out.roomlist[out.roomlist.length] = rm;
					}
				}
				
				cb(out);
			});
		}
		else
		{
			console.log('Failed to get room list: '+err);
		}
	});
};

