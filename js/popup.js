var Popup = (function() {
	var $_copyButton = $("button#btn_copy"),
		$_startButton = $("button#start"),
		$_stopButton = $("button#stop"),
		$_citationsDropdown = $("#citations"),
		selectedText = null,
		citations = null,

		wrapWithQuotes = function(str) {
			str = str.trim().replace("”", "\"");
			if (str.indexOf("\"") != 0) {
				str = "\"" + str;
			}
			if (str.slice(str.length - 1).indexOf("\"") != 0) {
				str += "\"";
			}

			return str;
		},

		citationsChangeHandler = function() {
			data = wrapWithQuotes(selectedText);
			citation = $(this).val().replace("”", "\"").trim();
			$("textarea#selected_text").text(data + " " + $(this).val());
		},

		showActivatePanel = function() {
			$("#activate-panel").show();
			$("#main-panel").hide();
		},

		showMainPanel = function() {
			$("#activate-panel").hide();
			$("#main-panel").show();
		},

		displayData = function(data, citations) {
			selectedText = data;
			citations = citations;
			$_citationsDropdown.children().remove();
			for (var i = 0; i < citations.length; i++) {
				$("<option/>").val(citations[i]).text(citations[i]).appendTo($_citationsDropdown);
			}

			data = wrapWithQuotes(data);
			citation = citations[0].replace("”", "\"").trim();
			$("textarea#selected_text").text(data + " " + citation);
			console.log($_citationsDropdown);
			$_citationsDropdown.change(citationsChangeHandler);
		},
		init = function() {
			let started = JSON.parse(localStorage._started || "false");

			if (started) {
				showMainPanel();

				// chrome.runtime.sendMessage({
				// 	from: "popup",
				// 	action: "get_data"
				// }, function(response) {
				// 	console.log(response);
				// 	// displayData(response.selectedText, response.citation);
				// });

				// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
				// 	if (message.from == "background" && message.action == "data_arrived") {
				// 		var citations = message.citations,
				// 			selectedText = message.selectedText;

				// 		displayData(selectedText, citations);
				// 		console.log(message.selectedText);
				// 		console.log(message.citations);
				// 	}
				// });

			
			} else {
				showActivatePanel();
			}

			$_startButton.click(function() {
				localStorage._started = JSON.stringify(true);
				showMainPanel();
			});

			// $_copyButton.click(function() {
			// 	var _btn = $(this);
			// 	$("textarea#selected_text").select();
			// 	document.execCommand('copy');
			// 	_btn.text("Copied to Clipboard");

			// 	chrome.extension.sendMessage({
			// 		from: "popup",
			// 		action: "copy",
			// 		data: $("textarea#selected_text").val()
			// 	});
				
			// 	window.setTimeout(function() {
			// 		_btn.text("Copy");
			// 	}, 3000);
			// });

			$_stopButton.click(function() {
				localStorage._started = JSON.stringify(false);
				localStorage._citation = JSON.stringify("");
				localStorage._selectedText = JSON.stringify("");
				showActivatePanel();
			});
				
		};

	return {
		init: init
	};
})();

(function(window, jQuery) {
	Popup.init();
})(window, $);