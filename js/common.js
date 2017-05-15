'use strict';

let LeadsFinder = (function() {
    let _status = JSON.parse(localStorage._status || "{}"),
        _started = JSON.parse(localStorage._started || "false"),
        _leads = JSON.parse(localStorage._leads || "[]"),
        _cities = JSON.parse(localStorage._cities || "[]");

    let start = (location, state) => {
        chrome.extension.sendMessage({
            from: "popup",
            action: "start",
            location: location,
            state: state
        });
    };

    let stop = () => {
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
        stop: stop
    };
})();