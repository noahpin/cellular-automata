let canvas = document.getElementById("renderer");
let ctx = canvas.getContext("2d");
let pixelSize = 1;
let width = 70;
let height = 50;
let data = [];
for (let i = 0; i < width; i++) {
	data.push(new Array(height).fill("a"));
}
let types = {
	a: {
		name: "air",
		color: "#0000",
		pass: airPass,
	},
	b: {
		name: "solid",
		color: "#000",
		pass: solidPass,
	},
	s: {
		name: "sand",
		color: "#ff0",
		pass: sandPass,
	},
};
let neighborPoints = [
	[-1, 1],
	[1, 1],
	[0, 1],
	[-1, 0],
	[1, 0],
	[-1, -1],
	[1, -1],
	[0, -1],
];
function airPass(x, y) {
	// let numNeighbors = 0;
	// for (let i = 0; i < 8; i++) {
	// 	let xn = (x + neighborPoints[i][0]);
	// 	let yn = (y + neighborPoints[i][1]);
	//     if(xn == -1 || xn >= width || yn == -1 || yn >= height) continue;
	// 	numNeighbors += data[xn][yn] == 'b';
	// }
	// if (numNeighbors == 3) nextData[x][y] = 'b';
}
function solidPass(x, y) {
	// let numNeighbors = 0;
	// for (let i = 0; i < 8; i++) {
	// 	let xn = (x + neighborPoints[i][0]);
	// 	let yn = (y + neighborPoints[i][1]);
	//     if(xn == -1 || xn >= width || yn == -1 || yn >= height) continue;
	// 	numNeighbors += data[xn][yn] == 'b';
	// }
	// if (numNeighbors < 2) nextData[x][y] = 'a';
	// else if (numNeighbors > 3) nextData[x][y] = 'a';
}
function sandPass(x, y) {
	if (y + 1 == height) return;
	if (nextData[x][y + 1] == "a") {
		nextData[x][y] = "a";
		nextData[x][cy(y + 1)] = "s";
	} else if (
		x - 1 >= 0 &&
		nextData[x - 1][y + 1] == "a" &&
		nextData[x - 1][y] == "a"
	) {
		nextData[x][y] = "a";
		nextData[x - 1][cy(y + 1)] = "s";
	} else if (
		x + 1 < width &&
		nextData[x + 1][y + 1] == "a" &&
		nextData[x + 1][y] == "a"
	) {
		nextData[x][y] = "a";
		nextData[x + 1][cy(y + 1)] = "s";
	}
}

function init() {
	canvas.width = width;
	canvas.height = height;
	console.log(data);
	data[1][0] = "b";
	requestAnimationFrame(physicsPass);
	requestAnimationFrame(renderer);
}
init();
let stop = true;

function pause() {
	stop = true;
}
function play() {
	stop = false;
	requestAnimationFrame(physicsPass);
}
let nextData = [];

function physicsPass() {
	nextData = new Array(width);
	for (let i = 0; i < width; i++) {
		nextData[i] = [...data[i]];
	}
	for (let y = height - 1; y >= 0; y--) {
		for (let x = 0; x < width; x++) {
			types[data[x][y]].pass(x, y);
		}
	}
	for (let i = 0; i < width; i++) {
		data[i] = [...nextData[i]];
	}
	if (!stop) requestAnimationFrame(physicsPass);
}
function clamp(t, min, max) {
	return Math.min(Math.max(min, t), max);
}
function cx(t) {
	return clamp(t, 0, width - 1);
}
function cy(t) {
	return clamp(t, 0, height - 1);
}
function renderer() {
	ctx.clearRect(0, 0, width, height);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (data[x][y] == 0) continue;

			ctx.fillStyle = types[data[x][y]].color;
			ctx.fillRect(x, y, 1, 1);
		}
	}

	requestAnimationFrame(renderer);
}
let draw = false;
let drawType = "b";
function drawMouse(e) {
	if (!draw) return;
	let bound = canvas.getBoundingClientRect();
	let x = Math.floor(((e.clientX - bound.left) / bound.width) * width);
	let y = Math.floor(((e.clientY - bound.top) / bound.height) * height);
	if (x < 0 || y < 0 || y >= height || x >= width) return;
	data[x][y + 1] = data[x + 1][y] = data[x + 1][y + 1] = data[x][y] = drawType;
}
function setType(e) {
	drawType = e;
}
window.onmousedown = function () {
	draw = true;
};
window.onmousemove = drawMouse;
window.onmouseup = function () {
	draw = false;
};
