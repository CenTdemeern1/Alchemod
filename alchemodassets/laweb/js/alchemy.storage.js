/**
 * Alchemy.window.storage
 * Responsible for window.localStorage initialization.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyright: ReCloak Interactive
 *
 * NEEDS REFACTOR - use Object.property (get, set)
 */
 /*global game, settings*/

window.storage = {
	init : function() {
		window.storage.checkOldVersionHistory();
		window.storage.checkHistory();
		window.storage.checkSettings();
		window.storage.checkAchievements();
		window.storage.checkReset();
		window.storage.checkOldHistory();
		window.loading.modificationDates = window.storage.getModificationDates();

		$(document).on("updateHistory", window.storage.updateHistory);
		$(document).on("updateSettings", window.storage.updateSettings);
		$(document).on("updateAchievements", window.storage.updateAchievements);
		$(document).on("updateReset", window.storage.updateReset);
		$(document).on("progressInitiated", window.storage.checkImportedHistory);

		// we reset progress when user logges out to prevent another person who log in from having reseted progress
		$(document).on("notLoggedIn loggedOut", function() {
			window.storage.setReset(-1);
		});
	},
	
	getHistory : function() {
		if(window.localStorage.getItem("progress") !== null) {
			return window.localStorage.getItem("progress");
		}

		return null;
	},

	checkOldVersionHistory : function() {
		// if there is old history then parse it
		if(window.localStorage.getItem("history") !== null 
		&& window.localStorage.getItem("history").length != 0 
		&& window.localStorage.getItem("progress") === null) { 
			var data = JSON.parse(window.localStorage.getItem("history"));
			var history = {
				parents: [],
				date: []
			};

			for(var i = 0, ii = data.parents.length; i < ii; i++) {
				history.parents.push([
					Math.min(data.parents[i][0] + 1, data.parents[i][1] + 1),
					Math.max(data.parents[i][0] + 1, data.parents[i][1] + 1)
				]);
				history.date.push(data.date[i]);
			}
			
			window.localStorage.setItem("progress", JSON.stringify(history));
			
			if(bases.base) {
				game.initProgress();
				game.getFinalElements();

				library.reload();
			}

			// remove old version settings (just in case it will crash sth)
			localStorage.removeItem("settings");
			localStorage.removeItem("history");

			// remove other not longer unused fields
			localStorage.removeItem("uid");
			localStorage.removeItem("timeSpent");
			localStorage.removeItem("notification");
		}
	},

	// checking progress imported by tool
	checkImportedHistory: function() {
		// if progress was imported by oldProgress tool
		if(window.localStorage.getItem("history") !== null 
		&& window.localStorage.getItem("progress") !== null) {
			var data = JSON.parse(window.localStorage.getItem("history"));
			var parents;

			for(var i = 0, ii = data.parents.length; i < ii; i++) {
				parents = [
					Math.min(data.parents[i][0] + 1, data.parents[i][1] + 1),
					Math.max(data.parents[i][0] + 1, data.parents[i][1] + 1)
				];

				if(game.checkIfNotAlreadyDone(parents)) {
					game.history.parents.push(parents);
					game.history.date.push(data.date[i]);
				}
			}
			
			$(document).trigger("updateHistory");
			localStorage.removeItem("history");
			
			if(bases.base) {
				game.initProgress();
				game.getFinalElements();

				if(typeof(library.el) !== "undefined" && library.el !== null) {
					library.reload();
				}
			}
		}
	},

	checkHistory : function() {
		if(window.localStorage.getItem("progress") === null || window.localStorage.getItem("progress").length === 0) { // if no such record, then create it
			var history = {
				parents: [],
				date: []
			};
			
			window.localStorage.setItem("progress", JSON.stringify(history));
		}
	},
	
	updateHistory : function() {
		window.localStorage.setItem("progress", JSON.stringify(window.game.history));		
	},

	resetHistory : function() {
		storage.updateReset();
		window.localStorage.removeItem("progress");
		window.storage.checkHistory();
	},

	checkSettings : function() {
		if(window.localStorage.getItem("settings") === null || window.localStorage.getItem("settings").length === 0) { // if no such record, then create it
			window.localStorage.setItem("settings", JSON.stringify(window.settings.def));
		}
	},

	getSettings : function() {
		if(window.localStorage.getItem("settings") !== null) {
			return JSON.parse(window.localStorage.getItem("settings"));
		}

		return null;
	},

	updateSettings : function() {
		window.localStorage.setItem("settings", JSON.stringify(window.settings.data));				
	},

	checkTime : function() {
		if(window.localStorage.getItem("timeSpent") === null) { // if no such record, then create it
			window.localStorage.setItem("timeSpent", 0);
		}
	},

	updateTime : function(time_) {
		window.localStorage.setItem("timeSpent", time_);
	},

	updateModificationDates : function() {
		window.localStorage.setItem("modificationDates", JSON.stringify(loading.modificationDates));
	},

	getModificationDates : function() {
		if(window.localStorage.getItem("modificationDates") !== null) {
			return JSON.parse(window.localStorage.getItem("modificationDates"));
		}

		return {};
	},

	checkAchievements : function() {
		if(window.localStorage.getItem("achievements") === null || window.localStorage.getItem("achievements").length === 0) { // if no such record, then create it
			window.localStorage.setItem("achievements", JSON.stringify([]));
		}
	},

	getAchievements : function() {
		if(window.localStorage.getItem("achievements") !== null) {
			return JSON.parse(window.localStorage.getItem("achievements"));
		}

		return [];
	},

	updateAchievements : function() {
		window.localStorage.setItem("achievements", JSON.stringify(window.achievements.earnedList));				
	},

	checkReset : function() {
		if(window.localStorage.getItem("reset") === null || window.localStorage.getItem("reset").length === 0) { // if no such record, then create it
			window.localStorage.setItem("reset", -1);
		}
	},

	getReset : function() {
		return parseInt(window.localStorage.getItem("reset"), 10);
	},

	setReset : function(value) {
		window.localStorage.setItem("reset", value);
	},

	updateReset : function() {
		if(GoogleAPI.logged) {
			window.localStorage.setItem("reset", (new Date()).getTime());
		}
	},

	getName : function() {
		var name = window.localStorage.getItem("name") || "";
		return name;
	},

	setName : function(value) {
		window.localStorage.setItem("name", value);
	},

	// checking old history - before reset
	checkOldHistory : function() {
		// if no such record, then create it
		if(window.localStorage.getItem("progressBeforeReset") === null || window.localStorage.getItem("progressBeforeReset").length === 0) {
			var history = {
				parents: [],
				date: []
			};
			
			window.localStorage.setItem("progressBeforeReset", JSON.stringify(history));
		}
	},
	
	setOldHistory : function(oldHistory) {
		window.localStorage.setItem("progressBeforeReset", JSON.stringify(oldHistory));		
	},

	getOldHistory : function() {
		if(window.localStorage.getItem("progressBeforeReset") !== null) {
			return JSON.parse(window.localStorage.getItem("progressBeforeReset"));
		}

		return {};
	},

	getElementPositions : function() {
		if(window.localStorage.getItem("elementPositions") !== null && window.localStorage.getItem("elementPositions").length > 0) {
			return JSON.parse(window.localStorage.getItem("elementPositions"));
		}

		return [];
	},

	setElementPositions : function(value) {
		window.localStorage.setItem("elementPositions", JSON.stringify(value));
	},

	getNotifications : function() {
		if(window.localStorage.getItem("notifications") !== null) {
			return JSON.parse(window.localStorage.getItem("notifications"));
		}

		return [];
	},

	updateNotifications : function() {
		window.localStorage.setItem("notifications", JSON.stringify(window.notifications.shown));				
	},

	getLoadingMessages : function() {
		if(window.localStorage.getItem("loadingMessages") !== null) {
			return JSON.parse(window.localStorage.getItem("loadingMessages"));
		}

		return [];
	},

	updateLoadingMessages : function(data) {
		window.localStorage.setItem("loadingMessages", JSON.stringify(data));				
	},

	getAuthUser: function() {
		if(window.localStorage.getItem("authuser") !== null) {
			return window.localStorage.getItem("authuser");
		}

		return -1;
	},

	setAuthUser: function(value) {
		window.localStorage.setItem("authuser", value);
	}
};