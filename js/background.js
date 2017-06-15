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
							LeadsFinder.stop(true);
						} else if (request.action == "resume") {
							LeadsFinder.resume();
						} else if (request.action == "pause") {
							LeadsFinder.pause();
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
									keyword: JSON.parse(localStorage._status || "{}").keyword || "chiropractor",
									city: JSON.parse(localStorage._curCity),
									count: JSON.parse(localStorage._max_lead_count || "null") || LeadsFinder.settings._max_lead_count.value
								});
							}
						} else if (request.action == "leads") {
							LeadsFinder.saveLeads(request.leads);
							let cities = JSON.parse(localStorage._cities || "[]"),
								curCity = cities.pop();

							localStorage._cities = JSON.stringify(cities);
							localStorage._curCity = JSON.stringify(curCity);

							if (curCity) {
								sendResponse({
									continue: true,
									keyword: JSON.parse(localStorage._status || "{}").keyword || "chiropractor",
									city: JSON.parse(localStorage._curCity),
									count: JSON.parse(localStorage._max_lead_count || "null") || LeadsFinder.settings._max_lead_count.value
								});
							} else {
								LeadsFinder.stop();
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