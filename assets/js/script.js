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

// Prevent arrow key scrolling
window.addEventListener("keydown", function(e) {
    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }
}, false);

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
        this.gameLoop = null;
        this.baseSpeed = 150;
        this.currentSpeed = this.baseSpeed;
        this.powerUpActive = false;
        this.powerUpTimer = null;
        this.powerUp = null;
        this.users = this.loadUsers();
        this.currentUser = '';

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.setupGame();
    }

    loadUsers() {
        const savedUsers = localStorage.getItem('snakeUsers');
        return savedUsers ? JSON.parse(savedUsers) : {};
    }

    saveUsers() {
        localStorage.setItem('snakeUsers', JSON.stringify(this.users));
    }

    setupGame() {
        // Create user profile elements
        const userSelect = document.createElement('select');
        userSelect.id = 'userSelect';
        userSelect.innerHTML = `<option value="">Select User</option>
            ${Object.keys(this.users).map(user => 
                `<option value="${user}">${user}</option>`
            ).join('')}`;

        const newUserInput = document.createElement('input');
        newUserInput.type = 'text';
        newUserInput.id = 'newUsername';
        newUserInput.placeholder = 'New username';

        const createUserBtn = document.createElement('button');
        createUserBtn.id = 'createUser';
        createUserBtn.textContent = 'Create User';

        const userControls = document.createElement('div');
        userControls.className = 'user-controls';
        userControls.appendChild(userSelect);
        userControls.appendChild(newUserInput);
        userControls.appendChild(createUserBtn);

        const gameContainer = document.querySelector('.game-container');
        gameContainer.insertBefore(userControls, gameContainer.firstChild);

        // Event listeners
        userSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                this.currentUser = e.target.value;
                document.getElementById('snakeHighScore').textContent = 
                    this.users[this.currentUser].highScore || 0;
            }
        });

        createUserBtn.addEventListener('click', () => {
            const username = newUserInput.value.trim();
            if (username && !this.users[username]) {
                this.users[username] = { highScore: 0 };
                this.saveUsers();
                userSelect.innerHTML += `<option value="${username}">${username}</option>`;
                newUserInput.value = '';
                userSelect.value = username;
                this.currentUser = username;
            }
        });

        document.getElementById('startSnake').addEventListener('click', () => {
            if (!this.currentUser) {
                alert('Please select or create a user profile first!');
                return;
            }
            if (this.gameLoop) {
                this.pauseGame();
            } else {
                this.startGame();
            }
        });
    }

    generateFood() {
        const food = {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)),
            type: Math.random() < 0.2 ? 'powerUp' : 'regular'
        };
        return food;
    }

    drawSnake() {
        this.ctx.fillStyle = this.powerUpActive ? '#FF6B6B' : '#4834D4';
        this.snake.forEach((segment, index) => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
    }

    drawFood() {
        this.ctx.fillStyle = this.food.type === 'powerUp' ? '#2ECC71' : '#FFC312';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }

    moveSnake() {
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Wall wrapping
        if (head.x >= this.canvas.width / this.gridSize) head.x = 0;
        if (head.x < 0) head.x = (this.canvas.width / this.gridSize) - 1;
        if (head.y >= this.canvas.height / this.gridSize) head.y = 0;
        if (head.y < 0) head.y = (this.canvas.height / this.gridSize) - 1;

        // Check collision with self
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            if (this.food.type === 'powerUp') {
                this.activateSlowPowerUp();
            }
            this.score += this.powerUpActive ? 30 : 10;
            if (this.score > this.users[this.currentUser].highScore) {
                this.users[this.currentUser].highScore = this.score;
                this.saveUsers();
                document.getElementById('snakeHighScore').textContent = this.score;
            }
            document.getElementById('snakeScore').textContent = this.score;
            this.food = this.generateFood();
            this.currentSpeed = Math.max(50, this.baseSpeed - (this.snake.length * 0.5));
        } else {
            this.snake.pop();
        }
    }

    activateSlowPowerUp() {
        this.powerUpActive = true;
        this.currentSpeed = this.baseSpeed * 1.5; // Slow down
        
        if (this.powerUpTimer) {
            clearTimeout(this.powerUpTimer);
        }
        
        this.powerUpTimer = setTimeout(() => {
            this.powerUpActive = false;
            this.currentSpeed = Math.max(50, this.baseSpeed - (this.snake.length * 0.5));
        }, 10000); // 10 seconds
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.powerUpActive = false;
        if (this.powerUpTimer) {
            clearTimeout(this.powerUpTimer);
        }
        alert(`Game Over! Score: ${this.score}`);
        this.reset();
    }

    reset() {
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.score = 0;
        this.currentSpeed = this.baseSpeed;
        this.food = this.generateFood();
        document.getElementById('snakeScore').textContent = '0';
    }

    startGame() {
        if (this.gameLoop) return;
        this.gameLoop = setInterval(() => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.moveSnake();
            this.drawFood();
            this.drawSnake();
        }, this.currentSpeed);
        document.getElementById('startSnake').textContent = 'Pause';
    }

    pauseGame() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        document.getElementById('startSnake').textContent = 'Resume';
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

// Rating System
class RatingSystem {
    constructor() {
        this.ratings = this.loadRatings();
        this.setupRatingForms();
    }

    loadRatings() {
        return JSON.parse(localStorage.getItem('ratings') || '[]');
    }

    saveRating(rating) {
        const ratings = this.loadRatings();
        ratings.push({
            ...rating,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('ratings', JSON.stringify(ratings));
    }

    calculateAverageRating() {
        const ratings = this.loadRatings();
        if (ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, curr) => acc + parseInt(curr.rating), 0);
        return (sum / ratings.length).toFixed(1);
    }

    setupRatingForms() {
        // Quick Feedback Form
        const quickFeedbackForm = document.getElementById('quickFeedbackForm');
        if (quickFeedbackForm) {
            quickFeedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(quickFeedbackForm);
                const rating = {
                    name: formData.get('username'),
                    rating: formData.get('rating'),
                    comments: formData.get('comments'),
                    type: 'quick'
                };

                this.saveRating(rating);
                this.updateRatingDisplays();
                this.showSuccessMessage(quickFeedbackForm, 'Thank you for your feedback!');
                quickFeedbackForm.reset();
            });
        }

        // Main Feedback Form
        const mainFeedbackForm = document.getElementById('feedbackForm');
        if (mainFeedbackForm) {
            mainFeedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(mainFeedbackForm);
                const rating = {
                    name: formData.get('username'),
                    rating: formData.get('rating'),
                    comments: formData.get('comments'),
                    type: 'detailed'
                };

                this.saveRating(rating);
                this.updateRatingDisplays();
                this.showSuccessMessage(mainFeedbackForm, 'Thank you for your detailed feedback!');
                mainFeedbackForm.reset();
            });
        }

        // Initial rating displays update
        this.updateRatingDisplays();
    }

    updateRatingDisplays() {
        const averageRating = this.calculateAverageRating();
        const ratingDisplays = document.querySelectorAll('.average-rating');
        ratingDisplays.forEach(display => {
            display.textContent = `Average Rating: ${averageRating}/5`;
        });

        // Update rating counts
        const ratings = this.loadRatings();
        const ratingCounts = document.querySelectorAll('.rating-count');
        ratingCounts.forEach(count => {
            count.textContent = `Total Ratings: ${ratings.length}`;
        });
    }

    showSuccessMessage(form, message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'feedback-success';
        successMessage.textContent = message;
        form.appendChild(successMessage);

        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }
}

// Movie section data
const movies = [
    {
        title: "The Matrix",
        genre: "Sci-Fi/Action",
        description: "A computer programmer discovers a mysterious world of digital reality and human imprisonment.",
        rating: 4.8
    },
    {
        title: "Inception",
        genre: "Sci-Fi/Thriller",
        description: "A skilled thief enters dreams to steal secrets but faces his greatest challenge yet.",
        rating: 4.7
    },
    {
        title: "The Dark Knight",
        genre: "Action/Drama",
        description: "Batman faces his greatest nemesis while protecting Gotham City from chaos.",
        rating: 4.9
    },
    {
        title: "Pulp Fiction",
        genre: "Crime/Drama",
        description: "Interconnected stories of Los Angeles criminals, small-time mobsters, and a mysterious briefcase.",
        rating: 4.8
    },
    {
        title: "The Shawshank Redemption",
        genre: "Drama",
        description: "A banker, wrongly imprisoned, builds a unique friendship while never losing hope.",
        rating: 4.9
    }
];

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set default tab
    document.getElementById('home').style.display = 'block';
    document.querySelector('.tab-link').classList.add('active');

    // Initialize games
    const snakeGame = new SnakeGame();
    const passwordGame = new PasswordGame();

    // Initialize movie section
    const movieSection = document.getElementById('movies');
    if (movieSection) {
        const movieContainer = document.createElement('div');
        movieContainer.className = 'movie-grid';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <h3>${movie.title}</h3>
                <p class="genre">${movie.genre}</p>
                <p class="description">${movie.description}</p>
                <div class="rating">Rating: ${movie.rating}/5 ★</div>
            `;
            movieContainer.appendChild(movieCard);
        });
        
        movieSection.appendChild(movieContainer);
    }
});
