'use strict';

let Popup = (function() {
	let _status = JSON.parse(localStorage._status || "{}"),
		_inputState = $("#state"),
		_btnStart = $("#start"),
		_selectLocation = $("#location"),
		_started = JSON.parse(localStorage._started || "false"),

		start = () => {
			LeadsFinder.start(_status.location, _status.state);
		},

		stop = () => {
			LeadsFinder.stop();
		},

		saveState = () => {
			localStorage._started = JSON.stringify(true);
			localStorage._status = JSON.stringify(_status);
		},

		inputChangeHander = () => {
			let name = $(this).name,
				value = $(this).val();

			_status[name] = value;
			saveState();
		},

		init = () => {
			_inputState.change(inputChangeHander);
			_selectLocation.change(inputChangeHander);
			for (let p in _status) {
				$("#" + p).val(_status[p]);
			}
			_btnStart.click(start);
		}
})();

(function(window, jQuery) {
    console.log("Starting popup");
})(window, $);