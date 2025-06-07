let helpWidget_html = `
  <style>
    #helpWidget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      background-color: #222831;
      color: #EEEEEE;
      font-family: sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-width: 200px;
      transition: all 0.3s ease;
    }

    #helpWidget button {
      margin-top: 10px;
      padding: 6px 12px;
      background-color: #393E46;
      border: none;
      border-radius: 6px;
      color: #EEEEEE;
      cursor: pointer;
      font-size: 13px;
      font-family: inherit;
      transition: background-color 0.2s ease;
    }

    #helpWidget button:hover {
      background-color: #00ADB5;
    }
  </style>

  <div id="helpWidget">
    <p style="margin: 0 0 10px;"><strong>DAP Extension</strong></p>
    <button id="startSelectionBtn">Start Selection</button>
    <button id="stopSelectionBtn">Stop Selection</button>
  </div>
`;

let helpWidget = document.createElement("div");
helpWidget.innerHTML = helpWidget_html;
document.body.appendChild(helpWidget);

const highlightBox = document.createElement("div");
highlightBox.style.position = "absolute";
highlightBox.style.border = "3px solid yellow";
highlightBox.style.borderRadius = "6px";
highlightBox.style.pointerEvents = "none";
highlightBox.style.zIndex = "999999";
highlightBox.style.transition = "all 0.1s ease";
document.body.appendChild(highlightBox);

function getUniqueSelector(element) {
	if (!(element instanceof Element)) return null;

	const isLikelyRandom = (str) => {
		return (
			/^(\d+|[a-f0-9]{6,})$/i.test(str) ||
			/[_\-]?[a-f0-9]{6,}/i.test(str) ||
			str.length > 20
		);
	};

	function getSelectorPart(el) {
		if (el.id && !isLikelyRandom(el.id)) {
			return `#${CSS.escape(el.id)}`;
		}

		const tag = el.tagName.toLowerCase();

		const validClasses = [...el.classList].filter(
			(cls) => !isLikelyRandom(cls) && isNaN(cls)
		);

		if (validClasses.length) {
			return `${tag}${validClasses
				.map((cls) => `.${CSS.escape(cls)}`)
				.join("")}`;
		}

		return tag;
	}

	let parts = [];
	let current = element;

	while (current && current.nodeType === Node.ELEMENT_NODE) {
		let part = getSelectorPart(current);
		let trialParts = [part, ...parts];
		let trialSelector = trialParts.join(" > ");

		if (
			document.querySelectorAll(trialSelector).length === 1 &&
			document.querySelector(trialSelector) === element
		) {
			return trialSelector;
		}

		const siblingsOfSameType = Array.from(
			current.parentElement?.children || []
		).filter((e) => e.tagName === current.tagName);
		if (siblingsOfSameType.length > 1) {
			const index = siblingsOfSameType.indexOf(current) + 1;
			part += `:nth-of-type(${index})`;
		}

		parts.unshift(part);
		current = current.parentElement;
	}

	return parts.join(" > ");
}

function mouseOverHandler(event) {
	const target = event.target;
	const rect = target.getBoundingClientRect();

	highlightBox.style.top = `${rect.top + window.scrollY}px`;
	highlightBox.style.left = `${rect.left + window.scrollX}px`;
	highlightBox.style.width = `${rect.width}px`;
	highlightBox.style.height = `${rect.height}px`;
	highlightBox.style.display = "block";
}

function mouseClickHandler(event) {
	event.preventDefault();
	event.stopPropagation();

	highlightBox.style.display = "none";

	if (event.target.closest("#helpWidget")) return;

	const boundingRect = event.target.getBoundingClientRect();
	const uniqueSelector = getUniqueSelector(event.target);

	const input = document.createElement("input");
	input.type = "text";
	input.placeholder = "Info";
	input.value = "";
	input.className = "dap-floating-input";
	input.style.position = "absolute";
	input.style.border = "1px solid #EEEEEE";
	input.style.borderRadius = "6px";
	input.style.pointerEvents = "auto";
	input.style.zIndex = "999999";
	input.style.transition = "all 0.1s ease";
	input.style.padding = "0.4rem 0.8rem";
	input.style.backgroundColor = "#222831";
	input.style.color = "#EEEEEE";
	input.style.fontFamily = "sans-serif";
	input.style.fontSize = "14px";
	input.style.width = "150px";
	input.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";

	document.body.appendChild(input);

	const inputRect = input.getBoundingClientRect();
	const top =
		boundingRect.top +
		window.scrollY +
		boundingRect.height / 2 -
		inputRect.height / 2;
	const left = boundingRect.right + window.scrollX + 8;

	input.style.top = `${top}px`;
	input.style.left = `${left}px`;

	input.focus();

	chrome.runtime.sendMessage(
		{
			type: "dapExtension:click",
			data: {
				target: {
					tag: event.target.tagName,
					id: event.target.id,
					className: event.target.className,
					name: event.target.getAttribute("name"),
					text: event.target.innerText?.trim(),
					selector: uniqueSelector,
				},
				dimensions: {
					x: event.clientX,
					y: event.clientY,
					boundingRect: {
						top: boundingRect.top,
						left: boundingRect.left,
						width: boundingRect.width,
						height: boundingRect.height,
						right: boundingRect.right,
						bottom: boundingRect.bottom,
					},
					top: top,
					left: left,
				},
			},
		},
		(response) => {
			if (response?.type === "dapExtension:action_complete") {
				console.log("Response from background script:", response.data);
			}
		}
	);

	stopSelection();
}

function startSelection() {
	window.addEventListener("mouseover", mouseOverHandler);
	window.addEventListener("click", mouseClickHandler);
}

function stopSelection() {
	window.removeEventListener("mouseover", mouseOverHandler);
	window.removeEventListener("click", mouseClickHandler);
}

document
	.getElementById("startSelectionBtn")
	?.addEventListener("click", startSelection);
document
	.getElementById("stopSelectionBtn")
	?.addEventListener("click", stopSelection);
