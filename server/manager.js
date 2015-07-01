var async = require('async');

var Room = require('./room');
var Player = require('./player');

var _r = []; //Room list
var _p = []; //Player list

module.exports.GetRoom = function(id, cb){
	if(id !== null && id !== undefined && id != 0){
		var str_id = ''+id;
		if(_r[str_id] === undefined || _r[str_id] === null){
			var nr = new Room(id);
			nr.Load(function() {
				_r[str_id] = nr;
				cb(_r[str_id]);
			});
		}else{
			cb(_r[str_id]);
		}
	}else{
		return cb(undefined);
	}
};

module.exports.StartTicker = function(){
	setInterval(function() {
		async.each(_r,function(a, cb){
			if(a !== undefined){
				a.Tick();
			}
			cb();
		});
	},1000);
};


module.exports.GetPlayer = function(id, cb){
	if(id !== null && id !== undefined && id != 0){
		var str_id = ''+id;
		if(_p[str_id] === undefined || _p[str_id] === null){
			var nr = new Player(id);
			nr.Load(function() {
				_p[str_id] = nr;
				cb(_p[str_id]);
			});
		}else{
			cb(_p[str_id]);
		}
	}else{
		return cb(undefined);
	}
};


module.exports.GetAllRooms = function(cb){
	global.redis.keys('room*', function(err, result){
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
