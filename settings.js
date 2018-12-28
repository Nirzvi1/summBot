document.addEventListener('DOMContentLoaded', function() {
	
	if (localStorage["SETTINGS-compressto"] == undefined) {
		localStorage["SETTINGS-compressto"] = "percent";
		localStorage["SETTINGS-percentval"] = 50;
		localStorage["SETTINGS-numsentval"] = 10;
	}
	
	readSettings();

	updateNumSentLabel();
	updatePercentLabel();	

	$("#" + localStorage["SETTINGS-compressto"] + "radio").attr("checked", "true");

	$("input[name=method]").change(function() {
		toggleCompressionMethod($(this).val());

		if (typeof $("#percent").attr("disabled") == typeof undefined || $("#percent").attr("disabled") == false) {
			localStorage["SETTINGS-compressto"] = "percent";
		} else {
			localStorage["SETTINGS-compressto"] = "numsent";
		}//else
	})

	$("#percentval").on("input", function() {
		updatePercentLabel();
	});
	$("#percentval").on("change", function() {
		localStorage["SETTINGS-percentval"] = $("#percentval").val();
	});

	$("#numsentval").on("input", function() {
		updateNumSentLabel();
		localStorage["SETTINGS-numsentval"] = $("#numsentval").val();
	});	


});

function readSettings() {
	toggleCompressionMethod(localStorage["SETTINGS-compressto"]);
	$("#percentval").val(localStorage["SETTINGS-percentval"]);
	$("#numsentval").val(localStorage["SETTINGS-numsentval"]);

	updateNumSentLabel();
	updatePercentLabel();
}

function updatePercentLabel() {
	$("#showpercent").text($("#percentval").val() + "%");	
}

function updateNumSentLabel() {
	if ($("#numsentval").val() > 1) {
		$("#shownumsent").text(" sentences");
	} else {
		$("#shownumsent").text(" sentence");
	}//else
}

function toggleCompressionMethod(val) {
	if (val == "percent") {
		$("#numsent").attr("disabled", "true");
	} else if (val == "numsent") {
		$("#percent").attr("disabled", "true");
	}//else

	$("#" + val).removeAttr("disabled");
}