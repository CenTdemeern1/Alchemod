/**
 * Alchemy.Update
 * Handle all communication with data base.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyright: Recloak
 *
 * @events:
 *		historyUpdated
 */

var update = {
	types: {
 		history: {
 			slot: 0,
 			lastSaveVersion: '',
 			data: function() {
 				var obj = {
 					parents: game.history.parents,
 					date: game.history.date,
 					reset: storage.getReset()
 				};

 				return JSON.stringify(obj);
 			},
 			merge: function() {}, //callback function
 			synchronized: false
 		},
 		settings: {
 			slot: 1,
 			lastSaveVersion: '',
 			data: function() {
 				return JSON.stringify(settings.data);
 			},
 			merge: function() {},
 			synchronized: false
 		},
 		achievements: {
 			slot: 2,
 			lastSaveVersion: '',
 			merge: function() {}
 		}
 	},
 	path: 'appstate/v1/states/',

	init : function() {
		update.types.history.merge = update.mergeHistoryData;
 		// update.types.settings.merge = update.mergeSettingsData;

		$(document).on("loggedIn", function() {
			if(GoogleAPI.logged) {
				update.synchronize("history");
				// update.synchronize("settings");
			}
		});

		$(document).on("loggedOut", function() {
			update.types.history.synchronized = false;
			// update.types.settings.synchronized = false;
		});

		$(document).on("progressInitiated", function() {
			if(GoogleAPI.logged) {
				update.synchronize("history");
			}
		});

		$(document).on("updateHistory", function(event, parents, date) {
			if(GoogleAPI.logged) {
				update.save("history");
			}
		});
	},

	resetHistory : function() {
		if(game.history.parents.length === 0 && GoogleAPI.logged) {
			update.save("history");
		}
	},

	synchronize : function(type) {
		if(update.types[type].synchronized) {
			return;
		}

		update.load(type, function() {
			update.types[type].synchronized = true;
			update.save(type);
		});
	},

	load : function(type, callback) {
		gapi.client.request({
			path: update.path + update.types[type].slot,
			method: 'get',
			callback: function(response, rawResponse) {
				// console.log('Cloud get response: ', response, rawResponse);

				var responseObject = JSON.parse(rawResponse);
				// remote storage is empty
				if (responseObject.gapiRequest.data.status == 404) {
					update.types[type].lastSaveVersion = response.currentStateVersion;
					update.save(type);
				} 
				// unauthorized
				else if( responseObject.gapiRequest.data.status == 401 ) {
					$(document).trigger("unauthorized");
				}
				else {
					// console.log('GET - success: ', response);
					if (response.kind == ('appstate#getResponse') && response.hasOwnProperty('data')) {
						update.types[type].lastSaveVersion = response.currentStateVersion;
						update.types[type].merge(JSON.parse(response.data));
					} 
					// else -> not expected response
				}
				
				if(callback != null) {
					callback();
				}
			}
		});
 	},

 	save : function(type, callback) {
		var paramsObj = {};
		if (update.types[type].lastSaveVersion != '') {
			paramsObj['currentStateVersion'] = update.types[type].lastSaveVersion;
		}
		
		gapi.client.request({
			path: update.path + update.types[type].slot,
			params: paramsObj,
			body: {
				kind: 'appstate#updateRequest',
				data: update.types[type].data()
			},
			method: 'put',
			callback: function (data, rawResponse) {
				// console.log('Cloud update response: ', data, rawResponse);
				var responseObject = JSON.parse(rawResponse);

				if (responseObject.gapiRequest.data.status == 409) {
					// conflict, we have old version number, got to load and save again
					// console.log("Out of date, wrong lastSaveVersion");

					update.load(type, function() {
						update.save(type);
					});
				} 
				// unauthorized
				else if( responseObject.gapiRequest.data.status == 401 ) {
					$(document).trigger("unauthorized");
				}
				else if (data.kind == "appstate#writeResult") {
					if (!data.hasOwnProperty('error')) {
						// everything ok, successfully updated
						update.types[type].lastSaveVersion = data.currentStateVersion;

						if(callback != null) {
							callback();
						}
					}
				}
			}
		});
 	},

	mergeHistoryData : function(loadedData) {
		var checkReset = function() {
			if(loadedData.reset !== -1) {
				var parents = [];
				var date = [];

 				for(var i = game.history.parents.length - 1; i >= 0; i--) {
 					if(parseInt(game.history.date[i], 10) < loadedData.reset) {
 						// we take element at position 0, because splice returns array of elements deleted
 						parents.push( game.history.parents.splice(i, 1)[0] );
 						date.push( game.history.date.splice(i, 1)[0] );

 						changed = true;
 					}
	 			}

	 			// if some elements were removed then save old progress
	 			if(changed) {
	 				game.saveOldProgress(parents, date);
	 			}

	 			// update reset timestamp
	 			if(loadedData.reset > storage.getReset()) {
	 				storage.setReset(loadedData.reset);
	 			}
 			}
		};
 		// checking history, primary one is local
 		var changed = false;

 		if(loadedData.parents.length > 0) {
 			// only if remote data is not empty we check and merge
	 		if(game.history && game.history.parents.length === 0) {
	 			// if local history is empty and remote is not
	 			storage.setReset(loadedData.reset);
	 			delete loadedData.reset;

	 			game.history = loadedData;
	 			changed = true;
	 		}
	 		else {
	 			// if not empty, then we check all remote parents if they are in local one
	 			for(var i = 0, ii = loadedData.parents.length; i < ii; i++) {
	 				if(game.checkIfNotAlreadyDone(loadedData.parents[i])) {
	 					// not in local history so add
	 					game.history.parents.push(loadedData.parents[i]);
	 					game.history.date.push(loadedData.date[i]);

	 					changed = true;
	 				}
	 			}

	 			// if reset is !== -1  then remove items created before reset timestamp
	 			checkReset();
	 		}
 		}
 		// if remote is empty it might have just beed reseted
 		else {
			checkReset();
 		}

 		// we changed local history so update it (localStorage)
 		if(changed) {
 			game.history = game.checkHistoryIntegrity(game.history);
 			storage.updateHistory();
 			game.initProgress();

 			workspace.clearSpecified(workspace.$el.find(".element"));
			library.reload();
 		}

 		$(document).trigger("historySynchronized");
 	},

 	// mergeSettingsData : function(loadedData) {
 	// 	// checking settings, primary one is remote
 	// 	for(var setting in loadedData) {
 	// 		if(settings.data.hasOwnProperty(setting)) {
 	// 			if(loadedData[setting] !== settings.data[setting]) {
 	// 				// if local != remote then change local
 	// 				settings.data[setting] = loadedData[setting];
 	// 			}
 	// 		}
 	// 	}

 	// 	storage.updateSettings();
 	// },

 	// synchronizeAchievements : function() {
	// 	Clay.Player.fetchUserData('achievements', function( response ) {
	// 		//console.log("syncAchievements", response);
	// 		if(response.data && response.data.length !== 0) {
	// 			var data = JSON.parse(response.data);
	// 			for(var i = 0, ii = data.length; i < ii; i++) {
	// 				if(achievements.earnedList.indexOf(data[i]) == -1) {
	// 					achievements.earnedList.push(data[i]);
	// 				}
	// 			}

	// 			$(document).trigger("updateAchievements");
	// 		}
	// 	});
	// },

	// updateAchievements : function() {
	// 	Clay.Player.saveUserData('achievements', JSON.stringify(achievements.earnedList), function( response ) {
	// 		//console.log("updateAchievements", response);
	// 		return false;
	// 	});
	// },
};