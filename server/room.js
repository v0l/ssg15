var ssg15 = require('./globals');
var Redis = require('ioredis');

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
		instance._redis.set(instance._redisKey, instance._data);
	};
	
	//check if the room exists
	this._redis.get(this._redisKey, function(err, res)
	{
		if(!err)
		{
			if(res !== undefined && res !== null)
			{
				//room exists, copy res to this._data
				console.log('Loading room data...('+instance._roomId+')');
				instance._data = res;
			}
			else
			{
				//this is a new room, flush the empty game data
				console.log('New room created! ('+instance._roomId+')');
				instance.Flush();
			}
		}
		else
		{
			console.log(err);
		}
	});

	this.JoinPlayerToRoom = function(player)
	{
		if(instance._roomId !== 0)
		{
			//am i real?
			if(ssg15.Rooms[instance._roomId] !== undefined)
			{
				instance._data.players.push(player.id);
				return { msg: null, ok: true };
			}
		}
		return { msg: 'You cant join a null room', ok: false };
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
