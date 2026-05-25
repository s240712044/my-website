document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.querySelector(".startBtn");
    const gameArea = document.getElementById("gameArea");
    const introArea = document.querySelector(".map-editor__intro");
    const endGameBtn = document.getElementById("endGame");

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            introArea.style.display = "none";
            gameArea.style.display = "flex";
            init();
        });
    }

    if (endGameBtn) {
        endGameBtn.addEventListener("click", () => {
            gameArea.style.display = "none";
            introArea.style.display = "block";
            document.getElementById("board").innerHTML = ""; 
        });
    }
});

function init() {
    let b = document.getElementById("board");
    b.innerHTML = ""; 
    for (let i = 0; i < 8; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < 8; j++) {
            let td = document.createElement("td");
            tr.appendChild(td);
            let img = document.createElement("img");

            img.src = "../../imgs/map-game/Q-block.jpg";
            img.className = "map-img";
            img.id = `img-${i}-${j}`;
            img.onclick = clicked;

            td.appendChild(img);
        }
        b.appendChild(tr);
    }
}

function clicked(e) {
    let img = document.getElementById(e.target.id);
    img.src = "../../imgs/map-game/kinoko.png";
}
