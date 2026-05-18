const startButton = document.querySelector('#startBtn');
const gameArea = document.getElementById('gameArea');
const feedback = document.getElementById('feedback');
const endButton = document.getElementById('endGame');
const submitButton = document.getElementById('submitChoice');

startButton.addEventListener('click', () => {
    gameArea.style.display = 'block';
    feedback.textContent = 'グー、チョキ、パーのどれかを選んでください。';
});

endButton.addEventListener('click', () => {
    gameArea.style.display = 'none';
    window.alert('ゲーム終了しました');
    
    const choices = document.getElementsByName('choice');
    for (const choice of choices) {
        choice.checked = false;
    }
});

submitButton.addEventListener('click', () => {
    const choices = document.getElementsByName('choice');
    let userChoice = '';

    for (const choice of choices) {
        if (choice.checked) {
            userChoice = choice.value;
            break;
        }
    }

    if (!userChoice) {
        feedback.textContent = '選択肢（グー、チョキ、パー）のいずれかを選んでください。';
        return;
    }

    const options = ['rock', 'scissors', 'paper'];
    const jpnOptions = {
        'rock': 'グー',
        'scissors': 'チョキ',
        'paper': 'パー'
    };
    const computerChoice = options[Math.floor(Math.random() * options.length)];

    let resultMessage = '';
    if (userChoice === computerChoice) {
        resultMessage = 'あいこです！もう一度選んでください。';
    } else if (
        (userChoice === 'rock' && computerChoice === 'scissors') ||
        (userChoice === 'scissors' && computerChoice === 'paper') ||
        (userChoice === 'paper' && computerChoice === 'rock')
    ) {
        resultMessage = 'あなたの勝ちです！';
    } else {
        resultMessage = 'あなたの負けです...';
    }

    // 結果の表示
    feedback.textContent = `あなた: ${jpnOptions[userChoice]} ｜ コンピュータ: ${jpnOptions[computerChoice]}。\n${resultMessage}`;
});