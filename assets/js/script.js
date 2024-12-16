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

// Enhanced Snake Game
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameLoop = null;
        this.speed = 100;
        this.powerUp = null;
        this.powerUpActive = false;
        this.powerUpTimer = null;

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('startSnake').addEventListener('click', () => {
            if (this.gameLoop) {
                this.pauseGame();
            } else {
                this.startGame();
            }
        });

        // Update high score display
        document.getElementById('snakeHighScore').textContent = this.highScore;
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        // 20% chance to spawn a power-up instead of regular food
        if (Math.random() < 0.2) {
            this.powerUp = {
                x: newFood.x,
                y: newFood.y,
                type: Math.random() < 0.5 ? 'speed' : 'points'
            };
        } else {
            this.powerUp = null;
        }
        
        return newFood;
    }

    handleKeyPress(event) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };
        const newDirection = keyMap[event.key.toLowerCase()];
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
        document.getElementById('startSnake').textContent = 'Pause Game';
    }

    pauseGame() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        document.getElementById('startSnake').textContent = 'Resume Game';
        
        // Draw pause screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
    }

    update() {
        const head = {...this.snake[0]};
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Wall collision with portal effect
        if (head.x < 0) head.x = this.canvas.width / this.gridSize - 1;
        if (head.x >= this.canvas.width / this.gridSize) head.x = 0;
        if (head.y < 0) head.y = this.canvas.height / this.gridSize - 1;
        if (head.y >= this.canvas.height / this.gridSize) head.y = 0;

        // Self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Power-up collision
        if (this.powerUp && head.x === this.powerUp.x && head.y === this.powerUp.y) {
            this.activatePowerUp(this.powerUp.type);
            this.powerUp = null;
            this.food = this.generateFood();
        }
        // Food collision
        else if (head.x === this.food.x && head.y === this.food.y) {
            const points = this.powerUpActive ? 20 : 10;
            this.score += points;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('snakeHighScore', this.highScore);
                document.getElementById('snakeHighScore').textContent = this.highScore;
            }
            document.getElementById('snakeScore').textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    activatePowerUp(type) {
        this.powerUpActive = true;
        clearTimeout(this.powerUpTimer);
        
        switch(type) {
            case 'speed':
                const originalSpeed = this.speed;
                this.speed = this.speed / 2;
                clearInterval(this.gameLoop);
                this.startGame();
                this.powerUpTimer = setTimeout(() => {
                    this.speed = originalSpeed;
                    clearInterval(this.gameLoop);
                    this.startGame();
                    this.powerUpActive = false;
                }, 5000);
                break;
            case 'points':
                this.powerUpTimer = setTimeout(() => {
                    this.powerUpActive = false;
                }, 5000);
                break;
        }
    }

    draw() {
        // Draw background
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        // Draw snake
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize,
                (segment.y + 1) * this.gridSize
            );
            gradient.addColorStop(0, '#27ae60');
            gradient.addColorStop(1, '#2ecc71');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );

            // Draw eyes on head
            if (index === 0) {
                this.ctx.fillStyle = 'white';
                const eyeSize = this.gridSize / 6;
                const eyeOffset = this.gridSize / 3;
                
                // Left eye
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + eyeOffset,
                    segment.y * this.gridSize + eyeOffset,
                    eyeSize, 0, Math.PI * 2
                );
                this.ctx.fill();
                
                // Right eye
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize - eyeOffset,
                    segment.y * this.gridSize + eyeOffset,
                    eyeSize, 0, Math.PI * 2
                );
                this.ctx.fill();
            }
        });

        // Draw food or power-up
        if (this.powerUp) {
            const gradient = this.ctx.createRadialGradient(
                this.powerUp.x * this.gridSize + this.gridSize/2,
                this.powerUp.y * this.gridSize + this.gridSize/2,
                0,
                this.powerUp.x * this.gridSize + this.gridSize/2,
                this.powerUp.y * this.gridSize + this.gridSize/2,
                this.gridSize/2
            );
            
            if (this.powerUp.type === 'speed') {
                gradient.addColorStop(0, '#e74c3c');
                gradient.addColorStop(1, '#c0392b');
            } else {
                gradient.addColorStop(0, '#f1c40f');
                gradient.addColorStop(1, '#f39c12');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(
                this.powerUp.x * this.gridSize + this.gridSize/2,
                this.powerUp.y * this.gridSize + this.gridSize/2,
                this.gridSize/2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        } else {
            const gradient = this.ctx.createRadialGradient(
                this.food.x * this.gridSize + this.gridSize/2,
                this.food.y * this.gridSize + this.gridSize/2,
                0,
                this.food.x * this.gridSize + this.gridSize/2,
                this.food.y * this.gridSize + this.gridSize/2,
                this.gridSize/2
            );
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(1, '#c0392b');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                this.food.x * this.gridSize,
                this.food.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        }

        // Draw power-up status
        if (this.powerUpActive) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(0, 0, this.canvas.width, 5);
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        
        // Draw game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2 - 30);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 10);
        this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width/2, this.canvas.height/2 + 40);
        
        document.getElementById('startSnake').textContent = 'Start New Game';
        
        // Reset game state
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.score = 0;
        this.powerUpActive = false;
        clearTimeout(this.powerUpTimer);
        this.speed = 100;
        document.getElementById('snakeScore').textContent = this.score;
    }
}

// Password Strength Game
class PasswordGame {
    constructor() {
        this.passwordInput = document.getElementById('passwordInput');
        this.strengthMeter = document.getElementById('strengthMeter');
        this.feedback = document.getElementById('passwordFeedback');
        this.score = document.getElementById('securityScore');
        this.tips = document.getElementById('securityTips');
        
        this.passwordInput.addEventListener('input', () => this.checkPassword());
    }

    checkPassword() {
        const password = this.passwordInput.value;
        let strength = 0;
        let feedback = [];
        
        // Length check
        if (password.length < 8) {
            feedback.push('❌ Password should be at least 8 characters long');
        } else {
            strength += 20;
            feedback.push('✅ Good length');
        }
        
        // Uppercase check
        if (!/[A-Z]/.test(password)) {
            feedback.push('❌ Add uppercase letters');
        } else {
            strength += 20;
            feedback.push('✅ Contains uppercase letters');
        }
        
        // Lowercase check
        if (!/[a-z]/.test(password)) {
            feedback.push('❌ Add lowercase letters');
        } else {
            strength += 20;
            feedback.push('✅ Contains lowercase letters');
        }
        
        // Numbers check
        if (!/\d/.test(password)) {
            feedback.push('❌ Add numbers');
        } else {
            strength += 20;
            feedback.push('✅ Contains numbers');
        }
        
        // Special characters check
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            feedback.push('❌ Add special characters');
        } else {
            strength += 20;
            feedback.push('✅ Contains special characters');
        }
        
        // Common patterns check
        const commonPatterns = [
            '123', '456', '789', 'abc', 'qwerty', 'password',
            'admin', 'letmein', 'welcome'
        ];
        
        if (commonPatterns.some(pattern => 
            password.toLowerCase().includes(pattern))) {
            strength -= 20;
            feedback.push('⚠️ Avoid common patterns');
        }
        
        // Update UI
        this.strengthMeter.value = strength;
        this.strengthMeter.className = 
            strength <= 20 ? 'very-weak' :
            strength <= 40 ? 'weak' :
            strength <= 60 ? 'medium' :
            strength <= 80 ? 'strong' : 'very-strong';
            
        this.feedback.innerHTML = feedback.join('<br>');
        this.score.textContent = strength;
        
        // Show relevant tips
        let tips = ['Tips to improve your password:'];
        if (strength < 100) {
            if (password.length < 12) {
                tips.push('• Consider using a longer password');
            }
            if (!/[A-Z].*[A-Z]/.test(password)) {
                tips.push('• Use multiple uppercase letters');
            }
            if (!/\d.*\d/.test(password)) {
                tips.push('• Use multiple numbers');
            }
            if (!/[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                tips.push('• Use multiple special characters');
            }
            tips.push('• Consider using a passphrase instead of a password');
        } else {
            tips = ['Excellent password strength! Remember to:',
                   '• Use different passwords for different accounts',
                   '• Change passwords periodically',
                   '• Never share your passwords'];
        }
        this.tips.innerHTML = tips.join('<br>');
    }
}

// Initialize games when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set default tab
    document.getElementById('home').style.display = 'block';
    document.querySelector('.tab-link').classList.add('active');

    // Initialize games
    const snakeGame = new SnakeGame();
    const passwordGame = new PasswordGame();
});
