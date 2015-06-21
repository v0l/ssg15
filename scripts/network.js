// <script>
"use strict";

var g_bHalt = false;
var g_IncludeGameStats = false;

window.CServerInterface = function( builder )
{
	// Get token

	this.m_strSteamID = false;

	this.m_nLastTick = false
	this.m_bRequestUpdates = false;
	this.m_protobufMessageBuilder = builder;
	
	this.m_protobuf_Request = builder.build( "CTowerAttack_Request" );
	this.m_protobuf_GetTuningData_Request = builder.build( "CTowerAttack_GetTuningData_Request" );
	this.m_protobuf_GetGameData_Request = builder.build( "CTowerAttack_GetGameData_Request" );
	this.m_protobuf_GetPlayerData_Request = builder.build( "CTowerAttack_GetPlayerData_Request" );
	
	this.m_protobuf_GetGameDataResponse = builder.build( "CTowerAttack_GetGameData_Response" );
	this.m_protobuf_GetPlayerNamesResponse = builder.build( "CTowerAttack_GetPlayerNames_Response" );
	this.m_protobuf_GetPlayerDataResponse = builder.build( "CTowerAttack_GetPlayerData_Response" );
	this.m_protobuf_UseAbilitiesResponse = builder.build( "CTowerAttack_UseAbilities_Response" );
	this.m_protobuf_ChooseUpgradeResponse = builder.build( "CTowerAttack_ChooseUpgrade_Response" );
	this.m_protobuf_UseBadgePointsResponse = builder.build( "CTowerAttack_UseBadgePoints_Response" );
	
	var instance = this;
	this.m_ws = false;
	this.m_ws_ps = 0; 
	this.m_ws_cbq = [];
}

CServerInterface.prototype.OnData = function(evt){
	console.log(evt);
}

CServerInterface.prototype.Connect = function( callback )
{
	var instance = this;

	var rgResult = {
		"webapi_host":"ws:\/\/localhost:8080\/",
		"webapi_host_secure":"wss:\/\/localhost:8081\/",
		"token":"1234",
		"steamid":"aaaa",
		"persona_name":"testuser",
		"success":1
	};
	
	instance.m_strSteamID = rgResult.steamid;
	instance.m_strWebAPIHost = rgResult.webapi_host;
	instance.m_ws = new WebSocket( rgResult.webapi_host );
	instance.m_ws.onmessage += instance.OnData;
	instance.m_ws.binaryType = "arraybuffer";
	callback(rgResult);
}

CServerInterface.prototype.BuildURL = function() { }

CServerInterface.prototype.Write = function( obj, callback )
{
	var instance = this;
	
	if(instance.m_ws != null && instance.m_ws.readyState == WebSocket.OPEN){
		instance.m_ws_cbq[instance.m_ws_cbq.length] = callback;
		
		instance.m_ws.send(obj.encode().toArrayBuffer())
		instance.m_ws_ps++;
	}
}

CServerInterface.prototype.GetGameTuningData = function( callback )
{
	var instance = this;
	
	var rgParams = {
		id: instance.m_ws_ps,
		type: 5,
		GetTuningData_Request: {
			game_type: 1,
			gameid: this.m_nGameId
		}
	};
	
	instance.Write(instance.m_protobuf_Request(rgParams), callback);
}

CServerInterface.prototype.GetGameData = function( callback, error, bIncludeStats )
{
	var instance = this;
	
	var rgParams = {
		id: instance.m_ws_ps,
		type: 0,
		GetGameData_Request: {
			gameid: this.m_nGameID,
			include_stats: ( bIncludeStats || g_IncludeGameStats ) ? true : false
		}
	};

	instance.Write(new instance.m_protobuf_Request(rgParams), function(rgResult){
		var message = instance.m_protobuf_GetGameDataResponse.decode(rgResult);
		var result = { 'response': message.toRaw( true, true ) };
		callback( result );
	});
}

CServerInterface.prototype.GetPlayerNames = function( callback, error, rgAccountIDs )
{
	var instance = this;
	
	var rgParams = {
		id: instance.m_ws_ps,
		type: 1,
		GetPlayerNames_Request: {
			gameid: this.m_nGameID,
			accountids: rgAccountIDs && rgAccountIDs.length < 100 ? rgAccountIDs : null
		}
	};

	instance.Write(new instance.m_protobuf_Request(rgParams), function(rgResult){
		var message = instance.m_protobuf_GetPlayerNamesResponse.decode(rgResult);
		var result = { 'response': message.toRaw( true, true ) };
		callback( result );
	});
}

CServerInterface.prototype.GetPlayerData = function( callback, error, bIncludeTechTree )
{
	var instance = this;
	
	var rgParams = {
		id: instance.m_ws_ps,
		type: 2,
		GetPlayerData_Request: {
			gameid: this.m_nGameID,
			steamid: g_steamID,
			include_tech_tree: (bIncludeTechTree) ? true : false,
		}
	};

	instance.Write(new instance.m_protobuf_Request(rgParams), function(rgResult){
		var message = instance.m_protobuf_GetPlayerDataResponse.decode(rgResult);
		var result = { 'response': message.toRaw( true, true ) };
		callback( result );
	});
}

CServerInterface.prototype.UseAbilities = function( callback, failed, rgParams )
{
	rgParams["gameid"] = this.m_nGameID;

	var instance = this;

	var rgRequest = {
		'input_json': V_ToJSON( rgParams ),
		'access_token': instance.m_WebAPI.m_strOAuth2Token,
		'format': "protobuf_raw",
	};

	$J.ajax({
		url: this.m_WebAPI.BuildURL( 'ITowerAttackMiniGameService', 'UseAbilities', true ),
		method: 'POST',
		data: rgRequest,
		xhrFields : {
			responseType : 'arraybuffer'
		},
		dataType : 'native'
	}).success(function(rgResult){
		var message = instance.m_protobuf_UseAbilitiesResponse.decode(rgResult);
		var result = { 'response': message.toRaw( true, true ) };
		if ( result.response.player_data )
		{
			result.response.player_data.active_abilities_bitfield = result.response.player_data.active_abilities_bitfield ? parseInt( result.response.player_data.active_abilities_bitfield ) : 0;
		}
		if ( result.response.tech_tree )
		{
			result.response.tech_tree.unlocked_abilities_bitfield = result.response.tech_tree.unlocked_abilities_bitfield ? parseInt( result.response.tech_tree.unlocked_abilities_bitfield ) : 0;
		}
		callback( result );
	} )
	.fail( failed );
}

CServerInterface.prototype.ChooseUpgrades = function( callback, upgrades )
{
	var rgParams = {
		'gameid': this.m_nGameID,
		'upgrades': upgrades
	};

	var instance = this;

	var rgRequest = {
		'input_json': V_ToJSON( rgParams ),
		'access_token': instance.m_WebAPI.m_strOAuth2Token,
		'format': "protobuf_raw"
	};

	$J.ajax({
		url: this.m_WebAPI.BuildURL( 'ITowerAttackMiniGameService', 'ChooseUpgrade', true ),
		method: 'POST',
		data: rgRequest,
		xhrFields : {
			responseType : 'arraybuffer'
		},
		dataType : 'native'
	}).success(function(rgResult){
		var message = instance.m_protobuf_ChooseUpgradeResponse.decode(rgResult);
		var result = { 'response': message.toRaw( true, true ) };
		if ( result.response.tech_tree )
		{
			result.response.tech_tree.unlocked_abilities_bitfield = result.response.tech_tree.unlocked_abilities_bitfield ? parseInt( result.response.tech_tree.unlocked_abilities_bitfield ) : 0;
		}
		callback( result );
	} )
	.fail( function(err)
	{
		console.log("FAILED");
		console.log(err);
	});
}

CServerInterface.prototype.UseBadgePoints = function( callback, abilityItems )
{
	var rgParams = {
		'gameid': this.m_nGameID,
		'ability_items': abilityItems
	};

	var instance = this;

	var rgRequest = {
		'input_json': V_ToJSON( rgParams ),
		'access_token': instance.m_WebAPI.m_strOAuth2Token,
		'format': "protobuf_raw"
	};

	$J.ajax({
		url: this.m_WebAPI.BuildURL( 'ITowerAttackMiniGameService', 'UseBadgePoints', true ),
		method: 'POST',
		data: rgRequest,
		xhrFields : {
			responseType : 'arraybuffer'
		},
		dataType : 'native'
	}).success(function(rgResult){
		var message = instance.m_protobuf_UseBadgePointsResponse.decode(rgResult);
		var result = { 'response': message.toRaw( true, true ) };
		if ( result.response.tech_tree )
		{
			result.response.tech_tree.unlocked_abilities_bitfield = result.response.tech_tree.unlocked_abilities_bitfield ? parseInt( result.response.tech_tree.unlocked_abilities_bitfield ) : 0;
		}
		callback( result );
	} )
	.fail( function(err)
	{
		console.log("FAILED");
		console.log(err);
	});
}

CServerInterface.prototype.QuitGame = function( callback )
{
	var rgParams = {
		'gameid': this.m_nGameID,
	};


	var instance = this;

	var rgRequest = {
		'input_json': V_ToJSON( rgParams )
	};

	this.m_WebAPI.ExecJSONP( 'IMiniGameService', 'LeaveGame',  rgRequest, true, null )
		.done( callback )
		.fail( function(err)
		{
			console.log("FAILED");
			console.log(err);
		});

}
