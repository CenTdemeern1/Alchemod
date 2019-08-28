/**
 * feedback
 * Responsible for showing the feedback site and sending there the screenshot.
 * It needs #feedbackBtn in html doc.
 * 
 * @author Marcin
 * @copyrighgt: Recloak
 */
var feedback = {
	formUrl : '../feedback/feedbackForm.html',

	initEvents : function(){
		$("#feedbackBtn").on('click', function(){
			feedback.prepareFeedback();
		});
	},

	prepareFeedback : function() {
		var imageSrc = '';
		var self = this;

		if(Clay && html2canvas) {
			$("#panel").hide();
			html2canvas(document.body, {
			    onrendered: function(canvas) {
					var screenshot = new Clay.Screenshot({ prompt: false });
					screenshot.data = canvas.toDataURL();
					screenshot.save({ hideUI: true }, function ( response ) {
						imageSrc = response.imageSrc;
						window.localStorage.setItem("bugSS",imageSrc);
					});
			    }
			});
		}
	}
};

feedback.initEvents();