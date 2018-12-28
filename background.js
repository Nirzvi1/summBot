addContextMenu();


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request["subject"] == "ShowNotification") {
      chrome.browserAction.setBadgeText({text: " "});
      chrome.browserAction.setBadgeBackgroundColor({"color":[0, 200, 100, 255]});
  }//if
});

function addContextMenu() {
  chrome.contextMenus.create({
      "title": "Summarize article...", 
      "id":"sum_selected",
      "contexts":["selection"]});

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "sum_selected") {

        chrome.browserAction.setBadgeText({text: " "});
        chrome.browserAction.setBadgeBackgroundColor({"color":[0, 100, 200, 255]});

		if (localStorage["SETTINGS-compressto"] == undefined) {
			localStorage["SETTINGS-compressto"] = "percent";
			localStorage["SETTINGS-percentval"] = 50;
			localStorage["SETTINGS-numsentval"] = 10;
		}

        var num_sentences = 0;
        if (localStorage["SETTINGS-compressto"] == "numsent") {
          num_sentences = localStorage["SETTINGS-numsentval"];
        } else {
          num_sentences = localStorage["SETTINGS-percentval"] / 100.0;
        }//else
        
        chrome.tabs.executeScript(null, {code: "var num_sentences=" + num_sentences + ";"}, function() {
                    chrome.tabs.executeScript(null, {file:'select.js'});});
    }//if

  });
}