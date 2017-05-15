var Options = (function() {
	var _dataTable = null,
		_hiddenTable = $("#hidden_table tbody"),
		$_exportButton = $("#export"),
		drawTable = function() {
			var _data = JSON.parse(localStorage._saved_data || "[]");

			_dataTable.clear().draw();

			for (var i = 0; i < _data.length; i ++) {
				var row = [i + 1];
				row.push(_data[i].source || "");
				row.push("<div class='col-xs-12'><textarea data-id='" + i + "' class='form-control citation'>" + _data[i].citation + "</textarea></div>");
				row.push(_data[i].copied_at);
				row.push("<div class=''>" +
					"<button class='action-copy btn btn-default col-xs-6' data-id='" + i + "'>Copy</button>" +
					"<button class='action-delete btn btn-danger col-xs-6' data-id='" + i + "'>Delete</button>" +
				"</div>");

				_dataTable.row.add(row).draw();
			}
		},

		changeData = function(index, citation) {
			var _data = JSON.parse(localStorage._saved_data || "[]");
			_data[index].citation = citation;
			localStorage._saved_data = JSON.stringify(_data);
		},

		exportToExcel = function(e) {
			// window.open('data:application/vnd.ms-excel,' + $('#hidden_table').html());
			// e.preventDefault();

			// var data_type = 'data:application/vnd.ms-excel';
			// var table_div = document.getElementById('hidden_table');
			// var table_html = table_div.outerHTML.replace(/ /g, '%20');

			// var a = document.createElement('a');
			// a.href = data_type + ', ' + table_html;
			// a.download = 'exported_table_' + Math.floor((Math.random() * 9999999) + 1000000) + '.xls';
			// a.click();
		},

		deleteData = function(index) {
			var _data = JSON.parse(localStorage._saved_data || "[]");
			_data.splice(index, 1);
			localStorage._saved_data = JSON.stringify(_data);
			drawTable();
		},

		init = function() {
			_dataTable = $('#data-table').DataTable();
			$("#data-table tbody")
			.on("change", "textarea.citation", function() {
				var index = parseInt($(this).attr('data-id')),
					citation = $(this).val();
				changeData(index, citation);
			})
			.on("click", "button.action-copy", function() {
				var $curRow = $(this).parents("tr"),
					$curCitation = $curRow.find("textarea.citation");

				$curCitation.select();
				$("button.action-copy.copied").removeClass("copied").text("Copy");
				document.execCommand('copy');
				$(this).addClass("copied").text("Copied");
			})
			.on("click", "button.action-delete", function() {
				if (confirm("Are you sure that you want to delete the citation?")) {
					var index = parseInt($(this).attr('data-id'));
					deleteData(index);
				}
			});

			$_exportButton.click(exportToExcel);
			drawTable();
		};

	return {
		init: init
	}
})();

(function(window, jQuery) {
	console.log("Options page is working.");
	Options.init();
})(window, $);