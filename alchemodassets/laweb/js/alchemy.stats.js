/**
 * Alchemy.Stats
 * Gathering data to create statistics.
 *
 * @package: Alchemy
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 *
 * @data:
 *		lastChildName
 *		lastChild - id
 *		lastParents - ids
 *		lastDate - date of creation of last element
 *		progress
 *		progressToday
 *		failCount
 *		failInRow
 *		failDate
 *		failParents
 *		numberOfClicks
 *		numberOfAFK
 *		online
 *		logged
 *		startDate
 *		loginDate
 *		quitDate
 *		timeSpent
 *		elementsPositions
 *
 */
/*global bases, game, login, update*/

var stats = {
	init : function() {
		// when user is leaving synchronize stats
		// window.onbeforeunload = function() {
		// 	// stats.initAnonymous();
		// 	// stats.data.timeSpent = parseInt(localStorage.getItem("timeSpent"), 10) + Math.floor(stats.time.total + stats.time.currentTime);

		// 	// if(stats.data.online){
		// 	// 	stats.updateOnline();
		// 	// }
		// 	// else{
		// 	// 	stats.updateOffline();
		// 	// }
		// };


		// stats.time.start();

		stats.data = {
			lastEvent : '',
			progress : 0,
			progressToday : 0,

			lastChild : 0,
			lastChildName : '',
			lastParents : [],
			lastDate : 0,

			failCount : 0,
			failInRow : [0],
			failParents : [],
			failDate: [],

			numberOfClicks : 0,
			numberOfAFK : 0,	// more than 15 sec

			online : true,
			logged : false,
			startDate : new Date().getTime(),

			maxElementsOnWorkspace: 0,

			elementsPositions : []	// save every time success or fail attempt
		};

		stats.initEvents();
		stats.initLA2();
		// stats.initAnalytics();
		// stats.updateOnStart();
	},

	initEvents : function() {
		$(document).on("newChildCreated", function(event, child) {
			stats.data.lastChild = child;
			stats.data.lastChildName = bases.names[child];
			stats.data.progress = game.progress.length + game.prime.length;
			stats.data.progressToday += 1;

			stats.data.failInRow.push(0);

			stats.data.elementsPositions.push(stats.getElementsPositions());
			if(stats.data.elementsPositions[stats.data.elementsPositions.length - 1] > stats.data.maxElementsOnWorkspace) {
				stats.data.maxElementsOnWorkspace = stats.data.elementsPositions[stats.data.elementsPositions.length - 1];
			}

			stats.data.lastMixAttempt = new Date().getTime();
		});

		$(document).on("updateHistory", function(event, parents, date) {
			stats.data.lastParents = parents;
			stats.data.lastDate = date;
		});

		$(document).on("childCreationFail", function(event, parents) {
			stats.data.failCount += 1;
			stats.data.failInRow[(stats.data.failInRow.length - 1)] += 1;
			stats.data.failParents.push(parents);
			stats.data.failDate.push(new Date().getTime());

			// stats.data.elementsPositions.push(stats.getElementsPositions());
			// if(stats.data.elementsPositions[stats.data.elementsPositions.length - 1] > stats.data.maxElementsOnWorkspace) {
				// stats.data.maxElementsOnWorkspace = stats.data.elementsPositions[stats.data.elementsPositions.length - 1];
			// }

			stats.data.lastMixAttempt = new Date().getTime();
		});

		$(document).on("loginCompleted", function() {
			stats.data.logged = true;
			stats.data.loginDate = new Date().getTime();
		});

		$(document).on("online", function() {
			stats.data.online = true;
		});

		$(document).on("awayFromKeyboard", function() {
			stats.data.numberOfAFK += 1;
		});

		$(document).on("click", function() {
			stats.data.numberOfClicks += 1;
		});

		$(document).on("onbeforeunload", function() {
			stats.data.logoutDate = new Date().getTime();
			stats.data.timeSpent = parseInt(window.localStorage.getItem("timeSpent"), 10) + Math.floor(stats.time.total + stats.time.currentTime);
		});

		$(document).on("newChildCreated updateHistory childCreationFail loginCompleted online", function(e) {
			stats.data.lastEvent = e.type;
			$(document).trigger("statsDataUpdated");	//trigger for notifications
		});
	},

	initAnalytics : function() {
		// opening menu
		$("#menu").on('touchstart', function() {
			gaPlugin.trackEvent(null, null, 'Menu', 'Opened');
        });

		// opening specific tab
		$(document).on('menuTabOpened', function(event, tabname) {
			gaPlugin.trackEvent(null, null, 'Menu', 'Tab opened', tabname, 0);
		});

		// changing settings
		$(document).on("change", "#settingsCheckAlreadyCombined", function() {
			gaPlugin.trackEvent(null, null, 'Settings', 'Check already combined', this.checked ? "true" : "false", 0);
		});

		$(document).on("change", "#settingsMarkFinalElements", function() {
			gaPlugin.trackEvent(null, null, 'Settings', 'Mark final elements', this.checked ? "true" : "false", 0);
		});

		$(document).on("change", "#settingsHideFinalElements", function() {
			gaPlugin.trackEvent(null, null, 'Settings', 'Hide final elements', this.checked ? "true" : "false", 0);
		});

		$(document).on("change", "#settingsTurnOffNotifications", function() {
			gaPlugin.trackEvent(null, null, 'Settings', 'Turn off notifications', this.checked ? "true" : "false", 0);
		});

		$(document).on("change", "#settingsLanguage", function() {
			gaPlugin.trackEvent(null, null, 'Settings', 'Language', this.options[this.selectedIndex].value, 0);
		});

		// creating new element
		// fail streak
		// $(document).on("newChildCreated", function(event, id) {
		// 	gaPlugin.trackEvent(null, null, 'Elements', 'New element', id, 0);
		// 	if(stats.data.failInRow.length >= 2 && stats.data.failInRow[stats.data.failInRow.length - 2] > 0) {
		// 		// gaPlugin.trackEvent(null, null, 'Elements', 'Fails in streak', stats.data.failInRow[stats.data.failInRow.length - 2]  + " ", 0);
		// 	}
		// });

		// fail parents
		// $(document).on("childCreationFail", function(event, parents) {
			// gaPlugin.trackEvent(null, null, 'Elements', "Failed parents", parents[0] + " | " + parents[1], 0);
		// });

		// clone element
		$(document).on("cloneWorkspaceBox", function(event, event_, element) {
			gaPlugin.trackEvent(null, null, 'Elements', "Clone element", element.id, 0);
		});

		// logged in
		$(document).on("loggedIn", function() {
			gaPlugin.trackEvent(null, null, 'Google+', 'Logged in', GoogleAPI.player.id, 0);
		});

		// achievement earned
		$(document).on("achievementEarned", function(e, achievementId) {
			gaPlugin.trackEvent(null, null, 'Achievements', 'Earned', achievementId, 0);
		});

		// hidden element created
		$(document).on("hiddenElementCreated", function(e, id) {
			gaPlugin.trackEvent(null, null, 'Elements', 'Hidden element', id, 0);
		});

		// share screenshot
		$(document).on("sharedScreenshot", function() {
			gaPlugin.trackEvent(null, null, 'Share', 'Screenshot', "", 0);
		});

		// share progress
		$(document).on("sharedProgress", function(e, p) {
			gaPlugin.trackEvent(null, null, 'Share', 'Progress', p + "", 0);
		});

		// share element
		$(document).on("sharedElement", function(e, id) {
			gaPlugin.trackEvent(null, null, 'Share', 'Element', id, 0);
		});

		// clear workspace
		// $("#clearWorkspace").on("touchstart", function() {
		// 	gaPlugin.trackEvent(null, null, 'Elements', 'Clear workspace', "Cleared", 0);
		// });

		// send stats about hole session
		// document.addEventListener("pause", function() {
		// 	gaPlugin.trackEvent(null, null, 'Progress', 'In session', stats.data.progressToday + " ", 0);
		// 	gaPlugin.trackEvent(null, null, 'Elements', 'Fails in session', stats.data.failCount + " ", 0);
		// }, false);
	},

	initLA2: function() {
		$(document).on("click", "[data-la2]", function(e) {
			ga('send', 'event', 'LA2', 'android', e.currentTarget.getAttribute('data-la2'));
		});
	},

	initAnonymous : function() {
		var i;

		if(!stats.data.logged && localStorage.getItem("uid") === null) {
			stats.uid = new Date().getTime() + "";

			var text = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for(i = 0; i < 10; i++ ){
		        text += possible.charAt(Math.floor(Math.random() * possible.length));
		    }

		    stats.uid += text;

		    window.localStorage.setItem("uid", stats.uid);
		}
	},

	getElementsPositions : function() {
		var positions = [];
		var offset, elementId;
		var elements = $("#workspace > .element");

		for(var i = 0, ii = elements.length; i < ii; i++) {
			offset = $(elements[i]).offset();
			offset.left = Math.floor(offset.left);
			offset.top = Math.floor(offset.top);

			if(offset.top > 0 && offset.left > 0) {
				elementId = elements[i].getAttribute("data-elementId");

				positions.push({
					position: offset,
					id: parseInt(elementId, 10)
				});
			}
		}

		return positions;
	}
};

stats.init();
