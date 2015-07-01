module.exports = {
	Env: 'dev',
	PublicDir: '../public/',
	AppDir: '../public/app/',
	Host: 'localhost',
	//Host: 'localhost',
	Port: 8080,
	Secure: false,
		
	SteamAPIKey: '298F9DA4CC9F6B5C3AFA0DF38B73C415',
	
	//Room settings
	MaxPlayers: 10000,
	RoomTickRate: 1000 // how often should a room run logic
};
module.exports.getUrl = function() { return (module.exports.Secure ? 'https://' : 'http://')+module.exports.Host+(module.exports.Port != 80 ? ':'+module.exports.Port+'/' : '/'); };
