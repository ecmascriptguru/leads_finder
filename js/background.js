'use strict';

let Background = (function() {
	let _status = JSON.parse(localStorage._status || "{}"),
		_googleBaseUrl = "https://www.google.ca/?gfe_rd=cr&ei=AAoZWbn8M7Hd8geBp6V4&gws_rd=ssl#q=",
		_emailFindrBaseUrl = "https://emailfindr.net/apps/fb_extractor/",

		init = () => {
			chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
				switch(request.from) {
					case "popup":
						//
						break;

					case "google":
						//
						break;

					case "emailfindr":
						//
						break;

					default:
						console.log("Unknown message found.");
						break;
				}
			});
		}

	return {
		init: init
	};
})();

(function(window, jQuery) {
	Background.init();
})(window, $);