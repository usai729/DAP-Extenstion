console.log("Background script loaded");

chrome.runtime.sendMessage({
	type: "backgroundScriptLoaded",
	message: "Background script is running",
});

chrome.action.onClicked.addListener(() => {
	chrome.windows.create({
		url: "https://www.example.com",
		type: "popup",
		width: 800,
		height: 600,
	});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log("Received message from content script:", request);
});
