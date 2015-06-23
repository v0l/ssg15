module.exports = {
	Redis: require('ioredis'),
	ByteBuffer: require("bytebuffer"),
	Protobuf: require('protocol-buffers'),
	UUID: require("uuid"),
	NodeStatic: require("node-static"),

	Config: require('./server.config'),
	Room: require('./room'),
	Player: require('./player'),
		
	Rooms: [],
	Players: []
};
