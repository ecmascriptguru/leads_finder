'use strict';

let Popup = (function() {
	let _status = JSON.parse(localStorage._status || JSON.stringify({location: "usa"})),
		_inputState = $("#state"),
		_btnStart = $("#start"),
		_panelStart = $("#start-panel"),
		_btnStop = $("#stop"),
		_panelStop = $("#stop-panel"),
		_selectLocation = $("#location"),
		_started = JSON.parse(localStorage._started || "false"),

		validate = () => {
			if (_status.location) {
				return true;
			} else {
				return false;
			}
		},

		start = () => {
			if (validate()) {
				_panelStart.hide();
				_panelStop.show();
				LeadsFinder.start(_status.location, _status.state);
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

		init = () => {
			_inputState.change(inputChangeHander);
			_selectLocation.change(inputChangeHander);
			for (let p in _status) {
				$("#" + p).val(_status[p]);
			}
			_btnStart.click(start);
			_btnStop.click(stop);

			if (_started) {
				_panelStart.hide();
				_panelStop.show();
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