/**
 * Alchemy.Gapi 
 * Responsible for handling Google Plus API .
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 */

var GoogleAPI = {
	player: {
		id: -1,
		name: ""
	},

	checked: false,
	
	apiKey: "AIzaSyBWa6dXP4geUkBPMGx7uEDrUEYqO_C64IA",
	clientId: "313610222031",

	init : function() {
		$(document).on("GAPILoaded", function() {
			if(gapi.client) {
				gapi.client.setApiKey(GoogleAPI.apiKey);
			}

			if(!GoogleAPI.checked && game.isOnline) {
				window.setTimeout(function() {
					GoogleAPI.checkLogin(true);
				}, 1);
			}
		});

		GoogleAPI.logged = false;
		GoogleAPI.accessToken = '';

		GoogleAPI.$login = $("#login");
		
		GoogleAPI.initEvents();
	},

	initEvents : function() {
		GoogleAPI.$login.on("touchstart", function(e) {
			if(!GoogleAPI.logged && game.isOnline) {
				GoogleAPI.checkLogin(false);
			}
		});

		$(document).on("unauthorized", function() {
			var refresh_token = localStorage.getItem("refresh_token");
			if(refresh_token !== null) {
				GoogleLogin.refreshTokens(refresh_token);
			}
			else {
				var e = GoogleAPI.logged ? "loggedOut" : "notLoggedIn";
				$(document).trigger(e);
			}
		});

		$(document).on("loggedIn", function() {
			console.log("loggedIn");
			GoogleAPI.accessToken = GoogleLogin.token.access_token;

			GoogleAPI.$login.hide();
		});

		$(document).on("loggedOut", function() {
			GoogleAPI.logged = false;
			GoogleAPI.player = {};
			GoogleAPI.accessToken = null;
			storage.setAuthUser(-1);
				
			GoogleAPI.$login.show();

			GoogleLogin.loggedOut();
		});

		$(document).on("notLoggedIn", function() {
			storage.setAuthUser(-1);
		});

		$(document).on("offline", function() {
			GoogleAPI.$login.hide();
		});

		$(document).on("online", function() {
			if(!GoogleAPI.logged) {
				GoogleAPI.$login.show();
			}

			if(typeof(gapi) !== "undefined" && gapi && gapi.client) {
				gapi.client.setApiKey(GoogleAPI.apiKey);

				if(!GoogleAPI.checked && !GoogleAPI.logged) {
					GoogleAPI.checkLogin(true);
				}
			}
			else {
				GoogleAPI.loadGapiScript();
			}
		});

		$(document).on("languagePackLoaded", function() {
			GoogleAPI.$login.html( localization.get("login-login") );
		});

		$(document).on("unauthorized", function() {
			GoogleAPI.checkLogin(true);
		});
	},

	checkLogin : function(type) {
		if(type) {
			GoogleLogin.checkLogin(GoogleLogin.setupGAPI);
		}
		else {
			GoogleLogin.logIn();
		}
	},

	handleAuth : function(authResult) {
		GoogleAPI.checked = true;

		if (authResult && !authResult.error && !GoogleAPI.logged) {
			GoogleAPI.logged = true;
			GoogleAPI.accessToken = authResult.access_token;
			storage.setAuthUser(authResult.authuser);
			GoogleAPI.loadClient();

			$(document).trigger("loggedIn");
		}
		else if(GoogleAPI.logged) {
			$(document).trigger("loggedOut");
		}
		else {
			$(document).trigger("notLoggedIn");
		}
	},

	loadClient : function() {
		gapi.client.load('games', 'v1', function(response) {
			GoogleAPI.loadPlayer();

			$(document).trigger("GAPIclientLoaded");
		});
	},

	loadPlayer : function() {
		var request = gapi.client.games.players.get({playerId: 'me'});

		request.execute(function(response) {
			if(!response.error) {
				GoogleAPI.player.id = response.playerId;
				GoogleAPI.player.name = response.displayName;

				$(document).trigger("playerLoaded");
			}
		});
	},

	disconnect : function() {
		// window.plugins.googleplus.logout
		window.plugins.googleplus.disconnect(
	    function (msg) {
	      GoogleAPI.logged = false;
				GoogleAPI.player = {};
				GoogleAPI.accessToken = null;
				GoogleLogin.token = {};

				$(document).trigger("loggedOut");
	    }
		);
	},

	loadGapiScript: function() {
		var script = document.getElementById("GAPIScript");
		script.parentNode.removeChild(script);
		
		(function() {
            var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
            po.src = 'https://apis.google.com/js/client.js?onload=GAPILoaded'; po.id = "GAPIScript";
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
        })();
	}
};