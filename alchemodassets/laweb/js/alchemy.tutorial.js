/**
 * Alchemy.Sharing 
 * Responsible for sharing element by social media or screenshot.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 */

var tutorial = {
	OPACITY: 0.75, 
	zINDEX: 2000,
	MARGIN: 5,
	DELAY: 3000,

	divs: {},
	content: null,
	visible: false,


	init: function() {
		tutorial.divs = {
			top: document.createElement("div"), 
			bottom: document.createElement("div"), 
			left: document.createElement("div"), 
			right: document.createElement("div")
		};

		tutorial.content = document.querySelector("#tutorial .content");
		tutorial.content.style.position = "absolute";
		tutorial.content.style.zIndex = tutorial.zINDEX + 100;
		tutorial.addTransitionEnd(tutorial.content);

		for(var div in tutorial.divs) {
			tutorial.divs[div].className = "tutorialOverlay";

			tutorial.divs[div].style.position = "absolute";
			tutorial.divs[div].style.backgroundColor = "black";
			tutorial.divs[div].style.opacity = tutorial.OPACITY;
			tutorial.divs[div].style.zIndex = tutorial.zINDEX;
			tutorial.divs[div].style.display = "none";

			document.getElementById("tutorial").appendChild(tutorial.divs[div]);

			tutorial.addTransitionEnd(tutorial.divs[div]);
		}

		$(".tutorialOverlay").on("click", function() {
			if(tutorial.visible) {
				tutorial.hide();
			}
		});
	},

	addTransitionEnd: function(el) {
		el.addEventListener("webkitTransitionEnd", tutorial.transitionEnd, false);
		el.addEventListener("oTransitionEnd", tutorial.transitionEnd, false);
		el.addEventListener("transitionend", tutorial.transitionEnd, false);
	},

	start: function() {
		var func = function() {
			tutorial.show("#clearWorkspace", "<h1>Welcome</h1><p>Elo elo</p>", {x: -50, y: -100});
		};

		tutorial.showNext(
			"#alphabet", 
			'<h1>Welcome</h1><img src="img/icon-android-256.png" />', 
			{x: -150, y: 200},
			func
		);
	},

	showNext: function(element, content, padding, callback, delay) {
		delay = delay || tutorial.DELAY;
		tutorial.show(element, content, padding);
		window.setTimeout(function() {
			callback();
		}, delay);
	},

	show: function(element, content, padding) {
		if(typeof element === "string") {
			var position = tutorial.showElement(element);
			tutorial.showContent(content, position[0], padding);
		}
		else {
			tutorial.showElement(element.start, element.end);
			tutorial.showContent(content, element.start, padding);
		}
	},

	showElement: function(el, margin) {
		margin = margin || tutorial.MARGIN;
		el = typeof el === 'string' ? document.querySelector( el ) : el;

		var start = {
			x: el.style.position === "absolute" ? parseInt( el.style.left, 10 ) : el.getBoundingClientRect().left,
  			y: el.style.position === "absolute" ? parseInt( el.style.top, 10 ) : el.getBoundingClientRect().top
		};

		start.x -= margin;
		start.y -= margin;

		var end = {
			x: start.x + el.offsetWidth + 2 * margin,
  			y: start.y + el.offsetHeight + 2 * margin
		};

		tutorial.showFrame(start, end);

		return [start, end];
	},

	showFrame: function(start, end) {
		start.x = Math.max(0, start.x);
		start.y = Math.max(0, start.y);

		// top
		tutorial.divs.top.style.top = 0;
		tutorial.divs.top.style.left = 0;
		tutorial.divs.top.style.width = window.innerWidth + "px";
		tutorial.divs.top.style.height = start.y + "px";

		// bottom
		tutorial.divs.bottom.style.top = end.y + "px";
		tutorial.divs.bottom.style.left = 0;
		tutorial.divs.bottom.style.width = window.innerWidth + "px";
		tutorial.divs.bottom.style.height = window.innerHeight + "px";

		// left
		tutorial.divs.left.style.top = start.y + "px";
		tutorial.divs.left.style.left = 0;
		tutorial.divs.left.style.width = start.x + "px";
		tutorial.divs.left.style.height = (end.y - start.y) + "px";

		// right
		tutorial.divs.right.style.top = start.y + "px";
		tutorial.divs.right.style.left = end.x + "px";
		tutorial.divs.right.style.width = (window.innerWidth - end.x) + "px";
		tutorial.divs.right.style.height = (end.y - start.y) + "px";

		for(var div in tutorial.divs) {
			tutorial.divs[div].style.display = "block";
		}

		tutorial.visible = true;
	},

	showContent: function(content, start, position) {
		content = typeof content === 'string' ? $(content) : content;

		var offset = {
			x: start.x + position.x,
  			y: start.y + position.y
		};

		$(tutorial.content).empty().append(content);

		tutorial.content.style.top = offset.y + "px";
		tutorial.content.style.left = offset.x + "px";

		tutorial.content.style.opacity = 1;
	},

	hide: function() {
		for(var div in tutorial.divs) {
			tutorial.content.style.opacity = 0;
			tutorial.divs[div].style.opacity = 0;
		}
	},

	transitionEnd: function() {
		if(this.style.opacity == 0) {
			if(this.className === "tutorialOverlay") {
				this.style.opacity = tutorial.OPACITY;
				this.style.display = "none";
			}
		}
	}
};
