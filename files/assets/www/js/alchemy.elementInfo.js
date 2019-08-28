/**
 * Alchemy.ElementInfo
 * 
 * @package: Alchemy  
 * @version: 0.1
 * @copyrighgt: Recloak
 */

var elementInfo = {
    constants : {
        WIDTH : 235,
        DISTANCE_TO_ELEMENT: 10,
        TIME_TO_FADE_OUT: 5000,
        FADE_OUT_TIME: 1500
    },

    init : function() {
        $(document).on("showElementInfo", function(e, e_, element) {
            var libraryElementClicked = element.$el.attr("data-elementType") === "libraryBox" ? true : false;
            
            var elPosition   = element.$el.offset();
            var elDim        = {width : element.$el.outerWidth(), height : element.$el.outerHeight()};
            var workspaceDim = {width : $('#workspace').outerWidth(), height : $('#workspace').outerHeight()};
            
            var newPosition = {};
            var elements = $(".elementInfoBox[data-elementId=" + element.id + "]");
            var i;
            for(i = 0; i < elements.length; i++) {
                if($(elements[i]).data("parent") === element.$el) {
                    var $el = $(elements[i]);
                    $el.stop().css("opacity", "1");

                    setTimeout(function() {
                        $el.fadeOut(elementInfo.constants.FADE_OUT_TIME, function(){
                            $el.off().remove();
                        });
                    }, elementInfo.constants.TIME_TO_FADE_OUT);
                        

                    return false;
                }
            }
            var infoBox = new ElementInfoBox(element.id, e_, element.$el, libraryElementClicked);

            //calculate new position
            newPosition.top  = elPosition.top  - infoBox.height - elementInfo.constants.DISTANCE_TO_ELEMENT;
            newPosition.left = elPosition.left - infoBox.width  - elementInfo.constants.DISTANCE_TO_ELEMENT;
            if(newPosition.left < 0) {
                newPosition.left = 0;
            }
            if(newPosition.top < 0) {
                newPosition.top = elPosition.top + elDim.height + elementInfo.constants.DISTANCE_TO_ELEMENT;
            }
            if(newPosition.top + infoBox.height > workspaceDim.height) {
                if( elPosition.top > (workspaceDim.height - elPosition.top - elDim.height) ) {
                    newPosition.top = 0;
                }
                else {
                    newPosition.top = workspaceDim.height - infoBox.height;
                }
            }
            if(element.$el.attr("data-elementType") === "libraryBox") {
                newPosition.left = elPosition.left;
            }
            if(newPosition.left + infoBox.width > workspaceDim.width){
                newPosition.left = workspaceDim.width - infoBox.width;
            }
            
            //set position
            infoBox.$el.css({
                'width': (infoBox.width - infoBox.paddingLR) + 'px',
                'z-index': '1000',
                'top': newPosition.top + 'px',
                'left': newPosition.left + 'px'
            });

            //block iscroll
            if(iscrollLibrary) {
                iscrollLibrary.initiated = false;
            }
            
            // $(".ui-draggable-dragging").trigger('mouseup');
        });
        
        //remove libraryInfoBoxes when some elements are moving
        $(document).on('libraryBoxDraggingStart',function(e){
            $(".elementInfoBox").off().remove();
        });
        $(document).on('workspaceBoxDraggingStart',function(e){
            $(".elementInfoBox").off().remove();
        });

    },

    getElementInfoData : function(id_) {
        var i, left = 0;
        var parents = [];
        var logged = false;

        if(bases.base[id_].hasOwnProperty("parents")) {
            left = bases.base[id_].parents.length;
            for(i = 0; i < bases.base[id_].parents.length; i++) {
                if(!game.checkIfNotAlreadyDone(bases.base[id_].parents[i])) {
                    left--;
                    parents.push({
                        names: [bases.names[bases.base[id_].parents[i][0]], bases.names[bases.base[id_].parents[i][1]]],
                        id: [bases.base[id_].parents[i][0], bases.base[id_].parents[i][1]]
                    });
                }
            }
        }

        if(parents.length == 0) {
            parents = localization.get("elementInfo-itIsAsItIs");
        }

        if(GoogleAPI.logged) {
            logged = true;
        }

        return {
            id: id_,
            name: bases.names[id_],
            parents: parents,
            combinationsLeft: left,
            loggedIn: logged
        };
    }
};

function ElementInfoBox(id_, e, element, fromLibrary) {
    this.id = id_;
    this.init(e, element);
    this.initEvents(fromLibrary);
}

ElementInfoBox.prototype.init = function(e, element) {
    var self = this;
    
    //create DOM element, set html and append to workspace
    var d = document.createElement('div');
    d.setAttribute("class", 'elementInfoBox');
    d.setAttribute("data-elementId",  this.id);
    this.$el = $(document.getElementById("workspace").appendChild(d));
    this.$el.data("parent", element);
    this.$el.html(templateEngine(templates.list.elementInfo, elementInfo.getElementInfoData(this.id)));
    
    //height will be used to calculate position 
    this.height = this.$el.outerHeight();
    this.width  = elementInfo.constants.WIDTH;
    this.paddingLR = parseInt(this.$el.css('padding-left')) + parseInt(this.$el.css('padding-right'));

    if (e.type !== 'mousedown') {
        $(e.target).one("touchend pointerup MSPointerUp", function() {
            self.timer = setTimeout(function() {
                self.fadeOut();
            }, elementInfo.constants.TIME_TO_FADE_OUT);
        });
    }
    else {
        this.timer = setTimeout(function() {
            self.fadeOut();
        }, elementInfo.constants.TIME_TO_FADE_OUT);
    }

    // init sharing
    sharing.initElement(this.$el);
};

ElementInfoBox.prototype.initEvents = function(fromLibrary) {
    var self = this;

    if(fromLibrary) {
        $(document).one("libraryScrollStart", function() {
            window.clearTimeout(self.timer);
            if(self.$el !== null) {
                self.$el.hide().off().remove();
            }
        });
    }

    var hide = function(event) {
        if(event.type === "mousedown" && event.which !== 1) {
            return;
        }
        
        if(event.target.className !== "elementInfoBox" && event.target.parentNode.className !== "elementInfoBox") {
            window.clearTimeout(self.timer);
            if(self.$el !== null) {
                self.$el.hide().off().remove();
            }
            
            $(document).off(gestures.startEvents.join(" "), hide);
        }
    };

    $(this.$el).on(gestures.startEvents.join(" "), function(e) {
        e.stopPropagation();
    });
    $(document).on(gestures.startEvents.join(" "), hide);

    var touchEvents = gestures.startEvents.join(" ").replace("mousedown", "");
    this.$el.find(".close").on("click " + touchEvents, function() {
        window.clearTimeout(self.timer);
        self.$el.hide().off().remove();
    });

    this.$el.on("mouseenter", function() {
        window.clearTimeout(self.timer);
        self.$el.stop().css("opacity", "1");
    });

    this.$el.on("mouseleave", function() {
        self.timer = setTimeout(function() {
            self.fadeOut();
        }, elementInfo.constants.TIME_TO_FADE_OUT);
    });
    
    //touch events
    this.$el.on(touchEvents, function(e) {
        window.clearTimeout(self.timer);
        self.$el.stop().css("opacity", "1.0");
        self.$el.on(gestures.events[e.type][1], function(e) {
            self.timer = setTimeout(function() {
                if(self.$el !== null) {
                    self.$el.fadeOut(elementInfo.constants.FADE_OUT_TIME, function() {
                        self.$el.off().remove();
                        self.$el = null;
                    });
                }
            }, elementInfo.constants.TIME_TO_FADE_OUT);
        });
    });
};

ElementInfoBox.prototype.fadeOut = function() {
    var self = this;

    if(self.$el !== null) {
        self.$el.fadeOut(elementInfo.constants.FADE_OUT_TIME, function() {
            if(self.$el !== null) {
                self.$el.off().remove();
            }
            self.$el = null;
        });
    }
};  

elementInfo.init();