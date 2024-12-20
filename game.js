document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const collectFuelSound = new Audio('sound/collect-fuel.mp3');   

    const mainMusic = new Audio('sound/main-music.mp3');
    mainMusic.loop = true; 
    mainMusic.volume = 0.5; 
    collectFuelSound.volume = 1.0; 

    let isMuted = false;

    document.addEventListener('keydown', e => {
        if (e.key === 'm') { 
            isMuted = !isMuted;

            
            mainMusic.muted = isMuted;
            collectFuelSound.muted = isMuted;

            console.log(isMuted ? 'Son désactivé' : 'Son activé');
        }
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let isPlaying = false;
    let car = { 
        x: canvas.width / 2, 
        y: canvas.height - 150, 
        width: 60, 
        height: 100, 
        speed: 5, 
        angle: 0 
    };
    let roadLines = [];
    let roadSpeed = 7;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0; 
    let fuel = 50; 
    let fuelCans = []; 
    let keys = {}; 

    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highscore');
    const fuelElement = document.getElementById('fuel');
    const gameOverElement = document.getElementById('game-over');

    const carImage = new Image();
    carImage.src = 'img/car.png';

    const fuelCanImage = new Image();
    fuelCanImage.src = 'img/fuel_can.png';

    function initRoad() {
        roadLines = [];
        for (let i = 0; i < canvas.height / 40; i++) {
            roadLines.push({ x: canvas.width / 2 - 5, y: i * 40, width: 10, height: 20 });
        }
    }

    function drawCar() {
        ctx.save(); 
    
        const carCenterX = car.x + car.width / 2;
        const carCenterY = car.y + car.height / 2;
    
        ctx.translate(carCenterX, carCenterY);
        ctx.rotate(car.angle);
        ctx.translate(-carCenterX, -carCenterY);
    
        ctx.drawImage(carImage, car.x, car.y, car.width, car.height);
    
        ctx.restore(); 
    }

    function drawRoad() {
        ctx.fillStyle = 'white';
        roadLines.forEach(line => {
            ctx.fillRect(line.x, line.y, line.width, line.height);
        });
    }

    function updateCarPosition() {
        if (keys['ArrowLeft'] && car.x > 0) {
            car.x -= car.speed; 
            car.angle = -0.2;
        } else if (keys['ArrowRight'] && car.x + car.width < canvas.width) {
            car.x += car.speed;
            car.angle = 0.2; 
        } else {
            car.angle = 0; 
        }
    }
    
    function updateRoad() {
        roadLines.forEach(line => {
            line.y += roadSpeed;
            if (line.y > canvas.height) {
                line.y = -20;
            }
        });
    }

    function updateFuelCans() {
        fuelCans.forEach((can, index) => {
            can.y += can.speed;

            if (can.y > canvas.height) {
                fuelCans.splice(index, 1);
            }

            if (detectCollision(car, can)) {
                fuel += 10;
                if (fuel > 50) fuel = 50;
            
                collectFuelSound.play();
            
                fuelCans.splice(index, 1); 
            }
        });
    }

    function drawFuelCans() {
        fuelCans.forEach(can => {
            ctx.drawImage(fuelCanImage, can.x, can.y, can.width, can.height);
        });
    }

    function generateFuelCan() {
        const xPosition = Math.random() * (canvas.width - 40); 
        fuelCans.push({
            x: xPosition,
            y: -50,
            width: 90,
            height: 70,
            speed: roadSpeed
        });
    }

    function detectCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    function updateScoreAndFuel() {
        score += 0.01;
        fuel -= 0.03;

        scoreElement.textContent = `Distance : ${Math.floor(score)} km`;
        fuelElement.textContent = `Essence : ${fuel.toFixed(1)} L`;

        if (Math.floor(score) > highScore) {
            highScore = Math.floor(score);
            localStorage.setItem('highScore', highScore);
            highScoreElement.textContent = `Plus long voyage : ${highScore} km`;
        }

        if (fuel <= 0) {
            fuel = 0;
            stopGame('Essence épuisée');
        }
    }

    function stopGame(reason) {
        isPlaying = false;
    
        mainMusic.pause();
        mainMusic.currentTime = 0; 
    
        gameOverElement.textContent = `Game Over : ${reason}`;
        gameOverElement.style.display = 'block';
    }

    function gameLoop() {
        if (!isPlaying) return;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        drawRoad();
        updateRoad();
    
        drawFuelCans();
        updateFuelCans();
    
        updateCarPosition(); 
        drawCar();
    
        updateScoreAndFuel();
    
        if (Math.random() < 0.01) {
            generateFuelCan();
        }
    
        requestAnimationFrame(gameLoop);
    }
    

    document.addEventListener('keydown', e => {
        keys[e.key] = true; 
    });
    
    document.addEventListener('keyup', e => {
        keys[e.key] = false; 
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' && car.x > 0) car.x -= car.speed;
        if (e.key === 'ArrowRight' && car.x + car.width < canvas.width) car.x += car.speed;
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !isPlaying) {
            isPlaying = true;
    
            mainMusic.play();
    
            score = 0;
            fuel = 50;
            fuelCans = [];
            gameOverElement.style.display = 'none';
            highScoreElement.textContent = `Plus long voyage : ${highScore} km`;
            initRoad();
            gameLoop();
        }
    });
    
});
