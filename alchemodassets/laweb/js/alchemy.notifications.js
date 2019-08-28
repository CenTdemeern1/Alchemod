/**
 * Alchemy.Notifications
 * Showing notifications and checking conditions.
 * Max priority is 10, min = 0. Greater is better.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyright: Recloak
 */

var notifications = {
	shown: [],
	DISPLAY_TIME: 10,
	PRIORITY_ALWAYS_SHOW: 5,

	init : function() {
		notifications.queue = [];
		notifications.waiting = [];
		notifications.toShow = [];
		notifications.alreadyShowing = "";
		notifications.waitingTimer = null;

		notifications.$box = $("#notificationBox");
		notifications.$boxContent = notifications.$box.find(".content");

		if(typeof(localization.language) !== "undefined") {
			notifications.loadTemplates();
		}
		else {
			$(document).one("languageDetected", notifications.loadTemplates);
		}
		// notifications.removeAlreadyShown();

		notifications.loadData();
		$(document).one("progressInitiated", notifications.loadData);

		$(document).on("statsDataUpdated", function() {
			if(!game) {
				return false;
			}

			notifications.checkConditions();

			if(notifications.queue.length > 0) {
				notifications.prepareToShow();
			}

			if(notifications.toShow.length > 0) {
				notifications.showOnBoard();
			}
		});

		notifications.initEvents();
	},

	loadData: function() {
		if(typeof(notificationsData) !== "undefined" && typeof(notifications.data) === "undefined") {
			notifications.data = notificationsData;
		}
	},

	initEvents: function() {
		$(document).on("languageChanged", function() {
			notifications.loadTemplates();
		});

		$(document).on("achievementEarned", function(event, achievementId) {
			var data = localization.get("achievements-" + achievementId);
			notifications.showSpecified(templates.list.achievement, {
				title: data.title,
				description: data.earned
			});
		});

		notifications.$box.find(".close").on("click", function() {
			notifications.hideOnBoard();
		});
	},

	checkConditions : function() {
		notifications.queue = [];

		for(var id in notifications.data) {
			if(notifications.data[id].hasOwnProperty("isGroup")) {
				notifications.checkGroup(id);
			}
			else {
				if(notifications.data[id].check()) {
					notifications.queue.push({
						name: id,
						priority: notifications.data[id].priority
					});
				}
			}
		}
	},

	// checking conditions in group
	checkGroup: function(id) {
		if(notifications.alreadyShowing === id) {
			return false;
		}

		// check if this kind of notifications is not blocked
		// (next of this kind can be shown only when previous is completed)
		if(notifications.data[id].hasOwnProperty("isBlocked") 
		&& notifications.data[id].isBlocked() ) {
			return false;
		}

		// check waiting if there is element of group, if there is then do not check
		for(var i = 0; i < notifications.waiting.length; i++) {
			if(notifications.waiting[i].group === id) {
				return false;
			}
		}

		for(var notificationName in notifications.data[id].list) {
			if(notifications.data[id].check( notifications.data[id].list[notificationName] )) {
				notifications.queue.push({
					group: id,
					name: notificationName,
					priority: notifications.data[id].priority
				});

				if(notifications.data[id].hasOwnProperty("isBlocked")) {
					notifications.data[id].blocker = notificationName;
				}

				if(notifications.data[id].hasOwnProperty("selfBlocking")) {
					break;
				}
			}
		}
	},

	// sort queue and prepare queue of notifications to show
	prepareToShow : function() {
		notifications.queue.sort(function (a, b) {
			if(a.priority > b.priority) {
				return 1;
			}
			else if(a.priority < b.priority) {
				return -1;
			}

			return 0;
		});

		notifications.prepareQueue();
		if(notifications.queue.length > 0) {
			i = 0;
			do {
				// add at beginning of array
				notifications.waiting.unshift(notifications.queue[i]);
				notifications.waiting[0].timestamp = new Date().getTime();
				i++;
			}
			while(notifications.queue[i] && notifications.queue[i].priority > notifications.PRIORITY_ALWAYS_SHOW)
		}

		notifications.checkWaiting();
	},

	// remove blockers and duplicates from queue
	prepareQueue: function() {
		// check queue for duplicates
		notifications.queue = notifications.queue.filter(function(elem, pos) {
		    return notifications.queue.indexOf(elem) == pos;
		});

		// check queue for blockers (notifications of kind that blocks other kind of notification)
		var name, i, j, toRemove;
		i = 0;
		while(i < notifications.queue.length) {
			if(!notifications.queue[i].hasOwnProperty("group")) {
				name = notifications.queue[i].name;

				toRemove = [];
				for(j = i + 1; j < notifications.queue.length; j++) {
					if(name === notifications.queue[j].name 
					|| notifications.data[name].blocker.indexOf(notifications.queue[j].name) != -1) {
						toRemove.push(j);
					}
				}

				// check toShow for blockers and duplicates
				for(j = 0; j < notifications.toShow.length; j++) {
					if(name === notifications.toShow[j].name
					|| notifications.data[name].blocker.indexOf(notifications.toShow[j].name) != -1) {
						toRemove.push(i);
						break;
					}
				}

				// check already showing
				if(notifications.alreadyShowing === name
				|| notifications.data[name].blocker.indexOf(notifications.alreadyShowing) != -1) {
					toRemove.push(i);
				}

				// remove duplicates
				toRemove = toRemove.filter(function(elem, pos) {
				    return toRemove.indexOf(elem) == pos;
				});

				if(toRemove.indexOf(i) === -1) {
					i++;
				}

				// remove elements
				for(j = toRemove.length - 1; j >= 0; j--) {
					notifications.queue.splice(toRemove[j], 1);
				}
			}
			else {
				i++;
			}
		}		
	},

	checkWaiting: function() {
		var isNumber = function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		};
		var toRemove = [];
		var now = new Date().getTime();

		var id;

		for(var i = 0; i < notifications.waiting.length; i++) {
			id = notifications.waiting[i].hasOwnProperty("group") ? notifications.waiting[i].group : notifications.waiting[i].name;
			if(notifications.data[id].hasOwnProperty("delay")) {
				// check if delay is function or number, if number then make simple setTimeout
				if(isNumber(notifications.data[id].delay)) {
					if(now >= notifications.waiting[i].timestamp + notifications.data[id].delay * 1000) {
						notifications.toShow.push(notifications.waiting[i]);
						toRemove.push(i);
					}
				}
				else {
					var result = notifications.data[id].delay(notifications.waiting[i]);
					if(result && !isNumber(result)) {
						notifications.toShow.push(notifications.waiting[i]);	
						toRemove.push(i);
					}
					else if(isNumber(result)) {
						notifications.waiting[i].timestamp = now;
					}
				}
			}
			else {
				notifications.toShow.push(notifications.waiting[i]);
				toRemove.push(i);
			}
		}

		// remove elements
		for(var j = toRemove.length - 1; j >= 0; j--) {
			notifications.waiting.splice(toRemove[j], 1);
		}

		if(notifications.waiting.length === 0) {
			window.clearInterval(notifications.waitingTimer);
			notifications.waitingTimer = null;
		}
		else {
			notifications.setCheckingWaiting();
		}

		if(notifications.toShow.length > 0) {
			notifications.showOnBoard();
		}
	},

	setCheckingWaiting : function() {
		if(notifications.waitingTimer === null) {
			notifications.waitingTimer = window.setInterval(notifications.checkWaiting, 1000);
		}
	},

	//////////////////////////////////////////////////////////////////////////////////////////
	// viewing and hiding notifications
	showOnBoard : function() { 
		if(notifications.alreadyShowing === "" && !settings.data.turnOffNotifications) {
			notifications.showNext();
			game.changeLink(notifications.$boxContent);
			notifications.$box.removeClass("hide").addClass("show");
			
			if(notifications.data.hasOwnProperty(notifications.alreadyShowing)
			&& notifications.data[notifications.alreadyShowing].hasOwnProperty("onShow")) {
				notifications.data[notifications.alreadyShowing].onShow();
			}
		}	
	},

	// showing all notifications in queue ordered by priority
	showNext : function() {
		if(notifications.toShow.length > 0) {
			notifications.$boxContent.empty();

			var toShow = notifications.toShow.shift();
			var template, data, duration;

			notifications.alreadyShowing = toShow.hasOwnProperty("group") ? toShow.group : toShow.name;
			if(toShow.hasOwnProperty("group")) {
				template = notifications.templates[notifications.data[toShow.group].template];
				data = notifications.data[toShow.group].passData(notifications.data[toShow.group].list[toShow.name]);
				duration = notifications.data[toShow.group].hasOwnProperty("duration") ? notifications.data[toShow.group].duration : notifications.DISPLAY_TIME;
			}	
			else {
				template = notifications.data[toShow.name].hasOwnProperty("template") ? notifications.templates[notifications.data[toShow.name].template] : notifications.templates[toShow.name];
				if(notifications.data[toShow.name].hasOwnProperty("passData")) {
					data = notifications.data[toShow.name].passData();
				}
				duration = notifications.data[toShow.name].hasOwnProperty("duration") ? notifications.data[toShow.name].duration : notifications.DISPLAY_TIME;
			}

			// TODO current data
			notifications.$boxContent.append(templateEngine(template, data));
			notifications.boxTimer = setTimeout(notifications.showNextCallback, duration * 1000);	

			if(toShow.hasOwnProperty("group")) {
				if(notifications.data[toShow.group].hasOwnProperty("once")) {
					if(notifications.shown.indexOf(toShow.group + "." + toShow.name) === -1) {
						notifications.shown.push(toShow.group + "." + toShow.name);
					}
				}
			}	
			else {
				if(notifications.data[toShow.name].hasOwnProperty("once")) {
					if(notifications.shown.indexOf(toShow.name) === -1) {
						notifications.shown.push(toShow.name);
						delete notifications.data[toShow.name];
					}
				}
			}

			storage.updateNotifications();
		}
	},

	showNextCallback: function() {
		var isTransitionSupported = !!window.getStyleProperty('transition');
		var next = function() {
			if(notifications.toShow.length > 0) {
				notifications.showNext();
				notifications.$box.removeClass("hide").addClass("show");
			}
			else {
				notifications.hideOnBoard();
			}

			notifications.$box.off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", next);
		};

		notifications.$box.removeClass("show").addClass("hide");
		if(notifications.data.hasOwnProperty(notifications.alreadyShowing)
		&& notifications.data[notifications.alreadyShowing].hasOwnProperty("onHide")) {
			notifications.data[notifications.alreadyShowing].onHide();
		}

		if(isTransitionSupported) {
			notifications.$box.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", next);
		}
		else {
			next();
		}
	},

	showSpecified : function(template, data, displayTime) {
		var duration = displayTime || notifications.DISPLAY_TIME;
		notifications.$boxContent
			.empty()
			.append(templateEngine(template, data));

		notifications.$box.removeClass("hide").addClass("show");

		notifications.boxTimer = setTimeout(notifications.hideOnBoard, duration * 1000);
	},

	hideOnBoard : function() {
		if(notifications.$box.is(":visible")) {
			notifications.$box.removeClass("show").addClass("hide");
			
			notifications.$boxContent.empty();
			notifications.toShow = [];
			notifications.alreadyShowing = "";

			clearTimeout(notifications.boxTimer);
		}
	},

	//////////////////////////////
	// helpers
	loadTemplates : function() {
		notifications.templates = {};

		var url = localization.getURL("notifications.html");
		$.get(loading.getURL(url), function(data, textStatus, jqXhr){
			loading.analyzeModificationDate(url, jqXhr.getResponseHeader('Last-Modified'));
			var $data = $(data);

            for(var templateData in notifications.data) {
            	if(!notifications.templates.hasOwnProperty(templateData)) {
            		if(notifications.data[templateData].hasOwnProperty("template")) {
            			notifications.templates[notifications.data[templateData].template] = $data.filter('#' + notifications.data[templateData].template).html();	
            		}
            		else {
            			notifications.templates[templateData] = $data.filter('#' + templateData).html();	
            		}
	            }
            }
        }).then(function() {
        	$(document).trigger("notificationsLoaded");
        });
	},

	removeAlreadyShown : function() {
		notifications.shown = storage.getNotifications();
		for(var i = 0; i < notifications.shown.length; i++) {
			if(notifications.shown[i].indexOf(".") !== -1) {
				delete notifications.data[notifications.shown[i].split(".")[0]].list[notifications.shown[i].split(".")[1]];
			}
			else {
				delete notifications.data[notifications.shown[i]];
			}
		}
	}
};

notifications.init();