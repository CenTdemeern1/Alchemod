/**
 * Alchemy.LoadingScreen
 * Responsible for loading screen, progress bar, showing tutorials and so on.
 * 
 * @package: Alchemy  
 * @version: 0.1
 * @copyrighgt: Recloak
 */

var loadingScreen = {
	transition: {
		PATH_TIME: 0.5,
		OPACITY_DELAY: 0.1,
		OPACITY_TIME: 0.75,
		PROGRESS_TIME: 0.3
	},

	progress: 0,
	shownProgress: 0,
	progressList: {
		"basesLoaded": {
			value: 20
		},
		"namesLoadingProgress": {
			value: 20,
			incremental: true,
			current: 0
		},
		"baseLoadingProgress": {
			value: 20,
			incremental: true,
			current: 0
		},
		"GAPILoaded": {
			value: 25
		},
		"notLoggedIn": {
			value: 25
		},
		"GAPIclientLoaded": {
			value: 10
		},
		"historySynchronized": {
			value: 15
		},
		"libraryShowed": {
			value: 10
		}
	},
	list:[],

	init: function() {
		$(document).one("online offline", function(e) {
			if(e.type === "offline") {
				$(document).off("GAPILoaded");
				$(document).off("notLoggedIn");
				$(document).off("GAPIclientLoaded");
				$(document).off("historySynchronized");

				var value = loadingScreen.progress + 50;
				loadingScreen.progress = value >= 100 ? 100 : value ;
			}
		});

		loadingScreen.initEvents();

		loadingScreen.el = document.getElementById("loadingScreen");
		loadingScreen.$el = $(loadingScreen.el);
		loadingScreen.playButton = loadingScreen.el.getElementsByClassName("playButton")[0];
		loadingScreen.progressBar = loadingScreen.el.getElementsByClassName("progressBar")[0];

		loadingScreen.initPath();
		loadingScreen.messages.init();
		loadingScreen.changeProgress();
	},

	initPath: function() {
		loadingScreen.path = document.querySelector('.playButton path');
		loadingScreen.path.style.strokeWidth = 12;

		if(loadingScreen.path.getTotalLength) {
			var length = loadingScreen.path.getTotalLength();

			if(navigator.userAgent.toLowerCase().indexOf("firefox") > -1 
			&& navigator.oscpu.toLowerCase().indexOf("windows nt 6.1") > -1 ) {
				loadingScreen.path.style.strokeDashoffset = Math.round(length / 12) + "px";
			}

			loadingScreen.path.style.display = "block";
			loadingScreen.path.getBoundingClientRect();
		}
	},

	completedAnimation: function() {
		// add click event on play button
		$(".playButtonContainer").one("touchstart", loadingScreen.hide);

		document.querySelector('.loadingScreen svg rect').style.opacity = 1;
		loadingScreen.path.style.opacity = 0;
	},

	completedLoading: function() {
		window.setTimeout(loadingScreen.completedAnimation, (loadingScreen.transition.PATH_TIME + loadingScreen.transition.OPACITY_DELAY) * 1000);

		window.setTimeout(function() {
			loadingScreen.progressBar.style.opacity = 0;

			window.setTimeout(function() {
				loadingScreen.progressBar.innerHTML = 'PL<span style="margin-right: -3px;">A</span>Y';
				loadingScreen.progressBar.style.opacity = 1;
			}, loadingScreen.transition.PROGRESS_TIME * 1000);
		}, 320);
	},

	changeProgress: function() {
		if(loadingScreen.shownProgress >= 100) {
			loadingScreen.completedLoading();
			return;
		}
		if(loadingScreen.progress > loadingScreen.shownProgress) {
			var value = 2;
			if(loadingScreen.progress - loadingScreen.shownProgress > 20 && loadingScreen.progress < 90) {
				value = 2 * Math.floor((loadingScreen.progress - loadingScreen.shownProgress) / 4);
				// value = 10;
			}

			loadingScreen.shownProgress += value;
			loadingScreen.animateProgress();
		}

		window.requestAnimationFrame(function animate() {
			loadingScreen.changeProgress();
		});
	},

	animateProgress: function() {
		loadingScreen.progressBar.innerHTML = loadingScreen.shownProgress + "%";

		if(loadingScreen.path.getTotalLength) {
			var length = loadingScreen.path.getTotalLength();
			if(navigator.userAgent.toLowerCase().indexOf("firefox") > -1 
			&& navigator.oscpu.toLowerCase().indexOf("windows nt 6.1") > -1 ) {
				loadingScreen.path.style.strokeDashoffset = Math.round((length - (loadingScreen.progress / 100 * length))/12) + "px";
			}
			else {
				loadingScreen.path.style.strokeDashoffset = (length - (loadingScreen.progress / 100 * length));	
			}
		}
	},

	incrementProgress: function(type) {
		var value = loadingScreen.progress + loadingScreen.progressList[type].value;
		console.log("incrementProgress", type, value);
		loadingScreen.progress = value >= 100 ? 100 : value ;
	},

	initEvents: function() {
		for(var i in loadingScreen.progressList) {
			$(document).on(i, function(e, value) {
				if(loadingScreen.progressList[e.type].hasOwnProperty("incremental")) {
					if(loadingScreen.progressList[e.type].current < 100) {
						loadingScreen.progress -= Math.round((loadingScreen.progressList[e.type].current / 100) * loadingScreen.progressList[e.type].value);
						loadingScreen.progress += Math.round((value / 100) * loadingScreen.progressList[e.type].value);
						loadingScreen.progressList[e.type].current = value;
					}
				}
				else {
					if(e.type === "basesLoaded") {
						loadingScreen.progress += loadingScreen.progressList[e.type].value * (200 - loadingScreen.progressList.namesLoadingProgress.current - loadingScreen.progressList.baseLoadingProgress.current) / 100;
						loadingScreen.progressList.namesLoadingProgress.current = 100;
						loadingScreen.progressList.baseLoadingProgress.current = 100;
					}
					else {
						loadingScreen.incrementProgress(e.type);
					}

					$(document).off(e.type);
					loadingScreen.list.push(e.type);
				}
			});
		}
	},

	hide: function() {
		var transformProperty = window.getStyleProperty('transform');
		var is3d = !!window.getStyleProperty('perspective');

		var translate = is3d ? function( y ) {
				return 'translate3d(0, ' + y + 'px, 0)';
			} :
			function( x, y ) {
				return 'translate(0, ' + y + 'px)';
			};

		var div = loadingScreen.el.getElementsByTagName("div")[0];
		div.style[window.getStyleProperty("transition")] = "margin-top 0.75s ease-in";
		loadingScreen.el.style[ window.getStyleProperty("transitionProperty") ] = "top, -webkit-transform, -ms-transform, -o-transform, -moz-transform";
		loadingScreen.el.style[ window.getStyleProperty("transitionDuration") ] = "0.5s";
		loadingScreen.el.style[ window.getStyleProperty("transitionTimingFunction") ] = "ease-in";

		div.style[ "margin-top" ] = window.innerHeight + "px";

		// loadingScreen.el.getElementsByTagName("div")[0].style[ transformProperty ] = translate( window.innerHeight );	
		window.setTimeout(function() {
			// loadingScreen.el.getElementsByTagName("div")[0].style[ transformProperty ] = $(loadingScreen.el.getElementsByTagName("div")[0]).css(transformProperty);
			div.style[ "margin-top" ] = $(div).css("margin-top") + "px";

			if(transformProperty !== undefined) {
				loadingScreen.el.style[ transformProperty ] = translate( window.innerHeight );	
			}
			else {
				loadingScreen.el.style[ "top" ] = window.innerHeight + "px";		
			}

			window.setTimeout(function() {
				loadingScreen.$el.off().remove();

				loadingScreen.el = null;
				loadingScreen.$el = null;
				loadingScreen.playButton = null;
				loadingScreen.progressBar = null;
			}, 1000);
		}, 200);
	},

	messages: {
		shown: [],
		list: [
			[
				{
					id: "combine"
				}
			],
			[
				{
					id: "longpress"
				}, 
				{
					id: "signin"
				}
			],
			[
				{
					id: "longpress",
					P: 3
				}, 
				{
					id: "signin",
					P: 3
				},
				{
					id: "newsletter",
					P: 3
				},
				{
					id: "shareProgress",
					P: 3
				},
				{
					id: "achievements",
					P: 3
				},
				{
					id: "finalClear",
					P: 3
				},
				{
					id: "clone",
					P: 3
				},
				{
					id: "mixItself",
					P: 3
				},
				{
					id: "hideFinal",
					P: 3
				},
				{
					id: "hydrated",
					P: 1
				},
				{
					id: "salad",
					P: 1
				},
				{
					id: "cookies",
					P: 1
				},
				{
					id: "randomMessage",
					P: 1
				},
				{
					id: "smile",
					P: 1
				},
				{
					id: "breaks",
					P: 1
				},
				{
					id: "overcomplicating",
					P: 1
				},
				{
					id: "science",
					P: 1
				}
			]
		],
		init: function() {
			loadingScreen.messages.el = document.getElementById("loadingScreenMessage");
			loadingScreen.messages.shown = storage.getLoadingMessages();
			loadingScreen.messages.showing = loadingScreen.messages.choose();

			$(document).one("languagePackLoaded", function() {
				if(loadingScreen.messages.el !== null) {
					var $el = $(loadingScreen.messages.el);
					$el.append( localization.get("loadingMessage-" + loadingScreen.messages.showing) );
					game.changeLink( $el ); 
				}
			});
		},

		choose: function() {
			var level = loadingScreen.messages.getLevel();
			var choosen;
			var notShown = [];
			
			for(i = 0; i < loadingScreen.messages.list[level].length; i++) {
				if(loadingScreen.messages.shown.indexOf(loadingScreen.messages.list[level][i].id) === -1) {
					notShown.push(loadingScreen.messages.list[level][i]);
				}	
			}

			if(notShown.length === 1) {
				choosen = notShown[0].id;
			}
			else if(!loadingScreen.messages.list[level][0].hasOwnProperty("P")) {
				var index = Math.floor(Math.random() * notShown.length);
				choosen = notShown[index].id;
			}
			else {
				choosen = loadingScreen.messages.probabilityChoose(level);
			}

			// save shown only if message is not one of last level (which one we do not save)
			if(level !== loadingScreen.messages.list.length - 1) {
				loadingScreen.messages.save(choosen);
			}

			return choosen;
		},

		save: function(choosen) {
			loadingScreen.messages.shown.push(choosen);
			storage.updateLoadingMessages(loadingScreen.messages.shown);
		},

		getLevel: function() {
			for(var i = 0; i < loadingScreen.messages.list.length; i++) {
				for(var j = 0; j < loadingScreen.messages.list[i].length; j++) {
					if(loadingScreen.messages.shown.indexOf(loadingScreen.messages.list[i][j].id) === -1) {
						return i;
					}
				}
			}
		},

		probabilityChoose: function(level) {
			var sum = 0;
			for(var i = 0, ii = loadingScreen.messages.list[level].length; i < ii; i++) {
				sum += loadingScreen.messages.list[level][i].P;
			}

			var index = Math.floor(Math.random() * sum);

			var choosen = -1;
			i = 0;
			while(i <= index) {
				choosen++;
				i += loadingScreen.messages.list[level][choosen].P;
			}

			return loadingScreen.messages.list[level][choosen].id;
		}
	}
};

