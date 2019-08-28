/**
 * Alchemy.Loading 
 * Responsible for loading scripts that are not required at the game start.
 * 
 * @package: Alchemy  
 * @version: 0.1
 * @copyrighgt: Recloak
 *
 * @events:
 * basesLoaded
 */

var loading = {
	modificationDates: {},

	init: function() {
		window.setTimeout(loading.checkIfModified, 15 * 1000);
	},

	checkIfModified : function() {
		for(var date in loading.modificationDates) {
			loading.getModificationDate(date);
		}
	},

	getModificationDate : function(url) {
	    var xhr = new XMLHttpRequest();
	    
	    xhr.open("HEAD", url, true); 
	    xhr.onreadystatechange = function(evt) {
	        if(this.readyState === this.DONE) {
	        	if(this.status === 200) {
		        	loading.analyzeModificationDate(url, xhr.getResponseHeader("Last-Modified"));
		        }
		        else {
		        	delete loading.modificationDates[url];
		        	storage.updateModificationDates();
		        }
	    	}
	    };

	    xhr.send();
	},

	getURL : function(url) {
		if(loading.modificationDates.hasOwnProperty(url)) {
			return url + "?t=" + loading.modificationDates[url];
		}

		return url;
	},

	analyzeModificationDate : function(url, date) {
		if(date !== null) {
			var newDate = loading.convertToMilisecondsDate(date);

			if(!loading.modificationDates.hasOwnProperty(url) || loading.modificationDates[url] < newDate) {
				loading.modificationDates[url] = newDate;
				storage.updateModificationDates();
			}
		}
	},

	convertToMilisecondsDate : function(date) {
		date = date.replace("/", " ");
	    date = date.replace("/", " ");
	    date = date.replace("-", " ");
	    date = date.replace("-", " ");

	    return new Date(Date.parse(date)).getTime();
	}
};