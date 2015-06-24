var fs = require('fs');
var http = require('http');

var Redis = require('ioredis');
var ByteBuffer = require("bytebuffer");
var Protobuf = require('protocol-buffers');
var UUID = require("uuid");
var express = require("express");
var exphbs = require('express-handlebars');
var WebSocketServer = require("ws").Server;

var Room = require('./room');
var Player = require('./player');
var ssg15 = require('./globals');
var hbHelpers = require('./views/helpers');
var expressGlobals = require('./express.global');
var comm = Protobuf(fs.readFileSync(ssg15.Config.PublicDir+'/TowerAttack/cfg/messages.proto'));
var app = express();

// Expose the request to handlebars
app.use(expressGlobals.globals);
app.use(express.static(ssg15.Config.PublicDir));
app.use(express.static(ssg15.Config.PublicDir+"/Towerattack")); // and the tower attack folder
app.engine('handlebars', exphbs({ defaultLayout: 'main', partialsDir: ssg15.Config.AppDir, layoutsDir: ssg15.Config.AppDir+'layouts/', helpers: hbHelpers }));
app.set('view engine', 'handlebars');
app.set('views', ssg15.Config.AppDir);

// page routes and viewm odels
var routes = {
	game: new require('./views/game')(app)
};

app.get('/login', function(req, res) {
	res.render('login');
});

app.get('/lobby', function(req, res) {
	res.render('lobby');
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
