chrome.storage.local.get(function (val) {
	if (val["summBot-title"] == undefined || val["summBot-summarized"] == undefined) {
  		document.getElementById("title").textContent = "summBot";
  		document.getElementById("text").innerHTML = "To summarize an article, select a word in the article, right-click to show the drop-down menu, and select \"Summarize article...\""  	
  	} else {
    	document.getElementById("title").textContent = val["summBot-title"];
    	document.getElementById("text").innerHTML = val["summBot-summarized"];
	}
});

chrome.storage.onChanged.addListener(function(changes, areaName) {
  chrome.storage.local.get(function (val) {
  
  	if (val["summBot-title"] == undefined || val["summBot-summarized"] == undefined) {
  		document.getElementById("title").textContent = "summBot";
  		document.getElementById("text").innerHTML = "To summarize an article, select a word in the article, right-click to show the drop-down menu, and select \"Summarize article...\""  	
  	} else {
    	document.getElementById("title").textContent = val["summBot-title"];
    	document.getElementById("text").innerHTML = val["summBot-summarized"];
	}
    chrome.browserAction.setBadgeText({text: "I"});
  });
});

chrome.browserAction.setBadgeText({text: ""});

document.addEventListener('DOMContentLoaded', function() {

	document.getElementById("settings").addEventListener('click', function() {

		chrome.tabs.create({url:chrome.extension.getURL("settings.html")});
	});

});
