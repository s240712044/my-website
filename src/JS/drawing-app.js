document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.querySelector(".startBtn");
    const endGameBtn = document.getElementById("endGame");
    const introArea = document.querySelector(".drawing-app__intro");
    const gameArea = document.getElementById("gameArea");
    const canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    let old_x = 0;
    let old_y = 0;
    let size = 4;

    function drawCcl(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }

    function drawLine(x1, y1, x2, y2, psize, color) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.lineWidth = psize;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    function getTouchCoords(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (event.touches[0].clientX - rect.left) * scaleX,
            y: (event.touches[0].clientY - rect.top) * scaleY,
        };
    }

    function touchStart(event) {
        if (event.touches.length > 1) {
            size = event.touches.length * 2;
        }
        const pos = getTouchCoords(event);
        old_x = pos.x;
        old_y = pos.y;
        drawCcl(old_x, old_y, size / 2, "green");
    }

    function touchMove(event) {
        event.preventDefault();
        const pos = getTouchCoords(event);
        const c_x = pos.x;
        const c_y = pos.y;
        drawLine(old_x, old_y, c_x, c_y, size, "green");
        old_x = c_x;
        old_y = c_y;
    }

    function oChange() {
        const flag = confirm("絵を消去しますか？");
        if (flag == false) return;
        ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function init() {
        canvas.addEventListener("touchstart", touchStart, false);
        canvas.addEventListener("touchmove", touchMove, { passive: false });
        window.addEventListener("orientationchange", oChange, true);
    }

    function cleanup() {
        canvas.removeEventListener("touchstart", touchStart, false);
        canvas.removeEventListener("touchmove", touchMove, { passive: false });
        window.removeEventListener("orientationchange", oChange, true);
    }

    startBtn.addEventListener("click", () => {
        introArea.style.display = "none";
        gameArea.style.display = "block";
        size = 4;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        init();
    });

    endGameBtn.addEventListener("click", () => {
        cleanup();
        introArea.style.display = "block";
        gameArea.style.display = "none";
    });
});
