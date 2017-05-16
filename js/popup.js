'use strict';

let Popup = (function() {
	let _status = JSON.parse(localStorage._status || JSON.stringify({location: "United States of America", keyword: "chiropractor"})),
		_inputState = $("#state"),
		_inputKeyword = $("#keyword"),
		_btnStart = $("#start"),
		_panelStart = $("#start-panel"),
		_btnStop = $("#stop"),
		_panelStop = $("#stop-panel"),
		_selectLocation = $("#location"),
		_curCity = $("span#cur-city"),
		_collectedLeadsCount = $("#collected-leads-count"),
		_exportedFilesCount = $("#exported-files-count"),
		_restCitiesCount = $("#rest-cities-count"),
		_started = JSON.parse(localStorage._started || "false"),

		validate = () => {
			if (_status.keyword && _status.location) {
				return true;
			} else {
				return false;
			}
		},

		start = () => {
			if (validate()) {
				_panelStart.hide();
				_panelStop.show();
				localStorage._status = JSON.stringify(_status);
				LeadsFinder.start(_status.keyword, _status.location, _status.state);
			} else {
				alert("Please fill in the form.");
			}
		},

		stop = () => {
			_panelStart.show();
			_panelStop.hide();
			chrome.extension.sendMessage({
				from: "popup",
				action: "stop"
			});
		},

		saveState = () => {
			localStorage._started = JSON.stringify(true);
			localStorage._status = JSON.stringify(_status);
		},

		inputChangeHander = () => {
			let name = event.target.getAttribute("name"),
				value = event.target.value;

			_status[name] = value;
			saveState();
		},

		updateProcessInfo = () => {
			let curCity = JSON.parse(localStorage._curCity || "null"),
				exportCount = JSON.parse(localStorage._exportedCount || "0"),
				citiesCount = JSON.parse(localStorage._cities || "[]").length,
				leadsCount = exportCount * (JSON.parse(localStorage._max_records_count || "null") || LeadsFinder.settings._max_records_count.value) + JSON.parse(localStorage._leads || "[]").length;
			
			if (curCity) {
				_curCity.text(curCity);
			}
			_exportedFilesCount.text(exportCount);
			_collectedLeadsCount.text(leadsCount);
			_restCitiesCount.text(citiesCount);
		},

		init = () => {
			_inputState.change(inputChangeHander);
			_selectLocation.change(inputChangeHander);
			_inputKeyword.change(inputChangeHander);
			for (let p in _status) {
				$("#" + p).val(_status[p]);
			}
			_btnStart.click(start);
			_btnStop.click(stop);

			if (_started) {
				_panelStart.hide();
				_panelStop.show();
				updateProcessInfo();

			} else {
				_panelStart.show();
				_panelStop.hide();
			}
		};

	return {
		init: init
	}
})();

(function(window, jQuery) {
    Popup.init();
})(window, $);