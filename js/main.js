// POPULATE SELECTOR FOR DAYS AND YEARS

var daySelect = document.querySelector('#day');
var yearSelect = document.querySelector('#year');

function populateDays() {
	for(i = 1; i <= 31; i++) {
		var option = document.createElement('option');
		option.textContent = i;
		daySelect.appendChild(option);
	}
}

function populateYears() {
 	// get this year as a number
	var date = new Date();
 	var year = date.getFullYear();

 	// Make this year, and the 100 years before it available in the year <select>
 	for(var i = 0; i <= 100; i++) {
		var option = document.createElement('option');
		option.textContent = year-i;
		yearSelect.appendChild(option);
 	}
}

// soundcloud widget
var widget1 = SC.Widget("sc_footer_embed");
window.onload = function() {
	widget1.pause();
	// set main page to visible
	$(".mainpage").css("display","initial");
}

// DISABLE THE SPLASH PAGE ON CLICK
$( ".splash" ).click(function() {
	$(".splash").fadeOut(300);
	// REFRESH THE SOUNDCLOUD FOOTER
	// $('#sc_footer_embed').attr('src', "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1231902859&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=false");
	// $('#sc_footer_embed').attr('allow', "autoplay");

	// enable soundcloud widget
	widget1.play();

	// set main page to visible just to be sure
	$(".mainpage").css("display","initial");
});

populateDays();
populateYears();

// form validation
$("#entryform").validate({
	messages: {
		"entry.1619314826": "*Enter a valid Soundcloud link",
		"entry.1451817724": "*Enter a valid email address",
		"entry.119122662": "*Enter a valid phone number",
	},
	rules: {
		"entry.119122662": {
			phoneUS: true,
		},
		"entry.1619314826": {
			validSoundcloudUrl: true,
		},
	},
});
