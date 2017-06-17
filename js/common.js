'use strict';

let LeadsFinder = (function() {
    let _status = JSON.parse(localStorage._status || "{}"),
        _started = JSON.parse(localStorage._started || "false"),
        _leads = JSON.parse(localStorage._leads || "[]"),
        _cities = JSON.parse(localStorage._cities || "[]"),
        _defaultSettings = {
            _max_lead_count: {
                id: "select-leads-count",
                value: 500
            },
            _max_records_count: {
                id: "input-records-count",
                value: 1700
            },
            _export_file_prefix: {
                id: "input-file-prefix",
                value: "<service> <location>_<state>"
            }
        },
        _googleTabId = JSON.parse(localStorage._googleTabId || "null"),
        _googleBaseUrl = "https://www.google.co.nz/?gws_rd=ssl#q=",
		_emailFindrBaseUrl = "https://emailfindr.net/apps/fb_extractor/";

    const start = (keyword, location, state, mode) => {
        localStorage._mode = JSON.stringify(mode || "individual");
        localStorage._started = JSON.stringify(true);
        localStorage._status = JSON.stringify({
            location,
            state,
            keyword
        });
        init();
        // chrome.extension.sendMessage({
        //     from: "popup",
        //     action: "start",
        //     location: location,
        //     state: state
        // });
        checkGoogle(location, state);
    };

    const resume = () => {
        let status = JSON.parse(localStorage._status || "{}");
        let step = JSON.parse(localStorage._step || "null");

        localStorage._started = JSON.stringify(true);

        if (step == "google") {
            checkGoogle(status.location, status.state);
        } else if (step == "email") {
            findLeads();
        }
    };

    const findLeads = () => {
        chrome.tabs.create({url: _emailFindrBaseUrl}, (tab) => {
            localStorage._emailFindrTabId = JSON.stringify(tab.id);
            localStorage._leads = JSON.stringify([]);

            let cities = JSON.parse(localStorage._cities || "[]"),
                curCity = cities.pop();

            localStorage._cities = JSON.stringify(cities);
            localStorage._curCity = JSON.stringify(curCity);
        });
    };

    const removeTab = (tabId, callback) => {
        chrome.tabs.query({}, function(tabs) {
            let tabIdArray = tabs.map((tab) => tab.id);
            if (tabId && tabIdArray.indexOf(tabId) > -1) {
                chrome.tabs.remove(tabId, () => {
                    if (typeof callback === "function") {
                        callback();
                    }
                });
            } else {
                if (typeof callback === "function") {
                    callback();
                }
            }
        })
    }

    const getBatchParams = () => {
        return JSON.parse(localStorage._params || "[]");
    }

    const saveCities = (cities) => {
        localStorage._cities = JSON.stringify(cities);
        let googleTabId = JSON.parse(localStorage._googleTabId || "null");
        
        removeTab(googleTabId, () => {
            localStorage._googleTabId = JSON.stringify(null);
            localStorage._step = JSON.stringify("email");
            findLeads();
        });
    }

    const templateToFileName = (original) => {
        let template = JSON.parse(localStorage._export_file_prefix || "null") || _defaultSettings._export_file_prefix.value;
        let status = JSON.parse(localStorage._status || "{}");
        let replacePattern = {
            "<service>": status.keyword || "No service",
            "<location>": status.location || "United States of America",
            "<state>": status.state
        }

        for (let p in replacePattern) {
            if (replacePattern[p]) {
                template = template.replace(new RegExp(p), replacePattern[p]);
            } else {
                template = template.replace(new RegExp(p), "none");
            }
        }

        return template.replace(/\//g, "-");
    }

    const downloadPlaintext = (data, filename) => {
        let blob = new Blob([data], { type: "text/plain" })

        let el = document.createElement("a")
        el.href = URL.createObjectURL(blob)
        el.download = filename
        document.body.appendChild(el)
        el.click()
        document.body.removeChild(el)
    }

    const exportToCSV = (leads) => {
        let toLine = arr => arr.map(x => `"${(x + "").replace(/"/g, '""')}"`).join(",");
        let content = [toLine(["Name", "Email Address"])];
        let status = JSON.parse(localStorage._status || "{}")
        let prefix = JSON.parse(localStorage._prefix || "null") || (status.keyword + " " + status.location + "_" + (status.state || ""));
        prefix = templateToFileName(prefix);
        let exportedCount = parseInt(JSON.parse(localStorage._exportedCount || "0")) + 1;
        localStorage._exportedCount = JSON.stringify(exportedCount);

        for (let i = 0; i < leads.length; i ++) {
            content.push(toLine([leads[i].name, leads[i].email]));
        }
        
        if (content.length > 1) {
            downloadPlaintext(content.join("\n"), `${prefix}_${exportedCount}.csv`);
        }
    }

    const saveLeads = (leads) => {
        let recordsPerExport = JSON.parse(localStorage._max_records_count || "null") || _defaultSettings._max_records_count.value;
        _leads = JSON.parse(localStorage._leads || "[]");
        _leads = _leads.concat(leads);

        if (_leads.length > recordsPerExport) {
            let exporting = _leads.slice(0, recordsPerExport);
            _leads = _leads.slice(recordsPerExport);
            exportToCSV(exporting);
        }
        localStorage._leads = JSON.stringify(_leads);
    }

    const checkGoogle = (location, state) => {
        let params = ["cities", "in"];
        
        if (state) {
            params.push(state);
        }

        if (location) {
            params.push(location);
        }
        
        chrome.tabs.create({url: _googleBaseUrl + params.join("+")}, (tab) => {
            localStorage._step = JSON.stringify("google");
            localStorage._googleTabId = tab.id;
            console.log("Google tab id is ", tab.id);
        });
    }

    const removeParamByIndex = (index) => {
        let params = JSON.parse(localStorage._params);
        let res = params.splice(index + 1);
        params.splice(index);
        params = params.concat(res);
        localStorage._params = JSON.stringify(params);
        return params;
    }

    const stop = (force) => {
        let curLeads = JSON.parse(localStorage._leads || "[]");
        let exportCount = JSON.parse(localStorage._exportedCount || "0"),
            leadsCount = exportCount * (JSON.parse(localStorage._max_records_count || "null") || LeadsFinder.settings._max_records_count.value) + JSON.parse(localStorage._leads || "[]").length;
		exportToCSV(curLeads);
        
        removeTab(JSON.parse(localStorage._googleTabId || "null"), () => {
            localStorage._googleTabId = JSON.stringify(null);
        });

        removeTab(JSON.parse(localStorage._emailFindrTabId || "null"), () => {
            localStorage._emailFindrTabId = JSON.stringify(null);
        });
        
        localStorage._step = JSON.stringify(null);
        localStorage._curCity = JSON.stringify(null);
        localStorage._cities = JSON.stringify([]);
        localStorage._leads = JSON.stringify([]);

        if (JSON.parse(localStorage._mode || "individual") == "batch") {
            let params = JSON.parse(localStorage._params || "[]");

            if (params.length == 0 || force) {
                localStorage._started = JSON.stringify(false);
                alert("Batch process completed.");
            } else {
                let param = params.pop();
                localStorage._params = JSON.stringify(params);
                start(param.keyword, param.location, param.state, JSON.parse(localStorage._mode));
            }
        } else {
            localStorage._started = JSON.stringify(false);
            alert("Leads Finding Extension Popup!\nSuccessfully Complted. " + leadsCount + " of leads are exported to " + (exportCount + 1) + " files.\nThank you.");
        }
    };

    const pause = () => {
        removeTab(JSON.parse(localStorage._googleTabId || "null"), () => {
            localStorage._googleTabId = JSON.stringify(null);
        });

        removeTab(JSON.parse(localStorage._emailFindrTabId || "null"), () => {
            localStorage._emailFindrTabId = JSON.stringify(null);
        });
        
        localStorage._started = JSON.stringify(false);
    };

    const addBatchRecords = (params) => {
        let original = JSON.parse(localStorage._params || "[]");
        original = original.concat(params);
        localStorage._params = JSON.stringify(original);
    }

    const init = () => {
        localStorage._step = JSON.stringify(null);
        localStorage._leads = JSON.stringify([]);
        localStorage._googleTabId = JSON.stringify(null);
        localStorage._exportedCount = JSON.stringify(0);
        localStorage._emailFindrTabId = JSON.stringify(null);
        localStorage._curCity = JSON.stringify(null);
        localStorage._cities = JSON.stringify([]);
    };

    return {
        init: init,
        start: start,
        resume: resume,
        stop: stop,
        pause: pause,
        checkGoogle: checkGoogle,
        saveCities: saveCities,
        saveLeads: saveLeads,
        export: exportToCSV,
        settings: _defaultSettings,
        addBatch: addBatchRecords,
        getBatchParams: getBatchParams,
        removePatchParam: removeParamByIndex
    };
})();