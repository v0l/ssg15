// <script>
"use strict"

window.k_ScreenWidth = 1280;
window.k_ScreenHeight = 720;

var g_JSCacheKey = 'a8hw08Ff';

var g_rgTextureCache = {
	// Particles
	steam_coin: { url: '/media/steam_coin.png?v='+g_CacheKey },
	pixel3d: { url: '/media/3d_pixel.png?v='+g_CacheKey },
	black_smoke: { url: '/media/black_smoke.png?v='+g_CacheKey },
	large_square_pixel: { url: '/media/large_square_pixel.png?v='+g_CacheKey },
	pixel_bubble: { url: '/media/pixel_bubble.png?v='+g_CacheKey },
	pixel_bubble_large: { url: '/media/pixel_bubble_large.png?v='+g_CacheKey },
	white_smoke_puff: { url: '/media/white_smoke_puff.png?v='+g_CacheKey },
	white_smoke_puff_large: { url: '/media/white_smoke_puff_large.png?v='+g_CacheKey },
	clock: { url: '/media/clock.png?v='+g_CacheKey },
	clover: { url: '/media/clover.png?v='+g_CacheKey },
	faded_triangle: { url: '/media/faded_triangle.png?v='+g_CacheKey },
	happy_little_flame: { url: '/media/happy_little_flame.png?v='+g_CacheKey },
	health_cross: { url: '/media/health_cross.png?v='+g_CacheKey },
	resurrection_spirit: { url: '/media/resurrection_spirit.png?v='+g_CacheKey },
	sparkle: { url: '/media/sparkle.png?v='+g_CacheKey },
	streak: { url: '/media/streak.png?v='+g_CacheKey },
	steam_coin_large: { url: '/media/steam_coin_large.png?v='+g_CacheKey },
	//// Backgrounds
	clouds: { url: '/media/clouds_loop.png?v='+g_CacheKey },
	// Desert
	desert_floor: { url: '/media/desert_floor.png?v='+g_CacheKey },
	desert_clouds: { url: '/media/desert_clouds.png?v='+g_CacheKey },
	desert_dunes: { url: '/media/desert_dunes.png?v='+g_CacheKey },
	desert_sky: { url: '/media/desert_sky.png?v='+g_CacheKey },
	// City
	city_floor: { url: '/media/city_floor.png?v='+g_CacheKey },
	city_sky: { url: '/media/city_sky.png?v='+g_CacheKey },
	city_bg_near: { url: '/media/city_bg_near.png?v='+g_CacheKey },
	city_bg_mid: { url: '/media/city_bg_mid.png?v='+g_CacheKey },
	city_bg_far: { url: '/media/city_bg_far.png?v='+g_CacheKey },
	// Ruined city
	cityr_floor: { url: '/media/cityr_floor.png?v='+g_CacheKey },
	cityr_sky: { url: '/media/cityr_sky.png?v='+g_CacheKey },
	cityr_bg_near: { url: '/media/cityr_bg_near.png?v='+g_CacheKey },
	cityr_bg_mid: { url: '/media/cityr_bg_mid.png?v='+g_CacheKey },
	cityr_bg_far: { url: '/media/cityr_bg_far.png?v='+g_CacheKey },
	// Ocean
	ocean_floor: { url: '/media/ocean_floor.png?v='+g_CacheKey },
	ocean_sky: { url: '/media/ocean_sky.png?v='+g_CacheKey },
	ocean_bg_near: { url: '/media/ocean_bg_near.png?v='+g_CacheKey },
	ocean_bg_mid: { url: '/media/ocean_bg_mid.png?v='+g_CacheKey },
	ocean_bg_far: { url: '/media/ocean_bg_far.png?v='+g_CacheKey },
	// night
	night_floor: { url: '/media/night_floor.png?v='+g_CacheKey },
	night_sky: { url: '/media/night_sky.png?v='+g_CacheKey },
	night_bg_near: { url: '/media/night_bg_near.png?v='+g_CacheKey },
	night_bg_mid: { url: '/media/night_bg_mid.png?v='+g_CacheKey },
	night_bg_far: { url: '/media/night_bg_far.png?v='+g_CacheKey },	
	// spaaaaaaaaaaaaaaaaaace
	space_floor: { url: '/media/space_floor.png?v='+g_CacheKey },
	space_sky: { url: '/media/space_sky.png?v='+g_CacheKey },
	space_bg_near: { url: '/media/space_bg_mid.png?v='+g_CacheKey },
	space_bg_mid: { url: '/media/space_bg_near.png?v='+g_CacheKey },
	space_bg_far: { url: '/media/space_bg_far.png?v='+g_CacheKey },
	// snow
	snow_floor: { url: '/media/snow_floor.png?v='+g_CacheKey },
	snow_sky: { url: '/media/snow_sky.png?v='+g_CacheKey },
	snow_bg_mid: { url: '/media/snow_bg_mid.png?v='+g_CacheKey },
	snow_bg_far: { url: '/media/snow_bg_far.png?v='+g_CacheKey },
	// statium
	stadium_floor: { url: '/media/statium_floor.png?v='+g_CacheKey },
	stadium_sky: { url: '/media/statium_sky.png?v='+g_CacheKey },
	stadium_bg_near: { url: '/media/statium_bg_near.png?v='+g_CacheKey },
	stadium_bg_mid: { url: '/media/statium_bg_mid.png?v='+g_CacheKey },
	stadium_bg_far: { url: '/media/statium_bg_far.png?v='+g_CacheKey },
	// island
	island_floor: { url: '/media/island_floor.png?v='+g_CacheKey },
	island_sky: { url: '/media/island_sky.png?v='+g_CacheKey },
	island_bg_mid: { url: '/media/island_bg_mid.png?v='+g_CacheKey },
	island_bg_far: { url: '/media/island_bg_far.png?v='+g_CacheKey },
	// volcano
	volcano_floor: { url: '/media/volcano_floor.png?v='+g_CacheKey },
	volcano_sky: { url: '/media/volcano_sky.png?v='+g_CacheKey },
	volcano_bg_mid: { url: '/media/volcano_bg_mid.png?v='+g_CacheKey },
	volcano_bg_far: { url: '/media/volcano_bg_far.png?v='+g_CacheKey },
	pointer: { url: '/media/pointer.png?v='+g_CacheKey },

};

var g_rgEmitterCache = {};

var g_rgSkeletonCache = {
	spawner_spaceship: { url: '/cfg/skeletons/spawner_spaceship.json?v=2'+g_CacheKey },
	boss_space: { url: '/cfg/skeletons/boss_space.json?v='+g_CacheKey },
	boss_desert: { url: '/cfg/skeletons/boss_desert.json?v='+g_CacheKey },
	boss_island: { url: '/cfg/skeletons/boss_island.json?v='+g_CacheKey },
	boss_stadium: { url: '/cfg/skeletons/boss_stadium.json?v='+g_CacheKey },
	boss_volcano: { url: '/cfg/skeletons/boss_volcano.json?v='+g_CacheKey },
	boss_city_day: { url: '/cfg/skeletons/boss_city_day.json?v='+g_CacheKey },
	boss_city_night: { url: '/cfg/skeletons/boss_city_night.json?v='+g_CacheKey },
	boss_ocean_floor: { url: '/cfg/skeletons/boss_ocean_floor.json?v='+g_CacheKey },
	boss_snow: { url: '/cfg/skeletons/boss_snow.json?v='+g_CacheKey },
	boss_city_destroyed: { url: '/cfg/skeletons/boss_city_destroyed.json?v='+g_CacheKey },
	creep: { url: '/cfg/skeletons/creep.json?v='+g_CacheKey + '2' }
};

var g_rgIconMap = {
	"ability_1": { icon: 'http://steamcommunity-a.akamaihd.net/economy/image/U8721VM9p9C2v1o6cKJ4qEnGqnE7IoTQgZI-VTdwyTBeimAcIoxXpgK8bPeslY9pPJIvB5IWW2-452kaM8heLSRgleGHorVWwb1mbacg0bL6DV136-dDUDPhGBHXgmacLef8nQM0MpF8IBukyM1M7cAXB9aR2qBKFA'  },
	"ability_2": { icon: 'http://steamcommunity-a.akamaihd.net/economy/image/U8721VM9p9C2v1o6cKJ4qEnGqnE7IoTQgZI-VTdwyTBeimAcIoxXpgK8bPeslY9pPJIvB5IWW2-452kaM8heLSRgleGGo7VWk-kzO_V91empDlVz7ORGAWDqHhbR1TfHLen4wgZiPcIqcBn0kpYb7cAXB9ZJHRPUDQ' },
	"ability_3": { icon: 'http://steamcommunity-a.akamaihd.net/economy/image/U8721VM9p9C2v1o6cKJ4qEnGqnE7IoTQgZI-VTdwyTBeimAcIoxXpgK8bPeslY9pPJIvB5IWW2-452kaM8heLSRgleGGo7VWk-kzO_V91empDlVz7ORGAWDqHhbR1TfHLen4wgZiPcIqcBn0kpYb7cAXB9ZJHRPUDQ' },
	"ability_4": { icon: 'http://steamcommunity-a.akamaihd.net/economy/image/U8721VM9p9C2v1o6cKJ4qEnGqnE7IoTQgZI-VTdwyTBeimAcIoxXpgK8bPeslY9pPJIvB5IWW2-452kaM8heLSRgleGGo7VWk-kzO_V91empDlVz7ORGAWDqHhbR1TfHLen4wgZiPcIqcBn0kpYb7cAXB9ZJHRPUDQ' },
	"ability_5": { icon: '/media/happycyto.png' },
	"ability_6": { icon: '/media/lucky.png' },
	"ability_7": { icon: '/media/lunahealthpotion.png' },
	"ability_8": { icon: '/media/goldstack.png' },
	"ability_9": { icon: '/media/hourglass.png' },
	"ability_10": { icon: '/media/abomb.png' },
	"ability_11": { icon: '/media/gmbomb.png' },
	"ability_12": { icon: '/media/burned.png' },
	"ability_13": { icon: '/media/alive.png' },
	"ability_14": { icon: '/media/logiaim.png' },
	"ability_15": { icon: '/media/pjkaboom.png' },
	"ability_16": { icon: '/media/theorb.png' },
	"ability_17": { icon: '/media/ccgold.png' },
	"ability_18": { icon: '/media/critical.png'  },
	"ability_19": { icon: '/media/fistpump.png'  },
	"ability_20": { icon: '/media/VeneticaGoldCoin.png' },
	"ability_21": { icon: '/media/swshield.png' },
	"ability_22": { icon: '/media/treasurechest.png' },
	"ability_23": { icon: '/media/healthvial.png' },
	"ability_24": { icon: '/media/sunportal.png' },
	"ability_25": { icon: '/media/twteamrandom.png' },
	"ability_26": { icon: '/media/wormwarp.png' },
	"ability_27": { icon: '/media/cooldown.png' },
	"element_1": { icon: '/media/shelterwildfire.png' },
	"element_2": { icon: '/media/waterrune.png' },
	"element_3": { icon: '/media/Wisp.png' },
	"element_4": { icon: '/media/FateTree.png' },
	"enemy_2": { icon: '/media/like_king.png' },
	"enemy_4": { icon: '/media/goldenmilkminer.png' },
};

var g_rgSoundCache = {
	loading: {urlv: '/media/loadingsound.ogg?v='+g_CacheKey, urlm: 'media/loadingsound.mp3?v='+g_CacheKey },
	hurt: {urlv: '/media/clickattack2.ogg?v='+g_CacheKey, urlm: 'media/clickattack2.mp3?v='+g_CacheKey },
	ability: {urlv: '/media/upgradeability.ogg?v='+g_CacheKey, urlm: 'media/upgradeability.mp3?v='+g_CacheKey },
	upgrade: {urlv: '/media/standardupgrade.ogg?v='+g_CacheKey, urlm: 'media/standardupgrade.mp3?v='+g_CacheKey },
	explode: {urlv: '/media/enemydied.ogg?v='+g_CacheKey, urlm: 'media/enemydied.mp3?v='+g_CacheKey },
	dead: {urlv: '/media/youdied.ogg?v='+g_CacheKey, urlm: 'media/youdied.mp3?v='+g_CacheKey },
	spawn: {urlv: '/media/shipspawn2.ogg?v='+g_CacheKey, urlm: 'media/shipspawn2.mp3?v='+g_CacheKey },
	nuke: {urlv: '/media/nuke.ogg?v='+g_CacheKey, urlm: 'media/nuke.mp3?v='+g_CacheKey },
	goldclick: {urlv: '/media/pickupgold.ogg?v='+g_CacheKey, urlm: 'media/pickupgold.mp3?v='+g_CacheKey },
	clusterbomb: {urlv: '/media/clusterbomb.ogg?v='+g_CacheKey, urlm: 'media/clusterbomb.mp3?v='+g_CacheKey },
	napalm: {urlv: '/media/napalm.ogg?v='+g_CacheKey, urlm: 'media/napalm.mp3?v='+g_CacheKey },
	wrongselection: {urlv: '/media/wrongselection.ogg?v='+g_CacheKey, urlm: 'media/wrongselection.mp3?v='+g_CacheKey },
	music: {urlv: '/media/backgroundtrack.ogg?v='+g_CacheKey, urlm: 'media/backgroundtrack.mp3?v='+g_CacheKey },
	music_boss: {urlv: '/media/bosslevel.ogg?v='+g_CacheKey, urlm: 'media/bosslevel.mp3?v='+g_CacheKey },
	music_bossB: {urlv: '/media/bosslevel2.ogg?v='+g_CacheKey, urlm: 'media/bosslevel2.mp3?v='+g_CacheKey },
	// Creep chatter
	creep_1:  {urlv: '/media/creep1.ogg?v='+g_CacheKey, urlm: 'media/creep1.mp3?v='+g_CacheKey },
	creep_2:  {urlv: '/media/creep2.ogg?v='+g_CacheKey, urlm: 'media/creep2.mp3?v='+g_CacheKey },
	creep_3:  {urlv: '/media/creep3.ogg?v='+g_CacheKey, urlm: 'media/creep3.mp3?v='+g_CacheKey },
	creep_4:  {urlv: '/media/creep4.ogg?v='+g_CacheKey, urlm: 'media/creep4.mp3?v='+g_CacheKey },
	creep_5:  {urlv: '/media/creep5.ogg?v='+g_CacheKey, urlm: 'media/creep5.mp3?v='+g_CacheKey },
	creep_6:  {urlv: '/media/creep6.ogg?v='+g_CacheKey, urlm: 'media/creep6.mp3?v='+g_CacheKey },
	creep_7:  {urlv: '/media/creep7.ogg?v='+g_CacheKey, urlm: 'media/creep7.mp3?v='+g_CacheKey },
	creep_8:  {urlv: '/media/creep8.ogg?v='+g_CacheKey, urlm: 'media/creep8.mp3?v='+g_CacheKey },
	creep_9:  {urlv: '/media/creep9.ogg?v='+g_CacheKey, urlm: 'media/creep9.mp3?v='+g_CacheKey },
	creep_10:  {urlv: '/media/creep3.1.ogg?v='+g_CacheKey, urlm: 'media/creep3.1.mp3?v='+g_CacheKey },
	creep_11:  {urlv: '/media/creep8.1.ogg?v='+g_CacheKey, urlm: 'media/creep8.1.mp3?v='+g_CacheKey },
};


var g_Server = false;
var g_Minigame = false;
var g_AudioManager = false;
var g_GameID = 0;
var g_TuningData = null;
var g_DebugMode = false;
var g_DebugUpdateStats = false;

function Boot() {

	// create an new instance of a pixi stage

	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

	// add the renderer view element to the DOM

	g_AudioManager = new CAudioManager();

	//LoadScene('preload');
	g_Minigame = new CMinigameManager;
	g_Minigame.gameid = g_GameID;
	g_Minigame.rgTuningData = g_TuningData;

	g_Minigame.Initialize($J('#gamecontainer')[0]);

	var preloadscene = new CScenePreload( g_Minigame );
	g_Minigame.EnterScene( preloadscene );

	//stage.click = function( mouseData ) { click(mouseData); }

	// Add input events
	//$('canvas').click(function( event ){ click( event ); });

	// turn off image smoothing on the 2d context if we generated one (If the browser doesn't let us use WebGL)
	var ctx2d = $J('canvas')[0].getContext('2d');
	if( ctx2d )
	{
		ctx2d.imageSmoothingEnabled = false;
		ctx2d.webkitImageSmoothingEnabled = false;
		ctx2d.mozImageSmoothingEnabled = false;
	}

};

var CScenePreload = function()
{
	CSceneMinigame.call(this, arguments[0]);

	if( typeof CUI === 'undefined' )
	{
		this.m_rgScriptsToLoad = [
			'/scripts/running.js?v=' + g_JSCacheKey + '&l=english',
			'/scripts/network.js?v=' + g_JSCacheKey + '&l=english',
			'/scripts/ui.js?v=' + g_JSCacheKey + '&l=english',
			'/scripts/easing.js?v=' + g_JSCacheKey + '&l=english',
			'/scripts/enemies.js?v=' + g_JSCacheKey + '&l=english'
		];
	} else {
		this.m_rgScriptsToLoad = [];
	}
	this.m_cScriptsLoaded = 0;
	this.m_cAudioLoaded = 0;
	this.m_cAudioTriedLoad = 0;
	this.m_bImagesLoaded = false;
	this.m_bSkeletonsLoaded = false;

	this.m_TextLoading = new PIXI.Text("Loading", {font: "50px 'Press Start 2P'", fill: "#fff" });
	this.m_TextLoading.x = 470;
	this.m_TextLoading.y = 250;

	this.m_Container.addChild( this.m_TextLoading );

	this.m_TextPercent = new PIXI.Text("0 / 0", {font: "30px 'Press Start 2P'", fill: "#fff" });
	this.m_TextPercent.x = 550;
	this.m_TextPercent.y = 300;

	this.m_Container.addChild( this.m_TextPercent );

	this.m_bTriedInitializing=false;




	//this.m_Manager.Stage.addChild( this.m_Container );
}

CScenePreload.prototype = Object.create(CSceneMinigame.prototype);

CScenePreload.prototype.Tick = function()
{
	CSceneMinigame.prototype.Tick.call(this);

	var nTotalRequests = window.g_cPendingRequests + window.g_cActiveRequests + window.g_cCompletedRequests;
	var nOutstandingRequests = window.g_cCompletedRequests;

	this.m_TextPercent.text = nOutstandingRequests + " / " + nTotalRequests;

	if( //this.m_cScriptsLoaded == this.m_rgScriptsToLoad.length &&
		//this.m_bSkeletonsLoaded &&
		!this.m_bTriedInitializing &&
		//&& this.m_cEmittersLoading == this.m_cEmittersLoaded
		window.g_cPendingRequests == 0 && window.g_cActiveRequests == 0 && window.g_cCompletedRequests > 0
		//&& this.m_cAudioLoaded == this.m_cAudioTriedLoad
		)
	{
		this.m_bTriedInitializing = true;
		console.log("Finished preloading.");

		var builder = this.ParseProtobufFile();

		// DO STUFF
		this.m_cScriptsLoaded = 0;
		this.m_cEmittersLoaded = 0;
		this.m_cEmittersLoading = 0;
		g_Server = new CServerInterface( builder );

		var gamescene = new CSceneGame( this.m_Manager );
		this.m_Manager.EnterScene( gamescene );
	}
}

CScenePreload.prototype.ParseProtobufFile = function()
{
	// Synchronously request this for now
	var ProtoBuf = dcodeIO.ProtoBuf;
	return ProtoBuf.loadProtoFile( '/cfg/messages.proto?v='+g_CacheKey );
}

window.g_cPendingRequests = 0;
window.g_cActiveRequests = 0;
window.g_cCompletedRequests = 0;

window.g_cMaxRequests = 3;

function LoadLater(fnLoad)
{
	window.g_cPendingRequests++;
	DelayedAjaxLoader(fnLoad);
}

function DelayedAjaxLoader(fnLoad)
{
	if( window.g_cActiveRequests < window.g_cMaxRequests )
	{
		//console.log("RUN -> P: %s A: %s C: %s, M: %s", window.g_cPendingRequests, window.g_cActiveRequests, window.g_cCompletedRequests, window.g_cMaxRequests );
		window.g_cPendingRequests--;
		window.g_cActiveRequests++;
		fnLoad();
	} else {
		var thing = fnLoad;
		setTimeout( function(){ DelayedAjaxLoader(thing); }, 10/*00 * Math.random()*/ );
		//console.log("Reschedule -> P: %s A: %s C: %s, M: %s", window.g_cPendingRequests, window.g_cActiveRequests, window.g_cCompletedRequests, window.g_cMaxRequests );
	}
}


CScenePreload.prototype.Enter = function()
{
	CSceneMinigame.prototype.Enter.call(this);

	var instance = this;

	// Load sound data

	var formatTester = new Audio();
	var strAudioFormat = false;

	if( formatTester.canPlayType( 'audio/ogg' ) == 'probably' )
		strAudioFormat = 'urlv'
	else if( formatTester.canPlayType( 'audio/mpeg' ) == 'probably' || formatTester.canPlayType( 'audio/mpeg' ) == 'maybe' ) // WHY.
		strAudioFormat = 'urlm';

	console.log("audio/ogg support is: %s", formatTester.canPlayType( 'audio/ogg' ));
	console.log("audio/mpeg support is: %s", formatTester.canPlayType( 'audio/mpeg' ));
	//console.log("WELCOME TO WEB DEVELOPMENT");

	if( strAudioFormat )
	{
		$J.each(g_rgSoundCache, function(i,j){

			LoadLater(
				(function(rgSound){
					return function(){
						rgSound.element = new Audio(j[strAudioFormat]);
						rgSound.element.volume = 0.5;
						rgSound.element.preload = "metadata";

						if( i == 'loading')
						{
							rgSound.element.addEventListener('loadedmetadata',function(){
								window.g_cCompletedRequests++;
								window.g_cActiveRequests--;
								g_AudioManager.playMusic('loading');
							});
						} else {
							rgSound.element.addEventListener('loadedmetadata',function(){
								window.g_cCompletedRequests++;
								window.g_cActiveRequests--;
							});
						}


					}
				}
					)(j)
			);
		});
	}

	for( var i=0; i<this.m_rgScriptsToLoad.length; i++)
	{
		var instance = this;
		LoadLater(
			(function(instance, i){
				return function()
				{
					$J.ajax({
						url: instance.m_rgScriptsToLoad[i],
						dataType: "script",
						cache: true
					});

					window.g_cCompletedRequests++;
					window.g_cActiveRequests--;
				}
			})(this, i)

		);


	}

	/*$J.each(g_rgEmitterCache, function(i,j)
	{
		//instance.m_cEmittersLoading++;
		LoadLater(function(){
			$J.ajax({
				url: j.url,
				dataType: "json"
			}).complete(
					(function(that){
						return function(rgResult)
						{
							g_rgEmitterCache[i].emitter = rgResult.responseJSON;
							//that.m_cEmittersLoaded++;
							window.g_cCompletedRequests++;
							window.g_cActiveRequests--;
						}
					})(this)
				);
		});
	});*/

	LoadLater(function(){
		$J.ajax({
			url: '/cfg/combined.json',
			dataType: "json"
		}).done(
				function(rgResult){
					g_rgEmitterCache = rgResult;
					//console.log(rgResult);
					window.g_cCompletedRequests++;
					window.g_cActiveRequests--;
				}
		);
	});




	// Load texture data


	$J.each(g_rgTextureCache, function(g,h){
		LoadLater(
			(function(i, j){
				return function(){
					var loader = new PIXI.loaders.Loader();
					loader.add( i, j.url );

					loader.load(function (loader, resources) {
						$J.each(resources, function(k,l){
							g_rgTextureCache[k].texture = l.texture;
							window.g_cCompletedRequests++;
							window.g_cActiveRequests--;
						});
					});

				}
			}
			)(g,h)
		);
	});

	$J.each(g_rgSkeletonCache, function(g,h){
		LoadLater(
			(function(i, j){
				return function(){
					var loader = new PIXI.loaders.Loader();
					loader.add( i, j.url );

					loader.load(function (loader, resources) {
						$J.each(resources, function(k,l){

							if( !g_rgSkeletonCache[k] )
								g_rgSkeletonCache[k] = {};
							else // Fun fact: This is because we get two responses for one request due to the atlas.
							{
								window.g_cCompletedRequests++;
								window.g_cActiveRequests--;
							}

							g_rgSkeletonCache[k].data = l;


						});
					});


				}
			}
				)(g,h)
		);
	});

	var instance = this;


}

function ToggleSound()
{
	WebStorage.SetLocal('minigame_mute', !WebStorage.GetLocal('minigame_mute') );
}

function bIsMuted()
{
	return WebStorage.GetLocal('minigame_mute') == true;
}

function PlaySound( sound )
{
	if( bIsMuted() )
		return;
	g_rgSoundCache[sound].element.currentTime=0;
	g_rgSoundCache[sound].element.play();
}


// Keyvalues->JSON always produces objects even when it shouldn't. This cleans it up.
function V_ToArray( obj )
{
	var rgOut = [];
	for (var idx in Object.keys(obj) )
	{
		if ( obj.hasOwnProperty( idx ) )
		{
			rgOut.push(obj[idx]);
		}
	}
	return rgOut;
}

window.CAudioManager = function()
{
	this.m_rgFading = [];
	var instance = this;
	setInterval( function(){ instance.tick(); }, 10);
}

CAudioManager.prototype.tick = function()
{
	var nFadeRate = 0.01;
	for( var i=this.m_rgFading.length-1; i>=0; i--)
	{
		if( this.m_rgFading[i].volume - nFadeRate <= 0 )
		{
			this.m_rgFading[i].pause();
			this.m_rgFading[i].volume = 0.5;
			this.m_rgFading.splice(i,1);
		} else
			this.m_rgFading[i].volume -= nFadeRate;
	}
}

CAudioManager.prototype.play = function( sound, channel )
{
	if( bIsMuted() || !g_rgSoundCache[sound].element )
		return;

	if( channel )
	{
		// ....
	}
	g_rgSoundCache[sound].element.currentTime = 0;
	g_rgSoundCache[sound].element.play();
}

CAudioManager.prototype.playMusic = function( sound )
{
	if( !g_rgSoundCache[sound].element )
		return;

	this.m_eleMusic = g_rgSoundCache[sound].element;
	this.m_eleMusic.currentTime = 0;
	this.m_eleMusic.loop = 1;

	if(  WebStorage.GetLocal('minigame_mutemusic') == true )
		return;


	this.m_eleMusic.play();
}

CAudioManager.prototype.CrossfadeTrack = function( strNewTrack )
{
	if( !g_rgSoundCache[strNewTrack].element || !this.m_eleMusic || this.m_eleMusic == g_rgSoundCache[strNewTrack].element )
		return;

	// DO SOMETHING PLS
	this.m_rgFading.push(this.m_eleMusic);
	this.m_eleMusic = g_rgSoundCache[strNewTrack].element;
	this.m_eleMusic.volume = 0.5;
	this.m_eleMusic.loop = 1;
	this.m_eleMusic.currentTime = 0;

	if(  WebStorage.GetLocal('minigame_mutemusic') == true )
		return;

	this.m_eleMusic.play();
}

CAudioManager.prototype.ToggleMusic = function( )
{
	WebStorage.SetLocal('minigame_mutemusic', !WebStorage.GetLocal('minigame_mutemusic') );

	if( !this.m_eleMusic )
		return;

	if( WebStorage.GetLocal('minigame_mutemusic') == true )
	{
		this.m_eleMusic.pause();
	} else {
		this.m_eleMusic.play();
	}
}

