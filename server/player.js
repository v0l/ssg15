var Redis = require('ioredis');

module.exports = function (id) {
	this._redis = new Redis();
	this.name = 'Unknown';
	this.id = id;
	this._roomId = 0;
	this._redisKey = 'player:'+id;
	
	this._data = {
		hp: 1000,
		current_lane: 0,
		target: 0,
		time_died: 0,
		gold: 0,
		active_abilities_bitfield: 0,
		active_abilities: [],
		crit_damage: 0,
		loot: []
	};
	
	this._tech = {
		upgrades: [],
		badge_points: 0,
		ability_items: [],
		base_dps: 10,
		max_hp: 1000,
		dps: 10
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
		
	};
};
