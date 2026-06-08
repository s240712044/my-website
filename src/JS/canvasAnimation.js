document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.querySelector(".startBtn");
    const endGameBtn = document.getElementById("endGame");
    const introArea = document.querySelector(".canvas-animation__intro");
    const gameArea = document.getElementById("gameArea");
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let animationId;
    let x = 100;
    let y = 100;
    let dx = 4;
    let dy = 3;

    function drawRct(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    function drawCcl(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawCcl(x, y, 30, "green");
        drawRct(x - 15, y - 15, 30, 30, "red");

        if (x + 30 > canvas.width || x - 30 < 0) {
            dx = -dx;
        }
        if (y + 30 > canvas.height || y - 30 < 0) {
            dy = -dy;
        }

        x += dx;
        y += dy;

        animationId = requestAnimationFrame(draw);
    }

    startBtn.addEventListener("click", () => {
        introArea.style.display = "none";
        gameArea.style.display = "block";
        x = 100;
        y = 100;
        draw();
    });

    endGameBtn.addEventListener("click", () => {
        cancelAnimationFrame(animationId);
        introArea.style.display = "block";
        gameArea.style.display = "none";
    });
});
