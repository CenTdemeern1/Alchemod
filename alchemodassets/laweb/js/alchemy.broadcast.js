/**
 * Alchemy.Broadcast
 * Responsible for showing broadcast.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyright: Recloak
 *
 */
 
 var broadcast = {
 	DISPLAY_TIME: 20,
 	currentIndex: 0,
 	timer: {
 		timer: null,
 		start: 0,
 		remaining: 0
 	},

	init: function() {
		broadcast.$el = $("#broadcast");
		broadcast.$controls = broadcast.$el.find(".controls");
		broadcast.$content = broadcast.$el.find(".content");
		
		if(typeof(localization.language) !== "undefined") {
			broadcast.loadResources();
		}
		else {
			$(document).one("languageDetected", broadcast.loadResources);
		}
		broadcast.initEvents();

		broadcast.$controls.hide();

		broadcast.onresize();
	},

	initEvents: function() {
		broadcast.$el.on("mouseenter", function() {
			broadcast.timer.remaining -= (new Date().getTime()) - broadcast.timer.start;
			clearTimeout(broadcast.timer.timer);

			// broadcast.$controls.show();
		});

		broadcast.$el.on("mouseleave", function() {
			// broadcast.$controls.hide();

			broadcast.timer.timer = setTimeout(broadcast.showNext, broadcast.timer.remaining);
			broadcast.timer.start = new Date().getTime();
		});

		// broadcast.$controls.on("click", ".next", function() {
		// 	clearTimeout(broadcast.timer.timer);

		// 	broadcast.showNext();
		// });

		// broadcast.$controls.on("click", ".prev", function() {
		// 	clearTimeout(broadcast.timer.timer);

		// 	broadcast.showPrev();
		// });

		$(document).on("languageChanged", broadcast.loadResources);

		$(window).on("resize", broadcast.onresize);
	},

	show: function() {
		broadcast.$content.empty().append(broadcast.data[broadcast.currentIndex]);
		game.changeLink(broadcast.$content);

		// if(broadcast.timer.timer !== null) {
		// 	window.clearTimeout(broadcast.timer.timer);
		// }
		broadcast.timer.timer = setTimeout(broadcast.showNext, broadcast.DISPLAY_TIME * 1000);
		broadcast.timer.start = new Date().getTime();
		broadcast.timer.remaining = broadcast.DISPLAY_TIME * 1000;
	},

	showNext: function() {
		broadcast.currentIndex += 1;
		if(broadcast.currentIndex == broadcast.data.length) {
			broadcast.currentIndex = 0;
		}

		broadcast.show();
	},

	showPrev: function() {
		broadcast.currentIndex -= 1;
		if(broadcast.currentIndex == -1) {
			broadcast.currentIndex = broadcast.data.length - 1;
		}

		broadcast.show();
	},

	loadResources: function() {
		$.getJSON(localization.getURL("broadcast.json"), function(data) {
			broadcast.data = data.data;
			// clear timere
			if(broadcast.timer.timer !== null) {
				window.clearTimeout(broadcast.timer.timer);
			}

			broadcast.show();
		});	
	},

	onresize: function() {
		broadcast.$el.css("max-width", $("#toggleFullscreen").offset().right - broadcast.$el.offset().right - 10);
	}
 };

broadcast.init();