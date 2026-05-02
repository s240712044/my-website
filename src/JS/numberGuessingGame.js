const startButton = document.querySelector('.startBtn');
const gameArea = document.getElementById('gameArea');
const feedback = document.getElementById('feedback');
const guessInput = document.getElementById('guessInput');
const submitGuess = document.getElementById('submitGuess');
const endGameButton = document.getElementById('endGame');

let targetNumber = 0; 

startButton.addEventListener('click', () => {
    targetNumber = Math.floor(Math.random() * 100) + 1;
    
    gameArea.style.display = 'block';
    feedback.textContent = '1から100の数字を入力してください！';
    guessInput.value = '';
});

submitGuess.addEventListener('click', () => {
    const userGuess = parseInt(guessInput.value, 10);

    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
        feedback.textContent = '1から100の正しい数字を入れてね！';
        return;
    }

    if (userGuess === targetNumber) {
        feedback.textContent = '🎉 正解です！おめでとう！';
    } else if (userGuess < targetNumber) {
        feedback.textContent = 'もっと大きい数字です！';
    } else {
        feedback.textContent = 'もっと小さい数字です！';
    }
});

endGameButton.addEventListener('click', () => {
    gameArea.style.display = 'none';
    window.alert(`ゲーム終了！正解は ${targetNumber} でした。`);
});