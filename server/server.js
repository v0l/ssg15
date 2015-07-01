var fs = require('fs');
var http = require('http');

var Redis = require('ioredis');
var UUID = require('uuid');
var Protobuf = require('protocol-buffers');
var express = require("express");
var exphbs = require('express-handlebars');
var WebSocketServer = require("ws").Server;
var passport = require('passport');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var M = require('./manager');
var ssg15 = require('./globals');
var hbHelpers = require('./views/helpers');
var expressGlobals = require('./express.global');
var comm = Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'cfg/messages.proto'));
var app = express();
var SteamStrategy = require('passport-steam').Strategy;

global.redis = new Redis();

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var ss_opt = {
	returnURL: ssg15.Config.getUrl()+'auth/steam/return',
	realm: ssg15.Config.getUrl(),
	apiKey: ssg15.Config.SteamAPIKey
};

passport.use(new SteamStrategy(ss_opt, function(id, pro, done) {
	process.nextTick(function() { pro.identifier = id; return done(null, pro); });
}));

//middlewear
app.use(expressGlobals.globals);
app.use(express.static(ssg15.Config.PublicDir));

app.use(session({ genid: function(req) {  return UUID.v4() }, store: new RedisStore, secret: 'PRIASE-EMU-SENPAI' }));
app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers: hbHelpers }));
app.set('view engine', 'handlebars');

var routes = {
	game: new require('./views/game')(app)
};

app.get('/',ensureAuthenticated, function(req, res) {
	res.redirect('/Towerattack');
});

app.get('/TowerAttack', ensureAuthenticated, function(req, res) {
	M.GetPlayer(req.user.steamId, function (pl) {
		if(pl !== null){
			M.GetRoom(pl._data.roomId, function(rm){
				res.render('game', { user: req.user, room: rm, player: pl });
			});
		}else{
			res.redirect('/lobby');
		}
	});
});

app.get('/login', function(req, res) {
	res.render('login');
});

app.get('/lobby', ensureAuthenticated, function(req, res) {
	M.GetPlayer(req.user.steamId, function(pl) {
		if(pl !== undefined){
			M.GetRoom(pl._data.roomId,function(rm){
				res.render('lobby', { user: req.user, room: rm, player: pl });
			});
		}else{
			res.render('lobby', { user: req.user, room: null, player: null });
		}
	});
});

app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/login#failed' }), function(req, res) {
	res.redirect('/lobby');
});
  
app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/login#failed' }), function(req, res) {
	//check player exists in redis
	M.GetPlayer(req.user.id, function(pl) {
		pl._data.displayName = req.user.displayName;
		pl._data.steamId = req.user.id;
		pl.Flush();
		
		res.cookie('st.id',req.user.id, { httpOnly: true });

		// Add some info to the session
		if (!req.session.user) {
			req.session.user = {};
		}
		req.session.user.displayName = req.user.displayName;
		req.session.user._json = req.user._json;
		
		res.redirect('/lobby');
	});
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/login');
});

app.get('/data/rooms', function(req, res){
	M.GetAllRooms(function(data) {
		res.json(data);	
	});
});

app.get('/data/joinroom/:id',ensureAuthenticated, function(req, res) {
	M.GetPlayer(req.user.id, function(pl) {
		pl.JoinRoom(req.params.id, function(r) {
			if(!r.ok)
			{
				console.log(r.msg);
			}
			res.json(r);
		});
	});
});

app.get('/data/:room/players', function(req, res){
	M.GetRoom(req.params.room, function(rm) {
		rm.GetPlayerListFull(function(data){
			res.json(data);
		});
	});
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login')
}

var server = app.listen(8080, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('ssg15'+(ssg15.Config.Env == 'dev' ? '-dev' : '')+' app listening at http://%s:%s', host, port);

	M.StartTicker();
});

var ws = new WebSocketServer({
    server: server,
    path: '/ws'
});

ws.on('connection', function(ws) {
	var sid = 0;
	if(ws.upgradeReq.headers.cookie !== undefined)
	{ 
		var cookies = ws.upgradeReq.headers.cookie.split(';');
		for(var x=0;x<cookies.length;x++)
		{
			var cookie = cookies[x];
		
			var csplit = cookie.split('=');
			
			if(csplit[0].indexOf("st.id") >= 0) //TODO: probably not a good idea better to trim leading spaces or client can send fake session cookies ie. fake.ssg.session='token'
			{
				sid = csplit[1];
			}
		}
	}
	ws.session = {
		id: sid
	};
	
	ws.on('message', function (data, flags) {
		if(flags.binary)
		{
			M.GetPlayer(ws.session.id, function(pl) {
				var msg = comm.CTowerAttack_Request.decode(data);

				pl.HandleMessage(msg, function(rsp){
					ws.send(rsp, { binary: true });
				});
			});
		}
	});

	ws.on('close', function(code, msg) {
		//TODO: remove player from players array, reconnect may cause issues
		ws.session = undefined;
	});
});
