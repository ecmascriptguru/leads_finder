'use strict';

let Options = (function() {
	let _selectLeadsCount = $("#select-leads-count"),
		_inputRecordsCount = $("#input-records-count"),
		_inputFilePrefix = $("#input-file-prefix");

	let initializeComponents = () => {
		let settings = LeadsFinder.settings;

		for (let p in settings) {
			let config = settings[p];
			$("#" + config.id).val(config.value);
		}
	};

	let init = () => {
		initializeComponents();
	}

	return {
		init: init
	}
})();

(function(window, jQuery) {
    Options.init();
})(window, $);