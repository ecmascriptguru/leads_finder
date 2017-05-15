'use strict';

let Background = (function() {
	let _status = JSON.parse(localStorage._status || "{}"),
		_started = JSON.parse(localStorage._started || "false"),
		_step = JSON.parse(localStorage._step || "null"),
        _googleTabId = JSON.parse(localStorage._googleTabId || "null"),

		init = () => {
			chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
				switch(request.from) {
					case "popup":
						if (request.action == "start") {
							localStorage._started = JSON.stringify(true);
							LeadsFinder.checkGoogle(request.location, request.state);
						} else if (request.action === "stop") {
							localStorage._started = JSON.stringify(false);
						}
						break;

					case "google":
						if (request.action === "status") {
							sendResponse({started: JSON.parse(localStorage._started)});
						} else if (request.action === "cities") {
							if (JSON.parse(localStorage._step || "null") === "google" && JSON.parse(localStorage._googleTabId || "null") === sender.tab.id) {
								console.log("Message arrived from tab with id = ", sender.tab.id);
								LeadsFinder.saveCities(request.cities);
							}
						}
						break;

					case "emailfindr":
						if (request.action === "status") {
							if (JSON.parse(localStorage._step || "null") == "email" && JSON.parse(localStorage._emailFindrTabId || "null") == sender.tab.id) {
								sendResponse({
									city: JSON.parse(localStorage._curCity)
								});
							}
						}
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