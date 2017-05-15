'use strict';

let Popup = (function() {
	let _status = JSON.parse(localStorage._status || JSON.stringify({location: "usa"})),
		_inputState = $("#state"),
		_btnStart = $("#start"),
		_btnStop = $("#stop"),
		_selectLocation = $("#location"),
		_started = JSON.parse(localStorage._started || "false"),

		validate = () => {
			if (_status.location && _status.state) {
				return true;
			} else {
				return false;
			}
		},

		start = () => {
			if (validate()) {
				LeadsFinder.start(_status.location, _status.state);
				_btnStart.hide();
				_btnStart.show();
			} else {
				alert("Please fill in the form.");
			}
		},

		stop = () => {
			LeadsFinder.stop();
			_btnStart.show();
			_btnStart.hide();
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
				_btnStart.hide();
				_btnStop.show();
			} else {
				_btnStart.show();
				_btnStop.hide();
			}
		};

	return {
		init: init
	}
})();

(function(window, jQuery) {
    Popup.init();
})(window, $);