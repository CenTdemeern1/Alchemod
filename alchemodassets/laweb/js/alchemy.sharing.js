/**
 * Alchemy.Sharing 
 * Responsible for sharing element by social media or screenshot.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 */

var sharing = {
	types: {
		element: {
			share: function(id) {
				// message, subject, image, url
				var title = localization.get("share-discovered") + " " + bases.names[id] + " " + localization.get("share-in") + " Little Alchemy!";
				var message = title + " http://littlealchemy.com";
				var url = null;

				var sharingDiv = document.getElementById("sharing");
				var el = document.getElementById("shareElement");
				
				sharingDiv.style.top = "0px";
				el.style.display = "block";

				sharing.types.element.prepareImage(id);

				$(document).trigger("sharedElement", [id]);

				html2canvas(el, {
					onrendered: function(canvas) {
						var image = canvas.toDataURL();
						window.plugins.socialsharing.share(message, title, image, url);

						sharingDiv.style.top = window.innerHeight + "px";
						el.style.display = "none";
					},
					width: 540
				});
			},

			prepareImage: function(id) {
				var image = document.getElementById("shareElement");
				image.getElementsByClassName("elementImage")[0].src = "data:image/png;base64," + bases.images[id];
				image.getElementsByClassName("elementDescription")[0].textContent = bases.names[id];

				image.getElementsByClassName("name")[0].textContent = storage.getName();
			}
		},
		progress: {
			share: function() {
				var progress = (game.progress.length + game.prime.length);
				var title = localization.get("share-discovered") + " " + progress + " " + localization.get("share-elements") + " " + localization.get("share-in") + " Little Alchemy!";
				var message = title + " http://littlealchemy.com";
				var image = null;
				var url = null;

				var sharingDiv = document.getElementById("sharing");
				var el = document.getElementById("shareProgress");
				
				sharingDiv.style.top = "0px";
				el.style.display = "block";

				sharing.types.progress.prepareImage();

				$(document).trigger("sharedProgress", [progress]);

				html2canvas(el, {
					onrendered: function(canvas) {
						var image = canvas.toDataURL();
						window.plugins.socialsharing.share(message, title, image, url);

						sharingDiv.style.top = window.innerHeight + "px";
						el.style.display = "none";
					},
					width: 540
				});
			},

			prepareImage: function(id) {
				var image = document.getElementById("shareProgress");
				image.getElementsByClassName("elementDescription")[0].textContent = (game.progress.length + game.prime.length);
				image.getElementsByClassName("name")[0].textContent = storage.getName();
			}
		},
		screenshot: {
			share: function(image) {
				var message = localization.get("share-screenshotMessage");
				var title = localization.get("share-screenshotTitle");
				var url = null;

				$(document).trigger("sharedScreenshot");
				window.plugins.socialsharing.share(message, title, image, url);
			}
		},
	},

	initElement: function($fragment) {
		$($fragment.find(".shareButton")[0]).on("click", function(e) {
			e.stopPropagation();
			var id = this.getAttribute("data-elementid");
			sharing.overlay.show(function() {
				sharing.types.element.share(id);
			});
		});
	},

	init : function() {		
		$("#screenshotIcon").on("touchstart", function() {
			window.plugins.toast.showShortCenter(localization.get("share-screenshotWaiting"));

			html2canvas(document.body, {
				onrendered: function(canvas) {
					var image = canvas.toDataURL();
					sharing.types.screenshot.share(image);
				}
			});
		});

		$("#progress").on("click", function(e) {
			e.stopPropagation();
			sharing.overlay.show( sharing.types.progress.share );
		});

		sharing.overlay.init();
		sharing.initTemplates();
		
		$(document).on("languagePackLoaded", sharing.initTemplates);
	},

	showScreenshotUrls : function(url) {
		$("#screenshotWaitText").hide();
		$("#screenshotLinks").show();

		//$("#screenshotUrl").attr("href", url);
		$("#screenshotUrl").on("click", function() {
			window.open(url, '_system', 'location=yes');
		});

		var button = document.getElementById("screenshotSharingButton");
		button.style.display = "block";
		$(button).on("click", function(e) {
			sharing.types.screenshot.share(url);
		});

		iscrollMenu.refresh();
	},

	overlay: {
		init: function() {
			sharing.overlay.$el = $("#sharingBox");
			sharing.overlay.$button = sharing.overlay.$el.find("button");

			sharing.overlay.$el.find(".closePanel").on("touchstart", sharing.overlay.hide);
			$(".overlay").on("touchstart", sharing.overlay.hide);
			
			sharing.overlay.$el.on("touchstart", function(e) {
				e.stopPropagation();
			});

			if(localization.loaded) {
				sharing.overlay.refreshTexts();
			}

			$(document).on("languagePackLoaded", sharing.overlay.refreshTexts);
		},

		show: function(callback) {
			var input = sharing.overlay.$el.find("#sharingName");

			input[0].value = storage.getName();
			input.on("input", function() {
				storage.setName(input[0].value.replace("<", ""));
			});

			sharing.overlay.$button.on("click", function() {
				callback();
				sharing.overlay.hide();
			});

			document.getElementById("overlay").style.display = "block";
			sharing.overlay.$el.removeClass("hide").addClass("show");
			if(storage.getName() === "") {
				// window.setTimeout(function() {
					input[0].focus();
				// }, 100);
			}
		},

		hide: function(e) {
			e.stopPropagation();
			e.preventDefault();
			
			var input = sharing.overlay.$el.find("#sharingName");
			input[0].blur();
			
			document.getElementById("overlay").style.display = "none";
			sharing.overlay.$button.off();
			sharing.overlay.$el.removeClass("show").addClass("hide");
		},

		refreshTexts: function() {
			sharing.overlay.$el.find("#sharingBoxMessage").text(localization.get("share-signYourself"));
			sharing.overlay.$button[0].textContent = localization.get("share-share");
		}
	},

	initTemplates: function() {
		var $sharing = $("#sharing");

		$sharing.find('span[data-text="discovered"]').text(localization.get("share-discovered"));
		$sharing.find('span[data-text="in"]').text(localization.get("share-in"));
		$sharing.find('span[data-text="elements"]').text(localization.get("share-elements"));
	}
};

sharing.init();