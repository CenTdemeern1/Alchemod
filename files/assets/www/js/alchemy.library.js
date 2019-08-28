/**
 * Alchemy.Library 
 * Responsible for library - showing, grouping, sorting, searching user elements.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: ReCloak Interactive
 *
 * @events:
 *		libraryShowed
 */
/*global workspace, iscrollLibrary, iscrollFullscreen, game, bases, settings, template*/
var library = {
	loadingImage: "iVBORw0KGgoAAAANSUhEUgAAAEoAAABKCAMAAAArDjJDAAAAkFBMVEUAAAAAAAAAAAAAAAAAAAACAgIAAAADAwMCAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAD////MzMwAAADk5ORdXV3a2tp0dHQICAj8/Pzw8PD19fXq6uoXFxfe3t5sbGzR0dHOzs7i4uJCQkLAwMA1NTVNTU0mJiawsLCYmJiKioqjo6NhYWHZ2dl+fn5XV1fT09PRrWOXAAAAEHRSTlMAYTbBS9Uk++MDdRapmQyK8ORcjAAAAdBJREFUWMPt1l2WojAQhuEoguBffyltEwFBEWlttfe/vJm7HGhNhXA1Z3wWkMMbQijx9vbPGgfUFY6FjznlxbataCgSHkYk0XWkmfAwoS90nWgkPKxiuqFtS2rut1khpWhRcST8xDXazirxPAx0Qds3TYSXD1qjbaeWwsu0RteZkmF9xpdf4ZIydKVq4bFSoir89kMrn75vGIMKl2qH37RaePSd8cytf+HE9HEfNN+X4hmdB3376IznClp5XlbDCxemb2DhijbAy8L5sD5D0qhfn8ZLedir74bXtn0KR3TCa2WfP1iQa1g0YY++AjYPiob1GXeaDewzmth57tjC7kqR59zhP4WEOdJPmxR17Nx3lDZ718IZlSilzUGv6cOpr0Eq7Xaop4IX0eNvn90nLjR26bujlAyduRTGDXaSk6FSCd93xV4aAwpntMdBsrTDqBXXps8iM8Mk08e6m2HS0qdNn7WQe4dBbvqYwjpktqrCWro4YsMc+OkPjtLFHgUxT3XG2nGpG7NU0DjvVRWzY78uJe+gU+6MjqnA7uDyUA92wA3oBJ0d7TKNUsXc9zxX6pqCoy/K4UqOQlLVxq5SFI8FL5ksQjW1ChejRLy9/cf+ADN8f5lRBqTtAAAAAElFTkSuQmCC",

	init : function() {
		library.elContainter = document.createDocumentFragment();
		library.el = document.getElementById("library");
		library.outerLibrary = document.getElementById("outerLibrary");

		library.$el = $(library.el);
		library.$outerLibrary = $(library.outerLibrary);

		library.droppable = new Droppable(library.outerLibrary, {
			tolerance: "touch"
		});

		library.$outerLibrary.on("droppableDrop", function(e, draggable) {
			if(draggable.element.getAttribute("data-elementtype") === "workspaceBox") {
				workspace.del(draggable.$element.data("ptr"));
			}
			else {
				$(draggable.helper)
						.off()
						.data("ptr", null)
						.remove();
			}
		});

		$(document).on("newChildCreated", function(e, childId) {
			library.addOne(childId);
		});

		$(document).on("imagesLoaded", library.reloadImages);

		library.mode = "normal";
		library.sortMode = "alphabetically";

		// add timeout to finish loading in case if history was not synchronized or login was not checked
		var loginDelay = 5;
		var loginDelayTimer = window.setTimeout(function() {
			library.addAll();
			if(loadingScreen.list.indexOf("historySynchronized") === -1 && loadingScreen.list.indexOf("notLoggedIn") === -1) {
				loadingScreen.incrementProgress("notLoggedIn");
			}
			$(document).off("historySynchronized notLoggedIn");
		}, loginDelay * 1000);

		$(document).on("historySynchronized notLoggedIn", function handler(e) {
			library.addAll();
			$(document).off("historySynchronized notLoggedIn", handler);
			window.clearTimeout(loginDelayTimer);
		});

		// !! IMPORTANT
		// trigger window resize or orientation change for droppables
		$(window).on("orientationchange resize", function(e) {
			$(".droppable").trigger("resized");
		});

		$(window).one("load", function() {
			library.droppable._getPosition();
			library.droppable._getSize();
		});

		$(document).one("iscrollInitiated", library.initOnScrollAction);
	},

	// allowing user to drag element from scrolling library
	initOnScrollAction: function() {
		var l = $("#libraryOverlay");
		var endTimeout = null;

		iscrollLibrary.on("scrollStart", function() {
			if(endTimeout !== null) {
				window.clearTimeout(endTimeout);
				endTimeout = null;
			}

			l[0].style.zIndex = 150;
		});

		iscrollLibrary.on("scrollEnd", function() {
			endTimeout = window.setTimeout(function() {
				l[0].style.zIndex = "auto";
				endTimeout = null;
			}, 75);
		});

		l.on(gestures.startEvents.join(" ").replace("mousedown", ""), function(e) {
			if(!iscrollLibrary.isInTransition) {
				return false;
			}

			// stop iScroll scrolling
			pos = iscrollLibrary.getComputedPosition();
			iscrollLibrary._translate(Math.round(pos.x), Math.round(pos.y));
			iscrollLibrary._execEvent('scrollEnd');
			iscrollLibrary.isInTransition = false;

			// get proper element and propagate event
			var offsetY = e.originalEvent.pageY !== 0 ? e.originalEvent.pageY : e.originalEvent.changedTouches[0].pageY;
			var y = Math.floor((offsetY + -1 * iscrollLibrary.y) / library.elementOuterHeight);
			var draggable;

			if(settings.data.hideFinalElements
			&& library.el.children.length !== (game.progressWithoutFinal.length + game.prime.length)) {
				draggable = library.el.querySelector('.element[data-elementid="' + library.sortedProgress[y] + '"]');	
			}
			else {
				draggable = library.el.children[y];	
			}
			
			$(draggable).data("ptr").draggable["on" + e.type](e.originalEvent);
		});
	},
	
	add : function(id_) {
		new LibraryBox(id_);
	},

	addOne : function(id_) {
		library.elContainter = document.createDocumentFragment();

		var progress = settings.data.hideFinalElements ? game.progressWithoutFinal : game.progress;
		var elements = library.sort(game.prime.concat(progress), true);

		//update sorted cached progress
		library.sortedProgress = elements;
		
		var index = elements.indexOf(id_);

		if(!library.checkIfHideFinal(id_)){	// if final element and hide setting checked then do not show
			library.add(id_);

			if(index === 0) {
				library.$el.prepend(library.elContainter);
			}
			else if(index !== -1) {
				var previousId = elements[index - 1];
				$('#library > .element[data-elementId="' + previousId + '"]').after(library.elContainter);
			}
		}

		var count = settings.data.hideFinalElements ? (game.progressWithoutFinal.length + game.prime.length) : (game.progress.length + game.prime.length);
		library.refreshIscroll(count);
	},

	addAll: function() {
		var i, ii;
		library.clear();

		var progress = settings.data.hideFinalElements ? game.progressWithoutFinal : game.progress;
		var elements = library.sort(game.prime.concat(progress), true);

		// we cache progress in order not to sort it every time (when alphabet searching)
		library.sortedProgress = elements;

		for(i = 0, ii = elements.length; i < ii; i++){
			// if final element and hide setting checked then do not show
				library.add(elements[i]);
		}

		library.el.appendChild(library.elContainter);
		library.elementOuterHeight = library.$el.find(".element").outerHeight();

		library.refreshIscroll(elements.length);

		$(document).trigger("libraryShowed");
	},

	clear: function() {
		var elements = library.el.getElementsByClassName("element");
		var $element;
		var ptr;

		for(var i = 0, ii = elements.length; i < ii; i++) {
			$element = $(elements[i])
			ptr = $element.data("ptr");
			if(ptr.draggable) {
				ptr.draggable.destroy();
			}
			ptr.draggable = null;

			$element.find("img").off();
			$element
				.data("ptr", null)
				.off();
		}

		library.el.innerHTML = "";
	},

	hideAll : function() {
		var i, ii;
		var elements = library.el.getElementsByClassName("element");

		for(var i = 0, ii = elements.length; i < ii; i++) {
			elements[i].style.display = "none";
		}
	},

	reload : function() {
		library.clear();
		library.addAll();
	},
	
	refresh : function() {
		library.show();
	},

	show : function(elements_) {
		var i, ii, id, index, elementsLength, count;

		var elementsDivs = library.el.getElementsByClassName("element");
		var elements = elements_ || game.prime.concat(game.progress);

		elements = library.sort(elements, true);
		elementsLength = elements.length;

		if(typeof(elements_) === "undefined") {
			library.sortedProgress = [];
		}

		count = 0;

		for(i = 0, ii = elementsDivs.length; i < ii; i++) {
			id = elementsDivs[i].getAttribute("data-elementId");
			index = elements.indexOf(parseInt(id, 10));
		
			if(!library.checkIfHideFinal(parseInt(id, 10)) &&  index > -1) {	
				elementsDivs[i].style.display = "block";
				elements.splice(index, 1);

				if(typeof(elements_) === "undefined") {
					library.sortedProgress.push(id);
				}

				count++;
			}
			else {
				elementsDivs[i].style.display = "none";
			}
		}

		library.refreshIscroll(count);

		$(document).trigger("libraryShowed");
	},

	reloadImages : function() {
		var i, ii;
		var elements = library.el.getElementsByClassName("element");
		var changeHandle = function(element) {
			var $this = $(this);
			
			$this.data("ptr").draggable.changeHandles("img");
			$this.off("dragEnd", changeHandle);
		};
		var draggable;

		for(i = 0, ii = elements.length; i < ii; i++) {
			elements[i].firstChild.nextSibling.src = "data:image/png;base64," + bases.images[elements[i].getAttribute('data-elementId')];
		}

		for(i = 0, ii = elements.length; i < ii; i++) {
			elements[i].firstChild.parentNode.removeChild(elements[i].firstChild);
			elements[i].firstChild.style.display = "block";

			draggable = $(elements[i]).data("ptr").draggable;

			// if element is being dragged then we postpone changing handle
			if(!draggable.isDragging) {
				draggable.changeHandles("img");
			}
			else {
				$(elements[i]).on("dragEnd", changeHandle);
			}
		}
	},

	markFinalElements : function() {
		var i, ii;
		var elements;

		if(window.settings.data.markFinalElements && !window.settings.data.hideFinalElements) {
			elements = game.finalElements;
			for(i = 0, ii = elements.length; i < ii; i++) {
				library.el.querySelector('.element[data-elementid="' + elements[i] + '"]').className += " finalElement";
			}
		}
		else {
			elements = library.el.getElementsByClassName("finalElement");
			while(elements.length > 0) {
				elements[0].className = elements[0].className.replace(/\bfinalElement\b/,'');
			}	
		}
	},

	showLetter : function(letter) {
		var i, ii;
		var result = [];
		var elements = game.prime.concat(game.progress);

		for(i = 0, ii = elements.length; i < ii; i++) {
			if(bases.names[elements[i]][0] === letter){
				result.push(elements[i]);
			}
		}

		return result;
	},
	
	showCategory : function(category) {
		var i, ii, j;
		var result = [];
		var elements = game.prime.concat(game.progress);

		for(i = 0, ii = elements.length; i < ii; i++){
			if(bases.base[elements[i]].tags) {
				for(j = 0; j < bases.base[elements[i]].tags.length; j++){
					if(bases.base[elements[i]].tags[j] === category){
						result.push(parseInt(elements[i], 10));
					}
				}
			}
		}

		return result;
	},

	showLetterAndCategory : function(letter, category) {
		var i, ii;
		var result = [];
		category = library.showCategory(category);

		for(i = 0, ii = category.length; i < ii; i++){
			if(bases.names[category[i]][0] === letter){
				result.push(category[i]);
			}
		}

		return result;
	},

	showPhrase : function(phrase_) {
		var i, ii;
		var result = [];
		var disallowed = "[]{}'/\\()?<>+.*^$";
		var elements = game.prime.concat(game.progress);
		for(var i = 0; i < disallowed.length; i++) {
			phrase_ = phrase_.split(disallowed[i]).join('');
		}
		//phrase_ = phrase_.toLowerCase().replace(/[^A-Za-z0-9\s]/gi, '');
		var pattern = new RegExp(phrase_);

		for(i = 0, ii = elements.length; i < ii; i++){
			//if(bases.names[elements[i]].substr(0, phrase_.length) === phrase_){
			if(pattern.test(bases.names[elements[i]].toLowerCase())) {
				result.push(elements[i]);
			}
		}

		return result;
	},
	
	sort : function(elements_, return_) {
		var elements = elements_ || game.prime.concat(game.progress);
		var result = [];

		if(library.sortMode === "alphabetically"){
			result = library.sortAlphabetically(elements);
		}
		else if(library.sortMode === "time"){
			result = library.sortByTime(elements);	// progress is saved by time
		}

		if(return_){
			return result;
		}
		else {
			// library.clear();
			library.show(result);
		}
	},
	
	sortAlphabetically : function(elements) {
		var i, ii;
		var ids = {};
		var keys = [];
		var result = [];
		var name;
		
		for(i = 0, ii = elements.length; i < ii; i++) {
			name = bases.names[elements[i]] + "_" + elements[i];
			ids[name] = elements[i];	// new object: key = name; value = id
			keys.push(name);			// put all keys in object to keys[]
		}
		
		if(localization.language !== "en") {
			keys.sort(localization.compare);
		}
		else {
			keys.sort();
		}
		
		for(i = 0, ii = keys.length; i < ii; i++){
			result.push(ids[keys[i]]);
		}

		return result;
	},

	sortByTime : function(elements) {
		var i, ii;
		var dates = {};
		var keys = [];
		var result = [];

		for(i = 0, ii = game.history.parents.length; i < ii; i++) {
			var children = workspace.sex(game.history.parents[i]);

			dates[game.history.date[i]] = children;
			keys.push(game.history.date[i]);
		}

		keys.sort();

		for(i = 0, ii = keys.length; i < ii; i++) {
			result = $.merge(result, dates[keys[i]]);
		}
		
		return result;
	},

	checkIfHideFinal : function(id_) {
		if(settings.data.hideFinalElements) {
			if(game.finalElements.indexOf(id_) === -1)
				return false;
			else
				return true;
		}
		else
			return false;
	},

	refreshIscroll: function(count) {
		if(!iscrollLibrary) {
			return;
		}

		var outerHeight = library.$outerLibrary.outerHeight() + 1;
		if( outerHeight < count * library.elementOuterHeight) {
			iscrollLibrary.refresh(true, count * library.elementOuterHeight + 50);
		}
		else {
			iscrollLibrary.refresh(true, outerHeight);
		}
	}
};

window.addEventListener("orientationChange", library.refreshIScroll, false);