'use strict';

let Background = (function() {
	let _status = JSON.parse(localStorage._status || "{}"),
		_googleBaseUrl = "https://www.google.com/?gfe_rd=cr&ei=AAoZWbn8M7Hd8geBp6V4&gws_rd=ssl#q=",
		_emailFindrBaseUrl = "https://emailfindr.net/apps/fb_extractor/",

		init = () => {
			chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
				switch(request.from) {
					case "popup":
						//
						break;

					case "google":
						if (request.action === "status") {
							sendResponse(_status);
						} else if (request.action === "cities") {
							console.log(request.cities);
						}
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