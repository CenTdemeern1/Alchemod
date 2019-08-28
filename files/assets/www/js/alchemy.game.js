/**
 * Alchemy.Game
 * Responsible for game. Main namespace.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyright: Recloak
 *
 * @events:
 *		newParentsCreated
 *		newChildCreated
 */
 /* global bases, library, workspace, storage*/
 
 var game = {
	platform : "web",
	prime : [],
	maxProgress : 0,
	finalElements : [],
	player : {},
	isOnline: false,

	init : function() {
		game.checkStructure();
		game.initProgress();

		$(document).trigger("progressInitiated");

		game.getFinalElements();
		game.checkMaxConnections();
		game.onChildCreated();
		game.initEvents();

		game.checkOnline();
	},

	initProgress : function() {
		var i, ii, children, j;
		game.history = JSON.parse(storage.getHistory());
		game.progress = [];
		game.hiddenElements = [];
		game.progressWithoutFinal = [];

		for(i = 0, ii = game.history.parents.length; i < ii; i++) {
			children = workspace.sex(game.history.parents[i]);

			for(j = 0; j < children.length; j++) {
				// hidden element
				if(bases.base[children[j]].hasOwnProperty("hidden")) {
					game.hiddenElements.push(children[j]);
				}
				else if(game.progress.indexOf(children[j]) === -1 && game.prime.indexOf(children[j]) === -1) {
					game.progress.push(children[j]);

					if(!game.checkIfFinal(children[j])) {
						game.progressWithoutFinal.push(children[j]);
					}
				}
			}
		}

		game.changeProgressCounter();
	},

	resetProgress : function() {
		game.saveOldProgress(game.history.parents, game.history.date);
		achievements.reset();
		storage.resetHistory();
		game.initProgress();
		update.resetHistory();

		workspace.clearSpecified(workspace.$el.find(".element"));
		library.reload();

		$(document).trigger("resetProgress");
	},

	onChildCreated : function() {
		$(document).on("childCreated", function(event, children_, parents_) {
			var i, date;
			for(i = 0; i < children_.length; i++) {
				// TODO handle types of elements
				if(game.checkIfNotAlreadyDone(parents_)) {
					date = new Date().getTime();

					game.history.parents.push(parents_);
					game.history.date.push(date);

					$(document).trigger("updateHistory", [parents_, date]);

					//if element is hidden - push to hidden array
					if(bases.base[children_[i]].hasOwnProperty("hidden")) { 
						$(document).trigger("hiddenElementCreated", [children_[i]]);
						
						if(game.hiddenElements.indexOf(children_[i]) === -1) {
							game.hiddenElements.push(children_[i]);
						}
					}
				}

				// if not in progress or prime, and not a hidden element then add to progress
				if(game.progress.indexOf(children_[i]) === -1 && game.prime.indexOf(children_[i]) === -1 && !bases.base[children_[i]].hasOwnProperty("hidden")) {
					game.progress.push(children_[i]);
					if(!game.checkIfFinal(children_[i])) {
						game.progressWithoutFinal.push(children_[i]);
					}
					else {
						game.finalElements.push(children_[i]);
					}
					game.changeProgressCounter();

					$(document).trigger("newChildCreated", [children_[i]]);
				}
			}
		});
	},

	changeProgressCounter : function() {
		var content = (game.progress.length + game.prime.length) + "/" + game.maxProgress;
		document.getElementById("progress").textContent = content;
	},

	/*
	 * Check if element in on specific platform. If its prime element and if it's not hidden.
	 */
	checkStructure : function() {
		var i;

		for(i in bases.base) {
			if(bases.base[i].hasOwnProperty("platforms")) {
				var platforms = bases.base[i].platforms.join(",");
				
				if(platforms.indexOf(game.platform) === -1) {
					delete bases.base[i];
					delete bases.names[i];
				}
			}

			// if is for this platform
			if(bases.base.hasOwnProperty(i)) {
				if(bases.base[i].hasOwnProperty("prime")) {	// check if prime
					game.prime.push(parseInt(i, 10));
				}

				if(!bases.base[i].hasOwnProperty("hidden")) {	// check if counts to progress (not hidden)
					game.maxProgress++;
				}
			}
		}	
	},

	getFinalElements : function() {
		var i, ii;
		for(i = 0, ii = game.progress.length; i < ii; i++){
			if(game.checkIfFinal(game.progress[i]) && game.finalElements.indexOf(game.progress[i]) === -1) {
				game.finalElements.push(game.progress[i]);
			}
		}
	},

	checkIfFinal : function(id) {
		var i, ii, j;
		var keys = Object.keys(bases.base);

		for(i = 0, ii = keys.length; i < ii; i++) {
			if(bases.base[keys[i]].hasOwnProperty("parents")) {
				for(j = 0; j < bases.base[keys[i]].parents.length; j++) {
					if(bases.base[keys[i]].parents[j].indexOf(id) !== -1) {	// if is parent of some element then not final
						return false;
					}
				}
			}
		}

		return true;
	},

	checkMaxConnections : function(id) {
		game.maxConnections = 0;
		var i;
		for(i in bases.base){
			if(bases.base[i].hasOwnProperty("parents")) {
				game.maxConnections += bases.base[i].parents.length;
			}
		}
	},

	checkIfNotAlreadyDone : function(parents_) {
		var parents = [Math.min(parents_[0], parents_[1]), Math.max(parents_[0], parents_[1])];
		for (var i = 0, ii = game.history.parents.length; i < ii; ++i) {
			if(Math.min(game.history.parents[i][0], game.history.parents[i][1]) === parents[0]
			&& Math.max(game.history.parents[i][0], game.history.parents[i][1]) === parents[1])
				return false;
		}

		return true;
	},

	initEvents : function() {
		var fullScreenSupported = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
		if(fullScreenSupported === undefined)
			$("#toggleFullscreen").hide();


		$("#toggleFullscreen").on("click", function() {
			game.toggleFullScreen(this);
		});
	},

	toggleFullScreen : function(buttonElement) {
		var doc = window.document;
		var docEl = doc.documentElement;
		  
		var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.webkitRequestFullscreen || null;
		var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen  || null;
		
		if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement) { 
			requestFullScreen.call(docEl);
		}
		else {
			cancelFullScreen.call(doc);  
		}
	},

	changeConnectionStatus: function(e) {
		if(e.type === "offline") {
			game.isOnline = false;
			$(document).trigger("offline");
		} 
		else {
			game.isOnline = true;
			$(document).trigger("online");
		}
	},

	checkOnline: function() {
		$.ajax({ 
			type: "GET",
            url: "http://littlealchemy.com/favicon.ico",
            cache: false,
            success:function(response) {
            	game.isOnline = true;
				$(document).trigger("online");
            },
            error:function(xhr, textStatus, errorThrown) {
            	game.isOnline = false;
				$(document).trigger("offline");
            }
        });
    },

	saveOldProgress : function(parents, date) {
		var oldProgress = window.storage.getOldHistory();

		Array.prototype.push.apply(oldProgress.parents, parents);
		Array.prototype.push.apply(oldProgress.date, date);

		// limit size of array to prevent overflowing localStorage size
		var MAX_SIZE = 1000;
		if(oldProgress.parents.length > MAX_SIZE) {
			oldProgress.parents.splice(0, oldProgress.parents.length - MAX_SIZE);
			oldProgress.date.splice(0, oldProgress.date.length - MAX_SIZE);
		}

		window.storage.setOldHistory(oldProgress);
	},

	// checking if every element in history has its ancestors
	checkHistoryIntegrity : function(data) {
		var i, ii, children, j;
		var progress = [];
		var checkIfParentsExist = function(id) {
			if(bases.base.hasOwnProperty(id) && (bases.base[id].hasOwnProperty("prime") || progress.indexOf(id) !== -1)) {
				return true;
			}

			return false;
		};

		for(i = 0, ii = data.parents.length; i < ii; i++) {
			Array.prototype.push.apply(progress, workspace.sex(data.parents[i]));
		}

		for(i = data.parents.length - 1; i >= 0; i--) {
			if(!checkIfParentsExist(data.parents[i][0]) || !checkIfParentsExist(data.parents[i][1])) {
				children = workspace.sex(data.parents[i]);
				for(j = 0; j < children.length; j++) {
					progress.splice(progress.indexOf(children[j]), 1);
				}

				data.parents.splice(i, 1);
				data.date.splice(i, 1);	
			}
		}

		return data;
	},

	changeLink: function($element) {
        $element.find("a").each(function(index, link) {
            $(link).on("click", function(e) {
                e.preventDefault();
                
                window.open(this.href, '_system', 'location=true');    
                return false;
            });
        });
    },

	reportError: function(msg, url, line, col, obj) {
		if(!game.isOnline) {
			return;
		}
		
		var data = { 
			msg: msg, 
			url: url,
			line: line,
			col: col || "",
			stack: obj && obj.stack ? obj.stack : "",
			userAgent: navigator.userAgent,
			time: (new Date().getTime()),
			resolution: screen.width + "x" + screen.height
		};

		$.ajax({
			type: "POST",
			url: "php/errorReporting.php",
			data: {
				data: JSON.stringify(data)
			}
		});

		return false;
	}
 };