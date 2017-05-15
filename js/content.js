'use strict';

var globalTimer = null,
	counter = 0;

var ContentScript = (function() {
	var _data = [],
		_selectedText = "",
		returndata = function() {
			chrome.extension.sendMessage({
				from: "cs",
				action: "feed_data",
				data: getData()
			}, function(response) {
				console.log(response);
			});
		},

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

		injectModal = function() {
			let $modalContainer = $("<div/>").attr("id", "citation-search-modal-container").css({display: "none"}),
				$header = $("<div/>").addClass("citation-search-modal-header").append($("<h2/>").text("Data Harvesting BOT")),
				$modalBody = $("<div/>").addClass("citation-search-modal-body"),
				$modalFooter = $("<div/>").addClass("citation-search-modal-footer"),
				$modalCitationOption = $("<select/>").attr("id", "citation-search-citations"),
				$modalText = $("<textarea/>").attr("id", "citation-search-result"),
				
				$modalCloseBtn = $("<button/>").attr("id", "citation-search-btn-close").addClass("btn btn-danger").text("Close").css({float:"left"}),
				$modalCopyBtn = $("<button/>").attr("id", "citation-search-btn-copy").addClass("btn btn-primary").text("Copy").css({float:"right"}),
				$body = $("body");

			$body.append( 
				$modalContainer.append(
					$header,
					$modalBody.append(
						$modalCitationOption,
						$modalText
					),
					$modalFooter.append(
						$modalCloseBtn,
						$modalCopyBtn
					)
				)
			);

			$modalCitationOption.change(function() {
				let _citation = $(this).val();

				let data = wrapWithQuotes(_selectedText);
				if (!data) {
					return false;
				}
				data = data.replace(/\"/g, '').trim();
				data = "“" + data + "”";
				_citation = _citation.replace("”", "\"").trim();
				if (_citation.substr(_citation.length - 1).indexOf(".") == -1) {
					_citation += ".";
				}
				$modalText.val(data + "  " + _citation);
			});

			$modalCloseBtn.click(function() {
				$modalContainer.hide();
			});

			$modalCopyBtn.click(function() {
				$modalText.select();
				document.execCommand('copy');

				let _btn = $(this);
				_btn.text("Copied to Clipboard");

				chrome.extension.sendMessage({
					from: "popup",
					action: "copy",
					data: $modalText.val()
				});
				
				window.setTimeout(function() {
					_btn.text("Copy");
				}, 3000);
			});
		},

		lexis = function() {
			var $dataContainer = $("div#shepListView");

			if ($dataContainer.length == 0) {
				// alert("Please open the correct url to get data.");
				return false;
			}
			var $dataRecords = $dataContainer.find("ol li div.tabrow div.indent");

			_data = [];
			for (var i = 0; i < $dataRecords.length; i++) {
				if ($dataRecords.eq(i).find("a.citedby").text().toLowerCase().indexOf("cited by") > -1) {
					var $tempCitation = $dataRecords.eq(i).find("span.hit"),
						$title = $dataRecords.eq(i).find("h2.doc-title");
					if ($tempCitation.text() && _data.indexOf($tempCitation.text()) == -1) {
						_data.push($tempCitation.text().trim());
					}
				}
			}
			
			return {
				source: "lexis",
				citations: _data
			};
		},
		westlaw = function() {
			var $dataContainer = $("table#co_relatedInfo_table_citingRefs");

			// if ($dataContainer.length == 0 && counter < 50) {
			// 	counter++;
			// 	return false;
			// }

			// clearInterval(globalTimer);
			// counter = 0;

			var $records = $dataContainer.find("tbody tr td.co_detailsTable_content"),
				_data = [];

			for (var i = 0; i < $records.length; i ++) {
				var $tempCitation = $records.eq(i).find("div.co_snippet a.co_snippet_link span.co_searchTerm"),
					$name = $records.eq(i).find("a.co_relatedInfo_grid_documentLink");
				if ($tempCitation.text() && _data.indexOf($tempCitation.text()) == -1) {
					_data.push($tempCitation.text().trim());
				}
			}

			return {
				source: "westlaw",
				citations: _data
			};
		},

		updateModal = function(analysis) {
			let _citations = analysis.citations,
				$citations = $("#citation-search-citations");

			$citations.children().remove();
			for (let i = 0; i < _citations.length; i ++) {
				$citations.append($("<option/>").val(_citations[i]).text(_citations[i]));
			}
			$citations.val(_citations[0]).change();

			$("#citation-search-btn-copy").attr('data-source', analysis.source);
			$("#citation-search-modal-container").show();
		},

		init = function() {
			console.log("init");
			injectModal();
			chrome.extension.sendMessage({
				from: "cs",
				action: "status"
			}, function(status) {
				if (status.started) {
					if (status.selectedText) {
						_selectedText = status.selectedText;

						if (window.location.href.indexOf("https://advance.lexis.com/") == 0) {
							globalTimer = window.setInterval(function() {
								if ($("div#shepListView").length > 0) {
									clearInterval(globalTimer);
									let _analysis = lexis();
									console.log(_analysis);
									updateModal(_analysis);
								}
							}, 500);
						} else if (window.location.href.indexOf("https://1.next.westlaw.com/") == 0) {
							globalTimer = window.setInterval(function() {
								if ($("table#co_relatedInfo_table_citingRefs").length > 0) {
									clearInterval(globalTimer);
									let _analysis = westlaw();
									console.log(_analysis);
									updateModal(_analysis);
								}
							}, 500);
						}
						chrome.runtime.sendMessage({
							from: "cs",
							action: "remove_selectedText"
						});
					}
				}

				$(document).mouseup(function() {
					var txt = window.getSelection().toString();

					if (txt && txt.length > 0) {
						chrome.extension.sendMessage({
							from: "cs",
							action: "selectedText",
							data: txt
						}, function(response) {
							if (response.started) {
								if (window.location.host.indexOf("advance.lexis.com") === 0) {
									var $citingRefLink = $("#Shepards a[data-action='sheppreview']");
									if ($citingRefLink.length > 0) {
										$($citingRefLink[0]).find("span").click();
									}
								} else if (window.location.host.indexOf("1.next.westlaw.com") === 0) {
									var $citingRefLink = $('a#coid_relatedInfo_kcCitingReferences_link');
									if ($citingRefLink.length > 0) {
										$citingRefLink[0].click();
									}
								}
							}
						});
					}
				});
			})
					
			return this;
		},
		getData = function() {
			return _data;
		},
		analyze = function() {
			if (window.location.host.indexOf("advance.lexis.com") === 0) {
				return lexis();
			} else if (window.location.host.indexOf("1.next.westlaw.com") === 0) {
				return westlaw();
			}
		};
		
	return {
		init: init,
		analyze: analyze,
		data: getData
	};
})();

(function(window, jQuery) {
	ContentScript.init();
	// ContentScript.analyze();

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.action === "get_data") {
			var text = ContentScript.analyze(),
				highlighted = null;

			// if (text == "") {
			// 	alert("Please select text.");
			// } else {
				
			// }

			// if (window.location.host.indexOf("advance.lexis.com") === 0) {
			// 	highlighted = $($("span.sentence")[0]).find("span.hit").text();// span.SS_un").text();
			// } else if (window.location.host.indexOf("1.next.westlaw.com") === 0) {
			// 	highlighted = $($("span.co_searchTerm")[0]).text();
			// }
			sendResponse(ContentScript.analyze());
		}
	})
})(window, $);