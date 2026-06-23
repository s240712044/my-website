"use strict";

const W = 31; // 迷路の幅
const H = 31; // 迷路の高さ

const maze = [];

let ctx;

const wallImg = new Image();
wallImg.src = "../../imgs/dungeon/kabe.png";
const pathImg = new Image();
pathImg.src = "../../imgs/dungeon/miti.png";

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
            maze[y][x] = 1; // 柱を立てる
            let dir = random(y === 2 ? 4 : 3);
            let px = x; // 今のx座標
            let py = y; // 今のy座標
            switch (dir) {
                case 0:
                    py++; // 下に倒す
                    break;
                case 1:
                    px--; // 左に倒す
                    break;
                case 2:
                    px++; // 右に倒す
                    break;
                case 3:
                    py--; // 上に倒す
                    break;
            }
            maze[py][px] = 1; // 倒れた場所も壁にする
        }
    }
}

function repaint() {
    // 背景クリア
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 900, 600);

    // 迷路描画
    ctx.save();
    ctx.translate(0, 0);
    for (let x = 0; x < W; x++) {
        for (let y = 0; y < H; y++) {
            if (maze[y][x] === 1) {
                ctx.drawImage(wallImg, x * 16, y * 16, 16, 16);
            } else {
                ctx.drawImage(pathImg, x * 16, y * 16, 16, 16);
            }
        }
    }
    ctx.restore();
}

function init() {
    const canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    createMaze(W, H);

    Promise.all([
        new Promise((resolve) => {
            if (wallImg.complete) resolve();
            else wallImg.onload = resolve;
        }),
        new Promise((resolve) => {
            if (pathImg.complete) resolve();
            else pathImg.onload = resolve;
        }),
    ]).then(() => {
        repaint();
    });
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
        gameArea.style.display = "none";
        introDiv.style.display = "block";
    });
});
