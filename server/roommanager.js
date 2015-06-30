var async = require('async');
var Room = require('./room').Room;
var _r = [];

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
