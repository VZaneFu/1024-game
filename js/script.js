document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const scoreDisplay = document.getElementById('score');
    const newGameButton = document.getElementById('new-game-button');
    const tryAgainButton = document.getElementById('try-again-button');
    const keepGoingButton = document.getElementById('keep-going-button');
    const gameOverMessage = document.getElementById('game-over');
    const gameWonMessage = document.getElementById('game-won');
    
    let grid = [];
    let score = 0;
    let gameOver = false;
    let gameWon = false;
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        grid = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        score = 0;
        gameOver = false;
        gameWon = false;
        scoreDisplay.textContent = score;
        gameOverMessage.style.display = 'none';
        gameWonMessage.style.display = 'none';
        
        // 清空网格
        gridContainer.innerHTML = '';
        
        // 创建网格单元格
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            gridContainer.appendChild(cell);
        }
        
        // 添加两个初始方块
        addRandomTile();
        addRandomTile();
        
        // 更新视图
        updateView();
    }
    
    // 添加随机方块
    function addRandomTile() {
        if (isFull()) return;
        
        let emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    // 检查网格是否已满
    function isFull() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) return false;
            }
        }
        return true;
    }
    
    // 检查是否可以移动
    function canMove() {
        // 检查是否有空格
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) return true;
            }
        }
        
        // 检查水平相邻是否有相同值
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i][j] === grid[i][j + 1]) return true;
            }
        }
        
        // 检查垂直相邻是否有相同值
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === grid[i + 1][j]) return true;
            }
        }
        
        return false;
    }
    
    // 更新视图
    function updateView() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = grid[i][j];
                const cellIndex = i * 4 + j;
                const cell = gridContainer.children[cellIndex];
                
                // 清除现有方块
                while (cell.firstChild) {
                    cell.removeChild(cell.firstChild);
                }
                
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    cell.appendChild(tile);
                }
            }
        }
    }
    
    // 移动方块
    function move(direction) {
        if (gameOver) return;
        
        let moved = false;
        
        // 创建网格副本用于比较
        const previousGrid = JSON.parse(JSON.stringify(grid));
        
        switch (direction) {
            case 'up':
                for (let j = 0; j < 4; j++) {
                    let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
                    let result = moveColumn(column);
                    for (let i = 0; i < 4; i++) {
                        grid[i][j] = result[i];
                    }
                }
                break;
            case 'right':
                for (let i = 0; i < 4; i++) {
                    let row = grid[i].slice();
                    row.reverse();
                    let result = moveRow(row);
                    result.reverse();
                    grid[i] = result;
                }
                break;
            case 'down':
                for (let j = 0; j < 4; j++) {
                    let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
                    column.reverse();
                    let result = moveColumn(column);
                    result.reverse();
                    for (let i = 0; i < 4; i++) {
                        grid[i][j] = result[i];
                    }
                }
                break;
            case 'left':
                for (let i = 0; i < 4; i++) {
                    grid[i] = moveRow(grid[i].slice());
                }
                break;
        }
        
        // 检查是否有移动
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] !== previousGrid[i][j]) {
                    moved = true;
                    break;
                }
            }
            if (moved) break;
        }
        
        if (moved) {
            addRandomTile();
            updateView();
            
            // 检查游戏状态
            checkGameStatus();
        }
    }
    
    // 移动行
    function moveRow(row) {
        // 移除零
        let newRow = row.filter(val => val !== 0);
        
        // 合并相同的数字
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                newRow[i + 1] = 0;
                score += newRow[i];
                
                // 检查是否达到1024
                if (newRow[i] === 1024 && !gameWon) {
                    gameWon = true;
                    gameWonMessage.style.display = 'flex';
                }
            }
        }
        
        // 再次移除零
        newRow = newRow.filter(val => val !== 0);
        
        // 填充零
        while (newRow.length < 4) {
            newRow.push(0);
        }
        
        scoreDisplay.textContent = score;
        return newRow;
    }
    
    // 移动列
    function moveColumn(column) {
        // 将列视为行处理
        return moveRow(column);
    }
    
    // 检查游戏状态
    function checkGameStatus() {
        if (!canMove()) {
            gameOver = true;
            gameOverMessage.style.display = 'flex';
        }
    }
    
    // 键盘事件监听
    document.addEventListener('keydown', event => {
        if (gameOver && !gameWon) return;
        
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                move('up');
                break;
            case 'ArrowRight':
                event.preventDefault();
                move('right');
                break;
            case 'ArrowDown':
                event.preventDefault();
                move('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                move('left');
                break;
        }
    });
    
    // 触摸事件支持
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    gridContainer.addEventListener('touchstart', event => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    });
    
    gridContainer.addEventListener('touchend', event => {
        touchEndX = event.changedTouches[0].clientX;
        touchEndY = event.changedTouches[0].clientY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑动
            if (dx > 0) {
                move('right');
            } else {
                move('left');
            }
        } else {
            // 垂直滑动
            if (dy > 0) {
                move('down');
            } else {
                move('up');
            }
        }
    }
    
    // 按钮事件监听
    newGameButton.addEventListener('click', initGame);
    tryAgainButton.addEventListener('click', initGame);
    keepGoingButton.addEventListener('click', () => {
        gameWonMessage.style.display = 'none';
    });
    
    // 初始化游戏
    initGame();
});