module.exports = {
	Env: 'dev',
	PublicDir: '../public/',
	AppDir: '../public/app/',
	Host: 'uat.ssg15.0x.tf',
	Port: 8080,
	Secure: false,
		
	SteamAPIKey: '548AE99AD2345B97F217E36C46894951',
	
	//Room settings
	MaxPlayers: 10000
};
module.exports.getUrl = function() { return (module.exports.Secure ? 'https://' : 'http://')+module.exports.Host+(module.exports.Port != 80 ? ':'+module.exports.Port+'/' : '/'); };
