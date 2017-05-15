'use strict';

var Citation = (function() {
	var _data = [],
		_savedData = JSON.parse(localStorage._saved_data || "[]"),
		setSavedData = function(data) {
			localStorage._saved_data = JSON.stringify(data || []);
		},
		getSavedData = function() {
			return JSON.parse(localStorage._saved_data || "[]");
		},
		setData = function(data) {
			_data = data;
		},
		copy = function(text) {
			var curSavedData = getSavedData();
			curSavedData.push({
				citation: text,
				source: JSON.parse(localStorage._source) || "lexis",
				copied_at: new Date().toISOString().slice(0, 10)
			});
			setSavedData(curSavedData);
		},
		getData = function() {
			return _data;
		},
		init = function() {
			//
		};

	return {
		init: init,
		setData: setData,
		getData: getData,
		setSavedData: setSavedData,
		getSavedData: getSavedData,
		copy: copy
	};
})();

(function(window, jQuery) {
	console.log("Background is working...");
})(window, $);

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    var url = info.url || tab.url;
    if(url && (url.indexOf('https://1.next.westlaw.com/') == 0 || url.indexOf('https://advance.lexis.com') == 0))
        chrome.pageAction.show(tabId);
    else
        chrome.pageAction.hide(tabId);
});

chrome.runtime.onInstalled.addListener(function() {
	chrome.tabs.query({}, function(tabs) {
		for (let i = 0; i < tabs.length; i ++) {
			if (tabs[i].url.indexOf("https://advance.lexis.com/") == 0 || tabs[i].url.indexOf("https://1.next.westlaw.com/") == 0) {
				chrome.tabs.reload(tabs[i].id, {bypassCache: true});
			}
		}
	})
})

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	var respondFunction = sendResponse;
	switch(message.from) {
		case "popup":
			if (message.action === "get_data") {
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {action: "get_data"}, function(response) {
						localStorage._source = JSON.stringify(response.source);
						chrome.runtime.sendMessage({
							from: "background",
							action: "data_arrived",
							selectedText: JSON.parse(localStorage._selectedText), 
							citations: response.citations
						});
					});
				});
				// sendResponse({
				// 	selectedText: JSON.parse(localStorage._selectedText),
				// 	citation: JSON.parse(localStorage._citation)
				// });
			} else if (message.action === "copy") {
				Citation.copy(message.data);
				sendResponse({});
			}
			break;

		case "cs":
			if (message.action == "feed_data") {
				Citation.setData(message.data);
			} else if (message.action == "citation") {
				if (message.data) {
					localStorage._citation = JSON.stringify(message.data);
					localStorage._source = JSON.stringify(message.source);
					sendResponse();
				}
			} else if (message.action == "selectedText") {
				localStorage._citation = JSON.stringify("");
				localStorage._selectedText = JSON.stringify(message.data);
				sendResponse({started: JSON.parse(localStorage._started || "false")});
			} else if (message.action == "status") {
				sendResponse({
					started: JSON.parse(localStorage._started || "false"),
					selectedText: JSON.parse(localStorage._selectedText || "null")
				});
			} else if (message.action == "remove_selectedText") {
				localStorage._selectedText = JSON.stringify(null);
			}
			break;

		default:
			console.log("Unkown...");
			break;
	}
})