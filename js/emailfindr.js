'use strict';

let EmailFindr = (function() {
	let _city = null,
		_leads = [],
		_inputSearch = $("#search"),
		_btnStart = $("#submit"),
		_selectCount = $("#cd-dropdown"),
		_waitTimer = null;

	let waitForLeads = () => {
		let $records = $("table#box tbody tr"),
			leads = [];

		if ($records.length == 0) {
			return false;
		}
		for (let i = 1; i < $records.length; i ++) {
			let $curRecord = $records.eq(i),
				lead = {};
			
			if (i == $records.length - 1) {
				break;
			} else if ($curRecord.find("td:nth-child(3)").text().indexOf("...") === 0) {
				return false;
			} else if ($curRecord.find("td:nth-child(6)").text() == "") {
				continue;
			}

			lead.name = $curRecord.find("td:nth-child(3)").text();
			lead.email = $curRecord.find("td:nth-child(6)").text();
			leads.push(lead);
		}

		window.clearInterval(_waitTimer);
		chrome.runtime.sendMessage({
			from: "emailfindr",
			action: "leads",
			leads: leads
		}, function(response) {
			if (response.continue && response.city && response.count) {
				init(response.keyword, response.city, response.count);
			}
		})
	};

	let init = (keyword, city, count) => {
		_city = city;

		_inputSearch = $("#search");
		_btnStart = $("#submit");
		_selectCount = $("#cd-dropdown");

		if (_btnStart.length > 0) {
			clearInterval(_waitTimer);
			
			_inputSearch.val(keyword + " in " + _city);
			_selectCount.val(count || 500);
			_btnStart.click();
			_waitTimer = window.setInterval(waitForLeads, 2000);
			console.log("Initializing...");
		} else {
			if (!_waitTimer) {
				_waitTimer = window.setInterval(() => {
					init(keyword, city, count);
				}, 500);
			}
		}
			
	};

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
			EmailFindr.init(response.keyword, response.city, response.count);
		}
	})
})(window, $);