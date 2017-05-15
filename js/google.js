'use strict';

let Google = (function() {
    let _cities = [],
        something = null,

        getCities = () => {
            //
        };

    return {
        getCities: getCities
    };
})
(function(window, jQuery) {
    chrome.extension.sendMessage({
        from: "google",
        action: "status"
    }, function(response) {
        if (response.started) {
            let cities = Google.getCities();
        }
    })
})(window, $);