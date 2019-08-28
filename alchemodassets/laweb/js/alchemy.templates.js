/**
 * Alchemy.Templates 
 * Responsible for loading, storing and precompiling templates.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: ReCloak Interactive
 */

var templates = {
	list : {
		elementInfo: null,
		notification: null, 
		achievements: null,
		leaderboards: null,
		achievement: null,
		getName: null
	},

	init : function() {
		if(typeof(localization.language) !== "undefined") {
			templates.load();
		}
		else {
			$(document).one("languageDetected", templates.load);
		}

		$(document).on("languageChanged", function() {
			templates.load();
		});
	},

	load : function() {
		var url = localization.getURL("templates.html");
		$.get(loading.getURL(url), function(data, textStatus, jqXhr) {
			loading.analyzeModificationDate(url, jqXhr.getResponseHeader('Last-Modified'));

			for(var template in templates.list) {
				templates.list[template] = $(data).filter('#' + template + "Template").html();
			}
		});
	}
};