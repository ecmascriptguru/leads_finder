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
        chrome.tabs.create({url: _emailFindrBaseUrl}, (tab) => {
            localStorage._emailFindrTabId = JSON.stringify(tab.id);
            localStorage._leads = JSON.stringify([]);

            let cities = JSON.parse(localStorage._cities || "[]"),
                curCity = cities.pop();

            localStorage._cities = JSON.stringify(cities);
            localStorage._curCity = JSON.stringify(curCity);
        });
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

    let exportToCSV = (leads) => {
        console.log(leads);
    }

    let saveLeads = (leads) => {
        let recordsPerExport = JSON.parse(localStorage._records_per_export || "50");
        _leads = JSON.parse(localStorage._leads || "[]");
        _leads = _leads.concat(leads);

        if (_leads.length > recordsPerExport) {
            let exporting = _leads.slice(0, recordsPerExport);
            _leads = _leads.slice(recordsPerExport);
            exportToCSV(exporting);
        }
        localStorage._leads = JSON.stringify(_leads);
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
        if (JSON.parse(localStorage._googleTabId || "null")) {
            chrome.tabs.remove(JSON.parse(localStorage._googleTabId), () => {
                localStorage._googleTabId = JSON.stringify(null);
            });
        }

        if (JSON.parse(localStorage._emailFindrTabId || "null")) {
            chrome.tabs.remove(JSON.parse(localStorage._emailFindrTabId), () => {
                localStorage._emailFindrTabId = JSON.stringify(null);
            });
        }
        localStorage._started = JSON.stringify(false);
        localStorage._step = JSON.stringify(null);
        localStorage._curCity = JSON.stringify(null);
        localStorage._cities = JSON.stringify([]);
        localStorage._leads = JSON.stringify([]);
    };

    let init = () => {
        //
    };

    return {
        init: init,
        start: start,
        stop: stop,
        checkGoogle: checkGoogle,
        saveCities: saveCities,
        saveLeads: saveLeads,
        export: exportToCSV
    };
})();