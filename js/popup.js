'use strict';

let Popup = (function() {
	let _status = JSON.parse(localStorage._status || JSON.stringify({location: "United States of America", keyword: "chiropractor"})),
		_inputState = $("#state"),
		_inputKeyword = $("#keyword"),
		_btnStart = $("#start"),
		_btnBatchStart = $("#btn-batch-start"),
		_fileCsvFile = $("#csv-file"),
		_btnContinue = $("#continue"),
		_panelStart = $("#start-panel"),
		_btnStop = $("#stop"),
		_btnPause = $("#pause"),
		_panelStop = $("#stop-panel"),
		_selectLocation = $("#location"),
		_curCity = $("span#cur-city"),
		_collectedLeadsCount = $("#collected-leads-count"),
		_exportedFilesCount = $("#exported-files-count"),
		_restCitiesCount = $("#rest-cities-count"),
		_started = JSON.parse(localStorage._started || "false");

	const validate = () => {
			if (_status.keyword && _status.location) {
				return true;
			} else {
				return false;
			}
		};

	const start = (mode) => {
			if (mode == "individual") {
				if (validate()) {
					_panelStart.hide();
					_panelStop.show();
					localStorage._status = JSON.stringify(_status);
					LeadsFinder.start(_status.keyword, _status.location, _status.state, mode);
				} else {
					alert("Please fill in the form.");
				}
			} else if (mode == "batch") {
				let params = JSON.parse(localStorage._params);

				if (params.length > 0) {
					let param = params.pop();
					localStorage._params = JSON.stringify(params);
					LeadsFinder.start(param.keyword, param.location, param.state, mode);
				} else {
					alert("There is nothing to do batch research.");
				}
			}
		};

	const resume = () => {
			_panelStart.show();
			_panelStop.hide();
			chrome.extension.sendMessage({
				from: "popup",
				action: "resume"
			});
		};

	const stop = () => {
			_panelStart.show();
			_panelStop.hide();
			chrome.extension.sendMessage({
				from: "popup",
				action: "stop"
			});
		};

	const pause = () => {
			_panelStart.show();
			_panelStop.hide();
			chrome.extension.sendMessage({
				from: "popup",
				action: "pause"
			});
		};

	const saveState = () => {
			localStorage._started = JSON.stringify(true);
			localStorage._status = JSON.stringify(_status);
		};

	const inputChangeHander = () => {
			let name = event.target.getAttribute("name"),
				value = event.target.value;

			_status[name] = value;
			saveState();
		};

	const updateProcessInfo = () => {
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
		};

	const batchStart = () => {
			start("batch");
		};

	const fileCsvChangeHandler = (file) => {
			let reader = new FileReader;
			reader.readAsText(file);
			// Handle errors load
			reader.onload = (event) => {
				let csv = event.target.result;
				let lines = csv.split("\n");
				let params = [];

				for (let i = 1; i < lines.length; i ++) {
					let cols = lines[i].split(",");

					if (cols.length == 3) {
						params.push({
							location: cols[0].trim(),
							state: cols[1].trim(),
							keyword: cols[2].trim()
						});
					} else {
						continue;
					}
				}

				LeadsFinder.addBatch(params);
			};
			reader.onerror = (event) => {
				if(event.target.error.name == "NotReadableError") {
					alert("Canno't read file !");
				}
			};
		}

	const init = () => {
			_inputState.change(inputChangeHander);
			_selectLocation.change(inputChangeHander);
			_inputKeyword.change(inputChangeHander);
			for (let p in _status) {
				$("#" + p).val(_status[p]);
			}
			_btnStart.click(() => {
				start("individual");
			});
			_btnContinue.click(resume);
			_btnStop.click(stop);
			_btnPause.click(pause);
			_fileCsvFile.change((event) => {
				fileCsvChangeHandler(event.target.files[0]);
			});

			_btnBatchStart.click(() => {
				start("batch");
			});

			// if (JSON.parse(localStorage.))

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