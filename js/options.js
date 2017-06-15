'use strict';

let Options = (function() {
	let _selectLeadsCount = $("#select-leads-count"),
		_inputRecordsCount = $("#input-records-count"),
		_inputFilePrefix = $("#input-file-prefix"),
		_selectLocation = $("#location"),
		_inputState = $("#state"),
		_inputKeyword = $("#keyword"),
		_btnAddParam = $("#add-new-param"),
		_btnReset = $("#reset");

	const initializeComponents = () => {
		let settings = LeadsFinder.settings;

		for (let p in settings) {
			let config = settings[p];
			$("#" + config.id).val(JSON.parse(localStorage[p] || "null") || config.value);
		}
	};

	const resetConfig = () => {
		let settings = LeadsFinder.settings;

		for (let p in settings) {
			let config = settings[p];
			$("#" + config.id).val(config.value).change();
			localStorage[p] = JSON.stringify(config.value);
		}
	}

	const inputChangeHandler = () => {
		let target = event.target.getAttribute("data-target");
		localStorage[target] = JSON.stringify(event.target.value);
	}

	const drawTable = () => {
		let params = LeadsFinder.getBatchParams();
		let $tBody = $("#batch-params-table tbody");

		$tBody.children().remove();

		for (let i = 0; i < params.length; i ++) {
			$tBody.append(
				$("<tr/>").append(
					$("<td/>").text(i + 1),
					$("<td/>").text(params[i].location),
					$("<td/>").text(params[i].state),
					$("<td/>").text(params[i].keyword),
					$("<td/>").append(
						$("<button/>").addClass("btn btn-danger param-delete").attr({"data-index": i}).text("Delete")
					)
				)
			);
		}
	}

	const addBatchButtonHandler = () => {
		let location = _selectLocation.val();
		let state = _inputState.val().trim();
		let keyword = _inputKeyword.val().trim();
		if (location == "" || state == "" || keyword == "") {
			alert("Please fill in the form.");
		} else {
			LeadsFinder.addBatch([{location, state, keyword}]);
			drawTable();
		}
	}

	const init = () => {
		initializeComponents();
		$("input").change(inputChangeHandler);
		$("select").change(inputChangeHandler);

		//	Tabbed pane
		$(".nav-tabs li a").click((event) => {
			event.preventDefault();
			$(event.target).tab('show');
		});

		_btnAddParam.click((event) => {
			addBatchButtonHandler();
		})
		_btnReset.click(resetConfig);
		drawTable();
	}

	return {
		init: init
	}
})();

(function(window, jQuery) {
    Options.init();
})(window, $);