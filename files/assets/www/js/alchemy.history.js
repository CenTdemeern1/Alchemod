/**
 * Alchemy.History
 * For handling actions history, previous and next action buttons.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 */

var workspaceHistory = {
    active: "",
    // state of elements on workspace in previous move
    back: [
        // {
        //     id: 0
        //     offset: {
        //         left: 0,
        //         top: 0
        //     }
        // }
    ],
    // in current move
    current: [
    ],

    init : function() {
        workspaceHistory.$backBtn = $("#backButton");
        workspaceHistory.$forwardBtn = $("#forwardButton");

        workspaceHistory.$backBtn.attr("disabled", true);
        workspaceHistory.$forwardBtn.attr("disabled", true);

        workspaceHistory.$backBtn.on("click", function(event) {
            if(workspaceHistory.active !== "back") {
                workspaceHistory.active = "back";
                workspaceHistory.show("back");

                workspaceHistory.$forwardBtn.attr("disabled", false);
                workspaceHistory.$backBtn.attr("disabled", true);
            }
        });

        workspaceHistory.$forwardBtn.on("click", function(event) {
            if(workspaceHistory.active === "back") {
                workspaceHistory.active = "current";
                workspaceHistory.show("current");

                workspaceHistory.$forwardBtn.attr("disabled", true);
                workspaceHistory.$backBtn.attr("disabled", false);
            }
        });

        workspaceHistory.initSaveEvents();
    },

    initSaveEvents : function() {
        $(document).on("childCreationFail childCreated workspaceCleared elementDropped", workspaceHistory.saveState);
    },

    show : function(which) {
        var i, ii;

        workspace.clearSpecified(workspace.$el.find("*"));
        for(i = 0, ii = workspaceHistory[which].length; i < ii; i++) {
            workspace.add(workspaceHistory[which][i].id, workspaceHistory[which][i].position);
        }
    },

    saveState : function() {
        workspaceHistory.$forwardBtn.attr("disabled", true);
        workspaceHistory.$backBtn.attr("disabled", false);

        if(workspaceHistory.active !== "back") {
            workspaceHistory.back = workspaceHistory.current;
            console.log(workspaceHistory.back);
        }
        workspaceHistory.current = stats.getElementsPositions();

        workspaceHistory.active = "current";
    }
};