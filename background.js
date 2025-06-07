chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(request);

	sendResponse({
		type: "dapExtension:action_complete",
		data: "Response from background script",
	});
});
