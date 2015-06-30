var fs = require('fs');
var Redis = require('ioredis');
var Protobuf = require('protocol-buffers');
var Long = require("long");

var ssg15 = require('./globals');
var comm = Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'cfg/messages.proto'));

module.exports = function (id) {
	this._redis = new Redis();
	this._redisKey = function() { return 'room:'+instance._data.roomId; };
	
	//set room object to defaults
	this._data = {
		roomId: id,
		enemyIndex: 0,
		data: {
			level: 0,
			lanes: [],
			timestamp: new Date().getTime() / 1000,
			status: comm.EMiniGameStatus.k_EMiniGameStatus_Invalid,
			events: [],
			timestamp_game_start: new Date().getTime() / 1000,
			timestamp_level_start: new Date().getTime() / 1000
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
			console.log(instance._data.roomId);
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
					timestamp: new Date().getTime() / 1000,
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
	
	this.ProcessAbility = function(player, ab) 
	{
		switch(ab.ability){
			case comm.ETowerAttackAbility.k_ETowerAttackAbility_Attack: {
				//apply base dps to players lane
				var l = instance._data.data.lanes[player._data.data.current_lane];
				if(l !== null && l !== undefined){
					for(var x=0;x<l.enemies.length;x++){
						var e = l.enemies[x];
						var dps = (player._data.tech.dps * ab.num_clicks);
						e.hp -= dps;
					}
				}else{
					console.log('Unknown player lane');
				}
				break;
			}
			default: {
				console.log(req);
			}
		}
					
		instance.Flush();
	};
	
	this.lastTick = 0;
	
	this.Tick = function() 
	{
		var now = new Date().getTime();
		if((now - instance.lastTick) >= 1000){
			instance.lastTick = now;
			instance._data.data.timestamp = now / 1000;
			
			//remove dead enemies
			for(var z=0;z<instance._data.data.lanes.length;z++){
				var l = instance._data.data.lanes[z];
			
				for(var x=0;x<l.enemies.length;x++){
					var e = l.enemies[x];
					if(e.hp <= 0){
						l.enemies.splice(x,1);
					}
				}
			}
			
			//check if all lanes are empty
			if(instance._data.data.lanes.length == 0 && instance._data.data.level == 0)
			{
				instance.InitRoom();
			}
			else if(instance._data.data.lanes[0].enemies.length == 0 && instance._data.data.lanes[1].enemies.length == 0 && instance._data.data.lanes[2].enemies.length == 0)
			{
				instance.NextLevel();
			}
			else
			{

			}		
			
			instance.Flush();
		}
	};

	// Spawn functions
	this.GetNewEntityID = function() {
		instance._data.enemyIndex++;
		return instance._data.enemyIndex;
	}

	this.CreateLane = function(bosslane){
		var l = {
			enemies: [],
			dps: 0,
			gold_dropped: 0,
			active_player_abilities: [],
			player_hp_buckets: [],
			element: comm.ETowerAttackElement.k_ETowerAttackElement_Invalid
		};
		
		if((instance._data.data.level + 1) % 100 == 0 && bosslane) //boss level
		{
			l.enemies[0] = instance.CreateEnemy(comm.ETowerAttackEnemyType.k_ETowerAttackEnemyType_Boss);
		}
		else
		{
			l.enemies[0] = instance.CreateEnemy(comm.ETowerAttackEnemyType.k_ETowerAttackEnemyType_Tower);
			l.enemies[1] = instance.CreateEnemy(comm.ETowerAttackEnemyType.k_ETowerAttackEnemyType_Mob);
			l.enemies[2] = instance.CreateEnemy(comm.ETowerAttackEnemyType.k_ETowerAttackEnemyType_Mob);
			l.enemies[3] = instance.CreateEnemy(comm.ETowerAttackEnemyType.k_ETowerAttackEnemyType_Mob);
		}

		return l;
	}
	
	this.CreateEnemy = function(t){
		var e = {
			id: instance.GetNewEntityID(),
			type: t,
			hp: 120,
			max_hp: 120,
			dps: 10,
			timer: 0,
			gold: 999
		};
		
		console.log(e);
		return e;
	}

	this.InitRoom = function()
	{
		instance._data.data.status = comm.EMiniGameStatus.k_EMiniGameStatus_Running;
		
		instance._data.data.lanes = [];
		instance._data.data.lanes[0] = instance.CreateLane(false);
		instance._data.data.lanes[1] = instance.CreateLane(false);
		instance._data.data.lanes[2] = instance.CreateLane(false);
	}
	
	this.NextLevel = function() {
		//clear lanes
		instance._data.data.lanes = [];

		instance._data.data.level++;
		instance._data.data.timestamp_level_start = new Date().getTime() / 1000;
		
		instance._data.data.lanes[0] = instance.CreateLane(false);
		instance._data.data.lanes[1] = instance.CreateLane(false);
		instance._data.data.lanes[2] = instance.CreateLane(false);
	};
	
	this.SpawnEnemy = function (lane, enemy) {
		var enemyData = {
			id: 999,
			type: enemy,
			hp: 100,
			max_hp: 100,
			dps: 10,
			timer: 0,
			gold: 999
		};
			
		var e = instance._data.data.lanes[lane];

		e.element = comm.ETowerAttackElement.k_ETowerAttackElement_Fire;
		
		if(e.enemies.length >= 3){
			e.enemies[e.enemies.length] = enemyData;
			console.log("Spawned Enemy");
		}else{
			console.log(e.enemies[0]);
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

