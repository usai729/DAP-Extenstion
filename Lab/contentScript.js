let helpWidget_html = `

  <div id="helpWidget"></div>
`;

let helpWidget = document.createElement("div");
helpWidget.innerHTML = helpWidget_html;
document.body.appendChild(helpWidget);

window.addEventListener("mouseover", (event) => {
	chrome.runtime.sendMessage({
		type: "elementHover",
		selector: event,
	});
});

window.addEventListener("message", (event) => {
	console.log("Received from background script:", event);
});
