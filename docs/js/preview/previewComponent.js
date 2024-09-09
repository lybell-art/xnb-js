import PreviewItem from "./previewItem.js";
import previewComponentStyle from "./previewComponentStyle.js";

class PreviewComponent extends HTMLElement {
	// data
	#previewData = [];
	#items = [];

	// slide index
	#currentIndex = 0;
	#maxLength = 0;

	// dom element
	#container;
	#leftButton;
	#rightButton;

	get currentIndex()
	{
		return this.#currentIndex;
	}
	set currentIndex(value)
	{
		if(value < 0) this.#currentIndex = 0;
		else if(value >= this.#maxLength) this.#currentIndex = this.#maxLength - 1;
		else this.#currentIndex = value;

		this.#container.style.setProperty("--index", this.#currentIndex);
		this.#leftButton.hidden = (this.#currentIndex === 0);
		this.#rightButton.hidden = (this.#currentIndex >= this.#maxLength - 1); 
	}
	constructor()
	{
		super();

		const shadowRoot = this.attachShadow({mode: "open"});
		shadowRoot.innerHTML = `
			<style>${previewComponentStyle}</style>
			<div id="container"></div>
			<button id="leftButton"><img src="assets/leftButton.png" alt="move left"></button>
			<button id="rightButton"><img src="assets/rightButton.png" alt="move right"></button>
		`;
		this.#container = shadowRoot.getElementById("container");
		this.#leftButton = shadowRoot.getElementById("leftButton");
		this.#rightButton = shadowRoot.getElementById("rightButton");
		this.#leftButton.hidden = true;
		this.#rightButton.hidden = true;

		this.#leftButton.addEventListener("click", ()=>this.currentIndex--);
		this.#rightButton.addEventListener("click", ()=>this.currentIndex++);
	}
	reset(length)
	{
		let oldLength = this.#maxLength;
		for(let i = oldLength-1; i>=length; i--) {
			let child = this.#container.children[i];
			if(i>=length) child.remove();
			else child.reset();
		}

		this.#maxLength = length;
		this.currentIndex = 0;
		const fragment = new DocumentFragment();
		for(let i=oldLength; i<length; i++) {
			fragment.append(new PreviewItem());
		}
		this.#container.append(fragment);

		// this.#container.style.setProperty("--index", this.#currentIndex);
		// this.#leftButton.hidden = true;
		// this.#rightButton.hidden = (this.#currentIndex >= this.#maxLength - 1);
	}
	showLoading(index)
	{
		if(index >= this.#maxLength) return;
		this.#container.children[index].showLoading();
	}
	showData(data, index)
	{
		if(index >= this.#maxLength) return;
		this.#container.children[index].showData(data);
	}
	showError(error, index, fileName)
	{
		if(index >= this.#maxLength) return;
		this.#container.children[index].showError(error, fileName);
	}
}

window.customElements.define("preview-component", PreviewComponent);

export default PreviewComponent;