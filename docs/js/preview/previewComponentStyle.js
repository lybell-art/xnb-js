export default `
#container {
	width: 100%;
	height: 100%;
	display: flex;
    gap: 20px;
    flex-wrap: nowrap;
    transform: translate(calc((-100% - 20px) * var(--index, 0)), 0px);
    transition: transform 0.2s;
}

#container preview-item{
	width: 100%;
	height: 100%;
	flex-shrink: 0;
}

button {
	position: absolute;
	width: 36px;
	height: 33px;
	border: none;
	cursor: pointer;
	background: inherit;
	box-shadow:none;
	border-radius:0;
	padding:0;
	overflow:visible;
	transition: transform 0.2s;
}

button img {
	width: 100%;
	height: 100%;
	image-rendering: pixelated;
}

button:hover {
	transform: scale(1.1);
}

#leftButton {
	left: 5px;
}
#rightButton {
	right: 5px;
}
`;