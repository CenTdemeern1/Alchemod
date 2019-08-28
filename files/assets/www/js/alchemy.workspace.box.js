/**
 * Alchemy.Workspace.Box 
 * Handling one element on workspace.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: ReCloak Interactive
 *
 * @events:
 *		childCreated
 */
/*global bases, template, workspace*/
// argument can be a DOM element (helper of draggalbe) or ID of element
function WorkspaceBox(argument, position_, zIndex_) {
	if(typeof argument === "string" || typeof argument === "number") {
		this.id = parseInt(argument, 10);
		this.$el = $(workspace.el.appendChild(this.createElement(position_)));
		this.init(zIndex_);
	}
	// if element is being created from helper of draggable
	else {	
		this.id = argument.getAttribute("data-elementid");
		this.$el = $(argument);
		this.changeType();
		this.init();
	}

	this.initEvents();
}

WorkspaceBox.prototype.createElement = function(position_) {
	var d = document.createElement('div');
	d.setAttribute("class", 'element');
	d.setAttribute("data-elementType", 'workspaceBox');
	d.setAttribute("data-elementId",  this.id);
	// d.setAttribute("data-active",  "true");
	d.style.cssText = 'position: absolute; left:' + position_.left + 'px; top:' + position_.top + 'px;';

	var img = document.createElement('img');
	img.style.opacity = 0;
	if(bases.imagesLoaded) {
		img.src = "data:image/png;base64," + bases.images[this.id];	
	}
	else {
		img.src = "data:image/png;base64," + library.loadingImage;
	}
	img.alt = bases.names[this.id];
	img.onload = function() {
		this.style.opacity = 1;
		img.onload = null;
	};

	var desc = document.createElement('div');
	desc.setAttribute("class", "elementName");
	desc.textContent = bases.names[this.id];
	if(settings.data.hideElementsNames) {
		desc.style.opacity = 0;
	}

	d.appendChild(img);
	d.appendChild(desc);

	return d;
};

WorkspaceBox.prototype.changeType = function() {
	this.$el[0].setAttribute("data-elementType", 'workspaceBox');

	if(settings.data.hideElementsNames) {
		this.$el.find(".elementName")[0].style.opacity = 0;
	}
};

WorkspaceBox.prototype.init = function(zIndex) {
	this.$el.data("ptr", this);

	// mark final elements
	if(game.finalElements.indexOf(this.id) !== -1 && settings.data.markFinalElements) {
		this.$el[0].className += " finalElement";
	}

	this.$el[0].style.zIndex = zIndex ? zIndex : "100";

	if(bases.base[this.id].hasOwnProperty("hidden")) {
		this.$el[0].className += " hiddenElement";
	}

	this.initDraggable();
	this.initDroppable();
	if(settings.data.hideElementsNames) {
		this.hideElementName();
	}
};

WorkspaceBox.prototype.initDraggable = function() {
	var self = this;
	this.draggable = new Draggable(this.$el[0], {
		handle : "img",
		zIndex : 1000,
		initialZIndex: 100
	});

	this.$el.on("dragStart", function(e) {
		if(settings.data.hideElementsNames) {
			self.$el.find(".elementName")[0].style.opacity = 1;
			self.removeHideElementName();
		}

		$(document).trigger("workspaceBoxDraggingStart");

		self.$el[0].parentNode.appendChild(self.$el[0]);
	});

	this.$el.on("dragEnd", function(e, draggable) {
		// var draggable = e.detail.draggable;
		var elementWidth = draggable.size.width / 2;
		var elementHeight = draggable.size.height / 2;
		
		if(draggable.position.left < -elementWidth 
		   || draggable.position.left > workspace.$el.width() + elementWidth
		   || draggable.position.top < -elementHeight
		   || draggable.position.top > workspace.$el.height() - elementHeight) {
				workspace.del(self);
				return;
		}

		if(settings.data.hideElementsNames) {
			self.hideElementName();
			self.$el.find(".elementName")[0].style.opacity = 0;
		}

		$(document).trigger("elementDropped");
	});
};

WorkspaceBox.prototype.initDroppable = function() {
	var self = this;

	this.droppable = new Droppable(this.$el[0], {
		acceptOne: true
	});

	this.$el.on("droppableOver", function(e, draggable) {
		self.onOver();

		// var parentId = ui.helper.attr("data-elementId");
		// var parents = [Math.min(parentId, self.id), Math.max(parentId, self.id)];
		// if(workspace.alreadyCombined(parents)) {
		// 	self.onAlreadyCombined();
		// }
		// else if(workspace.sex(parents).length > 0) {
		// 	self.onSex();
		// }
	});

	this.$el.on("droppableOut", function(e, draggable) {
		self.onOut();
	});

	this.$el.on("droppableDrop", function(e, draggable) {
		self.onOut();

		var parentId = draggable.element.getAttribute("data-elementid");
		var parents = [Math.min(parentId, self.id), Math.max(parentId, self.id)];
		var children = workspace.sex(parents);

		// if children were created and not yet combined
		if(children.length > 0 && !workspace.alreadyCombined(parents)) {
			var position = workspace.calculateOffspringPosition(
				[{
					left: draggable.position.x,
					top: draggable.position.y 
				}, self.$el.position()], 
				self.$el.width(), 
				children.length
			);

			for(i = 0; i < children.length; i++){	// add every child
				// check if final elements
				if(game.checkIfFinal(children[i])){	// if is final
					game.finalElements.push(children[i]);
				}

				workspace.add(children[i], position[i]);
			}

			// delete parent elements
			workspace.del(self);

			if(draggable.element.getAttribute("data-elementType") === "workspaceBox") {
				workspace.del($(draggable.element).data("ptr"));
			}
			else {
				$(draggable.helper).off().remove();
			}

			//fire event
			$(document).trigger("childCreated", [children, parents]);
		}
		else if(draggable.element.getAttribute("data-elementType") === "libraryBox") { // if draggable was not already on workspace
			new WorkspaceBox(draggable.helper);
			// draggable.helper.style.zIndex = (parseInt(self.$el[0].style.zIndex ,10) + 1).toString();

			if(!workspace.alreadyCombined(parents)) {
				$(document).trigger("childCreationFail", [parents]);
			}
		}
		else {
			// draggable.helper.style.zIndex = (parseInt(self.$el[0].style.zIndex ,10) + 1).toString();
			if(!workspace.alreadyCombined(parents)) {
				$(document).trigger("childCreationFail", [parents]);
			}
		}
	});
};

WorkspaceBox.prototype.hideElementName = function() {
	// enable transition - for single element not being dragged
	var elements = workspace.el.getElementsByClassName("elementName");
	for(var i = 0; i < elements.length; i++) {
		elements[i].className = elements[i].className.replace(" noTransition", "");
	}

	// add listeners
	var self = this;

	this.$el.on("mouseenter", function() {
		if(settings.data.hideElementsNames) {
			self.$el.find(".elementName")[0].style.opacity = 1;
		}
	});

	this.$el.on("mouseleave", function() {
		if(settings.data.hideElementsNames) {
			self.$el.find(".elementName")[0].style.opacity = 0;
		}
	});
};

WorkspaceBox.prototype.removeHideElementName = function() {
	this.$el.off("mouseenter");
	this.$el.off("mouseleave");

	// disable transition for elements below dragged element - performance issues
	var elements = workspace.el.getElementsByClassName("elementName");
	for(var i = 0; i < elements.length; i++) {
		elements[i].className += " noTransition";
	}
};

WorkspaceBox.prototype.onOver = function() {
	this.$el[0].style.opacity = 0.5;

	if(settings.data.hideElementsNames) {
		this.$el.find(".elementName")[0].style.opacity = 1;
	}
};

WorkspaceBox.prototype.onOut = function() {
	this.$el[0].style.opacity = 1;

	if(settings.data.hideElementsNames) {
		this.$el.find(".elementName")[0].style.opacity = 0;
	}
};

WorkspaceBox.prototype.onSex = function() {
};

WorkspaceBox.prototype.onAlreadyCombined = function() {
};

WorkspaceBox.prototype.initEvents = function() {
	var self = this,
	img = this.$el.find("img");

	// gestures for mouse events, for touch events can be found in touch.js
	img.dblclick(function(event) {
		event.preventDefault();
    });

	// double click - clone event
	var DELAY = 1000,
		clicks = 0,
		timer = null,
		elementPtr = null;
	
	img.on(gestures.startEvents.join(" "), function(evt) {
		if(evt.type === "mousedown" && evt.which !== 1) {
			return;
		}

		if(elementPtr === null || elementPtr === self) {
			elementPtr = self;
			clearTimeout(timer);

	        timer = setTimeout(function() {
	            clicks = 0;
	            elementPtr = null;
	        }, DELAY);

			if(clicks === 1) {
				img.on(gestures.events[evt.type][0], function(e) {
					if(clicks === 1) {
						clicks = 0;
				        elementPtr = null;
				        img.off(gestures.events[evt.type][0]);

				        $(document).trigger("cloneWorkspaceBox", [e, self]);
				    }
			    });	

			    return;
	        }

	        img.on(gestures.events[evt.type][0], function(e) {
		        clicks = 0;
		        elementPtr = null;
		        clearTimeout(timer);

		        img.off(e.type);
		    });	

		    img.on(gestures.events[evt.type][1],function() {
		        img.off(gestures.events[evt.type][0]);
		    });

		    // if clicked somewhere else then abort
		    $(document).on(gestures.startEvents.join(" "), function(e) {
		    	if(e.target !== img[0]) {
		    		clicks = 0;
			        elementPtr = null;
			        clearTimeout(timer);

			        $(document).off(gestures.startEvents.join(" "));
		    	}
		    });

	        clicks++;
    	}
	});

	// show element info box
	img.on("mousedown", function(e) {
		if(e.which === 3) {
			$(document).trigger("showElementInfo", [e, self]);
		}
	});

	img.on("gesturelongpress", function(e) {
		$(document).trigger("showElementInfo", [e, self]);
	});
};