module.exports = {
	Env: 'dev',
	PublicDir: '../public/',
	AppDir: '../public/app/',
	Host: 'uat.ssg15.0x.tf',
	Port: 8080,
	Secure: false,
	getUrl: function() { return (Secure ? 'https://' : 'http://')+Host+(Port != 80 ? ':'+Port+'/' : '/'); },
		
	SteamAPIKey: '548AE99AD2345B97F217E36C46894951',
	
	//Room settings
	MaxPlayers: 10000
};
