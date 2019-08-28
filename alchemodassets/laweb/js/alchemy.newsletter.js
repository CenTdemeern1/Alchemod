/**
 * Alchemy.Subscribe 
 * Language version.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyrighgt: Recloak
 */

var newsletter = {
	init: function() {

	},

	subscribe: function() {
		$.ajax({
			type: "POST",
			url: "php/newsletter.php",
			data: { 
				name: "Johsn", 
				email: "a@wookash.net"
			}
		})
		.done(function(result) {
			if(result != 1) {
				console.log(result);
			}
		});
	},


};