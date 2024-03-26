class PreviewText extends HTMLElement {
	// data
	#text = "";
	#chunkedText = [];
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
		const LINE_CHUNK = 100;
		for(let i=0; i<lines; i+=LINE_CHUNK)
		{
			this.#chunkedText.push(sliced.slice(i, i+LINE_CHUNK).join('\n'));
		}
		this.render();
	}
	constructor()
	{
		super();
		const shadowRoot = this.attachShadow({mode: "open"});
		const style = new CSSStyleSheet();
		style.insertRule("pre { margin:0; }");
		shadowRoot.adoptedStyleSheets = [style];

		this.#observer = new IntersectionObserver((entries, observer)=>{
			for(let entry of entries) {
				entry.target.style.visibility = entry.isIntersecting ? "visible" : "hidden";
			}
		});
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

		// update existing element
		for(let i=0; i<newLength; i++)
		{
			if(i < oldLength) {
				children[i].textContent = this.#chunkedText[i];
				children[i].style.visibility = "visible";
			}
			else {
				let textNode = document.createElement("pre");
				textNode.textContent = this.#chunkedText[i];
				this.#observer.observe(textNode);
				fragment.append(textNode);
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