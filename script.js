// 游戏状态变量
let gameStarted = false;
let gameTimer;
let seconds = 0;
let moves = 0;
let puzzleSize = 4; // 固定为4x4
let puzzleState = [];
let originalImage = '';
let selectedPiece = null;

// 抽奖转盘配置
const prizes = [
    { name: "iphone 16pro 256g", color: "#e74c3c", probability: 0.0527 },
    { name: "2000元优惠券", color: "#3498db", probability: 94.473 },
    { name: "1000元优惠券", color: "#2ecc71", probability: 0 },
    { name: "100元优惠券", color: "#f39c12", probability: 0 },
    { name: "10元优惠券", color: "#9b59b6", probability: 0 },
    { name: "0元优惠券", color: "#95a5a6", probability: 0 }
];

// 图片配置
const images = {
    image1: "./1.jpg"}
   

// DOM 元素
const startScreen = document.getElementById('start-screen');
const puzzleContainer = document.getElementById('puzzle-container');
const winScreen = document.getElementById('win-screen');
const wheelContainer = document.getElementById('wheel-container');
const targetBoard = document.getElementById('target-board');
const piecesSelection = document.getElementById('pieces-selection');
const timerElement = document.getElementById('timer');
const movesElement = document.getElementById('moves');
const finalTimeElement = document.getElementById('final-time');
const finalMovesElement = document.getElementById('final-moves');
const prizeResult = document.getElementById('prize-result');
const prizeName = document.getElementById('prize-name');
const wheel = document.getElementById('wheel');

// 按钮事件监听
document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('reset-button').addEventListener('click', resetGame);
document.getElementById('spin-button').addEventListener('click', startWheel);
document.getElementById('play-again').addEventListener('click', playAgain);

// 图片选择监听
document.getElementById('image-select').addEventListener('change', function() {
    originalImage = images[this.value];
});

// 初始化
function init() {
    originalImage = images.image1; // 默认图片
}

// 开始游戏
function startGame() {
    gameStarted = true;
    seconds = 0;
    moves = 0;
    
    // 更新UI
    startScreen.classList.add('hidden');
    puzzleContainer.classList.remove('hidden');
    winScreen.classList.add('hidden');
    wheelContainer.classList.add('hidden');
    
    // 更新计时器和步数显示
    timerElement.textContent = `时间: ${seconds}秒`;
    movesElement.textContent = `步数: ${moves}`;
    
    // 创建拼图
    createPuzzle();
    
    // 开始计时器
    gameTimer = setInterval(updateTimer, 1000);
}

// 更新计时器
function updateTimer() {
    seconds++;
    timerElement.textContent = `时间: ${seconds}秒`;
}

// 创建拼图
function createPuzzle() {
    // 清空拼图板和选择区域
    targetBoard.innerHTML = '';
    piecesSelection.innerHTML = '';
    
    // 初始化拼图状态 (4x4网格)
    puzzleState = Array(puzzleSize).fill().map(() => Array(puzzleSize).fill(null));
    
    // 创建目标区域的空格子
    for (let row = 0; row < puzzleSize; row++) {
        for (let col = 0; col < puzzleSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'target-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 修改点击事件
            cell.addEventListener('click', () => {
                // 只有当有选中的拼图块时才能放置
                // 且不能放在已有正确拼图的位置
                if (selectedPiece && 
                    !(puzzleState[row][col] && puzzleState[row][col].isCorrect)) {
                    placePiece(selectedPiece, row, col);
                }
            });
            
            targetBoard.appendChild(cell);
        }
    }
    
    // 创建拼图块并随机排列
    const pieces = [];
    for (let row = 0; row < puzzleSize; row++) {
        for (let col = 0; col < puzzleSize; col++) {
            pieces.push({ row, col });
        }
    }
    
    // 随机打乱拼图块
    shuffleArray(pieces);
    
    // 创建拼图选择区域
    pieces.forEach((piece, index) => {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'puzzle-piece';
        pieceElement.dataset.index = index;
        pieceElement.dataset.originalRow = piece.row;
        pieceElement.dataset.originalCol = piece.col;
        
        // 设置背景图片和位置
        pieceElement.style.backgroundImage = `url(${originalImage})`;
        pieceElement.style.backgroundSize = `${puzzleSize * 100}px ${puzzleSize * 100}px`;
        pieceElement.style.backgroundPosition = `-${piece.col * 100}px -${piece.row * 100}px`;
        
        // 添加点击事件，选择拼图块
        pieceElement.addEventListener('click', () => {
            if (!pieceElement.classList.contains('placed')) {
                // 取消之前选中的拼图
                if (selectedPiece) {
                    document.querySelector(`.puzzle-piece[data-index="${selectedPiece.dataset.index}"]`).classList.remove('selected');
                }
                
                // 选中当前拼图
                selectedPiece = pieceElement;
                pieceElement.classList.add('selected');
            }
        });
        
        piecesSelection.appendChild(pieceElement);
    });
}

// 打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 放置拼图块
function placePiece(pieceElement, row, col) {
    const originalRow = parseInt(pieceElement.dataset.originalRow);
    const originalCol = parseInt(pieceElement.dataset.originalCol);
    
    // 检查是否放置正确
    const isCorrect = (row === originalRow && col === originalCol);

    // 创建放置在目标区域的拼图块
    const placedPiece = document.createElement('div');
    placedPiece.className = 'placed-piece' + (isCorrect ? ' correct' : '');
    placedPiece.style.backgroundImage = pieceElement.style.backgroundImage;
    placedPiece.style.backgroundSize = pieceElement.style.backgroundSize;
    placedPiece.style.backgroundPosition = pieceElement.style.backgroundPosition;
    
    // 存储原始位置信息，用于后续可能的移除
    placedPiece.dataset.originalRow = originalRow;
    placedPiece.dataset.originalCol = originalCol;
    placedPiece.dataset.pieceIndex = pieceElement.dataset.index;

    // 将拼图块放入目标区域
    const targetCell = document.querySelector(`.target-cell[data-row="${row}"][data-col="${col}"]`);
    
    // 如果单元格已有拼图，先移除
    if (puzzleState[row][col] !== null) {
        const oldPiece = targetCell.querySelector('.placed-piece');
        if (oldPiece) {
            targetCell.removeChild(oldPiece);
            
            // 恢复原拼图块的可用状态
            const oldPieceIndex = oldPiece.dataset.pieceIndex;
            const oldPieceElement = document.querySelector(`.puzzle-piece[data-index="${oldPieceIndex}"]`);
            if (oldPieceElement) {
                oldPieceElement.classList.remove('placed');
                if (oldPieceElement.classList.contains('correct')) {
                    oldPieceElement.classList.remove('correct');
                }
            }
        }
    }
    
    targetCell.appendChild(placedPiece);
    
    // 更新拼图状态
    puzzleState[row][col] = { 
        originalRow, 
        originalCol,
        isCorrect,
        pieceIndex: pieceElement.dataset.index
    };

    // 如果正确放置，禁用该拼图块
    if (isCorrect) {
        pieceElement.classList.add('placed', 'correct');
        targetCell.classList.add('correct-cell');
        
        // 为正确放置的拼图添加点击事件阻止
        placedPiece.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    } else {
        pieceElement.classList.add('placed');
        
        // 为错误放置的拼图添加点击事件，允许移除
        placedPiece.addEventListener('click', (e) => {
            // 阻止事件冒泡，避免触发单元格的点击事件
            e.stopPropagation();
            
            // 移除拼图
            targetCell.removeChild(placedPiece);
            
            // 更新拼图状态
            puzzleState[row][col] = null;
            
            // 恢复拼图块的可用状态
            pieceElement.classList.remove('placed');
            
            // 如果当前没有选中的拼图，则选中这个
            if (!selectedPiece) {
                selectedPiece = pieceElement;
                pieceElement.classList.add('selected');
            }
        });
    }

    // 取消选中
    if (selectedPiece) {
        selectedPiece.classList.remove('selected');
        selectedPiece = null;
    }
    
    // 增加步数
    moves++;
    movesElement.textContent = `步数: ${moves}`;
    
    // 检查是否完成
    if (isPuzzleComplete()) {
        gameWin();
    }
}

// 检查拼图是否完成
function isPuzzleComplete() {
    for (let row = 0; row < puzzleSize; row++) {
        for (let col = 0; col < puzzleSize; col++) {
            // 如果有空格或拼图块位置不正确，则未完成
            if (puzzleState[row][col] === null || 
                puzzleState[row][col].originalRow !== row || 
                puzzleState[row][col].originalCol !== col) {
                return false;
            }
        }
    }
    return true;
}

// 游戏胜利
function gameWin() {
    // 停止计时器
    clearInterval(gameTimer);
    
    // 更新UI
    puzzleContainer.classList.add('hidden');
    winScreen.classList.remove('hidden');
    
    // 显示最终结果
    finalTimeElement.textContent = `用时: ${seconds}秒`;
    finalMovesElement.textContent = `步数: ${moves}`;
}

// 重置游戏
function resetGame() {
    // 停止计时器
    clearInterval(gameTimer);
    
    // 重新开始游戏
    startGame();
}

// 开始抽奖转盘
function startWheel() {
    // 更新UI
    winScreen.classList.add('hidden');
    wheelContainer.classList.remove('hidden');
    prizeResult.classList.add('hidden');
    
    // 创建转盘
    createWheel();
    
    // 旋转转盘
    spinWheel();
}

// 创建转盘
function createWheel() {
    wheel.innerHTML = '';
    
    // 计算每个奖项的角度 - 视觉上平均分配
    const segmentAngle = 360 / prizes.length;
    
    // 创建转盘扇形 - 视觉上均等
    prizes.forEach((prize, index) => {
        const segment = document.createElement('div');
        segment.className = 'wheel-segment';
        segment.style.backgroundColor = prize.color;
        segment.style.transform = `rotate(${index * segmentAngle}deg)`;
        segment.style.clipPath = `polygon(0 0, 100% 0, 100% 100%)`;
        
        // 添加奖项名称
        const nameElement = document.createElement('div');
        nameElement.textContent = prize.name;
        nameElement.style.transform = `rotate(${segmentAngle / 2}deg) translateX(30%)`;
        segment.appendChild(nameElement);
        
        wheel.appendChild(segment);
    });
}

// 旋转转盘
function spinWheel() {
    // 根据概率确定中奖结果
    const winningPrize = determineWinningPrize();
    const prizeIndex = prizes.findIndex(p => p.name === winningPrize);
    
    // 计算旋转角度（多转几圈再停在中奖位置）
    const segmentAngle = 360 / prizes.length;
    const rotationAngle = 1800 + (prizes.length - prizeIndex - 0.5) * segmentAngle;
    
    // 旋转转盘
    wheel.style.transform = `rotate(${rotationAngle}deg)`;
    
    // 转盘停止后显示结果
    setTimeout(() => {
        prizeResult.classList.remove('hidden');
        prizeName.textContent = winningPrize;
    }, 5000); // 5秒后显示结果
}

// 根据概率确定中奖结果 - 使用您设定的概率
function determineWinningPrize() {
    const random = Math.random() * 100; // 使用0-100的范围更直观
    let cumulativeProbability = 0;
    
    for (const prize of prizes) {
        cumulativeProbability += prize.probability;
        if (random < cumulativeProbability) {
            return prize.name;
        }
    }
    
    // 默认返回最后一个奖项
    return prizes[prizes.length - 1].name;
}

// 再玩一次
function playAgain() {
    // 重置游戏状态
    wheelContainer.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// 初始化游戏
init();