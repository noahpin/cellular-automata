class Color {
	constructor(r, g, b, a = 255) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	variate() {
		let diff = 160;
		let c = Math.round(Math.random() * diff - diff / 3.5);
		this.r += c;
		this.g += c;
		this.b += c;
		this.r = clamp(this.r, 0, 255);
		this.g = clamp(this.g, 0, 255);
		this.b = clamp(this.b, 0, 255);
	}
	cToH(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}
	hex() {
		this.variate();
		let hex = `#${this.cToH(this.r)}${this.cToH(this.g)}${this.cToH(
			this.b
		)}${this.cToH(this.a)}`;
		return hex;
	}
}
let types = {
	a: {
		name: "air",
		color: new Color(0, 0, 0, 0),
		pass: airPass,
	},
	b: {
		name: "solid",
		color: new Color(0, 0, 0),
		pass: solidPass,
	},
	s: {
		name: "sand",
		color: new Color(255, 255, 0),
		pass: sandPass,
	},
	w: {
		name: "water",
		color: new Color(0, 0, 255),
		pass: waterPass,
	},
};
class Velocity {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}
class Particle {
	constructor(type, velocity = new Velocity(0, 0), color) {
		this.velocity = velocity;
		this.type = type;
		this.color = new Color(
			types[this.type].color.r,
			types[this.type].color.g,
			types[this.type].color.b
		).hex();
	}
}
let canvas = document.getElementById("renderer");
let ctx = canvas.getContext("2d");
let pixelSize = 1;
let width = 70 * 4;
let height = 50 * 4;
let data = [];
for (let i = 0; i < width; i++) {
	data.push(new Array(height).fill(new Particle("a")));
}
let counts = {
	a: 0,
	b: 0,
	s: 0,
	w: 0,
};
let countsEl = document.getElementById("counts");
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
const gravity = 9.8;
let physicsDelta = 0;
function swapParticles(x1, y1, x2, y2) {
	let tmp = nextData[x1][y1];
	nextData[x1][y1] = nextData[x2][y2];
	nextData[x2][y2] = tmp;
}
function airPass(x, y) {}
function solidPass(x, y) {}
function sandPass(x, y) {
	let particle = data[x][y];
	data[x][y].velocity.y += gravity * physicsDelta;
	let tY = Math.floor(particle.velocity.y);
	for (let dy = tY; dy >=1; dy--) {
		if (y + dy >= height) return;
		if (nextData[x][y + dy].type == "a") {
			swapParticles(x, y, x, cy(y + dy));
		} else if (
			x - 1 >= 0 &&
			nextData[x - 1][y + dy].type == "a" &&
			nextData[x - 1][y].type == "a"
		) {
			swapParticles(x, y, x - 1, cy(y + dy));
		} else if (
			x + 1 < width &&
			nextData[x + 1][y + dy].type == "a" &&
			nextData[x + 1][y].type == "a"
		) {
			swapParticles(x, y, x + 1, cy(y + dy));
		}
		//next, see if you can push water out
		else if (nextData[x][y + dy].type == "w") {
			swapParticles(x, y, x, cy(y + dy));
		} else if (x - 1 >= 0 && nextData[x - 1][y + dy].type == "w") {
			swapParticles(x, y, x - 1, cy(y + dy));
		} else if (x + 1 < width && nextData[x + 1][y + dy].type == "w") {
			swapParticles(x, y, x + 1, cy(y + dy));
		}
		y = dy;
	}
}
function waterPass(x, y) {
	if (y + 1 == height) return;
	if (nextData[x][y + 1].type == "a") {
		swapParticles(x, y, x, y + 1);
	} else if (
		x - 1 >= 0 &&
		nextData[x - 1][y + 1].type == "a" &&
		nextData[x - 1][y].type == "a"
	) {
		swapParticles(x, y, x - 1, y + 1);
	} else if (
		x + 1 < width &&
		nextData[x + 1][y + 1].type == "a" &&
		nextData[x + 1][y].type == "a"
	) {
		swapParticles(x, y, x + 1, y + 1);
	} else if (x - 1 >= 0 && nextData[x - 1][y].type == "a") {
		swapParticles(x, y, x - 1, y);
	} else if (x + 1 < width && nextData[x + 1][y].type == "a") {
		swapParticles(x, y, x + 1, y);
	}
}

function init() {
	canvas.width = width;
	canvas.height = height;
	requestAnimationFrame(physicsPass);
	requestAnimationFrame(renderer);
}

function clearData() {
	data = [];
	for (let i = 0; i < width; i++) {
		data.push(new Array(height).fill(new Particle("a")));
	}
}
init();
let stop = true;

function pause() {
	stop = true;
}
function play() {
	stop = false;
	lastPhysicsTime = performance.now();
	requestAnimationFrame(physicsPass);
}
let nextData = [];
let physicsFrameCount = 0;
let lastPhysicsTime = performance.now();
function physicsPass() {
	physicsDelta = (performance.now() - lastPhysicsTime) / 1000;
	lastPhysicsTime = performance.now();

	physicsFrameCount++;
	nextData = new Array(width);
	for (let i = 0; i < width; i++) {
		nextData[i] = [...data[i]];
	}
	//iterate through counts and set them to 0
	for (let key in counts) {
		counts[key] = 0;
	}
	for (let y = height - 1; y >= 0; y--) {
		if (physicsFrameCount % 2 == 0) {
			for (let x = 0; x < width; x++) {
				types[data[x][y].type].pass(x, y);
				counts[data[x][y].type]++;
			}
		} else {
			for (let x = width - 1; x >= 0; x--) {
				types[data[x][y].type].pass(x, y);
				counts[data[x][y].type]++;
			}
		}
	}
	for (let i = 0; i < width; i++) {
		data[i] = [...nextData[i]];
	}
	countsEl.innerHTML = "";
	for (let key in counts) {
		countsEl.innerHTML += types[key].name + ": " + counts[key] + " ";
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
			if (data[x][y].type == "a") {
				continue;
			}

			ctx.fillStyle = data[x][y].color;
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
	for (let i = 0; i < 50; i++) {
		let size = 16;
		let rX = Math.floor(Math.random() * size - size / 2);
		let rY = Math.floor(Math.random() * size - size / 2);
		let nX = x + rX;
		let nY = y + rY;
		if (nX < 0 || nY < 0 || nY >= height || nX >= width) continue;
		data[nX][nY] = new Particle(drawType, new Velocity(0, 0));
	}
}
function setType(e) {
	drawType = e;
}
window.onmousedown = function (e) {
	draw = true;
	drawMouse(e);
};
window.onmousemove = drawMouse;
window.onmouseup = function () {
	draw = false;
};
