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
    const FIELD_WIDTH = (FW + 2) * CELL; // フィールド部分の幅
    const PANEL_WIDTH = 180; // スコアなどを表示する右側パネルの幅

    const HSCORE_KEY = "hscore2044";

    let field = [];

    let n = 0;
    let d_flag = 0;
    let f_flag = 0;

    let px = 0; // 操作中のぷよの列
    let py = 0; // 操作中のぷよ(下側)の行

    let score = 0; // 今回のスコア
    let rensa = 0; // 現在の連鎖数
    let hscore = Number(localStorage.getItem(HSCORE_KEY)) || 0; // 過去のハイスコア
    let nextColors = [1, 1]; // 次に降ってくるぷよの色(上, 下)

    // フィールドを空の状態で作り直す
    function init_field() {
        field = [];
        for (let x = 0; x < FW; x++) {
            field.push(Array(FH).fill(0));
        }
    }

    // 色コードから描画色を得る
    function colorName(code) {
        switch (code) {
            case 1:
                return "red";
            case 2:
                return "green";
            case 3:
                return "blue";
            default:
                return "white";
        }
    }

    // 新しいぷよの色をランダムに決める
    function random_color() {
        return Math.floor(Math.random() * 3) + 1;
    }

    // 1マスぷよを描く(フィールド・NEXT表示で共用)
    function draw_cell(x, y, code) {
        ctx.fillStyle = colorName(code);
        ctx.fillRect(x, y, CELL - 2, CELL - 2);
    }

    // ゲームフィールドを描く
    function paint() {
        for (let y = 1; y < FH; y++) {
            // 一番上の行は表示しない
            ctx.fillStyle = "brown";
            ctx.fillRect(0, (y + 1) * CELL, CELL, CELL - 2);
            for (let x = 0; x < FW; x++) {
                draw_cell((x + 1) * CELL, (y + 1) * CELL, field[x][y]);
            }
            ctx.fillStyle = "brown";
            ctx.fillRect((FW + 1) * CELL, (y + 1) * CELL, CELL - 2, CELL - 2);
        }
        ctx.fillStyle = "brown";
        ctx.fillRect(0, (FH + 1) * CELL, (FW + 2) * CELL, CELL - 2);

        paint_panel();
    }

    // スコアなどの情報パネルを描く
    function paint_panel() {
        ctx.clearRect(FIELD_WIDTH, 0, PANEL_WIDTH, canvas.height);

        // フィールドとの区切り線
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(FIELD_WIDTH + 1, 0);
        ctx.lineTo(FIELD_WIDTH + 1, canvas.height);
        ctx.stroke();

        const textX = FIELD_WIDTH + 20;
        ctx.fillStyle = "#334155";

        ctx.font = "bold 16px sans-serif";
        ctx.fillText("SCORE", textX, 32);
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(("0000000" + score).slice(-7), textX, 62);

        ctx.font = "bold 16px sans-serif";
        ctx.fillText("HIGH SCORE", textX, 110);
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(("0000000" + hscore).slice(-7), textX, 140);

        ctx.font = "bold 16px sans-serif";
        ctx.fillText("NEXT", textX, 190);
        ctx.fillStyle = "brown";
        ctx.fillRect(textX, 200, CELL, CELL * 2 - 2);
        draw_cell(textX + 1, 202, nextColors[0]);
        draw_cell(textX + 1, 202 + CELL, nextColors[1]);
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
    // 戻り値: 削除した色ぷよの数(スコア計算に利用)
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

    // 入力処理(キーを押した瞬間に呼ばれる。落下タイマーを待たずに即座に反映する)
    function input(code) {
        switch (code) {
            case 37: // 左キー
                if (px > 0) {
                    if (field[px - 1][py] == 0 && field[px - 1][py - 1] == 0) {
                        field[px - 1][py] = field[px][py];
                        field[px - 1][py - 1] = field[px][py - 1];
                        field[px][py] = 0;
                        field[px][py - 1] = 0;
                        px--;
                    }
                }
                break;
            case 39: // 右キー
                if (px < FW - 1) {
                    if (field[px + 1][py] == 0 && field[px + 1][py - 1] == 0) {
                        field[px + 1][py] = field[px][py];
                        field[px + 1][py - 1] = field[px][py - 1];
                        field[px][py] = 0;
                        field[px][py - 1] = 0;
                        px++;
                    }
                }
                break;
            case 32: {
                // スペースキー(上下を入れ替える)
                const tmp = field[px][py];
                field[px][py] = field[px][py - 1];
                field[px][py - 1] = tmp;
                break;
            }
        }
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
                    // 操作中のぷよの列が落ちたら、追跡している行番号も更新する
                    if (x == px) py++;
                    break;
                }
            }
        }
        return n;
    }

    // 新しいぷよを作る(NEXT表示していた色を使い、次のNEXTを新たに決める)
    function new_puyo() {
        px = Math.floor(FW / 2);
        py = 1;

        if (field[px][0] != 0 || field[px][1] != 0) {
            gameover();
            return;
        }

        field[px][0] = nextColors[0];
        field[px][1] = nextColors[1];
        nextColors = [random_color(), random_color()];
    }

    // ゲームオーバー
    function gameover() {
        stopGame();

        if (score > hscore) {
            hscore = score;
            localStorage.setItem(HSCORE_KEY, hscore);
        }

        paint();
        alert("ゲームオーバー\nスコア: " + score + "\nハイスコア: " + hscore);
    }

    // メイン
    function tick() {
        f_flag = fall_puyo();
        paint();
        if (f_flag == 0) {
            d_flag = delete_puyo();
            if (d_flag > 0) {
                // 消えたぷよの数 × 10 × 連鎖数 をスコアに加算する
                rensa++;
                score += d_flag * 10 * rensa;
            } else {
                rensa = 0;
                new_puyo();
            }
        }
    }

    // キーが押された瞬間に移動・回転を即時反映して描き直す
    function mykeydown(e) {
        if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 32) {
            e.preventDefault(); // ページのスクロールを防ぐ
            input(e.keyCode);
            paint();
        }
    }

    function init() {
        canvas.width = FIELD_WIDTH + PANEL_WIDTH;
        canvas.height = (FH + 2) * CELL;

        ctx = canvas.getContext("2d");
        init_field();

        score = 0;
        rensa = 0;
        nextColors = [random_color(), random_color()];

        paint();
        timer = setInterval(tick, 500);

        window.onkeydown = mykeydown;
    }

    function stopGame() {
        clearInterval(timer);
        timer = NaN;
        window.onkeydown = null;
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
