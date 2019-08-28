/**
 * Alchemy.Gestures
 * Responsible for catching and triggering all gestures both on gestures and mouse.
 *
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 */

var gestures = {
    startEvents : ["mousedown", "touchstart", "pointerdown", "MSPointerDown"],
    endEvents : {
        "mouseup": "mousedown",
        "touchend": "touchstart",
        "pointerup": "pointerdown",
        "MSPointerUp": "MSPointerDown"
    },
    events : {
        "mousedown": ["mousemove", "mouseup"],
        "touchstart": ["touchmove", "touchend"],
        "pointerdown": ["pointermove", "pointerup"],
        "MSPointerDown": ["MSPointerMove", "MSPointerUp"]
    },

    init : function() {
        for(var i = 0; i < gestures.startEvents.length; i++) {
            document.addEventListener(gestures.startEvents[i], function(e) {
                gestures.longPress.down(e);
                // gestures.swipe.down(e);
            });

            document.addEventListener(gestures.events[gestures.startEvents[i]][1], function(e) {
                gestures.longPress.up(e);
                // gestures.swipe.up(e);
            });
        }
    },
    
    longPress : {
        LONGPRESS_TIME: 800,
        WIGGLE_THRESHOLD: 5,
        target: null,
        initPosition: {
            x : -1,
            y : -1
        },

        down : function(e) {
            clearTimeout(gestures.longPress.timer);
            document.addEventListener(gestures.events[e.type][0], gestures.longPress.move);

            e = e.type === "touchstart" ? e.changedTouches[0] : e;
            gestures.longPress.initPosition = {
                x : e.pageX,
                y : e.pageY
            };

            gestures.longPress.target = e.target;

            gestures.longPress.timer = setTimeout(function() {
                var event = document.createEvent('Event');
                event.initEvent('gesturelongpress', true, true);
                e.target.dispatchEvent(event);
            }, gestures.longPress.LONGPRESS_TIME);
        },

        move : function(e) {
            if(gestures.longPress.initPosition.x !== -1 && gestures.longPress.initPosition.y !== -1) {
                var type = e.type;
                e = e.type === "touchmove" ? e.changedTouches[0] : e;

                var pos = gestures.longPress.initPosition;
                var distance = Math.sqrt(
                    (pos.x - e.pageX) * (pos.x - e.pageX)
                +   (pos.y - e.pageY) * (pos.y - e.pageY)
                );

                if((pos && distance > gestures.longPress.WIGGLE_THRESHOLD)
                    || e.target !== gestures.longPress.target) {
                    clearTimeout(gestures.longPress.timer);
                    gestures.longPress.initPosition = {
                        x : -1,
                        y : -1
                    };

                    document.removeEventListener(type, gestures.longPress.move);
                }
            }
        },

        up : function(e) {
            clearTimeout(gestures.longPress.timer);
            document.removeEventListener(gestures.events[gestures.endEvents[e.type]][0], gestures.longPress.move);
        }
    }
    // ,

    // swipe : {
    //     DISTANCE: 200,
    //     WIGGLE_THRESHOLD: 100,
    //     DURATION: 1000,
    //     target: null,
    //     initPosition: {
    //         x : -1,
    //         y : -1
    //     },

    //     down : function(e) {
    //         document.addEventListener("mousemove", gestures.swipe.move);

    //         gestures.swipe.initPosition = {
    //             x : e.pageX,
    //             y : e.pageY
    //         };

    //         gestures.swipe.begin = {
    //             x : e.pageX,
    //             y : e.pageY
    //         };

    //         gestures.swipe.target = e.target;
    //         gestures.swipe.time = new Date().getTime();
    //     },

    //     move : function(e) {
    //         if(gestures.swipe.initPosition.x !== -1 || gestures.swipe.initPosition.y !== -1) {
    //             if(Math.abs(gestures.swipe.initPosition.x - e.pageX) > gestures.swipe.WIGGLE_THRESHOLD) {
    //                 gestures.swipe.initPosition.x = -1;
    //             }

    //             if(Math.abs(gestures.swipe.initPosition.y - e.pageY) > gestures.swipe.WIGGLE_THRESHOLD) {
    //                 gestures.swipe.initPosition.y = -1;   
    //             }

    //             if(gestures.swipe.initPosition.x === -1 && gestures.swipe.initPosition.y === -1 
    //                 || e.target !== gestures.swipe.target) {
    //                 console.log("swipe cancel");
    //                 gestures.swipe.initPosition = {
    //                     x : -1,
    //                     y : -1
    //                 };

    //                 document.removeEventListener("mousemove", gestures.swipe.move);
    //             }
    //         }
    //     },

    //     up : function(e) {
    //         if(gestures.swipe.initPosition.x === -1 && gestures.swipe.initPosition.y === -1) {
    //             return false;
    //         }

    //         var time = new Date().getTime();
    //         if((time - gestures.swipe.time) > gestures.swipe.DURATION) {
    //             return false;
    //         }

    //         if(Math.abs(gestures.swipe.initPosition.x - e.pageX) < gestures.swipe.DISTANCE
    //         && Math.abs(gestures.swipe.initPosition.y - e.pageY) < gestures.swipe.DISTANCE)
    //             return false;

    //         // conditions ok, so trigger event
    //         // vertical
    //         var triggerEvent = function(name) {
    //             var event = document.createEvent('Event');
    //             event.initEvent(name, true, true);
    //             e.target.dispatchEvent(event);
    //         };

    //         if(gestures.swipe.initPosition.x == -1) {
    //             if(gestures.swipe.begin.x > e.pageX) {
    //                 triggerEvent("swipeleft");
    //             }
    //             else {
    //                 triggerEvent("swiperight");
    //             }
    //         }

    //         // horizontal
    //         if(gestures.swipe.initPosition.y == -1) {
    //             if(gestures.swipe.begin.y < e.pageY) {
    //                 triggerEvent("swipedown");
    //             }
    //             else {
    //                 triggerEvent("swipeup");
    //             }
    //         }

    //         document.removeEventListener("mousemove", gestures.swipe.move);
    //     }
    // }

    // doubleTap : {
    //     DELAY : 600,
    //     WIGGLE_THRESHOLD : 10,
    //     clicks: 0,
    //     timer : null,
    //     objectPointer : null,

    //     down : function(e) {
    //         if(gestures.doubleTap.objectPointer === null || gestures.doubleTap.objectPointer === $.data(e.target.parentNode, "ptr")) {
    //             gestures.doubleTap.objectPointer = $.data(e.target.parentNode, "ptr");
    //             clearTimeout(gestures.doubleTap.timer);

    //             gestures.doubleTap.timer = setTimeout(function() {
    //                 gestures.doubleTap.clicks = 0;
    //                 gestures.doubleTap.objectPointer = null;
    //             }, gestures.doubleTap.DELAY);

    //             gestures.doubleTap.clicks++;
    //         }
    //     },

    //     move : function(e) {
    //         if(gestures.doubleTap.clicks === 2) {
    //             $(document).trigger("cloneWorkspaceBox", [e, gestures.doubleTap.objectPointer]);

    //             gestures.doubleTap.clicks = 0;
    //             gestures.doubleTap.objectPointer = null;
    //         }
    //     }
    // },
};