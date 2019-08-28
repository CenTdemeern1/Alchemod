/**
 * Alchemy.Localization 
 * Language version.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 */
var localization = {
	data: {},
	languageFamily: "en",
	// language: "en-us",
	
	// write BCP47 codes as lowercase, to be compatible with all browsers
	languages: {
		"en-us": "English",
		"es": "Español",
		"pt": "Português", 
		"fr": "Français",
		"de": "Deutsch", 
		"pl": "Polski",
		"it": "Italiano", 
		"nl": "Nederlands", 
		"no": "Norsk", 
		"sv": "Svenska"
	},
		
	defaultLocale: {
		"en": "en-us"
	},

	characters: {
		"en": "abcdefghijklmnopqrstuvwxyz",
		"pl": "aąbcćdeęfghijklłmnńoópqrsśtuvwxyzźż",
		"de": "aäbcdefghijklmnoöpqrsßtuüvwxyz",
		"fr": "aàâæäbcçdeéèêëfghiîïjklmnoôœöpqrstuùûüvwxyÿz",
		"es": "aábcdeéfghiíjklmnñoópqrstuúüvwxyz",
		"it": "aàbcdeèéfghiìjklmnoòpqrstuùvwxyz",
		"nl": "aäbcdeëèéfghiïĳjklmnoöpqrstuüvwxyz",
		"no": "aåæbcdefghijklmnoøpqrstuvwxyz",
		"pt": "aáâãábcçdeéêfghiíjklmnoóôõpqrstuúvwxyz",
		"sv": "aäåbcdefghijklmnoöpqrstuvwxyz"
	},
	loaded: false,

	init: function() {
		if(settings.data.language) {
			localization.setLanguage(settings.data.language);
			$(document).trigger("languageDetected");
			
			localization.loadResources();
		}
		else {
			localization.checkLanguage();
		}
	},

	checkLanguage: function() {
		var fail = function() {
			localization.setLanguage(localization.defaultLocale["en"]);
			$(document).trigger("languageDetected");
		
			localization.loadResources();
		};

		var check = function() {
			navigator.globalization.getPreferredLanguage(function(data) {
				localization.setLanguage(localization.parseBCP47(data.value));

				settings.data.language = localization.language;
				$(document).trigger("updateSettings");
				$(document).trigger("languageDetected");

				localization.loadResources();
			}, fail);
		};

		if(typeof(navigator.globalization) !== "undefined") {
			if(navigator.globalization.hasOwnProperty("getPreferredLanguage")) {
				check();
			}
			else {
				fail();
			}
		}
		else {
			var onDevice = function() {
				if(typeof(navigator.globalization) !== "undefined"
				&& navigator.globalization.hasOwnProperty("getPreferredLanguage")) {
					check();
				}
				else {
					fail();
				}
			};

			document.addEventListener("deviceready", onDevice, false);
			window.setTimeout(function() {
				fail();

				document.removeEventListener("deviceready", onDevice);
			}, 2.5 * 1000);
		}
	},

	parseBCP47: function(data) {
		data = data.toLowerCase();
		var parts = data.split("-");
		var code = parts[0];
		if(parts.length > 1) {
			code += "-" + parts[1];
		}

		if(localization.languages.hasOwnProperty(code)) {
			return code;
		}
		else if(localization.languages.hasOwnProperty(parts[0])) {
			return parts[0];
		}
		else if(localization.defaultLocale.hasOwnProperty(parts[0])) {
			return localization.defaultLocale[parts[0]];
		}
		else {
			return localization.defaultLocale["en"];	
		}
	},

	setLanguage: function(lang) {
		if( !localization.languages.hasOwnProperty(lang) ) {
			lang = localization.defaultLocale["en"];
		}
		
		localization.language = lang;
		localization.setFamily();
		localization.setRegex();
	},

	setFamily: function() {
		localization.languageFamily = localization.language.split("-")[0];
	},

	setRegex: function() {
		localization.regex = new RegExp("[^" + localization.characters[localization.languageFamily] + " ]", "ig");
	},

	changeLanguage: function(newLanguage) {
		if(newLanguage !== localization.language) {
			localization.setLanguage(newLanguage);
			localization.loadResources();

			$(document).trigger("languageChanged");
		}
	},

	loadResources: function() {
		$.getJSON(localization.getURL("languagePack.json"), function(data) {
			localization.data = data;
			localization.loaded = true;

			$(document).trigger("languagePackLoaded");
		});	
	},

	get: function(key) {
		var keySplit = key.split("-");
		if(localization.data.hasOwnProperty(keySplit[0]) && localization.data[keySplit[0]].hasOwnProperty(keySplit[1])) {
			return localization.data[keySplit[0]][keySplit[1]];
		}

		return "";
	},

	getURL: function(file) {
		return "resources/" + localization.language + "/" + file;
	},

	// comparing letter
	compareLetter: function(a, b) {
		if(a === b) {
			return 0;
		}
		
		var i1 = localization.characters[localization.languageFamily].indexOf(a.toLowerCase());
		var i2 = localization.characters[localization.languageFamily].indexOf(b.toLowerCase());

		if((i1 < 0 || i2 < 0) || (i1 === i2)) {
			return 0;
		}

		return i1 < i2 ? -1 : 1;
	},

	// comparing strings
	compare: function(a, b) {
		a = a.replace(localization.regex, '');
		b = b.replace(localization.regex, '');

		var length = Math.min(a.length, b.length);
		var i = 0, result;

		while(i < length) {
			result = localization.compareLetter(a[i], b[i]);
			if(result !== 0)
				return result;

			i++;
		}

		if (a.length < b.length) return -1;
		if (a.length > b.length) return 1;
		return 0;
	}
};