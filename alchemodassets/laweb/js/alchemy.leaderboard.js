/**
 * Alchemy.leaderboard 
 * Handling leaderboards.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 *
 * @events:
 */

var leaderboard = {
	boardIDs: {
		progress: 'CgkIz_OApZAJEAIQAQ',
		connections: 'CgkIz_OApZAJEAIQBg'
	},
	scores: {}, 

	init : function() {
		// $(document).on("newChildCreated", function() {
		// 	if(GoogleAPI.logged) {
		// 		leaderboard.submitScore("progress", game.progress.length + game.prime.length);
		// 	}
		// });

		// $(document).on("updateHistory", function() {
		// 	if(GoogleAPI.logged) {
		// 		leaderboard.submitScore("connections", game.history.parents.length);
		// 	}
		// });

		// $(document).on("leaderboardsTabShown",  function() {
		// 	document.getElementById("leaderboard").style.display = "none";
		// 	document.getElementById("shareLeaderboard").style.display = "none";
		// 	document.getElementById("leaderboardWaitText").style.display = "block";

		// 	leaderboard.getScores("progress", function() {
		// 		$("#leaderboard").html(templateEngine(templates.list["leaderboards"], leaderboard.scores["progress"]));
		// 		document.getElementById("leaderboard").style.display = "block";
		// 		document.getElementById("leaderboardWaitText").style.display = "none";

		// 		if(leaderboard.scores["progress"].list.length <= 1) {
		// 			document.getElementById("shareLeaderboard").style.display = "block";
		// 		}

		// 		window.setTimeout(function() {
		// 			menu.refreshIScroll();	
		// 		}, 100);
		// 	}, "SOCIAL");
		// // }, "PUBLIC");
		// });
	},

	// submitScore : function(leaderBoardType, score_) {
	// 	if(typeof(gapi.client.games) === "undefined") {
	// 		return false;
	// 	}

	// 	var request = gapi.client.games.scores.submit({
	// 		leaderboardId: leaderboard.boardIDs[leaderBoardType],
	// 		score: score_
	// 	});

	// 	request.execute(function(response) {
	// 		// console.log('Submiting score: ', leaderBoardType, response);
	// 		// if (response.hasOwnProperty('beatenScoreTimeSpans')) {
	// 			// if(response.beatenScoreTimeSpans.length > 0) {
	// 				// TODO handle the beaten and unbeaten scores
	// 				// console.log(response.beatenScoreTimeSpans[0], " score beaten!");					
	// 			// }
	// 		// }
	// 	});
	// },

	// submitMultipleScores : function(scores) {
	// 	var params = {
	// 		kind: "games#playerScoreSubmissionList",
	// 		scores: []
	// 	};

	// 	for(var score_ in scores) {
	// 		if(leaderboard.boardIDs.hasOwnProperty(score_)) {
	// 			params.scores.push({
	// 				kind: "games#scoreSubmission",
	// 				leaderboardId: leaderboard.boardIDs[score_],
	// 				score: scores[score_] 
	// 			})
	// 		}
	// 	}

	// 	var request = gapi.client.games.scores.submitMultiple(params);
	// 	request.execute(function(response) {
	// 		// TODO handle beaten and unbeaten scores
	// 	});
	// },

	// getScores : function(leaderBoardType, callback, collectionType) {
	// 	var collection = collectionType || "PUBLIC";
	// 	// collectionType - "SOCIAL" or "PUBLIC"

	// 	// check if user is logged in and if this leaderBoardType is supported
	// 	if(GoogleAPI.logged && leaderboard.boardIDs.hasOwnProperty(leaderBoardType)) {
	// 		var request = gapi.client.games.scores.list({
	// 			collection: collection,
	// 			leaderboardId: leaderboard.boardIDs[leaderBoardType],
	// 			timeSpan: 'ALL_TIME'
	// 		});

	// 		request.execute(function(response) {
	// 			if(!response.hasOwnProperty("error")) {
	// 				leaderboard.parseResponse(leaderBoardType, response);

	// 				if(callback) {
	// 					callback();
	// 				}
	// 			}
	// 			else if(response.code === 401) {
	// 				$(document).trigger("unauthorized");
	// 			}
	// 		});
	// 	}
	// },

	// showScores : function(leaderBoardType, collectionType) {
	// 	var collection = collectionType || "PUBLIC";

	// 	leaderboard.getScores(leaderBoardType, function() {
	// 		$("#leaderboard").html(templateEngine(templates.list["leaderboards"], { players: leaderboard.scores[leaderBoardType].list }));
	// 	}, collection);
	// },

	// parseResponse : function(type, response) {
	// 	// getting player scores
	// 	leaderboard.scores[type] = {};

	// 	if (response.hasOwnProperty('playerScore')) {
	// 		leaderboard.scores[type].player = {
	// 			id: response.playerScore.player.playerId,
	// 			name: response.playerScore.player.displayName,
	// 			avatar: response.playerScore.player.avatarImageUrl,
	// 			score: response.playerScore.scoreValue,		
	// 			rank: response.playerScore.scoreRank,
	// 			timeStamp: response.playerScore.writeTimestampMillis
	// 		};
	// 	}
	// 	else {
	// 		leaderboard.scores[type].player = {
	// 			id: -1
	// 		};
	// 	}

	// 	// getting others on leaderboard scores
	// 	if (response.hasOwnProperty('items')) {
	// 		// empty list every time we want to put new scores
	// 		leaderboard.scores[type].list = [];

	// 		for (var i = 0, ii = response.items.length; i < ii; i++) {
	// 			leaderboard.scores[type].list.push({
	// 				id: response.items[i].player.playerId,
	// 				name: response.items[i].player.displayName,
	// 				avatar: response.items[i].player.hasOwnProperty("avatarImageUrl") ? response.items[i].player.avatarImageUrl : "img/achievement-earned-placeholder.png",
	// 				score: response.items[i].scoreValue,
	// 				rank: response.items[i].scoreRank,
	// 				timeStamp: response.items[i].writeTimestampMillis
	// 			});
	// 		}
	// 	}
	// }
};

leaderboard.init();