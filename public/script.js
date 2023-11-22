let canvas = document.getElementById("canvas");
let startScreen = document.querySelector(".start-screen");
let singlePlayerButton = document.getElementById("singlePlayerButton");
let onlineButton = document.getElementById("onlineButton");
let restartButton = document.getElementById("restartButton");
let ctx = canvas.getContext("2d");
let isPaused = false;
let isGameStarted = false;
let isGameOver = false;
let lives = 1; // Three lives
let score = 0; // Score instead of rating
let okLeft = false;
let okRight = false;
let okUp = false;
let okDown = false;
let canDrawHeart = true; 


// Images and their initial positions
let line = new Image();
line.src = "img/line.png";
line.X = 180;
line.Y = -140;

let line2 = new Image();
line2.src = "img/line.png";
line2.X = 180;
line2.Y = 160;

let pause = new Image();
pause.src = "img/pause.png"
pause.X = 154;
pause.Y = 200;

let heart = new Image();
heart.src = "img/heart.png";
heart.X = 100;
heart.Y = 100;

let myCar = new Image();
myCar.src = "img/myCar.png";
myCar.X = 158;
myCar.Y = 400;

let enemyCar1 = new Image();
enemyCar1.src = "img/enCar1.png";
enemyCar1.X = 50;
enemyCar1.Y = -150;

let enemyCar2 = new Image();
enemyCar2.src = "img/enCar2.png";
enemyCar2.X = 250;
enemyCar2.Y = -450;

// Audio elements
let myReq;
let currentAnimation;
let accident = new Audio();
let scoreSound = new Audio('audio/dobavlenie.mp3');
let end = new Audio();
let bonus = new Audio();
bonus.src = "audio/bonus.mp3";
accident.src = "audio/accident.mp3";
end.src = "audio/end.mp3";
// Добавьте переменную для хранения рекорда
let record = 0;
// Функция для обновления рекорда
function updateRecord() {
    if (score > record) {
        record = score;
        // Обновление текста с рекордом над игровым окном
        document.getElementById('recordDisplay').innerText = "Рекорд: " + record;
    }
}


// Event listener for single-player button
singlePlayerButton.addEventListener("click", function () {
    if (!isGameStarted && !isGameOver) {
        if (currentAnimation) {
            cancelAnimationFrame(currentAnimation);
        }
        isGameStarted = true;
        lives = 1;
        score = 0;
        myCar.X = 158;
        myCar.Y = 400;
        startScreen.style.display = "none";
        canvas.style.display = "block";
        restartButton.style.display = "none";  // Hide restart button
        currentAnimation = requestAnimationFrame(render);
    }
});

// Event listener for online button
onlineButton.addEventListener("click", function () {
    if (!isGameStarted && !isGameOver) {
        // Your code for "Online" mode goes here
    }
});

// Event listener for restart button
restartButton.addEventListener("click", function () {
    if (isGameOver) {
        if (currentAnimation) {
            cancelAnimationFrame(currentAnimation);
        }
        isGameOver = false;
        lives = 1;
        score = 0;
        myCar.X = 158;
        myCar.Y = 400;
        canDrawHeart = true; // Reset the flag to allow heart drawing
        startScreen.style.display = "none";
        canvas.style.display = "block";
        restartButton.style.display = "none";
        currentAnimation = requestAnimationFrame(render);
    }
});

// Function to stop the game
function stop() {
    cancelAnimationFrame(myReq);
    ctx.font = "40px Arial";
    ctx.fillStyle = "Red";
    ctx.fillText("Game over", 100, 200);
    isGameOver = true;
    restartButton.style.display = "block"; 
    updateRecord();// Show the restart button
}

// Function to check collision between two cars
function checkCollision(car1, car2) {
    return car1.Y < car2.Y + 100 && car1.Y + 100 > car2.Y && car1.X < car2.X + 65 && car1.X + 65 > car2.X;
}

// Function to draw the background rectangle
function drawRect() {
    ctx.fillStyle = "Gray";
    ctx.fillRect(0, 0, 400, 500);
}

// Function to draw lives and score
function drawLives() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "White";
    ctx.fillText("Жизни: " + lives, 235, 48);
    ctx.fillText("Счет: " + score, 35, 48);
}

// Function to draw road lines
function drawLines() {
    ctx.drawImage(line, line.X, line.Y);
    line.Y += 3;
    if (line.Y > 500) {
        line.Y = -140;
    }

    ctx.drawImage(line2, line2.X, line2.Y);
    line2.Y += 3;
    if (line2.Y > 500) {
        line2.Y = -140;
    }
}

// Function to draw the player's car
function drawMyCar() {
    if (isGameStarted) {
        if (okLeft === true && myCar.X > 0) {
            myCar.X -= 10;
        }
        if (okRight === true && myCar.X < 335) {
            myCar.X += 10;
        }
        if (okUp === true && myCar.Y > 0) {
            myCar.Y -= 5;
        }
        if (okDown === true && myCar.Y < 400) {
            myCar.Y += 5;
        }
    }
    ctx.drawImage(myCar, myCar.X, myCar.Y);
}

// Function to draw the heart bonus
function drawHeart() {
    if (isGameStarted && score > 1 && canDrawHeart) {
        let carCenterX = myCar.X + myCar.width / 2;
        let carCenterY = myCar.Y + myCar.height / 2;

        let heartCenterX = heart.X + heart.width / 2;
        let heartCenterY = heart.Y + heart.height / 2;

        let distanceX = Math.abs(carCenterX - heartCenterX);
        let distanceY = Math.abs(carCenterY - heartCenterY);

        let carRadius = (myCar.width + myCar.height) / 4; // Car radius
        let heartRadius = (heart.width + heart.height) / 4; // Heart radius

        if (distanceX < carRadius + heartRadius && distanceY < carRadius + heartRadius) {
            crash = true;
            heart.X = Math.floor(Math.random() * 335); // Random horizontal position
            heart.Y = -100; // Initial position above the visible area
            if (lives >= 1) {
                lives++;
                bonus.play();
                lifeLost = true; // Set the life lost flag
            }
            if (lives === 3) {
                canDrawHeart = false; // Set the flag to prevent further heart drawing
            }
            if (lives === 0) {
                stop();
                end.play();
            }
        } else {
            crash = false;
        }

        if (!crash) {
            ctx.drawImage(heart, heart.X, heart.Y);

            // Check if the heart has gone beyond the bottom edge
            if (heart.Y >= 500) {
                // Return the heart to the top edge and set a new X coordinate
                heart.X = Math.floor(Math.random() * 335); // Random horizontal position
                heart.Y = -100; // Initial position above the visible area
                lifeLost = false; // Reset the life lost flag
            }

            heart.Y += Math.ceil((score + 1) / 5);
        }
    }
}

// Function to generate a random X position for a car, avoiding collisions with existing cars
function generateRandomCarPosition(existingCars) {
    let newX;
    do {
        newX = Math.floor(Math.random() * 335);
    } while (existingCars.some(car => Math.abs(newX - car.X) < 50)); // Check for collision with existing cars
    return newX;
}

// Function to draw the first enemy car
function drawEnemyCar1() {
    if (isGameStarted) {
        if (checkCollision(myCar, enemyCar1)) {
            crash = true;
            enemyCar1.Y = myCar.Y - 500;
            enemyCar1.X = generateRandomCarPosition([enemyCar2]); // Pass the existing car for collision checking

            if (lives !== 1) {
                lives = lives - 1;
                accident.play();
            } else if (lives === 1) {
                lives = lives - 1;
            }
            if (lives < 1) {
                stop();
                end.play();
            }
        } else {
            crash = false;
        }

        if (!crash) {
            ctx.drawImage(enemyCar1, enemyCar1.X, enemyCar1.Y);
            enemyCar1.Y += Math.ceil((score + 1) / 5);
        }
    }
}

// Function to draw the second enemy car
function drawEnemyCar2() {
    if (isGameStarted) {
        if (checkCollision(myCar, enemyCar2)) {
            crash = true;
            enemyCar2.Y = myCar.Y - 500;
            enemyCar2.X = generateRandomCarPosition([enemyCar1]); // Pass the existing car for collision checking

            if (lives !== 1) {
                lives = lives - 1;
                accident.play();
            } else if (lives === 1) {
                lives = lives - 1;
            }
            if (lives < 1) {
                stop();
                end.play();
            }
        } else {
            crash = false;
        }

        if (!crash) {
            ctx.drawImage(enemyCar2, enemyCar2.X, enemyCar2.Y);
            enemyCar2.Y += Math.ceil((score + 1) / 5);
        }
    }
}

// Function to handle score updates
function ochki() {
    if (enemyCar1.Y >= 500 || enemyCar2.Y >= 500) {
        score = score + 1;
        scoreSound.play();
        if (enemyCar1.Y >= 500) {
            enemyCar1.Y = -100;
            enemyCar1.X = Math.floor(Math.random() * 335);
        } else if (enemyCar2.Y >= 500) {
            enemyCar2.Y = -100;
            enemyCar2.X = Math.floor(Math.random() * 335);
        }
    }
}

// Main rendering function
function render() {
    if (isGameOver) {
        return;
    }

    if (!isPaused) {
        drawRect();
        drawLines();
        drawMyCar();
        drawHeart();
        drawEnemyCar1();
        drawEnemyCar2();
        drawLives();
        ochki();
    }
    if (isPaused) {
        ctx.drawImage(pause, pause.X, pause.Y);
    }

    currentAnimation = requestAnimationFrame(render);
}

// Initial rendering call
render();

// Event listeners for keydown and keyup events
addEventListener("keydown", function (event) {
    if (isGameStarted) {
        let newDirect = event.keyCode;
        if (newDirect === 37 || newDirect === 65) {
            okLeft = true;
        }
        if (newDirect === 38 || newDirect === 87) {
            okUp = true;
        }
        if (newDirect === 39 || newDirect === 68) {
            okRight = true;
        }
        if (newDirect === 40 || newDirect === 83) {
            okDown = true;
        }
        if (newDirect === 32) {
            isPaused = !isPaused;
        }
    }
});
// Handle key release events to stop the corresponding car movement
addEventListener("keyup", function (event) {
    if (isGameStarted) {
        let newDirection = event.keyCode;
        // Check the released key and update the corresponding movement flag to false
        if (newDirection === 37 || newDirection === 65) {
            okLeft = false;
        }
        if (newDirection === 38 || newDirection === 87) {
            okUp = false;
        }
        if (newDirection === 39 || newDirection === 68) {
            okRight = false;
        }
        if (newDirection === 40 || newDirection === 83) {
            okDown = false;
        }
    }
});