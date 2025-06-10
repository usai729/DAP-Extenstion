chrome.action.onClicked.addListener(() => {
	chrome.windows.create({
		url: "https://www.google.com",
		type: "popup",
		width: 800,
		height: 600,
	});
});
