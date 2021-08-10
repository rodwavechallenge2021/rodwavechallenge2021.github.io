jQuery.extend(jQuery.validator.messages, {
    required: "*This field is required",
});

jQuery.validator.addMethod("validSoundcloudUrl", function(value) {
	var lowercaseurl = value.toLowerCase();
    return lowercaseurl.includes("soundcloud.com");
}, "*Enter a valid Soundcloud link");
