export default `

.preview-container {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Result item style */

.image-box-aligner {
	max-width: 50%;
	max-height: 50%;
	transform: scale(2);
}

.preview-img {
	image-rendering: pixelated;
}

.preview-text {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	max-height: 100%;
	margin: 0;
	padding: 10px;
	box-sizing: border-box;
}


/* scroll bar style */

.preview-container::-webkit-scrollbar{
	width: 10px;
	height: 10px;
}
.preview-container::-webkit-scrollbar-thumb{
	background: linear-gradient(135deg, #009688, #aaaaaa);
		background-clip: padding-box;
		border: 3px solid transparent;
}
.preview-container::-webkit-scrollbar-track {
	background-color: transparent;
}


/* loading animation */
/* from https://tobiasahlin.com/spinkit/ */

.spinner {
	width: 24px;
	height: 24px;
	position: relative;
}

.cube1, .cube2 {
	background-color: #3b7362;
	width: 37.5%;
	height: 37.5%;
	position: absolute;
	top: 0;
	left: 0;
	
	-webkit-animation: sk-cubemove 1.8s infinite ease-in-out;
	animation: sk-cubemove 1.8s infinite ease-in-out;
}

.cube2 {
	-webkit-animation-delay: -0.9s;
	animation-delay: -0.9s;
}

@-webkit-keyframes sk-cubemove {
	25% { -webkit-transform: translateX(200%) rotate(-90deg) scale(0.5) }
	50% { -webkit-transform: translateX(200%) translateY(200%) rotate(-180deg) }
	75% { -webkit-transform: translateX(0px) translateY(200%) rotate(-270deg) scale(0.5) }
	100% { -webkit-transform: rotate(-360deg) }
}

@keyframes sk-cubemove {
	25% { 
		transform: translateX(200%) rotate(-90deg) scale(0.5);
		-webkit-transform: translateX(200%) rotate(-90deg) scale(0.5);
	} 50% { 
		transform: translateX(200%) translateY(200%) rotate(-179deg);
		-webkit-transform: translateX(200%) translateY(200%) rotate(-179deg);
	} 50.1% { 
		transform: translateX(200%) translateY(200%) rotate(-180deg);
		-webkit-transform: translateX(200%) translateY(200%) rotate(-180deg);
	} 75% { 
		transform: translateX(0px) translateY(200%) rotate(-270deg) scale(0.5);
		-webkit-transform: translateX(0px) translateY(200%) rotate(-270deg) scale(0.5);
	} 100% { 
		transform: rotate(-360deg);
		-webkit-transform: rotate(-360deg);
	}
}

@keyframes opacity-toggle {
	from {
		opacity: 0;
	}
	80% {
		opacity: 0;
		visibility: visible;
	}
	100% {
		opacity: 1;
		visibility: visible;
	}
}

.spinner.shown {
	-webkit-animation: 0.75s linear forwards opacity-toggle;
	animation: 0.75s linear forwards opacity-toggle;
}
`;