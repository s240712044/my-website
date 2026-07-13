document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.querySelector(".startBtn");
    const endGameBtn = document.getElementById("endGame");
    const introArea = document.querySelector(".puyo-game__intro");
    const gameArea = document.getElementById("gameArea");
    const canvas = document.getElementById("gameCanvas");

    let ctx;
    let timer = NaN;

    const FW = 6; // フィールドの横マス数
    const FH = 13; // フィールドの縦マス数(最上段は表示しない)
    const DELETE = 3; // この個数以上隣接していたら消す
    const CELL = 44; // 1マスのピッチ(px)

    let field = [];

    let n = 0;
    let d_flag = 0;
    let f_flag = 0;

    // フィールドを空の状態で作り直す
    function init_field() {
        field = [];
        for (let x = 0; x < FW; x++) {
            field.push(Array(FH).fill(0));
        }
    }

    // ゲームフィールドを描く
    function paint() {
        for (let y = 1; y < FH; y++) {
            // 一番上の行は表示しない
            ctx.fillStyle = "brown";
            ctx.fillRect(0, (y + 1) * CELL, CELL, CELL - 2);
            for (let x = 0; x < FW; x++) {
                switch (field[x][y]) {
                    case 0:
                        ctx.fillStyle = "white";
                        break;
                    case 1:
                        ctx.fillStyle = "red";
                        break;
                    case 2:
                        ctx.fillStyle = "green";
                        break;
                    case 3:
                        ctx.fillStyle = "blue";
                        break;
                }
                ctx.fillRect((x + 1) * CELL, (y + 1) * CELL, CELL - 2, CELL - 2);
            }
            ctx.fillStyle = "brown";
            ctx.fillRect((FW + 1) * CELL, (y + 1) * CELL, CELL - 2, CELL - 2);
        }
        ctx.fillStyle = "brown";
        ctx.fillRect(0, (FH + 1) * CELL, (FW + 2) * CELL, CELL - 2);
    }

    // 自分に隣接している同色ぷよの個数を調べる(探索後に消す→戻す)
    // 走査済みマスは一旦まとめて記録し、探索が完全に終わってから元の色に戻す。
    // (探索の途中で戻すと、ループ状につながったぷよで再帰が無限に往復してしまう)
    function count(x, y) {
        const c = field[x][y]; // 自分の色
        const visited = [];
        count_rec(x, y, c, visited);
        for (const [vx, vy] of visited) {
            field[vx][vy] = c;
        }
    }

    function count_rec(x, y, c, visited) {
        field[x][y] = 0;
        n++;
        visited.push([x, y]);

        if (x + 1 < FW && field[x + 1][y] == c) count_rec(x + 1, y, c, visited); // 右方向に再帰探索
        if (y + 1 < FH && field[x][y + 1] == c) count_rec(x, y + 1, c, visited); // 下方向に再帰探索
        if (x - 1 >= 0 && field[x - 1][y] == c) count_rec(x - 1, y, c, visited); // 左方向に再帰探索
        if (y - 1 >= 0 && field[x][y - 1] == c) count_rec(x, y - 1, c, visited); // 上方向に再帰探索
    }

    // ぷよを消す(count関数の応用)
    function vanish(f, x, y) {
        const c = f[x][y]; // 自分の色

        f[x][y] = 0; // 色ぷよを消す

        if (x + 1 < FW && f[x + 1][y] == c) vanish(f, x + 1, y); // 右方向に再帰探索
        if (y + 1 < FH && f[x][y + 1] == c) vanish(f, x, y + 1); // 下方向に再帰探索
        if (x - 1 >= 0 && f[x - 1][y] == c) vanish(f, x - 1, y); // 左方向に再帰探索
        if (y - 1 >= 0 && f[x][y - 1] == c) vanish(f, x, y - 1); // 上方向に再帰探索
    }

    // ゲームフィールドの色をコピーする
    function copy_field(to, from) {
        for (let y = 0; y < FH; y++) {
            for (let x = 0; x < FW; x++) {
                to[x][y] = from[x][y];
            }
        }
    }

    // 四方に DELETE 以上隣接している色ぷよを消す
    // 戻り値: 削除した色ぷよの数(スコア計算に利用可能)
    function delete_puyo() {
        let f = [];
        for (let x = 0; x < FW; x++) {
            f.push(Array(FH).fill(0));
        }
        let d = 0;

        copy_field(f, field);

        for (let y = 0; y < FH; y++) {
            for (let x = 0; x < FW; x++) {
                n = field[x][y];
                if (n != 0) {
                    n = 0;
                    count(x, y);
                    // すでに別マスの探索で消去済みの領域は再度消さない
                    if (n >= DELETE && f[x][y] != 0) {
                        vanish(f, x, y);
                        d += n;
                    }
                }
            }
        }
        copy_field(field, f);
        return d;
    }

    // 浮いているぷよを1マスだけ落とす
    // 戻り値: ぷよを落とした列数
    function fall_puyo() {
        n = 0;
        for (let x = 0; x < FW; x++) {
            for (let y = FH - 1; y >= 0; y--) {
                if (field[x][y] == 0) {
                    let iy;
                    for (iy = y - 1; iy >= 0 && field[x][iy] == 0; iy--);
                    if (iy < 0) break;
                    n++;
                    for (iy = y; iy >= 0; iy--) {
                        if (iy - 1 >= 0) field[x][iy] = field[x][iy - 1];
                        else field[x][iy] = 0;
                    }
                    break;
                }
            }
        }
        return n;
    }

    // 新しいぷよを作る
    function new_puyo() {
        const r = Math.floor(Math.random() * FW);
        field[r][0] = Math.floor(Math.random() * 3) + 1;
        field[r][1] = Math.floor(Math.random() * 3) + 1;
    }

    // メイン
    function tick() {
        f_flag = fall_puyo();
        paint();
        if (f_flag == 0) {
            d_flag = delete_puyo();
            if (d_flag == 0) new_puyo();
        }
    }

    function init() {
        ctx = canvas.getContext("2d");
        init_field();
        paint();
        timer = setInterval(tick, 500);
    }

    function stopGame() {
        clearInterval(timer);
        timer = NaN;
    }

    startBtn.addEventListener("click", () => {
        introArea.style.display = "none";
        gameArea.style.display = "block";
        init();
    });

    endGameBtn.addEventListener("click", () => {
        stopGame();
        introArea.style.display = "block";
        gameArea.style.display = "none";
    });
});
