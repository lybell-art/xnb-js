const LINE_CHUNK = 100;

class PreviewText extends HTMLElement {
	// data
	#text = "";
	#chunkedText = [];
	#lastLines = 0;
	// observer
	#observer;

	get text()
	{
		return this.#text;
	}
	set text(value)
	{
		this.#text = value;
		this.#chunkedText = [];
		const sliced = value.split("\n");
		const lines = sliced.length;
		for(let i=0; i<lines; i+=LINE_CHUNK)
		{
			this.#chunkedText.push(sliced.slice(i, i+LINE_CHUNK).join('\n'));
		}
		this.#lastLines = lines - (this.#chunkedText.length - 1) * LINE_CHUNK;
		this.render();
	}
	constructor()
	{
		super();
		const shadowRoot = this.attachShadow({mode: "open"});
		const style = new CSSStyleSheet();
		style.insertRule(`.wrapper, pre { margin:0; }`);
		style.insertRule(`.wrapper{ width: max-content; min-width: 100%; }`);
		style.insertRule(`.wrapper:not(:last-child) { height:${LINE_CHUNK*46/3}px; }`);
		style.insertRule(`.wrapper:last-child { height:calc(var(--lastLine) * 46px / 3); }`);
		shadowRoot.adoptedStyleSheets = [style];

		this.#observer = new IntersectionObserver((entries, observer)=>{
			for(let entry of entries) {
				const pre = entry.target.firstChild;
				pre.hidden = !entry.isIntersecting;
			}
		});
	}
	connectedCallback()
	{
		for(let child of this.shadowRoot.children) {
			this.#observer.observe(child);
		}
	}
	disconnectedCallback()
	{
		this.#observer.disconnect();
	}
	render()
	{
		const children = this.shadowRoot.children;
		const oldLength = children.length;
		const newLength = this.#chunkedText.length;
		const fragment = new DocumentFragment();
		this.style.setProperty("--lastLine", this.#lastLines);

		// update existing element
		for(let i=0; i<newLength; i++)
		{
			if(i < oldLength) {
				const pre = children[i].firstChild;
				pre.textContent = this.#chunkedText[i];
				//pre.style.visibility = "visible";
			}
			else {
				let wrapperNode = document.createElement("div");
				wrapperNode.className = "wrapper";
				let textNode = document.createElement("pre");
				textNode.textContent = this.#chunkedText[i];
				wrapperNode.append(textNode);
				this.#observer.observe(wrapperNode);
				fragment.append(wrapperNode);
			}
		}
		// remove overflown element
		for(let i=oldLength-1; i>=newLength; i--)
		{
			this.#observer.unobserve(children[i]);
			children[i].remove();
		}
		this.shadowRoot.append(fragment);
	}
}

window.customElements.define("preview-text", PreviewText);

export default PreviewText;