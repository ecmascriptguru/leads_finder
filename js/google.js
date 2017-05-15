'use strict';

let Google = (function() {
    let _cities = [],
        something = null,
        globalTimer = null;

    let getCities = () => {
            let $cities = $("#appbar .klitem div.kltat span");
            
            _cities = [];

            for (let i = 0; i < $cities.length; i ++) {
                _cities.push($cities.eq(i).text());
            }

            chrome.extension.sendMessage({
                from: "google",
                action: "cities",
                cities: _cities
            });
        };

    let parseGoogle = () => {
            if (!globalTimer) {
                globalTimer = window.setInterval(() => {
                    if ($("#appbar .klitem div.kltat span").length > 0) {
                        window.clearInterval(globalTimer);
                        getCities();
                    }
                }, 500);
            }
        }

    return {
        getCities: getCities,
        parseGoogle: parseGoogle
    };
})();

(function(window, jQuery) {
    chrome.extension.sendMessage({
        from: "google",
        action: "status"
    }, function(response) {
        if (response.started) {
            Google.parseGoogle();
        }
    })
})(window, $);