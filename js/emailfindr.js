'use strict';

let EmailFindr = (function() {
	let _city = null,
		_leads = [],
		_inputSearch = $("#search"),
		_btnStart = $("#submit"),
		_selectCount = $("#cd-dropdown");

	let init = (city) => {
		_city = city;
		_inputSearch.val("chiropractor in " + _city);
		_selectCount.val(500);
		_btnStart.click();
		console.log("Initializing...");
	}

	return {
		init: init
	};
})();
(function(window, jQuery) {
	chrome.runtime.sendMessage({
		from: "emailfindr",
		action: "status"
	}, function(response) {
		if (response && response.city) {
			EmailFindr.init(response.city);
		}
	})
})(window, $);