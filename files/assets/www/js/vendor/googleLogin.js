var GoogleLogin = {
	data: {
		clientId: "313610222031-428kjepief7str6ij1m5i3190qcfojir.apps.googleusercontent.com",
		secret: "ik20ylx4NBhLUGdFr2Beu2US"
	},
	token: {},
	authWindow: null,

	logIn: function() {
		function onError(error) {
      console.error(error);
    }

    window.plugins.googleplus.login({
        webClientId: GoogleLogin.data.clientId,
        scopes: 'https://www.googleapis.com/auth/appstate',
      }, 
      function(loginData) {
        GoogleLogin.token.access_token = loginData.accessToken;
				GoogleLogin.token.refresh_token = loginData.idToken;
				GoogleLogin.token.id_token = loginData.idToken;
				GoogleLogin.token.refresh_time = (new Date()).getTime() + 1000 * loginData.expires_in;

				GoogleLogin.setupGAPI();
      }
    , onError);
	},

	checkLogin: function(callback) {
		window.plugins.googleplus.trySilentLogin(
	    {
	      webClientId: GoogleLogin.data.clientId,
        scopes: 'https://www.googleapis.com/auth/appstate',
	    },
	    function (loginData) {
	      GoogleLogin.token.access_token = loginData.accessToken;
				GoogleLogin.token.refresh_token = loginData.idToken;
				GoogleLogin.token.id_token = loginData.idToken;
				GoogleLogin.token.refresh_time = (new Date()).getTime() + 1000 * loginData.expires_in;

	      callback();
	    },
	    function (msg) {
	    	// TODO: on fail it loops and keeps asking for permission
	      $(document).trigger("notLoggedIn");
	    }
		);
	},

	setupGAPI: function() {
		gapi.auth.setToken("token", GoogleLogin.token);

		GoogleAPI.checked = true;
		GoogleAPI.logged = true;
		GoogleAPI.loadClient();

		$(document).trigger("loggedIn");
	},

	loggedOut: function() {
		GoogleLogin.token = {};

		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
		localStorage.removeItem("refresh_time");
	}
};
