// 遊戲元素選取
const holes = document.querySelectorAll('.hole');
const scoreBoard = document.getElementById('score');
const levelBoard = document.getElementById('level');
const timerBoard = document.getElementById('timer');
const levelGoalBoard = document.getElementById('level-goal');
const livesBoard = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const scoreChangeDisplay = document.getElementById('score-change');

// 音效
const bonkSound = new Audio('sounds/bonk.mp3');
const bgm = new Audio('sounds/bgm.mp3');
const bombSound = new Audio('sounds/bomb.mp3');
const starSound = new Audio('sounds/star.mp3');
const jackpotSound = new Audio('sounds/jackpot.mp3');
const specialSound = new Audio('sounds/special.mp3');
const treasureSound = new Audio('sounds/treasure_open.mp3');

let lastHole;
let timeUp = false;
let isPaused = false;
let peepTimeout;
let countdown;

let score = 0;
let level = 1;
let lives = 2;
let moleSpeed = 1200;
let bombChance = 0.15;
let starChance = 0;
let jackpotChance = 0.05;
let specialMoleChance = 0;
let timeBonusChance = 0;
let treasureChance = 0;
let timeLeft = 120;

// 隨機時間
function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

// 隨機洞口
function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) return randomHole(holes);
    lastHole = hole;
    return hole;
}

// 地鼠/道具出現
function peep() {
    if (timeUp || isPaused) return;

    const time = randomTime(moleSpeed * 0.5, moleSpeed);
    const hole = randomHole(holes);

    const mole = hole.querySelector('.mole');
    const bomb = hole.querySelector('.bomb');
    const star = hole.querySelector('.star');
    const jackpotStar = hole.querySelector('.jackpot-star');
    const specialMole = hole.querySelector('.special-mole');
    const timeBonus = hole.querySelector('.time-bonus');
    const treasureChest = hole.querySelector('.treasure-chest');

    // 清除所有 up class
    [mole,bomb,star,jackpotStar,specialMole,timeBonus,treasureChest].forEach(el => el.classList.remove('up'));

    // 隨機出現
    if (level >= 15 && Math.random() < treasureChance) treasureChest.classList.add('up');
    else if (level >= 7 && Math.random() < timeBonusChance) timeBonus.classList.add('up');
    else if (level >= 9 && Math.random() < specialMoleChance) specialMole.classList.add('up');
    else if (level >= 5 && Math.random() < jackpotChance) jackpotStar.classList.add('up');
    else if (level >= 5 && Math.random() < starChance) star.classList.add('up');
    else if (Math.random() < bombChance) bomb.classList.add('up');
    else mole.classList.add('up');

    peepTimeout = setTimeout(() => {
        [mole,bomb,star,jackpotStar,specialMole,timeBonus,treasureChest].forEach(el => el.classList.remove('up'));
        peep();
    }, time);
}

// 寶箱效果
function openTreasureChest() {
    treasureSound.currentTime = 0;
    treasureSound.play();

    const outcomes = ['score_down','time_up','life_up'];
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    let message = "";
    if (randomOutcome === 'score_down') {
        score = Math.max(0, score - 50);
        message = "糟糕！分數-50！";
        updateScoreChangeDisplay(-50);
        bombSound.currentTime = 0;
        bombSound.play();
    } else if (randomOutcome === 'time_up') {
        timeLeft += 50;
        timerBoard.textContent = `時間: ${timeLeft}`;
        message = "太棒了！時間+50秒！";
        updateScoreChangeDisplay("+50s");
        starSound.currentTime = 0;
        starSound.play();
    } else if (randomOutcome === 'life_up') {
        lives++;
        livesBoard.textContent = `機會: ${lives}`;
        message = "太幸運了！增加一次機會！";
        updateScoreChangeDisplay("+1機會");
        starSound.currentTime = 0;
        starSound.play();
    }
    displayMessage(message,2000);
    scoreBoard.textContent = `分數: ${score}`;
}

// 倒數計時
function startLevel() {
    timerBoard.textContent = `時間: ${timeLeft}`;
    livesBoard.textContent = `機會: ${lives}`;

    countdown = setInterval(() => {
        if(!isPaused){
            timeLeft--;
            timerBoard.textContent = `時間: ${timeLeft}`;
            if(timeLeft <= 0){
                stopLevel();
                displayMessage(`遊戲結束！你的分數是：${score}`,3000);
                startBtn.disabled = false;
                bgm.pause();
            }
        }
    },1000);
}

// 停止關卡
function stopLevel() {
    clearInterval(countdown);
    clearTimeout(peepTimeout);
    timeUp = true;
    holes.forEach(hole => {
        hole.querySelectorAll('.mole, .bomb, .star, .jackpot-star, .special-mole, .time-bonus, .treasure-chest').forEach(el => el.classList.remove('up'));
    });
}

// 開始遊戲
function startGame() {
    score = 0; level = 1; lives = 2; moleSpeed = 1200;
    bombChance = 0.15; starChance=0; jackpotChance=0.05;
    specialMoleChance=0; timeBonusChance=0; treasureChance=0;
    timeLeft = 120; timeUp=false; isPaused=false;

    scoreBoard.textContent = `分數: ${score}`;
    levelBoard.textContent = `關卡: ${level}`;
    levelGoalBoard.textContent = `目標: ${5 * Math.pow(2,0)}`;
    livesBoard.textContent = `機會: ${lives}`;
    startBtn.disabled = true;

    peep();
    startLevel();
    bgm.currentTime = 0;
    bgm.play();
}

// 關卡升級檢查
function checkLevelUp() {
    const scoreGoal = 5 * Math.pow(2, level - 1);
    if(score >= scoreGoal && level < 50){
        level++;
        displayMessage(`關卡 ${level}`,2000);
        score = 0;
        scoreBoard.textContent = `分數: ${score}`;
        levelBoard.textContent = `關卡: ${level}`;
        levelGoalBoard.textContent = `目標: ${5 * Math.pow(2, level-1)}`;
        if(level >=10) moleSpeed = Math.max(200, moleSpeed-50);
        if(level<5) bombChance += 0.05;
        else { starChance = Math.min(0.2, starChance+0.05); bombChance = Math.min(0.8,bombChance+0.03);}
        if(level===10) bombChance = 0.6;
        if(level>=6) jackpotChance = Math.min(0.1,jackpotChance+0.01);
        if(level>=7) timeBonusChance = Math.min(0.15,timeBonusChance+0.01);
        if(level>=9) specialMoleChance = Math.min(0.2,specialMoleChance+0.01);
        if(level>=15) treasureChance = Math.min(0.2,treasureChance+0.02);

        stopLevel();
        peep();
        startLevel();
        timeUp=false;
        bgm.currentTime = 0;
        bgm.play();
    } else if(score >= scoreGoal && level ===50){
        displayMessage("恭喜你！你完成所有50關！",3000);
        stopLevel();
        startBtn.disabled = false;
        bgm.pause();
    }
}

// 點擊/觸控
function bonk(e){
    const target = e.target.closest('.mole, .bomb, .star, .jackpot-star, .special-mole, .time-bonus, .treasure-chest');
    if(!target || !target.classList.contains('up') || isPaused) return;
    e.preventDefault();

    if(target.classList.contains('mole')){
        const moleImg = target.querySelector('img');
        moleImg.src = "images/pet_head_bonked.png";
        score++;
        bonkSound.currentTime = 0; bonkSound.play();
        target.classList.remove('up');
        setTimeout(()=>{moleImg.src="images/pet_head_normal.png";},1000);
    } else if(target.classList.contains('bomb')){
        score = Math.max(0, score-5);
        updateScoreChangeDisplay(-5);
        bombSound.currentTime = 0; bombSound.play();
        target.classList.remove('up');
    } else if(target.classList.contains('star')){
        score +=5;
        starSound.currentTime = 0; starSound.play();
        target.classList.remove('up');
    } else if(target.classList.contains('jackpot-star')){
        score +=50;
        jackpotSound.currentTime=0; jackpotSound.play();
        target.classList.remove('up');
    } else if(target.classList.contains('special-mole')){
        score +=200;
        specialSound.currentTime=0; specialSound.play();
        target.classList.remove('up');
    } else if(target.classList.contains('time-bonus')){
        timeLeft +=20;
        timerBoard.textContent = `時間: ${timeLeft}`;
        target.classList.remove('up');
    } else if(target.classList.contains('treasure-chest')){
        openTreasureChest();
        target.classList.remove('up');
    }

    scoreBoard.textContent = `分數: ${score}`;
    const scoreGoal = 5 * Math.pow(2, level-1);
    if(score >= scoreGoal) checkLevelUp();
}

// 顯示訊息
function displayMessage(text,duration){
    const msg = document.getElementById('game-message');
    msg.querySelector('h2').textContent = text;
    msg.classList.add('visible');
    setTimeout(()=>{msg.classList.remove('visible');},duration);
}

// 分數變化動畫
function updateScoreChangeDisplay(amount){
    const displayAmount = typeof amount==='number'? (amount>0? "+" : "")+amount : amount;
    scoreChangeDisplay.textContent = displayAmount;
    scoreChangeDisplay.classList.remove('positive','negative');
    if(typeof amount==='number'){
        if(amount>0) scoreChangeDisplay.classList.add('positive');
        else if(amount<0) scoreChangeDisplay.classList.add('negative');
    } else scoreChangeDisplay.classList.add('positive');

    scoreChangeDisplay.style.opacity=1;
    setTimeout(()=>{scoreChangeDisplay.style.opacity=0;},1500);
}

// 暫停/繼續
function togglePause(){
    isPaused=!isPaused;
    if(isPaused){
        pauseBtn.textContent="繼續";
        clearTimeout(peepTimeout);
        clearInterval(countdown);
        displayMessage("遊戲暫停",99999);
    }else{
        pauseBtn.textContent="暫停";
        peep();
        startLevel();
        document.getElementById('game-message').classList.remove('visible');
    }
}

// 事件綁定
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
holes.forEach(hole => {
    hole.addEventListener('click', bonk);
    hole.addEventListener('touchstart', bonk);
});
