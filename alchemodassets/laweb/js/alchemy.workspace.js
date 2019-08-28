/**
 * Alchemy.Workspace
 * Responsible for workspace - mixing elements.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyright: ReCloak Interactive
 *
 * @events:
 *
 * TODO - if changed class helper of draggable then change del()
 */
 /*global bases, game, settings*/

var workspace = {
	init : function() {
		workspace.el = document.getElementById("workspace");
		workspace.$el = $(workspace.el);

		workspace.loadFromStorage();

		$("#clearWorkspace").on("touchstart", workspace.clear);

		$(document).on("cloneWorkspaceBox", function(event, event_, element_) {
			workspace.clone(event_, element_);
		});

		$(document).on("imagesLoaded", function() {
			workspace.reloadImages();
		});

		$(document).on("namesLoaded", workspace.reloadNames);
		// this event creates draggable on workspace, to prevent having dead element
		$(document).on("draggableDroppedFix", function(e, draggable) {
			new WorkspaceBox(draggable.helper);
		});

		window.addEventListener("orientationchange", workspace.recalculateElements, false);
		window.addEventListener("resize", workspace.hideUnderLibrary, false);
		window.addEventListener("beforeunload", workspace.save, false);
	},
	
	add : function(id_, position_, zIndex_) {
		return new WorkspaceBox(id_, position_, zIndex_);
	},
 
	// cloning element, new element is created in place from which old one has been dragged
	clone : function(event_, element_) {
		var ptr = new WorkspaceBox(element_.id, element_.$el.position());

		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent(
			'mousedown', 
			true, 
			true, 
			window, 
			1, 
			event_.pageX, 
			event_.pageY, 
			event_.pageX, 
			event_.pageY, 
			false, 
			false, 
			false, 
			false, 
			0, 
			null
		);
		
		ptr.$el[0].dispatchEvent(evt);
		ptr.droppable.startListeningToDrag(element_.draggable);
	},
	
	clear : function() {
		if(settings.data.markFinalElements && workspace.$el.find(".finalElement").length > 0) {
			elements = workspace.$el.find(".finalElement");
		}
		else {
			elements = workspace.$el.find(".element");
		}  

		workspace.clearSpecified(elements);

		$(document).trigger("workspaceCleared");
	},

	clearSpecified : function(elements) {
		var element, ptr;
		for(var i = 0, ii = elements.length; i < ii; i++) {
			element = $(elements[i]);
			ptr = element.data("ptr");
			
			if(ptr) {
				if(ptr.droppable) {
					ptr.droppable.destroy();
				}
				if(ptr.draggable) {
					ptr.draggable.destroy();
				}

				ptr.draggable = null;
				ptr.droppable = null;
			}

			element.find("img").off();
			element
				.data("ptr", null)		// get pointer to object, then delete
				.off()
				.remove();
		}
	},

	/**
	 *	Delete specified element.
	 */
	del : function(element) {
		element.$el[0].style.display = "none";
		$(document).off(gestures.startEvents.join(" "));
		$(element.$el).off(gestures.startEvents.join(" "));

		if(element.droppable) {
			element.droppable.destroy();
		}
		if(element.draggable) {
			element.draggable.destroy();
		}

		element.draggable = null;
		element.droppable = null;
		
		element.$el.find("img").off();
		element.$el
			.data("ptr", null)
			.off()
			.remove();

		element = null;
	},
	
	reloadImages : function() {
		var workspaceBoxes = workspace.el.getElementsByClassName("element");
		var $element, img;

		for(var i = 0; i < workspaceBoxes.length; i++) {
			img = workspaceBoxes[i].firstChild;
			img.src = "data:image/png;base64," + bases.images[workspaceBoxes[i].getAttribute("data-elementId")];
		}
	},

	reloadNames : function() {
		var workspaceBoxes = workspace.el.getElementsByClassName("element");
		var $element, description;

		for(var i = 0; i < workspaceBoxes.length; i++) {
			$element = $(workspaceBoxes[i]);
			description = $element.find("div");
			description[0].innerHTML = bases.names[$element.attr("data-elementId")];
		}
	},

	sex : function(elements) {
		var i,ii,j,count;
		var children = [];
		var keys = Object.keys(bases.base);

		for(i = 0, ii = keys.length; i < ii; i++) {
			count = workspace.ifSex(elements, keys[i]); //i.e. human + zombie = 2x zombie so count = 2
			for(j = 0; j < count; j++) {
				children.push(parseInt(keys[i], 10));
			}
		}

		return children;
	},
	
	ifSex : function(elements, i) {
		var j, ret = 0;
		if(bases.base[i].hasOwnProperty("parents")) {
			for (j = 0; j < bases.base[i].parents.length; j++) {
				if(Math.min(elements[0], elements[1]) === Math.min(bases.base[i].parents[j][0], bases.base[i].parents[j][1]) 
				   && Math.max(elements[0], elements[1]) === Math.max(bases.base[i].parents[j][0], bases.base[i].parents[j][1])){
					ret = ret + 1;
				}
			}
		}

		return ret;
	},
	
	calculateOffspringPosition : function(parentsPosition, width, numberOfChildren) {
		var i;
		var childPosition = function(no) {
			var a = (parentsPosition[0].top  - parentsPosition[1].top ) /		//direction factor of line of parents
					(parentsPosition[0].left - parentsPosition[1].left);
					
			var translation = width * 0.35;	//distance between children
			
			var middlePoint = {
				x : (parentsPosition[0].left + parentsPosition[1].left) / 2,
				y : (parentsPosition[0].top  + parentsPosition[1].top)  / 2
			};
			var x = middlePoint.x + Math.cos(Math.atan(-1 / a)) * no * translation;
			var y = middlePoint.y + Math.sin(Math.atan(-1 / a)) * no * translation;	//coordinates of child on normal line to line of parents
			
			return {
				top: y, 
				left: x
			};
		};
		
		var childrenPositions = [];			
		var n = Math.floor(numberOfChildren / 2);
		for(i = -n; i <= n; i++){
			if(i !== 0 || numberOfChildren % 2){
				childrenPositions.push(childPosition(i));
			}
		}
		
		return childrenPositions;
	},
	
	alreadyCombined : function(elements) {
		if(settings.data.checkAlreadyCombined) {
			if(game.checkIfNotAlreadyDone(elements)) {
				return false;
			}

			return true;
		}

		return false;
	},

	hideUnderLibrary: function() {
		var elements = workspace.$el.find(".element");
		var leftOffset = workspace.$el.width() - $("#side").width();
		var elementWidth = $(".element").width();

		for(var i = 0; i < elements.length; i++) {
			var $this = $(elements[i]);
			if($this.offset().left + elementWidth / 2 > leftOffset) {
				elements[i].style.visibility = "hidden";
				$this.data("ptr").droppable.enabled = false;
			}
			else if(elements[i].style.visibility === "hidden") {
				elements[i].style.visibility = "visible";	
				$this.data("ptr").droppable.enabled = true;
			}
		}
	},

	recalculateElements: function() {
		var i;
		var elements = workspace.$el.find(".element");
		var width = workspace.$el.width();
		var elementWidth = $(".element").width();

		for(var i = 0; i < elements.length; i++) {
			var $this = $(elements.get(i));
			if($this.offset().left + elementWidth > width) {
				workspace.del($this.data("ptr"));
			}
		}
	},

	save: function() {
		if(settings.data.saveElementsPositions) {
			var positions = stats.getElementsPositions();
			storage.setElementPositions(positions);
		}
	},

	loadFromStorage: function() {
		if(!settings.data.saveElementsPositions) {
			return;
		}
		
		var positions = storage.getElementPositions();
		if(positions !== null) {
			for(var i = 0, ii = positions.length; i < ii; i++) {
				if(game.progress.indexOf(positions[i].id) !== -1 || game.prime.indexOf(positions[i].id) !== -1) {
					workspace.add(positions[i].id, positions[i].position);
				}
			}
		}
	},

	elementsNamesVisibility: function() {
		var elements = workspace.$el.find(".element");
		var ptr = null;
		var $el;

		for(var i = 0, ii = elements.length; i < ii; i++) {
			$el = $(elements[i]);
			ptr = $el.data("ptr");

			if(settings.data.hideElementsNames) {
				ptr.hideElementName();
				$el.find(".elementName")[0].style.opacity = 0;
			}
			else {
				ptr.removeHideElementName();
				$el.find(".elementName")[0].style.opacity = 1;
			}
		}
	}
};