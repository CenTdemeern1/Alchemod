/**
 * Alchemy.Achievements.Conditions
 * Conditions for specified achievements. Returning true to unlock this achievement.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyright: Recloak
 */

var achievementsData = [
	{
		id: '50elements',
		gapiId: "CgkIz_OApZAJEAIQAg",
		events: "newChildCreated",
		imageNotEarned: "achievement50-locked.png",
		imageEarned: "achievement50.png",
		check :	function(childId) {
			if((game.progress.length + game.prime.length) === 50) {
				return true;
			}

			return false;
		},
		initCheck: function() {
			if((game.progress.length + game.prime.length) >= 50) {
				return true;
			}
			return false;
		}
	},
	{
		id: '100elements',
		gapiId: "CgkIz_OApZAJEAIQAw",
		events: "newChildCreated",
		imageNotEarned: "achievement100-locked.png",
		imageEarned: "achievement100.png",
		check :	function(childId) {
			if((game.progress.length + game.prime.length) === 100) {
				return true;
			}

			return false;
		},
		initCheck: function() {
			if((game.progress.length + game.prime.length) >= 100) {
				return true;
			}
			return false;
		}
	},
	{
		id: '200elements',
		gapiId: "CgkIz_OApZAJEAIQBA",
		events: "newChildCreated",
		imageNotEarned: "achievement200-locked.png",
		imageEarned: "achievement200.png",
		check :	function(childId) {
			if((game.progress.length + game.prime.length) === 200) {
				return true;
			}

			return false;
		},
		initCheck: function() {
			if((game.progress.length + game.prime.length) >= 200) {
				return true;
			}
			return false;
		}
	},
	{
		id: '300elements',
		gapiId: "CgkIz_OApZAJEAIQBw",
		events: "newChildCreated",
		imageNotEarned: "achievement300-locked.png",
		imageEarned: "achievement300.png",
		check :	function(childId) {
			if((game.progress.length + game.prime.length) === 300) {
				return true;
			}

			return false;
		},
		initCheck: function() {
			if((game.progress.length + game.prime.length) >= 300) {
				return true;
			}
			return false;
		}
	},
	{
		id: '400elements',
		gapiId: "CgkIz_OApZAJEAIQCA",
		events: "newChildCreated",
		imageNotEarned: "achievement400-locked.png",
		imageEarned: "achievement400.png",
		check :	function(childId) {
			if((game.progress.length + game.prime.length) === 400) {
				return true;
			}

			return false;
		},
		initCheck: function() {
			if((game.progress.length + game.prime.length) >= 400) {
				return true;
			}
			return false;
		}
	},
	{
		id: 'completionist',
		gapiId: "CgkIz_OApZAJEAIQCQ",
		events: "newChildCreated",
		imageNotEarned: "achievement-all-locked.png",
		imageEarned: "achievement-all.png",
		check :	function(childId) {
			if((game.progress.length + game.prime.length) === game.maxProgress) {
				return true;
			}

			return false;
		}
	},
	{
		id: 'hiddenelement',
		gapiId: "CgkIz_OApZAJEAIQCg",
		events: "hiddenElementCreated",
		imageNotEarned: "achievement-hidden-locked.png",
		imageEarned: "achievement-hidden.png",
		check :	function(childId) {
			return true;
		},
		initCheck: function() {
			if(game.hiddenElements.length >= 1) {
				return true;
			}

			return false;
		}
	}
];




