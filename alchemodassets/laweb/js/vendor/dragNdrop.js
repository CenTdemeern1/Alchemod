// Drag n Drop by Recloak.com
// based on Draggabilly http://draggabilly.desandro.com

(function(){
// -------------------------- requestAnimationFrame -------------------------- //
var lastTime = 0;
var prefixes = 'webkit moz ms o'.split(' ');
// get unprefixed rAF and cAF, ifpresent
var requestAnimationFrame = window.requestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame;
// loop through vendor prefixes and get prefixed rAF and cAF
var prefix;
for( var i = 0; i < prefixes.length; i++ ) {
  if( requestAnimationFrame && cancelAnimationFrame ) {
    break;
  }
  prefix = prefixes[i];
  window.requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
  window.cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] ||
                            window[ prefix + 'CancelRequestAnimationFrame' ];
}

// fallback to setTimeout and clearTimeout ifeither request/cancel is not supported
if( !requestAnimationFrame || !cancelAnimationFrame || typeof requestAnimationFrame === "undefined" )  {
  window.requestAnimationFrame = function( callback ) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
    var id = window.setTimeout( function() {
      callback( currTime + timeToCall );
    }, timeToCall );
    lastTime = currTime + timeToCall;
    return id;
  };

  window.cancelAnimationFrame = function( id ) {
    window.clearTimeout( id );
  };
}

// -------------------- extend objects -------------------- //
function extend( a, b ) {
  for( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

// -------------------- get style -------------------- //
var getStyle = getComputedStyle ?
  function( elem ) {
    return getComputedStyle( elem, null );
  } 
  : function( elem ) {
    return elem.currentStyle;
  };

// -------------------- get style property ----------------- //
var prefixes = 'Webkit Moz ms Ms O'.split(' ');
var docElemStyle = document.documentElement.style;

window.getStyleProperty = function( propName ) {
  if ( !propName ) {
    return;
  }

  // test standard property first
  if ( typeof docElemStyle[ propName ] === 'string' ) {
    return propName;
  }

  // capitalize
  propName = propName.charAt(0).toUpperCase() + propName.slice(1);

  // test vendor specific properties
  var prefixed;
  for ( var i=0, len = prefixes.length; i < len; i++ ) {
    prefixed = prefixes[i] + propName;
    if ( typeof docElemStyle[ prefixed ] === 'string' ) {
      return prefixed;
    }
  }
}

// ------------------- global variables ------------------ //
var transformProperty = window.getStyleProperty('transform');
var is3d = !!window.getStyleProperty('perspective');

window.Draggables = {
  isDragging: null
};

// --------------------- DRAG ----------------------------- //
function Draggable( element, options ) {
  // querySelector ifstring
  this.element = typeof element === 'string' ?
    document.querySelector( element ) : element;
  this.$element = $(this.element);

  this.options = extend( {}, this.options );
  extend( this.options, options );

  this._create();
}

Draggable.prototype.options = {
  helperShowDistance: 8
};

Draggable.prototype._create = function() {
  this.position = {};
  this.size = {};

  this._getPosition();

  this.startPoint = { x: 0, y: 0 };
  this.dragPoint = { x: 0, y: 0 };

  this.startPosition = extend( {}, this.position );

  this.enable();
  this.setHandles();

  this.visible = false;
};

// set handle of dragging object
Draggable.prototype.setHandles = function() {
  this.handles = this.options.handle ?
    this.element.querySelectorAll( this.options.handle ) : [ this.element ];

  this.addListenersToHandles();
};

// set handle of dragging object
Draggable.prototype.changeHandles = function(handle) {
  this.removeHandlerListeners();
  this._unbindEvents();

  this.handles = handle ?
    this.element.querySelectorAll( handle ) : [ this.element ];

  this.addListenersToHandles();
};

Draggable.prototype.addListenersToHandles = function() {
  var handle;

  for( var i = 0, ii = this.handles.length; i < ii; i++ ) {
    handle = this.handles[i];
    handle.addEventListener( 'mousedown', this );
    handle.addEventListener( 'touchstart', this );

    if ( window.navigator.pointerEnabled ) {
      handle.addEventListener( 'pointerdown', this );
      handle.style.touchAction = 'none';
    } else if ( navigator.msMaxTouchPoints ) {
      handle.addEventListener( 'MSPointerDown', this );
      handle.style.msTouchAction = 'none';
    }
  }
};

// clear all listeners
Draggable.prototype.removeHandlerListeners = function() {
  for( var i = 0, len = this.handles.length; i < len; i++ ) {
    var handle = this.handles[i];
    handle.removeEventListener( 'mousedown', this );
    handle.removeEventListener( 'touchstart', this );

    handle.removeEventListener( 'pointerdown', this );
    handle.removeEventListener( 'MSPointerDown', this );
  }
};

// get left/top position from style
Draggable.prototype._getPosition = function() {
  var style = getStyle( this.element );
  if(style.position === "absolute") {
    this.position = {
      x: parseInt( style.left, 10 ),
      y: parseInt( style.top, 10 )
    };
  }
  else {
    var rect = this.element.getBoundingClientRect();
    this.position = {
      x: rect.left,
      y: rect.top
    };
  }
};

// get left/top position from style
Draggable.prototype._getHelperSize = function() {
  var style = getStyle( this.helper );

  var width = parseInt( style.width, 10 );
  var height = parseInt( style.height, 10 );

  this.size.width = isNaN( width ) ? 0 : width;
  this.size.height = isNaN( height ) ? 0 : height;
};

// -------------------------- events -------------------------- //

// trigger handler methods forevents
Draggable.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if( this[ method ] ) {
    this[ method ]( event );
  }
};

// ----- start event ----- //
Draggable.prototype.onmousedown = function( event ) {
  var button = event.button;
  if( button && ( button !== 0 && button !== 1 ) ) {
    return;
  }

  this.dragStart( event, event );
};

Draggable.prototype.ontouchstart = function( event ) {
  if( this.isDragging ) {
    return;
  }

  // multiple touch
  // for(var i = 0; i < event.changedTouches.length; i++) {
  //   if(this.handles[0] === event.changedTouches[i].target) {
  //     this.dragStart( event, event.changedTouches[i] );
  //   }
  // }

  this.dragStart( event, event.changedTouches[0] );
}

Draggable.prototype.onMSPointerDown =
Draggable.prototype.onpointerdown = function( event ) {
  if ( this.isDragging ) {
    return;
  }

  this.dragStart( event, event );
};

function setPointerPoint( point, pointer ) {
  point.x = pointer.pageX !== undefined ? pointer.pageX : pointer.clientX;
  point.y = pointer.pageY !== undefined ? pointer.pageY : pointer.clientY;
}

// hash of events to be bound after start event
var postStartEvents = {
  mousedown: [ 'mousemove', 'mouseup' ],
  touchstart: [ 'touchmove', 'touchend', 'touchcancel' ],
  pointerdown: [ 'pointermove', 'pointerup', 'pointercancel' ],
  MSPointerDown: [ 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel' ]
};

/**
 * drag start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
Draggable.prototype.dragStart = function( event, pointer ) {
  if(Draggables.isDragging !== null) {
    // check if element blocking dragging still exists
    if(Draggables.isDragging.parentNode && !Draggables.isDragging.parentNode.contains(Draggables.isDragging)) {
      Draggables.isDragging = null;  
    }
    else {
      return;
    }
  }

  if( !this.isEnabled ) {
    return;
  }

  event.preventDefault();

  if( this.options.helper ) {
    this.helper = null;
  }

  this.isDragging = true;
  Draggables.isDragging = this;

  this.isOver = false;

  // save pointer identifier to match up touch events
  this.pointerIdentifier = pointer.pointerId !== undefined ? pointer.pointerId : pointer.identifier;

  this._getPosition();

  // point where drag began
  setPointerPoint( this.startPoint, pointer );
  // position _when_ drag began
  this.startPosition.x = this.position.x;
  this.startPosition.y = this.position.y;

  // if helper is not created everytime, then dragging starts immediately
  // in other case it starts after element is dragged this.options.helperShowDistance px from start position
  if( !this.options.helper && this.options.helperShowDistance ) {
    // create helper if needed
    this.helper = this.element;
    this.helper.style.position = "absolute";
    this._getHelperSize();

    // change z-index
    this.helper.style.zIndex = this.options.zIndex ? this.options.zIndex.toString() : this.helper.style.zIndex;

    // reset left/top style
    this.setLeftTop();
  }

  this.dragPoint.x = 0;
  this.dragPoint.y = 0;

  // bind move and end events
  this._bindEvents({
    // get proper events to match start event
    events: postStartEvents[ event.type ],
    // IE8 needs to be bound to document
    node: event.preventDefault ? window : document
  });

  // this.helper.className += ' is-dragging';

  if( !this.options.helper && this.options.helperShowDistance ) {
    this.$element.trigger('dragStart', [this]);
    $(".droppable").trigger("drag", [this]);

    this.animate();
  }
};

Draggable.prototype._bindEvents = function( args ) {
  for(var i = 0, len = args.events.length; i < len; i++ ) {
    args.node.addEventListener( args.events[i], this );
  }

  // save these arguments
  this._boundEvents = args;
};

Draggable.prototype._unbindEvents = function() {
  var args = this._boundEvents;
  if( !args || !args.events ) {
    return;
  }

  for(var i = 0, len = args.events.length; i < len; i++ ) {
    args.node.removeEventListener( args.events[i], this, false );
  }

  //  delete this._boundEvents;
  this._boundEvents = null;
};

Draggable.prototype._getTouch = function( event ) {
  for(var i = 0, ii = event.changedTouches.length; i < ii; i++) {
    if(this.pointerIdentifier === event.changedTouches[i].identifier) {
      return event.changedTouches[i];
    }
  }
}

// ----- move event ----- //
Draggable.prototype.onmousemove = function( event ) {
  this.dragMove( event, event );
};

Draggable.prototype.ontouchmove = function( event ) {
  // multiple touch
  // for(var i = 0; i < event.changedTouches.length; i++) {
  //   if(this.handles[0] === event.changedTouches[i].target) {
  //     this.dragMove( event, event.changedTouches[i] );
  //   }
  // }

  var touch = this._getTouch( event );
  if(touch) {
    this.dragMove( event, touch );
  }
};

Draggable.prototype.onMSPointerMove =
Draggable.prototype.onpointermove = function( event ) {
  if ( this.pointerIdentifier === event.pointerId ) {
    this.dragMove( event, event );
  }
};

// Draggable.prototype.onpointermove = function( event ) {
//   this.dragMove( event, event.originalEvent.changedTouches[0] );
// };

/**
 * drag move
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
Draggable.prototype.dragMove = function( event, pointer ) {
  if( !this.isDragging ) {
    return false;
  }

  setPointerPoint( this.dragPoint, pointer );
  var dragX = this.dragPoint.x - this.startPoint.x;
  var dragY = this.dragPoint.y - this.startPoint.y;

  if(this.options.helper && !this.visible) {
    if(Math.sqrt(dragX * dragX + dragY * dragY) > this.options.helperShowDistance) {
      // create helper if needed
      this.helper = this.options.helper ? this.options.helper() : this.element;
      this.helper.style.position = "absolute";
      this._getHelperSize();

      // reset left/top style
      this.position.x = this.startPosition.x;
      this.position.y = this.startPosition.y;
      this.setLeftTop();

      // change z-index
      this.helper.style.zIndex = this.options.zIndex ? this.options.zIndex.toString() : this.helper.style.zIndex;
      this.helper.style.display = "block";
      this.visible = true;

      this.$element.trigger('dragStart', [this]);
      $(".droppable").trigger("drag", [this]);

      this.animate();
    }
  }

  this.position.x = this.startPosition.x + dragX;
  this.position.y = this.startPosition.y + dragY;

  // set dragPoint properties
  this.dragPoint.x = dragX;
  this.dragPoint.y = dragY;

  this.$element.trigger('dragMove', [this]);
};

// ----- end event ----- //
Draggable.prototype.onmouseup = function( event ) {
  this.dragEnd( event, event );
};

Draggable.prototype.ontouchend = function( event ) {
  var touch = this._getTouch( event );
  if(touch) {
    this.dragEnd( event, touch );
  }
};

Draggable.prototype.onMSPointerUp =
Draggable.prototype.onpointerup = function( event ) {
  if ( this.pointerIdentifier === event.pointerId ) {
    this.dragEnd( event, event );
  }
};

/**
 * drag end
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
Draggable.prototype.dragEnd = function( event, pointer ) {
  Draggables.isDragging = null;
  this.isDragging = false;
  this.visible = false;
  // delete this.pointerIdentifier;
  this.pointerIdentifier = null;

  // remove events
  this._unbindEvents();

  if( this.helper && this.helper.style.display !== "none" ) {
    if( transformProperty ) {
      this.helper.style[ transformProperty ] = '';
      this.setLeftTop();
    }

    // set auto z-index
    if(this.options.zIndex && this.options.initialZIndex && this.helper && this.helper.style.display !== "none") {
      this.helper.style.zIndex = this.options.initialZIndex.toString();
    }  
  }
  else {
    return false;
  }

  // change class name
  // this.helper.className = this.helper.className.replace(/\bis-dragging\b/, '');

  // if we want to remove helper then do it
  if(this.options.removeHelper) {
    this.helper.parentNode.removeChild(this.helper);
  }

  this.$element.trigger('dragEnd', [this]);
};

// ----- cancel event ----- //
Draggable.prototype.onMSPointerCancel =
Draggable.prototype.onpointercancel = function( event ) {
  if ( event.pointerId === this.pointerIdentifier ) {
    this.dragEnd( event, event );
  }
};

Draggable.prototype.ontouchcancel = function( event ) {
  var touch = this._getTouch( event );
  if(touch) {
    this.dragEnd( event, touch );
  }
};

// -------------------------- animation -------------------------- //
Draggable.prototype.animate = function() {
  // only render and animate ifdragging
  if( !this.isDragging ) {
    return;
  }

  this.positionDrag();

  var self = this;
  window.requestAnimationFrame(function animateFrame() {
    self.animate();
  });
};

// transform translate function
var translate = is3d ? function( x, y ) {
    return 'translate3d( ' + x + 'px, ' + y + 'px, 0)';
  } :
  function( x, y ) {
    return 'translate( ' + x + 'px, ' + y + 'px)';
  };

// left/top positioning
Draggable.prototype.setLeftTop = function() {
  this.helper.style.left = this.position.x + 'px';
  this.helper.style.top  = this.position.y + 'px';
};

Draggable.prototype.positionDrag = transformProperty ?
  function() {
    // position with transform
    this.helper.style[ transformProperty ] = translate( this.dragPoint.x, this.dragPoint.y );
  } 
  : Draggable.prototype.setLeftTop;

Draggable.prototype.enable = function() {
  this.isEnabled = true;
};

Draggable.prototype.disable = function() {
  this.isEnabled = false;
  if( this.isDragging ) {
    this.dragEnd();
  }
};

Draggable.prototype.destroy = function() {
  this.removeHandlerListeners();
  this.$element.off();
};

window.Draggable = Draggable;

// ======================================================== //
//                                                          //
// --------------------- DROPPABLE ------------------------ //
//                                                          //
// ======================================================== //

// pointer to droppable above which is currently dragged draggable
window.Droppables = {
  isOverPtr: null
};

function Droppable( element, options ) {
  // querySelector ifstring
  this.element = typeof element === 'string' ?
    document.querySelector( element ) : element;
  this.$element = $(this.element);

  this.options = extend( {}, this.options );
  extend( this.options, options );

  this._create();
}

Droppable.prototype.options = {
  tolerance: "intersect"
};

Droppable.prototype._create = function() {
  this.position = {};
  this.size = {};

  // get position and size of droppable
  this._getPosition();
  this._getSize();

  this.isOver = false;
  this.blocker = null;

  this._listen();
  this.element.className += " droppable";
  this.enabled = true;
  // on orientation change or window resize
  var self = this;
  // self.resize = function(e) {
  //   self._getPosition();
  //   self._getSize();
  // };

  this.$element.on("resized", function(e) {
    self._getPosition();
    self._getSize();
  });
};

// get left/top position from style
Droppable.prototype._getPosition = function() {
  var style = getStyle( this.element );
  if(style.position === "absolute") {
    this.position = {
      x: parseInt( style.left, 10 ),
      y: parseInt( style.top, 10 )
    };
  }
  else {
    var rect = this.element.getBoundingClientRect();
    this.position = {
      x: rect.left,
      y: rect.top
    };
  }
};

// get left/top position from style
Droppable.prototype._getSize = function() {
  var style = getStyle( this.element );

  var width = parseInt( style.width, 10 );
  var height = parseInt( style.height, 10 );

  this.size.width = isNaN( width ) ? 0 : width;
  this.size.height = isNaN( height ) ? 0 : height;
};

// listen to events of acceptable draggables
Droppable.prototype._listen = function() {
  var self = this;

  this.dragEnd = function(e, draggable) {
    Droppable.prototype._onDragEnd.apply(self, [e, draggable]);
  };

  var dragMove = function(e, draggable) {
    Droppable.prototype._onDragMove.apply(self,[draggable, e]);
  };

  this.$element.on("drag", function(e, draggable) {
    if(typeof(draggable) === "undefined" || typeof(draggable.element) === "undefined") {
      return false;
    }

    if(self.enabled) {
      // check if is blocker being dragging
      if(self.blocker !== null && self.blocker === draggable.helper) {
        self.blocker = null;
      }

      // check if droppable can accept draggable if so then add listeners
      if(self._accept(draggable.element)) {
        draggable.$element.on("dragMove", dragMove);
        draggable.$element.one("dragEnd", self.dragEnd);
      }
    }
  });

  // change position if element was dragged away
  this.$element.on("dragEnd", function(e, draggable) {
    if(self.element === draggable.element) {
      self._getPosition();
    }
  });
};

Droppable.prototype.startListeningToDrag = function(draggable) {
  var self = this;

  // this.dragEnd = function(e, draggable) {
  //   $(this).off("dragEnd", self.dragEnd);
  //   Droppable.prototype._onDragEnd.apply(self, [e, draggable]);
  // };

  var dragMove = function(e, draggable) {
    Droppable.prototype._onDragMove.apply(self,[draggable]);
  };

  draggable.$element.on("dragMove", dragMove);
  draggable.$element.one("dragEnd", this.dragEnd);
};

// on draggable move
Droppable.prototype._onDragMove = function(draggable) {
  if(this.enabled) {
    if(Droppables.isOverPtr !== null && Droppables.isOverPtr !== this) {
      return;
    }

    var intersect = this._checkIntersection(draggable);

    if(intersect) {
      this._over(draggable);
    }
    else if(this.isOver) {
      this._out(draggable);
    }
  }
  else {
    this.destroy();
  }
};

// when dragging ends
Droppable.prototype._onDragEnd = function(e, draggable) {
  // remove listeners
  draggable.$element.off("dragMove");
  if(this.dragEnd !== null) {
    draggable.$element.off("dragEnd", this.dragEnd);
  }

  if(this.enabled) {
    if(draggable.dragPoint.x == 0 && draggable.dragPoint.y == 0) {
      return;
    }

    if(this.isOver && this.blocker === null) {
      this._drop(draggable);

      // !! important
      // if this droppable accepts drop of draggable then stop event propagation
      // e.stopImmediatePropagation();
    }
  }
  else {
    this.destroy();
  }
};

// checking if draggable is acceptable by droppable
Droppable.prototype._accept = function(element) {
  if(this.$element.data("ptr") && this.$element.data("ptr").draggable.isDragging) {
    return false;
  }

  if(this.$element === null) {
    return false;
  }

  if(this.element === element) {
    return false;
  }

  if(this.options.acceptOne && this.blocker !== null) {
    if(this.element.parentNode.contains(this.blocker) 
    && this._checkIntersection($(this.blocker).data("ptr").draggable)) {
      return false;
    }

    // blocker has been removed
    else {
      this.blocker = null;
      return true;
    }
  }

  return true;
};

// execute when draggable is over droppable
Droppable.prototype._over = function(draggable) {
    this.isOver = true;
    draggable.isOver = true;
    Droppables.isOverPtr = this;

    this._trigger("droppableOver", draggable);
};

Droppable.prototype._out = function(draggable) {
    this.isOver = false;
    draggable.isOver = false;
    Droppables.isOverPtr = null;

    if(this.options.acceptOne) {
      this.blocker = null;
    }

    this._trigger("droppableOut", draggable);
};

Droppable.prototype._drop = function(draggable) {

    if(this.options.acceptOne) {
      this.blocker = draggable.helper;
    }
    Droppables.isOverPtr = null;

    this._trigger("droppableDrop", draggable);
};

Droppable.prototype._trigger = function(name, draggable) {
  if(this.$element !== null) {
    this.$element.trigger(name, [draggable]);
  }
  else {
    // we trigger this event to create draggable on workspace, to prevent having dead element
    $(document).trigger("draggableDroppedFix", [draggable]);
    this.destroy();
  }
};

// check if droppable and draggable intersects
Droppable.prototype._checkIntersection = function(draggable) {
  var l = this.position.x,
      t = this.position.y,
      r = l + this.size.width,
      b = t + this.size.height,
      width = draggable.size.width,
      height = draggable.size.height,
      x1 = draggable.position.x,
      x2 = x1 + width,
      y1 = draggable.position.y,
      y2 = y1 + height;

  if(this.options.tolerance === "touch") {
    return (
        (y1 >= t && y1 <= b) || // Top edge touching
        (y2 >= t && y2 <= b) || // Bottom edge touching
        (y1 < t && y2 > b)      // Surrounded vertically
      ) && (
        (x1 >= l && x1 <= r) || // Left edge touching
        (x2 >= l && x2 <= r) || // Right edge touching
        (x1 < l && x2 > r)      // Surrounded horizontally
      );
  }
  else {
    return (l < x1 + (width / 2)      // right half
      && x2 - width / 2 < r           // left half
      && t < y1 + (height / 2)        // bottom half
      && y2 - (height / 2) < b );     // top half  
  }
};

Droppable.prototype.destroy = function() {
  if(Droppables.isOverPtr === this) {
    Droppables.isOverPtr = null;
  }

  this.enabled = false;
  
  // delete this.dragMove;
  // delete this.dragEnd;

  if(this.$element !== null) {
    this.$element.off("drag");
    this.$element.off("dragMove");
    this.$element.off("dragEnd");
    this.$element.off("resized");
    this.$element.off();
  }
  this.$element = null;

  // delete this.dragEnd;
  this.dragEnd = null;

  this.blocker = null;
  if(this.element) {
    this.element.parentNode.removeChild(this.element);
  }
  this.element = null;
};

window.Droppable = Droppable;
})( window );