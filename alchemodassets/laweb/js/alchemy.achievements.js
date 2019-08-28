/**
 * Alchemy.Achievements 
 * Handling achievements.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 */

var achievements = {
	earnedList: [],

	// remote player achievements list
	playerList: {},

	init : function() {
		achievements.earnedList = storage.getAchievements();

		achievements.loadData();
		achievements.checked = false;

		if(bases && bases.loaded && typeof(achievements.data) !== "undefined") {
			achievements.initialCheck();
			achievements.initConditionsEvents();
		}
		else {
			$(document).one("progressInitiated", function() {
				achievements.loadData();

				achievements.initialCheck();
				achievements.initConditionsEvents();
			});
		}
		
		$(document).on("achievementsTabShown", function() {
			$("#achievementsList").html(templateEngine(templates.list["achievements"], { achievements: achievements.getDataToShow() }));
		});

		$(document).on("GAPIclientLoaded loggedIn", function() {
			if(GoogleAPI.logged && !achievements.checked && gapi.client.games) {
				achievements.getPlayerList();
				achievements.initConditionsEvents();
			}
		});

		$(document).on("loggedOut", function() {
			achievements.checked = false;
		});

		$(document).on("historySynchronized", function() {
			if(typeof(achievements.data) !== "undefined") {
				achievements.initialCheck();
			}
		});		
	},

	checkEarnedIntegrity: function() {
		var exists = false;
		for(var i = achievements.earnedList.length - 1; i >= 0; i--) {
			for(var j = 0; j < achievements.data.length; j++) {
				if(achievements.earnedList[i] ===  achievements.data[j].id) {
					exists = true;
					break;
				}
			}

			if(!exists) {
				achievements.earnedList.splice(i, 1);
			}
		}
	},

	loadData: function() {
		if(typeof(achievementsData) !== "undefined" && typeof(achievements.data) === "undefined") {
			achievements.data = achievementsData;

			achievements.checkEarnedIntegrity();
		}
	},

	initialCheck : function() {
		for(var i = 0, ii = achievements.data.length; i < ii; i++) {
			if(achievements.earnedList.indexOf(achievements.data[i].id) === -1
			&& achievements.data[i].hasOwnProperty("initCheck")) {
				if(achievements.data[i].initCheck()) {
					achievements.earnedList.push(achievements.data[i].id);
				}
			}
		}

		$(document).trigger("updateAchievements");
	},

	initConditionsEvents : function() {
		for(var i = 0, ii = achievements.data.length; i < ii; i++) {
			(function(index) {
				if(achievements.earnedList.indexOf(achievements.data[index].id) == -1) {
					$(document).on(achievements.data[index].events, function handler(e, data) {
						// if specified event occures we check if conditions are fullfiled
						if(achievements.earnedList.indexOf(achievements.data[index].id) == -1) {
							if(!achievements.data[index].hasOwnProperty("check") || achievements.data[index].check(data)) {
								achievements.earn(achievements.data[index].id, {trigger: true});
								$(document).off(achievements.data[index].events, handler);
							}
						}
					});
				}
			} (i));
		}
	},

	earn : function(achievementId, options) {
		achievements.earnedList.push(achievementId);
		achievements.unlock(achievements.getById(achievementId).gapiId);

		$(document).trigger("updateAchievements");
		$(document).trigger("achievementEarned", [achievementId]);
	},

	getByGapiId: function(id) {
		for(var i = 0; i < achievements.data.length; i++) {
			if(id === achievements.data[i].gapiId) {
				return achievements.data[i];
			}
		}
	},

	getById: function(id) {
		for(var i = 0; i < achievements.data.length; i++) {
			if(id === achievements.data[i].id) {
				return achievements.data[i];
			}
		}
	},

	getDataToShow : function() {
		var texts = {};
		var data = [];
		var image;
		var earned;
		
		for(var i = 0, ii = achievements.data.length; i < ii; i++) {
			texts = localization.get("achievements-" + achievements.data[i].id);
			earned = achievements.earnedList.indexOf(achievements.data[i].id) !== -1;
			image = earned ? achievements.data[i].imageEarned : achievements.data[i].imageNotEarned;
			data.push({
				title: texts.title,
				description: texts.description,
				earned: earned,
				image: image
			});
		}

		return data;
	},

	synchronize: function() {
		// synchronize local
		for(var gapiId in achievements.playerList) {
			if(achievements.playerList[gapiId].achievementState === "UNLOCKED") {
				if(achievements.earnedList.indexOf(achievements.getByGapiId(gapiId).id) == -1) {
					achievements.earnedList.push(achievements.getByGapiId(gapiId).id);
				}
			}
		}
		$(document).trigger("updateAchievements");

		// synchronize remote
		var gapiId;
		var achvmnt;
		for(var i = 0; i < achievements.earnedList.length; i++) {
			achvmnt = achievements.getById(achievements.earnedList[i]);
			if(achvmnt && achvmnt.hasOwnProperty("gapiId")) {
				gapiId = achvmnt.gapiId;
				if(gapiId && achievements.playerList[gapiId].achievementState !== "UNLOCKED") {
					achievements.unlock(gapiId);
				}
			}
		}
	},

	unlock : function(achievementGapiId) {
		if(!GoogleAPI.logged || !gapi.client.games) {
			return;
		}

		if(achievementGapiId.hasOwnProperty("incremental")) {
			achievements.incrementRequest(achievementGapiId);
		}
		else {
			achievements.unlockRequest(achievementGapiId);
		}
	},

	unlockRequest : function(id) {
		var request = gapi.client.games.achievements.unlock({
			achievementId: id
		});

		request.execute(function(response) {
			// console.log('Data from earning achievement is ', response);
			// if (response.newlyUnlocked) {
				// console.log("You unlocked achievement");
			// } 
			// else {
				// already unlocked earlier
				// console.log('You unlocked ' + achievements.list[achievementId].name + ' but you already unlocked it earlier.');
			// }
		});
	},

	incrementRequest : function(id) {
		var request = gapi.client.games.achievements.increment({
			achievementId: id,
			stepsToIncrement: 1
		});
		
		request.execute(function(response) {
			// console.log('Data from incrementing achievement is ', response);

			achievements.playerList[id].currentSteps = response.currentSteps;
			
			if (response.newlyUnlocked) {
				achievements.playerList[id].achievementState = "UNLOCKED";
				// console.log("You unlocked incremental achievement")
			} 
			// else if(achievements.playerList[id].achievementState !== "UNLOCKED") {
				// console.log('You haven\'t unlocked ' + achievements.list[achievementId].name);
			// }
			// else -> already unlocked
		});
	},

	getPlayerList : function() {
		var request = gapi.client.games.achievements.list({
			playerId: 'me'
		});
	
		request.execute(function(response) {
			// console.log('Your achievement data: ', response);
			if (response.kind === 'games#playerAchievementListResponse' && response.hasOwnProperty('items')) {
				for (var i = 0, ii = response.items.length; i < ii; i++) {
					delete response.items[i].kind;
					delete response.items[i].formattedCurrentStepsString;

					achievements.playerList[response.items[i].id] = response.items[i];
				}

				achievements.synchronize();
				achievements.checked = true;
			} 
		});
	},

	reset: function() {
		achievements.earnedList = [];
		$(document).trigger("updateAchievements");
	}
};

achievements.init();