/**
 * Alchemy.Library.Box 
 * Handling one element in library.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 */
/*global bases, game, library, settings, template, workspace*/

function LibraryBox(id_) {	
	this.id = id_;
	this.init();
	this.initEvents();
}

LibraryBox.prototype.createElement = function(isHidden) {
	var d = document.createElement('div');
	d.setAttribute("class", 'element');
	d.setAttribute("data-elementType", 'libraryBox');
	d.setAttribute("data-elementId",  this.id);

	d.style.display = isHidden ? "none" : d.style.display;

	// final elements
	if(game.finalElements.indexOf(this.id) !== -1 && settings.data.markFinalElements) {
		d.className += " finalElement";
	}

	var img, span;
	if(bases.imagesLoaded) {
		img = document.createElement('img');
		img.style.opacity = 0;
		img.src = "data:image/png;base64," + bases.images[this.id];	
		img.alt = bases.names[this.id];

		img.onload = function() {
			this.style.opacity = 1;
			img.onload = null;
		};
	}
	else if(isHidden) {
		img = document.createElement('img');
		img.src = "data:image/png;base64," + library.loadingImage;
		img.alt = bases.names[this.id];
	}
	else {
		img = document.createElement('img');
		img.style.display = "none";
		img.alt = bases.names[this.id];

		span = document.createElement('span');
		span.className += " elementLoadingImage";
	}

	var desc = document.createElement('div');
	desc.setAttribute("class", "elementName");
	desc.textContent = bases.names[this.id];

	if(span) {
		d.appendChild(span);
	}
	d.appendChild(img);
	d.appendChild(desc);

	return d;
};

LibraryBox.prototype.init = function() {
	this.$el = $(library.elContainter.appendChild(this.createElement()));
	this.$el.data("ptr", this);

	this.initDraggable();
};

LibraryBox.prototype.initDraggable = function() {
	var self = this;
	
	this.draggable = new Draggable(this.$el[0], {
		zIndex : 1000,
		initialZIndex: 100,
		handle: bases.imagesLoaded ? "img" : "span, img",
		helper : function() {
			return document.getElementById("workspace").appendChild(self.createElement(true));
		}
	});

	this.$el.on("dragStart", function(e) {
		$(document).trigger("libraryBoxDraggingStart", [self.id]);
		if(iscrollLibrary) {
			iscrollLibrary.disable();
		}
	});

	this.$el.on("dragEnd", function(e, draggable) {
		// if is not above library or other element then create workspaceBox
		if(!draggable.isOver) {
			new WorkspaceBox(draggable.helper);
			$(document).trigger("elementDropped");
		}

		if(iscrollLibrary) {
			iscrollLibrary.initiated = false;
			iscrollLibrary.enable();
		}
	});
};

LibraryBox.prototype.initEvents = function() {
	var self = this, img = self.$el.find("img");

	img.on("mousedown", function(e) {
		if(e.which === 3) {
			$(document).trigger("showElementInfo", [e, self]);
		}
	});

	img.on("gesturelongpress", function(e) {
		$(document).trigger("showElementInfo", [e, self]);
	});
};
