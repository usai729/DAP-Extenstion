console.log("Content script loaded");

chrome.runtime.sendMessage({
	type: "contentScriptLoaded",
	message: "Content script is running",
});

let helpWidget_html = `
  <div id="helpWidget"></div>
`;

let helpWidget = document.createElement("div");
helpWidget.innerHTML = helpWidget_html;
document.body.appendChild(helpWidget);

window.addEventListener("mouseover", (event, response) => {
	chrome.runtime.sendMessage({
		type: "elementHover",
		selector: event,
	});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log("Received message from background script:", request);
});
