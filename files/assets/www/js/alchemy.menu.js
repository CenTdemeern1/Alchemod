/**
 * Alchemy.Menu
 * Showing menu and contents of menu.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 */

var menu = {
    init : function() {
        menu.$el = $("#panel");
        menu.$container = menu.$el.find(".content");
        menu.active = "welcome";
        menu.initEvents();
        menu.canClickMenuTab = true;

        menu.data = {
            welcome: {
                initEvents: function() {
                    if(typeof feedback != undefined) {
                        feedback.initEvents();
                    }
                },
                onCreation: function() {
                    $(".menuSocialMediaTwitter").on("touchstart", function() {
                        window.open("http://twitter.com/alchemygame", '_system', 'location=true');
                    });

                    $(".menuSocialMediaGoogle").on("touchstart", function() {
                        window.open("https://plus.google.com/100024456292124591499/posts", '_system', 'location=true');
                    });

                    $(".menuSocialMediaFacebook").on("touchstart", function() {
                        window.open("http://facebook.com/littlealchemy", '_system', 'location=true');
                    });
                }
            },
            settings: {
                generateData: function() {
                    // var langs = {};
                    // for(var l in localization.languages) {
                    //     langs[l] = localization.languages[l];
                    // }

                    return {
                        selected: localization.language,
                        languages: localization.languages
                    };
                },
                onCreation: function() {
                    settings.initContent();
                    
                    var disconnectButton = document.getElementById("settingsDisconnect");

                    if(!GoogleAPI.logged) {
                        disconnectButton.style.display = "none";
                    }

                    $(document).on("loggedIn", function() {
                        disconnectButton.style.display = "block";   
                    });

                    $(document).on("loggedOut", function() {
                        disconnectButton.style.display = "none";   
                    });
                }
            },
            // leaderboards: {
            //     // refresh: true,
            //     initEvents: function() {
            //         $(document).trigger("leaderboardsTabShown");
            //     },
            //     onCreation: function() {
            //         var tab = menu.$el[0].querySelector('[data-tabName="leaderboards"]');

            //         if(!GoogleAPI.logged) {
            //             tab.style.display = "none";
            //         }

            //         $(document).on("loggedIn", function() {
            //             tab.style.display = "block";

            //             menu.setMenuTabsWidth();
            //             menu.refreshIScroll();
            //         });

            //         $(document).on("loggedOut", function() {
            //             tab.style.display = "none";
                        
            //             menu.setMenuTabsWidth();
            //             menu.refreshIScroll();
            //         });

            //         $("#shareLeaderboard").on("click", function() {
            //             sharing.types.leaderboard.share();
            //         });
            //     }
            // },
            achievements: {
                refresh: true, // if we want to refresh tab every time its shown
                initEvents: function() {
                    $(document).trigger("achievementsTabShown");
                }
            },
            // social: {
            //     initEvents: function() {
            //         sharing.init();
            //     }
            // },
            // example menu tab
            // name: {
                // title: ""
                //generateData : function() {},
                //initEvents : function() {},
            //}
        };

        if(localization && localization.loaded) {
            menu.loadTemplates();
        }            
        else {
            $(document).one("languagePackLoaded", function() {
               menu.loadTemplates();
            });
        }
    },

    initEvents : function() {
        $("#menu").on('touchstart', function() {
            menu.open();
        });

        menu.$el.on('touchstart', function(e) {
            if(e.target.id === menu.$el[0].id) {
                menu.close();
            }
        });

        $("#closePanel").on('touchstart', function() {
            menu.close();
        });

        $(document).on('keyup', function(e) {
            if(e.which === 27) {
                menu.close();
            }
        });

        $(document).on("languageChanged", function() {
            menu.$container.find("#menuContent").remove();
            menu.$container.find("#outerMenuTabs").remove();

            menu.loadTemplates();
        });


        $(document).on("menuCreated", function() {
            game.changeLink(menu.$el);
        });
    },

    initTabs : function() {
        for(var tab in menu.data) {
            // get title of tab considering language
            menu.data[tab].title = localization.get("menu-" + tab);
        }

        // create menu from template
        menu.$container.append(templateEngine(menu.template, menu));
        menu.$el.find('[data-tabName="' + menu.active + '"]').addClass("active");
        
        for(var tab in menu.data) {
            // create tab content
            var generatedTabData = menu.data[tab].hasOwnProperty("generateData") ? menu.data[tab].generateData() : {};
            $($("#" + tab).find("div")[0]).append(templateEngine(menu.data[tab].template, generatedTabData));

            // if this tab has some function to be called after tab creation, then call it
            if(menu.data[tab].hasOwnProperty("onCreation")) {
                menu.data[tab].onCreation();
            }

            // when tab is clicked
            menu.$el.find('[data-tabName="' + tab + '"]').on("click", function() {
                if(!menu.canClickMenuTab) {
                    return false;
                }

                var $this = $(this);
                var clicked = $this.attr("data-tabName");

                // generate template again
                if(menu.data[clicked].hasOwnProperty("refresh")) {
                    var generatedTabData = menu.data[clicked].hasOwnProperty("generateData") ? menu.data[clicked].generateData() : {};
                    $(menu.$container.find("#" + clicked).find("div")[0]).empty().append(templateEngine(menu.data[clicked].template, generatedTabData));
                }

                menu.active = clicked;
                menu.$el.find(".active").removeClass("active");
                $this.addClass("active");
                
                menu.$container.find(".visible").removeClass("visible").addClass("hidden");
                menu.$container.find("#" + clicked).removeClass("hidden").addClass("visible");

		        // if there are events to. Only run when they change to that tab
		        if(menu.data[clicked].hasOwnProperty("initEvents")) {
		            menu.data[clicked].initEvents();
		        }

                if(iscrollMenu) {
                    iscrollMenu.scrollTo(0, 0, 0);
                    iscrollMenu.refresh();
                }

                $(document).trigger("menuTabOpened", [clicked]);
            });
        }

        $("#" + menu.active).removeClass("hidden").addClass("visible");
        if(menu.data[menu.active].hasOwnProperty("initEvents")) {
            menu.data[menu.active].initEvents();
        }

        if(menu.$el[0].style.display === "block") {
            menu.setMenuTabsWidth();
        }

        $(document).trigger("menuCreated");
    },

    loadTemplates : function() {
        var url = localization.getURL("menu.html");
        $.get(loading.getURL(url), function(data, textStatus, jqXhr){
            loading.analyzeModificationDate(url, jqXhr.getResponseHeader('Last-Modified'));

            menu.template = $(data).filter("#menuTemplate").html();
            for(var templateData in menu.data) {
                menu.data[templateData].template = $(data).filter('#' + templateData + "Template").html();
            }
            
            menu.initTabs();
            menu.initIscroll();
        });
    },

    open : function() {
        // ============ TEMP ==================
        menu.active = "welcome";
        menu.$el.find(".active").removeClass("active");
        menu.$el.find('[data-tabName="' + menu.active + '"]').addClass("active");
        
        menu.$container.find(".visible").removeClass("visible").addClass("hidden");
        menu.$container.find("#" + menu.active).removeClass("hidden").addClass("visible");

        // ============ END TEMP ==============
        // generate template again if needed
        if(menu.data[menu.active].hasOwnProperty("refresh")) {
            var generatedTabData = menu.data[menu.active].hasOwnProperty("generateData") ? menu.data[menu.active].generateData() : {};
            $(menu.$container.find("#" + menu.active).find("div")[0]).empty().append(templateEngine(menu.data[menu.active].template, generatedTabData));

            if(menu.data[menu.active].hasOwnProperty("initEvents")) {
                menu.data[menu.active].initEvents();
            }
        }

        
        menu.$el[0].style.display = "block";

        // another set of stupid hacky magic for the iscroll
        // this time for the tabs in the menu so the iscroll knows what's the real width of the scrollable content
        menu.setMenuTabsWidth();
        menu.refreshIScroll();
    },

    close : function() {
        if(menu.isVisible()) {
            menu.$el[0].style.display = "none";
            menu.canClickMenuTab = true;
        }
    },

    initIscroll: function() {
        var init = function() {
            iscrollMenuTabs = new IScroll('#outerMenuTabs', { mouseWheel: true, scrollX: true, scrollY: false, preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A|LABEL|LI)$/}, eventPassthrough: false,  click: true});
            iscrollMenu = new IScroll('#menuContent', { mouseWheel: true, preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A|LABEL)$/} });

            iscrollMenuTabs.on('scrollStart', function(e) {
                menu.canClickMenuTab = false;
            });

            iscrollMenuTabs.on('scrollEnd', function(e) {
                menu.canClickMenuTab = true;
            });
        };

        // if already defined then just refresh
        if(typeof(iscrollMenu) !== "undefined" && typeof(iscrollMenuTabs) !== "undefined") {
            menu.refreshIScroll();
        }

        if(typeof(IScroll) !== "undefined") {
            init();            
        }
        else {
            $(document).one("IScrollLoaded", init);
        }
    },

    refreshIScroll: function() {
        if(menu.$el[0].style.display !== "block") {
            return;
        }

        // This is the saddest piece of hackery I've written for this project but I can't figure out how to make it work any other way.
        // Basically #menuContent has to have a set height for the overflow: hidden to work but we set it dynamically and often in %.
        // I really want and have to find a better way to do it before we go stable. -.-
        // Jakub

        // we love you <3 Wookasheq
        $("#menuContent").css({height: $("#panel .content").height() - $("#menuTabs").outerHeight(true)});
        if(typeof(iscrollMenu) !== "undefined" && iscrollMenu) {
            iscrollMenu.refresh();
            iscrollMenu.scrollTo(0, 0, 0);
        }

        var MAGIC_NUMBER = 15;
        $("#outerMenuTabs").width($("#panel .content").innerWidth() - $("#closePanel").innerWidth() - MAGIC_NUMBER);

        if(typeof(iscrollMenuTabs) !== "undefined" && iscrollMenuTabs) {
            iscrollMenuTabs.refresh();
        }
    },

    setMenuTabsWidth: function() {
        var lis = document.querySelectorAll("#menuTabs li");
        var width = 15; //MAGIC_NUMBER
        for(var i = 0; i < lis.length; i++) {
            width += lis[i].offsetWidth;
        }

        $("#menuTabs").width(width);
    },

    isVisible: function() {
        return menu.$el[0].style.display === "block";
    }
};

window.onresize = menu.refreshIScroll;
window.addEventListener("orientationchange", function() {
    menu.setMenuTabsWidth();
    menu.refreshIScroll();
}, false);

menu.init();