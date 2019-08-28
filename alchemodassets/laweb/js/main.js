var iscrollLibrary;
var iscrollAlphabeth;

var gaPlugin;

loadingScreen.init();

$(document).ready(function() {
	FastClick.attach(document.body);

	var LA2_LINK = 'market://details?id=com.recloak.littlealchemy2';
	$(document).on('touchstart click', '[data-la2]', function(e) {
		window.open(LA2_LINK, '_system', 'location=true');
		e.preventDefault();
		e.stopPropagation();
	});

	gestures.init();
	settings.init();
	localization.init();

	bases.load();
	storage.init();
	templates.init();
	update.init();
	GoogleAPI.init();

	$(document).on("basesLoaded", function() {
		game.init();

		search.init();
		workspace.init();
		library.init();

		if(typeof(IScroll) !== "undefined") {
			window.initIScroll();
		}
		else {
			$(document).one("IScrollLoaded", window.initIScroll);
		}

		loading.init();
	});

	window.onresize = function() {
		if(typeof iscrollAlphabeth !== "undefined" && typeof iscrollLibrary !== "undefined") {
			iscrollAlphabeth.refresh();
			iscrollLibrary.refresh();
		}

		library.elementOuterHeight = $("#library > .element").outerHeight();
	};
});

document.addEventListener("deviceready", function() {
	if(typeof(gapi) !== "undefined") {
		$(document).trigger("GAPILoaded");
	}

	window.gaPlugin = window.plugins.gaPlugin;
	window.gaPlugin = {
		init: window.ga.startTrackerWithId,
		trackPage: window.ga.trackView,
		trackEvent: window.ga.trackEvent,
	};
    gaPlugin.init("UA-24907950-15", 15);
    gaPlugin.trackPage("index.html");

    document.addEventListener("menubutton", function() {
    	if(!menu.isVisible()) {
    		menu.open();
    	}
    	else {
    		menu.close();
    	}
    }, false);
}, false);

document.addEventListener("backbutton", function(e) {
	if(menu.$el.is(":visible")) {
		menu.close();
	}
	else if(GoogleLogin.authWindow !== null) {
		GoogleLogin.authWindow.close();
		GoogleLogin.authWindow = null;
	}
	else {
		e.preventDefault();

		workspace.save();

		if(navigator.app){
			navigator.app.exitApp();
		}
		else if(navigator.device){
			navigator.device.exitApp();
		}
	}
}, false);

document.addEventListener("online", game.changeConnectionStatus, false);
document.addEventListener("offline", game.changeConnectionStatus, false);

document.addEventListener("resume", onResume, false);
function onResume() {
	// maybe when app was pause remote progress changed, so check it
	if(GoogleAPI.logged) {
	    update.load("history");
	}

	game.checkOnline();
}

document.addEventListener("pause", function() {
	workspace.save();
}, false);

GAPILoaded = function() {
	$(document).trigger("GAPILoaded");
};

GAPILoadError = function() {
	loadingScreen.incrementProgress("GAPILoaded");
};

document.addEventListener('touchmove', function (e) {
	e.preventDefault();
}, false);

document.oncontextmenu = function(e) {
	return false;
};

var initIScroll = function() {
	iscrollLibrary = new IScroll('#outerLibrary', {
		mouseWheel: true
	});
	iscrollLibrary.on('scrollStart', function() {
		$(document).trigger("libraryScrollStart");
	});

	iscrollAlphabeth = new IScroll('#alphabet', {
		mouseWheel: true,
		click: true
	});

	$(document).trigger("iscrollInitiated");
};

// ios 7.1 full screen dirty hack
window.addEventListener("orientationchange", function(){document.body.scrollTop = 0;}, false);

// DEBUG
window.onerror = game.reportError;
// window.onerror = function(errorMsg, url, lineNumber) {
// 	alert(errorMsg + " : " + errorMsg.type + " : " + url + " : " + lineNumber);
// }
