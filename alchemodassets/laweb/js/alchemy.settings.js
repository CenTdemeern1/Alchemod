/**
 * Alchemy.Settings
 * Changing settings of game.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyright: ReCloak Interactive
 */

var settings = {
	def : {
		checkAlreadyCombined : false,
		markFinalElements : true,
		hideFinalElements : false,
		turnOffNotifications : false,
		saveElementsPositions : true,
		hideElementsNames : false,
		nightMode : false,
	},

	init : function() {
		var fromLocalStorage = window.storage.getSettings();
		window.settings.data = {};
		$.extend(window.settings.data, window.settings.def, fromLocalStorage); // merge without modifying default
	},

	initContent : function() {
		settings.offContent();

		$('#settingsCheckAlreadyCombined').prop('checked', window.settings.data.checkAlreadyCombined);
		$('#settingsMarkFinalElements').prop('checked', window.settings.data.markFinalElements);
		$('#settingsHideFinalElements').prop('checked', window.settings.data.hideFinalElements);
		$('#settingsTurnOffNotifications').prop('checked', window.settings.data.turnOffNotifications);
		$('#settingsTurnOffElementsPositions').prop('checked', !window.settings.data.saveElementsPositions);
		$('#settingsHideElementNames').prop('checked', window.settings.data.hideElementsNames);
		$('#settingsNightMode').prop('checked', window.settings.data.nightMode);

		// init events
		$("#settingsResetProgress").on("touchstart", function() {
			event.preventDefault();
			event.stopPropagation();

			var result = confirm(window.localization.get("settings-resetProgressConfirm"));
			if(result) { 
				window.game.resetProgress();
			}
		}); 

		$("#settingsDisconnect").on("touchstart", function(event) {
			event.preventDefault();
			event.stopPropagation();

			var result = confirm(window.localization.get("settings-disconnectConfirm"));
			if(result) { 
				window.GoogleAPI.disconnect();
			}
		});

		$(document).on("change", "#settingsCheckAlreadyCombined", function() {
			window.settings.data.checkAlreadyCombined = this.checked;

			$(document).trigger("updateSettings");
		});

		$(document).on("change", "#settingsMarkFinalElements", function() {
			var self = this;

			window.setTimeout(function() {
				window.settings.data.markFinalElements = self.checked;
				window.library.markFinalElements(this.checked);
				
				if(window.settings.data.markFinalElements) {
					workspace.$el.find(".element").each(function(index, el) {
						if(game.finalElements.indexOf(parseInt(el.getAttribute('data-elementId'), 10)) !== -1) {
							el.className += " finalElement";
						}
					});
				}
				else {
					workspace.$el.find(".finalElement").removeClass("finalElement");
				}


				$(document).trigger("updateSettings");
			}, 10);
		});

		$(document).on("change", "#settingsHideFinalElements", function() {
			var self = this;

			window.setTimeout(function() {
				window.settings.data.hideFinalElements = self.checked;
				if(window.settings.data.hideFinalElements) {
					window.library.refresh();
				}
				else {
					window.library.reload();
				}

				$(document).trigger("updateSettings");
			}, 10);
		});

		$(document).on("change", "#settingsTurnOffNotifications", function() {
			window.settings.data.turnOffNotifications = this.checked;
			$(document).trigger("updateSettings");
		});

		$(document).on("change", "#settingsTurnOffElementsPositions", function() {
			window.settings.data.saveElementsPositions = !this.checked;
			$(document).trigger("updateSettings");
		});

		$(document).on("change", "#settingsHideElementNames", function() {
			window.settings.data.hideElementsNames = this.checked;
			workspace.elementsNamesVisibility();
			
			$(document).trigger("updateSettings");
		});

		$(document).on("change", "#settingsNightMode", function() {
			window.settings.data.nightMode = this.checked;
			settings.changeNightMode();
			
			$(document).trigger("updateSettings");
		});

		$(document).on("change", "#settingsLanguage", function() {
			window.settings.data.language = this.options[this.selectedIndex].value;
			$(document).trigger("updateSettings");
			
			window.localization.changeLanguage(this.options[this.selectedIndex].value);
		});

		var showPlayerName = function() {
			var $element = $("#loggedInAs");

			$element.find("span")[0].textContent = GoogleAPI.player.name;
			$element.show();
		};
		$(document).on("playerLoaded", showPlayerName);

		$(document).on("loggedOut", function() {
			$("#loggedInAs").hide();
		});

		if(typeof(GoogleAPI.player.name) !== "undefined" && GoogleAPI.player.name !== "") {
			showPlayerName();
		}

		$("#settingsLanguage").on("focus", function() {
			if(typeof(iscrollMenu) !== "undefined") {
				iscrollMenu.disable();
			}
		});
		$("#settingsLanguage").on("change blur click", function() {
			if(typeof(iscrollMenu) !== "undefined") {
				iscrollMenu.enable();
			}
		});
	},

	offContent: function() {
		$("#settingsResetProgress").off("touchstart"); 
		$("#settingsDisconnect").off("touchstart");
		// $("#settingsLanguage").off("focus");
		// $("#settingsLanguage").off("change blur click");

		$(document).off("change", "#settingsCheckAlreadyCombined");
		$(document).off("change", "#settingsMarkFinalElements");
		$(document).off("change", "#settingsHideFinalElements");
		$(document).off("change", "#settingsTurnOffNotifications");
		$(document).off("change", "#settingsTurnOffElementsPositions");
		$(document).off("change", "#settingsHideElementNames");
		$(document).off("change", "#settingsNightMode");
		$(document).off("change", "#settingsLanguage");
		$(document).off("playerLoaded");
	},

	changeNightMode: function() {
		if(window.settings.data.nightMode) {
			document.body.className += " nightMode";
		}
		else {
			document.body.className = document.body.className.replace(/nightMode/g,'');
		}
	}
};