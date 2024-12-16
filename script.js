// Tab Navigation
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Snake Game
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.speed = 100;

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('startSnake').addEventListener('click', () => {
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameLoop = null;
                document.getElementById('startSnake').textContent = 'Start Game';
            } else {
                this.startGame();
                document.getElementById('startSnake').textContent = 'Pause Game';
            }
        });
    }

    generateFood() {
        return {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
        };
    }

    handleKeyPress(event) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };
        const newDirection = keyMap[event.key];
        if (newDirection) {
            const opposites = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };
            if (opposites[newDirection] !== this.direction) {
                this.direction = newDirection;
            }
        }
    }

    startGame() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.speed);
    }

    update() {
        const head = {...this.snake[0]};
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('snakeScore').textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#27ae60';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
        document.getElementById('startSnake').textContent = 'Start New Game';
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.score = 0;
        document.getElementById('snakeScore').textContent = this.score;
    }
}

// Memory Game
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.symbols = ['🌟', '🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪'];
        this.setupGame();
    }

    setupGame() {
        const gameContainer = document.getElementById('memoryGame');
        this.cards = [...this.symbols, ...this.symbols]
            .sort(() => Math.random() - 0.5);
        
        gameContainer.innerHTML = '';
        this.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back">${symbol}</div>
                </div>
            `;
            card.addEventListener('click', () => this.flipCard(card));
            gameContainer.appendChild(card);
        });

        document.getElementById('memoryMoves').textContent = '0';
        this.moves = 0;
        this.matchedPairs = 0;
    }

    flipCard(card) {
        if (this.flippedCards.length === 2 || 
            card.classList.contains('flipped') || 
            card.classList.contains('matched')) return;

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            document.getElementById('memoryMoves').textContent = this.moves;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = this.cards[card1.dataset.index] === this.cards[card2.dataset.index];

        if (match) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            if (this.matchedPairs === this.symbols.length) {
                setTimeout(() => this.gameComplete(), 500);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 1000);
        }

        this.flippedCards = [];
    }

    gameComplete() {
        alert(`Congratulations! You completed the game in ${this.moves} moves!`);
    }
}

// Initialize games when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set default tab
    document.getElementById('home').style.display = 'block';
    document.querySelector('.tab-link').classList.add('active');

    // Initialize games
    const snakeGame = new SnakeGame();
    const memoryGame = new MemoryGame();

    // Reset Memory Game button
    document.getElementById('resetMemory').addEventListener('click', () => {
        memoryGame.setupGame();
    });
});
