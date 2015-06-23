module.exports = function (id) {
	this._redis = new ssg15.Redis();
	this._roomID = id;
	this._redisKey = 'room:'+id;
	this._redisStatsKey = 'roomstats:'+id;
	this._players = []; //Player ids only
	
	//set room object to defaults
	this._data = {
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
	};

	this._stats = {
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
	};

	var instance = this;
	
	this.Flush = function()
	{
		var pipe = instance._redis.pipeline();
		pipe.set(instance._redisKey, instance._data);
		pipe.set(instance._redisStatsKey, instance._stats);
		
		pipe.exec(function (err, res){ }); //TODO: add some error checking
	};
	
	//check if the room exists
	this._redis.get(this._redisKey, function(err, res)
	{
		if(!err)
		{
			if(res !== undefined && res !== null)
			{
				//room exists, copy res to this._data
				console.log('Loading room data...('+instance._roomID+')');
				instance._data = res;
				
				//load room stats also
				instance._redis.get(instance._redisStatsKey, function(er, res)
				{
					if(!er)
					{
						instance._stats = res;
					}
				});
			}
			else
			{
				//this is a new room, flush the empty game data
				console.log('New room created! ('+instance._roomID+')');
				instance.Flush();
			}
		}
		else
		{
			console.log(err);
		}
	});

	this.HandlePlayerMessage = function(playerData, Message) 
	{
		
		instance._Flush();
	};

	this.Tick = function(deltaTime) 
	{

		instance._Flush();
	};
};
