/**
 * Alchemy.Conditions
 * Conditions for specified notofications. Returning true to show notification, false not to show.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyright: Recloak
 */

var notificationsHelpers = {
	checkProgressAndElements: function(elements, minProgress) {
		if(game.progress.length < minProgress) {
			return false;
		}

		for(var i = 0; i < elements.length; i++) {
			if(game.progress.indexOf(elements[i]) === -1) {
				return false;
			}
		}

		return true;
	},

	checkFailsInRow: function(minFails) {
		if(stats.data.lastEvent === "childCreationFail" 
		&& stats.data.failInRow[stats.data.failInRow.length - 1] >= minFails) {
			return true;
		}

		return false;
	}
};

var notificationsData = {
	elements: {
		isGroup: true,
		once: true,
		priority: 9,
		template: "element",
		duration: 15,
		selfBlocking: true,
		blocker: null,
		isBlocked: function() {
			if(this.blocker === null) {
				return false;
			}

			if(game.progress.indexOf(this.list[this.blocker].id) !== -1) {
				delete this.list[this.blocker];
				this.blocker = null;
				return false;
			}

			return true;
		},
		check: function(data) {
			return game.hasOwnProperty("progress")
			&&  game.progress.indexOf(data.id) === -1
			&&	notificationsHelpers.checkFailsInRow(data.failsInRow)
			&& 	notificationsHelpers.checkProgressAndElements(data.blockers, data.minProgress);
		},
		passData: function(data) {
			return {
				name: bases.names[data.id],
				image: bases.images[data.id]
			};
		},
		delay: function(data) {
			var DELAY_TIME = 5;
			var now = new Date().getTime();
			if((now > data.timestamp + DELAY_TIME * 1000)
			&& (stats.data.lastMixAttempt <= data.timestamp )) {
				return true;
			}

			if(stats.data.lastMixAttempt > data.timestamp) {
				return now;
			}

			return false;
		},
		list: {
			plant : {
				id: 24,
				blockers: [13],
				minProgress: 5,
				failsInRow: 10
			},
			stone : {
				id: 27,
				blockers: [6],
				minProgress: 6,
				failsInRow: 15
			},
			swamp : {
				id: 43,
				blockers: [24],
				minProgress: 20,
				failsInRow: 25
			},
			life : {
				id: 44,
				blockers: [43, 11],
				minProgress: 28,
				failsInRow: 20
			},
			sand : {
				id: 28,
				blockers: [27],
				minProgress: 30,
				failsInRow: 20
			},
			metal : {
				id: 36,
				blockers: [27],
				minProgress: 26,
				failsInRow: 20
			},
			human : {
				id: 48,
				blockers: [44],
				minProgress: 32,
				failsInRow: 20
			},
			time : {
				id: 41,
				blockers: [28],
				minProgress: 40,
				failsInRow: 20
			},
			wood : {
				id: 56,
				blockers: [42],
				minProgress: 45,
				failsInRow: 20
			},
			tool : {
				id: 53,
				blockers: [36, 48],
				minProgress: 36,
				failsInRow: 20
			},
			farmer : {
				id: 71,
				blockers: [48],
				minProgress: 43,
				failsInRow: 20
			},
			tree : {
				id: 42,
				blockers: [24, 41],
				minProgress: 42,
				failsInRow: 20
			},
			livestock : {
				id: 73,
				blockers: [48],
				minProgress: 57,
				failsInRow: 20
			},
			wheel : {
				id: 82,
				blockers: [42, 53],
				minProgress: 60,
				failsInRow: 20
			},
			wild_animal : {
				id: 140,
				blockers: [44, 42],
				minProgress: 62,
				failsInRow: 20
			},
			fruit : {
				id: 88,
				blockers: [42, 71],
				minProgress: 70,
				failsInRow: 20
			},
			blade : {
				id: 55,
				blockers: [27, 36],
				minProgress: 30,
				failsInRow: 20
			},
			house : {
				id: 72,
				blockers: [53, 172],
				minProgress: 40,
				failsInRow: 20
			},
			sun : {
				id: 108,
				blockers: [22],
				minProgress: 20,
				failsInRow: 20
			},
			sky : {
				id: 22,
				blockers: [15],
				minProgress: 15,
				failsInRow: 20
			},
			wheat : {
				id: 84,
				blockers: [71],
				minProgress: 80,
				failsInRow: 20
			},
			rainbow : {
				id: 110,
				blockers: [13, 108],
				minProgress: 60,
				failsInRow: 20
			},
			electricity : {
				id: 114,
				blockers: [11, 36],
				minProgress: 30,
				failsInRow: 20
			},
			pig : {
				id: 165,
				blockers: [12, 73],
				minProgress: 75,
				failsInRow: 20
			},
			glass : {
				id: 32,
				blockers: [28],
				minProgress: 20,
				failsInRow: 20
			},
			glasses : {
				id: 185,
				blockers: [32],
				minProgress: 30,
				failsInRow: 20
			},
			mountain : {
				id: 201,
				blockers: [19],
				minProgress: 30,
				failsInRow: 20
			},
			paper : {
				id: 208,
				blockers: [7, 56],
				minProgress: 70,
				failsInRow: 20
			},
			letter : {
				id: 260,
				blockers: [208, 233],
				minProgress: 80,
				failsInRow: 20
			},
			lightbulb : {
				id: 115,
				blockers: [32, 114],
				minProgress: 85,
				failsInRow: 20
			},
			thread : {
				id: 432,
				blockers: [82, 361],
				minProgress: 100,
				failsInRow: 20
			},
			moon : {
				id: 79,
				blockers: [22, 27],
				minProgress: 70,
				failsInRow: 20
			},
			energy : {
				id: 11,
				blockers: [],
				minProgress: 70,
				failsInRow: 20
			}
		}
	},

	manyFails : { 
		priority: 7,
		check: function() {
			if(stats.data.lastEvent === "childCreationFail" && stats.data.failCount - 139 === 0 && stats.data.failCount > 0 && game.progress.length > 80) {
				return true;
			}

			return false;
		},
		onShow: function() {
			var width = notifications.$box.width() - 30;
			var height = notifications.$box.height();

			var a = $($(".notificationLink")[0]);
			var pos = a.position();
			var padding = {
				top: pos.top + "px ",
				left: pos.left + "px",
				right: (width - pos.left - a.width()) + "px ",
				bottom: (height - pos.top - a.height()) + "px "
			};

			a.css("padding", padding.top + padding.right + padding.bottom + padding.left);
			a.css("margin", "-" + padding.top + "-" + padding.right + "-" + padding.bottom + "-" + padding.left);
		},
		blocker: []
	},
	manyFails2 : { 
		priority: 7,
		check: function() {
			if(stats.data.lastEvent === "childCreationFail" && stats.data.failCount - 200 === 0 && stats.data.failCount > 0 && game.progress.length > 50) {
				return true;
			}

			return false;
		},
		onShow: function() {
			var width = notifications.$box.width() - 35;
			var height = notifications.$box.height();

			var a = $($(".notificationLink")[0]);
			var pos = a.position();
			var padding = {
				top: pos.top + "px ",
				left: pos.left + "px",
				right: (width - pos.left - a.width()) + "px ",
				bottom: (height - pos.top - a.height()) + "px "
			};

			a.css("padding", padding.top + padding.right + padding.bottom + padding.left);
			a.css("margin", "-" + padding.top + "-" + padding.right + "-" + padding.bottom + "-" + padding.left);
		},
		blocker: []
	}
	//,

	// failsInRow : { 
	// 	priority: 6,
	// 	check: function() {
	// 		if(stats.data.lastEvent === "childCreationFail" && stats.data.failInRow[stats.data.failInRow.length - 1] % 2 == 0) {
	// 			return true;
	// 		}

	// 		return false;
	// 	},
	// 	passData: function() {
	// 		return {
	// 			failInRow: stats.data.failInRow[stats.data.failInRow.length - 1]
	// 		};
	// 	},
	// 	blocker: ["manyFails"]
	// }
};