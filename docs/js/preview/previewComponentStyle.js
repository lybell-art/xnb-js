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

.button {
	width: 36px;
	height: 33px;
	position: absolute;
	image-rendering: pixelated;
	transition: transform 0.2s;
}
.button:hover {
	transform: scale(1.1);
}

#leftButton {
	left: 5px;
}
#rightButton {
	right: 5px;
}
`;