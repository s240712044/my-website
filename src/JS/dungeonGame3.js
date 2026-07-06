"use strict";

const W = 31;
const H = 31;

const maze = [];

let ctx;

const wallImg = new Image();
wallImg.src = "../../imgs/dungeon/kabe.png";
const pathImg = new Image();
pathImg.src = "../../imgs/dungeon/miti.png";
const monsterImg = new Image();
monsterImg.src = "../../imgs/dungeon/monster_1-removebg-preview.png";

let monsters = [];
const MONSTER_COUNT = 10;

const player = new Player(1, 1);
let keyCode = 0;
let timer = NaN;

function Player(x, y) {
    this.x = x;
    this.y = y;

    this.update = function () {
        let nx = 0;
        let ny = 0;

        switch (keyCode) {
            case 37: nx = -1; break;
            case 38: ny = -1; break;
            case 39: nx = +1; break;
            case 40: ny = +1; break;
        }

        if (maze[this.y + ny][this.x + nx] === 0 && (nx !== 0 || ny !== 0)) {
            this.x += nx;
            this.y += ny;
        }
    };

    this.paint = function (gc) {
        const img = document.getElementById("hero3");
        gc.drawImage(img, this.x * 16, this.y * 16, 16, 16);
    };
}

function random(v) {
    return Math.floor(Math.random() * v);
}

function createMaze(w, h) {
    for (let y = 0; y < h; y++) {
        maze[y] = [];
        for (let x = 0; x < w; x++) {
            maze[y][x] = x === 0 || x === w - 1 || y === 0 || y === h - 1 ? 1 : 0;
        }
    }
    for (let y = 2; y < h - 2; y += 2) {
        for (let x = 2; x < w - 2; x += 2) {
            maze[y][x] = 1;
            let dir = random(y === 2 ? 4 : 3);
            let px = x;
            let py = y;
            switch (dir) {
                case 0: py++; break;
                case 1: px--; break;
                case 2: px++; break;
                case 3: py--; break;
            }
            maze[py][px] = 1;
        }
    }
}

// 通路のマスにランダムでモンスターを配置
function placeMonsters() {
    monsters = [];
    let count = 0;
    while (count < MONSTER_COUNT) {
        const x = random(W);
        const y = random(H);
        // 通路で、プレイヤーの開始位置から離れた場所に配置
        if (maze[y][x] === 0 && !(x <= 2 && y <= 2)) {
            monsters.push({ x, y });
            count++;
        }
    }
}

function checkCollision() {
    monsters = monsters.filter(m => !(m.x === player.x && m.y === player.y));
}

function init() {
    const canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    player.x = 1;
    player.y = 1;

    createMaze(W, H);
    placeMonsters();

    Promise.all([
        new Promise((resolve) => { if (wallImg.complete) resolve(); else wallImg.onload = resolve; }),
        new Promise((resolve) => { if (pathImg.complete) resolve(); else pathImg.onload = resolve; }),
        new Promise((resolve) => { if (monsterImg.complete) resolve(); else monsterImg.onload = resolve; }),
    ]).then(() => {
        repaint();
    });

    go();
}

function go() {
    window.onkeydown = mykeydown;
    window.onkeyup = mykeyup;
    timer = setInterval(tick, 100);
}

function tick() {
    player.update();
    checkCollision();
    repaint();

    if (monsters.length === 0) {
        clearInterval(timer);
        timer = NaN;
        setTimeout(() => alert("全モンスターを倒した！クリア！"), 50);
    }
}

function repaint() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 900, 600);

    // 迷路描画
    for (let x = 0; x < W; x++) {
        for (let y = 0; y < H; y++) {
            if (maze[y][x] === 1) {
                ctx.drawImage(wallImg, x * 16, y * 16, 16, 16);
            } else {
                ctx.drawImage(pathImg, x * 16, y * 16, 16, 16);
            }
        }
    }

    // モンスター描画
    for (const m of monsters) {
        ctx.drawImage(monsterImg, m.x * 16, m.y * 16, 16, 16);
    }

    // プレイヤー描画
    player.paint(ctx);

    // 残りモンスター数表示
    ctx.fillStyle = "white";
    ctx.font = "16px sans-serif";
    ctx.fillText("残り敵: " + monsters.length, 510, 20);
}

function mykeydown(e) {
    keyCode = e.keyCode;
}

function mykeyup(e) {
    keyCode = 0;
}

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.querySelector(".startBtn");
    const gameArea = document.getElementById("gameArea");
    const introDiv = document.querySelector(".dungeon-game__intro");
    const endBtn = document.getElementById("endGame");

    startBtn.addEventListener("click", () => {
        gameArea.style.display = "block";
        introDiv.style.display = "none";
        init();
    });

    endBtn.addEventListener("click", () => {
        clearInterval(timer);
        timer = NaN;
        keyCode = 0;
        gameArea.style.display = "none";
        introDiv.style.display = "block";
    });
});
