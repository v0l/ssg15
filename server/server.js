var fs = require('fs');
var http = require('http');

var Redis = require('ioredis');
var ByteBuffer = require("bytebuffer");
var Protobuf = require('protocol-buffers');
var UUID = require("uuid");
var express = require("express");
var exphbs = require('express-handlebars');
var WebSocketServer = require("ws").Server;
var passport = require('passport');

var Room = require('./room');
var Player = require('./player');
var ssg15 = require('./globals');
var hbHelpers = require('./views/helpers');
var expressGlobals = require('./express.global');
var comm = Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'/Towerattack/cfg/messages.proto'));
var app = express();
var SteamStrategy = require('passport-steam').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new SteamStrategy({
	returnURL: ssg15.Config.getUrl()+'auth/steam/return',
	realm: ssg15.Config.getUrl(),
	apiKey: ssg15.Config.SteamAPIKey
}, function(id, pro, done) {
	process.nextTick(function() { pro.identifier = id; return done(null, pro); });
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(expressGlobals.globals);
app.use(express.static(ssg15.Config.PublicDir));
app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers: hbHelpers }));
app.set('view engine', 'handlebars');

var routes = {
	game: new require('./views/game')(app)
};

app.get('/', function(req, res) {
	if(req.isAuthenticated()) 
	{
		res.redirect('/Towerattack/');
	}
	else
	{
		res.redirect('/login');
	}
});

app.get('/TowerAttack', function(req, res) {
	if(req.isAuthenticated() || ssg15.Config.Env == 'dev') 
	{
		res.render('game', { user: req.user });
	}
	else
	{
		res.redirect('/login');
	}
});

app.get('/login', function(req, res) {
	if(req.isAuthenticated()) 
	{
		res.redirect('/lobby');
	}
	else
	{
		res.render('login');
	}
});

app.get('/lobby', function(req, res) {
	if(!req.isAuthenticated()) 
	{
		res.redirect('/login');
	}
	else
	{
		res.render('lobby', { user: req.user });
	}
});

app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/login#failed' }), function(req, res) {
	res.redirect('/lobby');
});
  
app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/login#failed' }), function(req, res) {
    res.redirect('/lobby');
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

var server = app.listen(8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('ssg15'+(ssg15.Config.Env == 'dev' ? '-dev' : '')+' app listening at http://%s:%s', host, port);
});

var ws = new WebSocketServer({
    server: server,
    path: '/ws'
});

ws.on('connection', function(ws) {
	ws.session = {
		id: UUID.v4() //TODO: should replace this with cookie var set by login
	};

	var npl = new Player(ws.session.id);
	ssg15.Players[ws.session.id] = npl;

	ws.on('message', function (data, flags) {
		if(flags.binary)
		{
			var pl = ssg15.Players[ws.session.id];
			if(pl !== undefined && pl !== null)
			{
				var msg = comm.CTowerAttack_Request.decode(data);
				//console.log('Got msg: '+msg.id+'-'+msg.type+' ('+ws.session.id+')');
				pl.HandleMessage(msg, function(rsp){
					ws.send(rsp, { binary: true });
				});
			}
		}
	});

	ws.on('close', function(code, msg) {
		//TODO: remove player from players array
	});
});
