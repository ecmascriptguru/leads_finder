'use strict';

let Options = (function() {
	let _selectLeadsCount = $("#select-leads-count"),
		_inputRecordsCount = $("#input-records-count"),
		_inputFilePrefix = $("#input-file-prefix"),
		_btnReset = $("#reset");

	let initializeComponents = () => {
		let settings = LeadsFinder.settings;

		for (let p in settings) {
			let config = settings[p];
			$("#" + config.id).val(JSON.parse(localStorage[p] || "null") || config.value);
		}
	};

	let resetConfig = () => {
		let settings = LeadsFinder.settings;

		for (let p in settings) {
			let config = settings[p];
			$("#" + config.id).val(config.value).change();
			localStorage[p] = JSON.stringify(config.value);
		}
	}

	let inputChangeHandler = () => {
		let target = event.target.getAttribute("data-target");
		localStorage[target] = JSON.stringify(event.target.value);
	}

	let init = () => {
		initializeComponents();
		$("input").change(inputChangeHandler);
		$("select").change(inputChangeHandler);
		_btnReset.click(resetConfig);
	}

	return {
		init: init
	}
})();

(function(window, jQuery) {
    Options.init();
})(window, $);