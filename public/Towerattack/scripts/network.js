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
	this.m_protobuf_Responce = builder.build( "CTowerAttack_Response" );
	
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
	instance.m_ws = new WebSocket( "ws:\/\/"+location.host );
	instance.m_ws.onmessage = function(evt){
		// Dunno how to decode or how to pass this off to where it needs to go
		var data = evt.data;
		var msg = instance.m_protobuf_Responce.decode(data);

		//fire the callback based on the msg id (message seq)
		switch(msg.type){
			case 0:{
				//get game data
				var cb = instance.m_ws_cbq[msg.id];
				if(cb != undefined){
					if(msg.GetGameData_Response.data == undefined)
					{
						//something went wrong? redirect to login/lobby page
						window.location = '/login';
					}
					cb(msg.GetGameData_Response);
				}
				break;
			}
			case 1:{
				//get player names
				var cb = instance.m_ws_cbq[msg.id];
				if(cb != undefined){
					cb(msg.GetPlayerNames_Response);
				}
				break;
			}
			case 2:{
				//get player data
				var cb = instance.m_ws_cbq[msg.id];
				if(cb != undefined){
					cb(msg.GetPlayerData_Response);
				}
				break;
			}
			case 3:{
				//use abilities
				var cb = instance.m_ws_cbq[msg.id];
				if(cb != undefined){
					cb(msg.UseAbilities_Response);
				}
				break;
			}
			case 4:{
				//choose upgrade
				var cb = instance.m_ws_cbq[msg.id];
				if(cb != undefined){
					cb(msg.ChooseUpgrade_Response);
				}
				break;
			}
			case 5:{
				//get tuning data
				var cb = instance.m_ws_cbq[msg.id];
				if(cb != undefined){
					cb(msg.GetTuningData_Response);
				} 
				break;
			}
			case 6:{
				//get daily stats rollup 
				var cb = instance.m_ws_cbq[msg.id];
				if(cb != undefined){
					cb(msg.GetDailyStatsRollup_Response);
				}
				break;	
			}
			case 7:{
				//handle game event
				break;
			}
			case 8:{
				//use badge points
				
				break;
			}
			case 9:{
				//quit game
				
				break;
			}
			default:{
				console.log("Unknown type: "+msg.type);
				break;
			}
		}
	};

	// Wait for the connection to be ready
	instance.m_ws.onopen = function(){
		instance.m_ws.binaryType = "arraybuffer";
		callback(rgResult);
	};
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
		var result = { 'response': rgResult.toRaw( true, true ) };
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
		var result = { 'response': rgResult.toRaw( true, true ) };
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
			include_tech_tree: (bIncludeTechTree) ? true : false,
		}
	};

	instance.Write(new instance.m_protobuf_Request(rgParams), function(rgResult){
		var result = { 'response': rgResult.toRaw( true, true ) };
		callback( result );
	});
}

CServerInterface.prototype.UseAbilities = function( callback, failed, rgParams )
{
	var instance = this;
	
	rgParams["gameid"] = this.m_nGameID;

	var rgRequest = {
		id: instance.m_ws_ps,
		type: 3,
		UseAbilities_Request: rgParams
	};

	instance.Write(new instance.m_protobuf_Request(rgRequest), function(rgResult){
		var result = { 'response': rgResult.toRaw( true, true ) };
		if ( result.response.player_data )
		{
			result.response.player_data.active_abilities_bitfield = result.response.player_data.active_abilities_bitfield ? parseInt( result.response.player_data.active_abilities_bitfield ) : 0;
		}
		if ( result.response.tech_tree )
		{
			result.response.tech_tree.unlocked_abilities_bitfield = result.response.tech_tree.unlocked_abilities_bitfield ? parseInt( result.response.tech_tree.unlocked_abilities_bitfield ) : 0;
		}
		callback( result );
	});
}

CServerInterface.prototype.ChooseUpgrades = function( callback, upgrades )
{
	var instance = this;

	var rgRequest = {
		id: instance.m_ws_ps,
		type: 4,
		ChooseUpgrade_Request: {
			gameid: this.m_nGameID,
			upgrades: upgrades
		}
	};
	
	instance.Write(new instance.m_protobuf_Request(rgRequest), function(rgResult){
		var result = { 'response': rgResult.toRaw( true, true ) };
		if ( result.response.tech_tree )
		{
			result.response.tech_tree.unlocked_abilities_bitfield = result.response.tech_tree.unlocked_abilities_bitfield ? parseInt( result.response.tech_tree.unlocked_abilities_bitfield ) : 0;
		}
		callback( result );
	});
}

CServerInterface.prototype.UseBadgePoints = function( callback, abilityItems )
{
	var instance = this;

	var rgRequest = {
		id: instance.m_ws_ps,
		type: 8,
		UseBadgePoints_Request: {
			gameid: this.m_nGameID,
			ability_items: abilityItems
		}
	};
	
	instance.Write(new instance.m_protobuf_Request(rgRequest), function(rgResult){
		var result = { 'response': rgResult.toRaw( true, true ) };
		if ( result.response.tech_tree )
		{
			result.response.tech_tree.unlocked_abilities_bitfield = result.response.tech_tree.unlocked_abilities_bitfield ? parseInt( result.response.tech_tree.unlocked_abilities_bitfield ) : 0;
		}
		callback( result );
	});
}

CServerInterface.prototype.QuitGame = function( callback )
{
	var instance = this;

	var rgRequest = {
		id: instance.m_ws_ps,
		type: 9
	};
	
	instance.Write(new instance.m_protobuf_Request(rgRequest), function(rgResult){
		callback();
	});
}
