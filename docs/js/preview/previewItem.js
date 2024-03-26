import previewItemStyle from "./previewItemStyle.js";

class PreviewItem extends HTMLElement {
	// data
	#imageURL = "";
	// component
	#loadingElem;
	#previewElem;
	#previewImgElem;
	#previewTextElem;
	#errorElem;
	#errorTextElem;

	constructor()
	{
		super();
		
		const shadowRoot = this.attachShadow({mode: "open"});
		shadowRoot.innerHTML = `<style>${previewItemStyle}</style>`;
		this.#loadingElem = this.__initLoadingElem();
		this.#previewElem = this.__initPreviewElem();
		this.#previewImgElem = this.#previewElem.querySelector("img");
		this.#previewTextElem = this.#previewElem.querySelector("preview-text");
		this.#errorElem = this.__initErrorElem();
		this.#errorTextElem = this.#errorElem.querySelector(".error-text");
	}
	disconnectedCallback()
	{
		window.URL.revokeObjectURL(this.#imageURL);
	}
	reset()
	{
		this.#loadingElem.remove();
		this.#previewElem.remove();
		this.#errorElem.remove();
		window.URL.revokeObjectURL(this.#imageURL);
	}
	showLoading()
	{
		this.shadowRoot.append(this.#loadingElem);
		this.#previewElem.remove();
		this.#errorElem.remove();
	}
	showData(data)
	{
		this.#loadingElem.remove();
		this.shadowRoot.append(this.#previewElem);
		this.#errorElem.remove();
		if(data instanceof Blob)
		{
			this.#previewTextElem.text = "";
			window.URL.revokeObjectURL(this.#imageURL);
			this.#imageURL = window.URL.createObjectURL(data);
			this.#previewImgElem.src = this.#imageURL;
		}
		else
		{
			this.#previewImgElem.src = "assets/blank.png";
			this.#previewTextElem.text = data;
		}
	}
	showError(error)
	{
		this.#loadingElem.remove();
		this.#previewElem.remove();
		this.shadowRoot.append(this.#errorElem);
		this.#errorTextElem.innerText = error.message;
	}
	__initLoadingElem()
	{
		const element = document.createElement("div");
		element.className= "spinner";
		element.innerHTML = `
			<div class="cube1"></div>
			<div class="cube2"></div>
		`.trim();
		return element;
	}
	__initPreviewElem()
	{
		const element = document.createElement("div");
		element.className= "preview-container";
		element.innerHTML = `
			<div class="image-box-aligner">
				<img class="preview-img" src="assets/blank.png" alt="preview image"/>
			</div>
			<preview-text class="preview-text"></preview-text>
		`;
		return element;
	}
	__initErrorElem()
	{
		const element = document.createElement("div");
		element.className= "error-container";
		element.innerHTML = `
			<img class="error-icon" src="assets/error.png" />
			<p class="error-title">Unpack Error!</p>
			<p class="error-text"></p>
		`;
		return element;
	}
}

window.customElements.define("preview-item", PreviewItem);

export default PreviewItem;