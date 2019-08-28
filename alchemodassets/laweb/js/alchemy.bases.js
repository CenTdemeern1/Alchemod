/**
 * Alchemy.Bases 
 * Responsible for loading base from json.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: ReCloak Interactive
 *
 * @events:
 * basesLoaded
 */

var bases = {
	imagesLoaded: false,
	loaded: false,

	load: function() {
		bases.initEvents();
		var startLoad = function() {
			$.when(
				$.ajax({
					url: "resources/base.json",
					type: "GET",
					dataType: "json",
					success: function(data) {
						bases.base = data; 
					},
					xhrFields: {
						onprogress: function(evt) {
							if (evt.lengthComputable) {
								$(document).trigger("baseLoadingProgress", [parseInt((evt.loaded / evt.total * 100), 10)]);
							}
						}
					}
				}),
				$.ajax({
					url: localization.getURL("names.json"),
					type: "GET",
					dataType: "json",
					success: function(data) {
						bases.names = data; 
					},
					xhrFields: {
						onprogress: function(evt) {
							if (evt.lengthComputable) {
								$(document).trigger("namesLoadingProgress", [parseInt((evt.loaded / evt.total * 100), 10)]);
							}
						}
					}
				})
			).done(function() {
				bases.loaded = true;
				$(document).trigger('basesLoaded');
			}).fail(function(e) {
				console.log("fail", e);
			});
		};

		if(typeof(localization.language) !== "undefined") {
			startLoad();
		}
		else {
			$(document).one("languageDetected", startLoad);
		}
		
		$.getJSON("resources/images.json", function(data) {
			bases.images = data;
			bases.imagesLoaded = true;
			
			$(document).trigger('imagesLoaded');
		});
	},

	initEvents: function() {
		$(document).on("languageChanged", function() {
			$.getJSON(localization.getURL("names.json"), function(data) {
				bases.names = data;

				library.reload();
				$(document).trigger("namesLoaded");
			});
		});
	}
	// ,

	// initProgressHandle: function() {
	// 	var originalXhr = $.ajaxSettings.xhr;
	// 	$.ajaxSetup({
	// 		progress: function() {},
	// 		xhr: function() {
	// 			var req = originalXhr(), that = this;
	// 			if (req) {
	// 				if (typeof req.addEventListener == "function") {
	// 					req.addEventListener("progress", function(evt) {
	// 						that.progress(evt);
	// 					}, false);
	// 				}
	// 			}
	// 			return req;
	// 		}
	// 	});
	// }
};