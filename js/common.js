'use strict';

let LeadsFinder = (function() {
    let _status = JSON.parse(localStorage._status || "{}"),
        _started = JSON.parse(localStorage._started || "false"),
        _leads = JSON.parse(localStorage._leads || "[]"),
        _cities = JSON.parse(localStorage._cities || "[]"),
        _googleTabId = JSON.parse(localStorage._googleTabId || "null"),
        _googleBaseUrl = "https://www.google.com/?gfe_rd=cr&ei=AAoZWbn8M7Hd8geBp6V4&gws_rd=ssl#q=",
		_emailFindrBaseUrl = "https://emailfindr.net/apps/fb_extractor/";

    let start = (location, state) => {
        localStorage._started = JSON.stringify(true);
        chrome.extension.sendMessage({
            from: "popup",
            action: "start",
            location: location,
            state: state
        });
    };

    let findLeads = () => {
        //
    };

    let saveCities = (cities) => {
        localStorage._cities = JSON.stringify(cities);
        
        if (JSON.parse(localStorage._googleTabId || "null")) {
            chrome.tabs.remove(JSON.parse(localStorage._googleTabId), () => {
                localStorage._googleTabId = JSON.stringify(null);
                localStorage._step = JSON.stringify("email");
                findLeads();
            });
        }
    }

    let checkGoogle = (location, state) => {
        let params = ["cities", "in"];
        if (location) {
            params.push(location);
        }

        if (state) {
            params.push(state);
        }

        
        chrome.tabs.create({url: _googleBaseUrl + params.join("+")}, (tab) => {
            localStorage._step = JSON.stringify("google");
            localStorage._googleTabId = tab.id;
            console.log("Google tab id is ", tab.id);
        });
    }

    let stop = () => {
        localStorage._started = JSON.stringify(false);
        chrome.extension.sendMessage({
            from: "popup",
            action: "stop"
        });
    };

    let init = () => {
        //
    };

    return {
        init: init,
        start: start,
        stop: stop,
        checkGoogle: checkGoogle,
        saveCities: saveCities
    };
})();