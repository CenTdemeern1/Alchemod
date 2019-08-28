/**
 * Alchemy.Search
 * Handle search engine of the game.
 * 
 * @package: Alchemy  
 * @author: Wookie
 * @version: 0.1
 * @copyright: Recloak
 */


var search = {
	init : function() {
		search.activeLetter = null;
		search.activeCategory = null;

		search.$alphabet = $("#alphabet");

		search.initAlphabet();
		// search.checkCategories();
		search.initSearchBar();

		search.initEvents();
	},

	initAlphabet : function() {
		// onClick - lock letter
		search.$alphabet.on("click", "li", function() {
			var $this = $(this);
			search.activeLetter = $this.text().toLowerCase();

			if(search.activeCategory === null){
				search.scrollToLetter(search.activeLetter);
			}
			else{
				var elements = library.showCategory(search.activeCategory);
				library.show(elements);
				search.scrollToLetter(search.activeLetter, elements);		
			}

			$(document).trigger("alphabetSearchOccured", [search.activeLetter])
		});
	},

	initEvents : function() {
		// $(document).on("newChildCreated", function(event, child) {
		// 	search.addToCategories(bases.base[child].tags);
		// });

		$(document).on("searchAlphabethClick", function(event) {
			if(!search.$alphabet.is(':visible')){
				el.show();
				iscrollAlphabeth.refresh();
			}
			else {
				search.$alphabet.hide();
				search.activeLetter = null;

				if(search.activeCategory === null){
					library.refresh();
					iscrollLibrary.scrollTo(0, 0, 500);
				}
				else{
					library.show(library.showCategory(search.activeCategory));
				}
			}
			
			iscrollAlphabeth.refresh(); // in case of window resize when display:none;
		});

		// $(document).on("searchCategoriesClick", function(event) {
		// 	var el = $("#searchCategories");
		// 	if(!el.is(':visible')){
		// 		el.show();
		// 	}
		// 	else {
		// 		el.hide();
		// 		$("#searchCategories .active").removeClass("active");
		// 		search.activeCategory = null;

		// 		library.reload();
		// 	}

		// 	iscrollCategories.refresh(); // in case of window resize when display:none;
		// 	var w_ = $('#alphabetList').width() + $('#categoriesList').width();
		// 	$('#search').css({width: w_});
		// });
	},

	// checkCategories : function() {
	// 	var elements = game.prime.concat(game.progress);
	// 	var categories = "";
	// 	var i, ii, j;

	// 	for(i = 0, ii = elements.length; i < ii; i++) {
	// 		if(bases.base[elements[i]].tags) {
	// 			for(j = 0; j < bases.base[elements[i]].tags.length; j++){
	// 				if(categories.indexOf(bases.base[elements[i]].tags[j]) === -1){
	// 					categories += bases.base[elements[i]].tags[j] + ",";
	// 				}
	// 			}
	// 		}
	// 	}

	// 	search.categories = categories.slice(0, -1).split(",");
	// 	search.categories.sort();
	// 	search.generateCategories();
	// },

	// addToCategories : function(categories) {
	// 	if(categories) {
	// 		var i;
	// 		for(i = 0; i < categories.length; i++){
	// 			if($.inArray(categories[i], search.categories) === -1){
	// 				search.categories.push(categories[i]);
	// 			}
	// 		}

	// 		search.categories.sort();
	// 	}
	// },

	// generateCategories : function() {
	// 	var output = "";
	// 	var i, ii;

	// 	for(i = 0, ii = search.categories.length; i < ii; i++){
	// 		output += "<li>" + search.categories[i] + "</li>";
	// 	}

	// 	$("#searchCategories ul").append(output);

	// 	$("#searchCategories").on("click", "li", function() {
	// 		var $this = $(this);

	// 		if($this.hasClass("active")) {
	// 			$this.removeClass("active");
	// 			search.activeCategory = null;

	// 			library.reload();
	// 		}
	// 		else {
	// 			$("#searchCategories .active").removeClass("active");
	// 			$this.addClass("active");	
	// 			search.activeCategory = $this.text();

	// 			library.show(library.showCategory(search.activeCategory));
	// 		}

	// 		iscrollLibrary.scrollTo(0, 0, 500);
	// 		iscrollLibrary.refresh();
	// 	});

	// 	// onHover - show, onHoverOut - show locked
	// 	$("#searchCategories").on('hover', 'li', function() {
	// 		var $this = $(this);

	// 		search.activeCategory= $this.text().toLowerCase();
	// 		library.show(library.showCategory(search.activeCategory));
	// 	}, function() {
	// 		var $this = $(this);

	// 		if($("#searchCategories .active").length > 0) {
	// 			search.activeCategory = $("#searchCategories .active").text().toLowerCase();
	// 			library.show(library.showCategory(search.activeCategory));
	// 		}
	// 		else {
	// 			search.activeCategory = null;
	// 			library.reload();
	// 		}
	// 	});
	// },

	initSearchBar : function() {
		var searchBar = document.getElementById("searchBar");
		var hide = function() {
			$(document).trigger("searchOccured");

			if(searchBar.type === "text") {
				searchBar.value = "";
				searchBar.type = "hidden";
				
				library.refresh(); 
			}
		};

		$(document).keydown(function(event) {
			if(!menu.$el.is(":visible") && ($(":focus").length == 0 || ($(":focus")[0] === searchBar  || $(":focus")[0].tagName !== "INPUT"))) {
				if(((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 32) 
				&& (!event.ctrlKey || (event.ctrlKey && event.altKey))) {
					searchBar.type = "text";
					searchBar.focus();
					
					if(typeof(iscrollLibrary) !== "undefined") {
						iscrollLibrary.scrollTo(0, 0, 300);
					}
					else {
						initIScroll();
					}
				}
			}

			// prevent backspace default action
			if(event.keyCode === 8) {
				var doPrevent = false;

				var d = event.srcElement || event.target;
				if((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE')) 
					|| d.tagName.toUpperCase() === 'TEXTAREA') {
					doPrevent = d.readonly || d.disabled;
				}
				else {
					doPrevent = true;
				}

				if(doPrevent) {
					event.preventDefault();
				}
			}
		});

		searchBar.onkeyup = function(event) {
			if((searchBar.type === "text") && (searchBar.value.length === 0 || event.keyCode === 27)) {
				event.preventDefault();
				hide();
			}
			else {
				library.show(library.showPhrase(searchBar.value.toLowerCase()));
			}
		};	

		searchBar.onfocus = function() {
			library.show(library.showPhrase(searchBar.value.toLowerCase()));
		};

		searchBar.onblur = hide;
		$(document).on("libraryBoxDraggingStart workspaceBoxDraggingStart", hide);
	},

	scrollToLetter : function(letter_, elements_) {
		if(typeof(iscrollLibrary) === "undefined") {
			initIScroll();
		}

		if(typeof(iscrollLibrary) !== "undefined" && iscrollLibrary.maxScrollY < 0) {
			var y = Math.max(-( library.elementOuterHeight ) * search.getNoElementsBefore(letter_, elements_), iscrollLibrary.maxScrollY);
			iscrollLibrary.scrollTo(0, y, 500); // x, y, time
		}
	},

	getNoElementsBefore : function(letter, elements_) {
		// needed only when search alphabet and categories is enabled
		// var elements; 
		// if(settings.data.hideFinalElements) {
		// 	elements = elements_ || game.prime.concat(game.progressWithoutFinal);
		// }
		// else {
		// 	elements = elements_ || game.prime.concat(game.progress);
		// }
		// elements = library.sortAlphabetically(elements);
		var elements = library.sortedProgress;

		var i = 0, ii = elements.length;

		while(i < ii) {
			if(localization.compareLetter(letter, bases.names[elements[i]][0]) <= 0) {
				return i;
			}
	
			i++;
		}

		return (i - 1);
	}
};