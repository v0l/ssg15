module.exports = {
	Config: require('./server.config.js'),
	Room: require('./room.js'),
	
	Redis: require('ioredis'),
	ByteBuffer: require("bytebuffer"),
	Protobuf: require('protocol-buffers'),
	UUID: require("uuid"),
	NodeStatic: require("node-static")
};
