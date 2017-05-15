'use strict';

let EmailFinder = (function() {
    let _status = JSON.parse(localStorage._status || "{}"),
        _started = JSON.parse(localStorage._started || "false"),
        _leads = JSON.parse(localStorage._leads || "[]"),
        _cities = JSON.parse(localStorage._cities || "[]"),

        init = () => {
            //
        };

    return {
        init: init
    };
})();