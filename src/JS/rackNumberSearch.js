const startBtn = document.querySelector(".startBtn");
const gameArea = document.getElementById("gameArea");
const feedback = document.getElementById("feedback");
const question1 = document.getElementById("question1");
const ans1 = document.getElementById("ans1");
const endGameBtn = document.getElementById("endGame");

startBtn.addEventListener("click", startGame);
endGameBtn.addEventListener("click", endGame);

function startGame() {
    startBtn.style.display = "none";
    gameArea.style.display = "block";

    qno = 1;
    startTime = new Date();

    const ps = gameArea.querySelectorAll("p");
    ps.forEach((p) => p.remove());

    makedNumbers();
}

function endGame() {
    gameArea.style.display = "none";
    startBtn.style.display = "block";
}

let missingIndex = 0;
let qno = 1;
let startTime;

const makedNumbers = () => {
    const dgt = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const a = [];

    missingIndex = Math.floor(Math.random() * 9);

    for (let i = 0, j = 0; i < 9; i++) {
        if (i !== missingIndex) {
            a[j] = dgt[i];
            j++;
        }
    }
    shuffleArray(a);
};

const myhandler = (event) => {
    if (gameArea.style.display === "none") return;

    for (let i = 1; i <= 9; i++) {
        if (event.key == i) {
            const ansElem = document.getElementById("ans" + qno);
            if (ansElem) {
                ansElem.innerText = `[ ${i} ]`;
            }
            if (i == missingIndex + 1) {
                if (qno >= 10) {
                    const elapsedTime = (new Date() - startTime) / 1000;
                    alert(`クリア！ タイム：${elapsedTime}秒`);
                    endGame();
                } else {
                    qno++;
                    makedNumbers();
                }
            }
        }
    }
};

Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
};

function shuffleArray(array) {
    array.shuffle();

    const p = document.createElement("p");
    p.id = "question" + qno;
    p.innerHTML = `${array.join(" ")} &nbsp;&nbsp; <span id="ans${qno}"></span>`;

    gameArea.insertBefore(p, endGameBtn);
}

document.addEventListener("keydown", myhandler, false);
