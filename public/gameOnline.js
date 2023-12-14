
let localCanvas = document.getElementById("canvasLocal");
let localContext = localCanvas.getContext("2d");
let remoteCanvas = document.getElementById("canvasRemote");
let remoteContext = remoteCanvas.getContext("2d");
let restartButton = document.getElementById("restartButton");
let isLocalPaused = false;
let isLocalGameOver = false;
let localLives = 1;
let localScore = 0; // Score instead of rating
let okLeft = false;
let okRight = false;
let okUp = false;
let okDown = false;
let canDrawHeart = true;
let exitButton = document.getElementById("exitButton");
// Images and their initial positions
let line = new Image();
const socket = io();


let isRemotePaused = false,
    isRemoteGameOver = false,
    remoteLives = 1,
    remoteScore = 0, // Score instead of rating
    isRemoteLeft = false,
    isRemoteRight = false,
    isRemoteUp = false,
    isRemoteDown = false;

const remoteCar = new Image();
remoteCar.src = "img/myCar.png";
remoteCar.X = 158;
remoteCar.Y = 400;


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

const localRenderCallback = function() {
    currentAnimation = requestAnimationFrame(() => render({
        ctx: localContext,
        isGameOver: isLocalGameOver,
        car: myCar,
        isLeft: okLeft,
        isRight: okRight,
        isUp: okUp,
        isDown: okDown,
        isPaused: isLocalPaused,
        score: localScore,
        lives: localLives,
        callback: localRenderCallback,
        livesCallback: currLives => localLives = currLives,
        scoreCallback: currScore => localScore = currScore,
    }));
};

const localRenderOptions = {
    car: myCar,
    ctx: localContext,
    isGameOver: isLocalGameOver,
    isLeft: okLeft,
    isRight: okRight,
    isUp: okUp,
    isDown: okDown,
    isPaused: isLocalPaused,
    score: localScore,
    lives: localLives,
    callback: localRenderCallback,
    livesCallback: currLives => localLives = currLives,
    scoreCallback: currScore => localScore = currScore,
};

const remoteRenderCallback = function() {
    currentAnimation = requestAnimationFrame(() => render({
        ctx: remoteContext,
        isGameOver: isRemoteGameOver,
        car: myCar,
        isLeft: okLeft,
        isRight: okRight,
        isUp: okUp,
        isDown: okDown,
        isPaused: isLocalPaused,
        score: remoteScore,
        lives: remoteLives,
        callback: remoteRenderCallback,
        livesCallback: currLives => remoteLives = currLives,
        scoreCallback: currScore => remoteScore = currScore,
    }));
};

const remoteRenderOptions = {
    car: myCar,
    ctx: remoteContext,
    isGameOver: isRemoteGameOver,
    isLeft: okLeft,
    isRight: okRight,
    isUp: okUp,
    isDown: okDown,
    isPaused: isLocalPaused,
    score: remoteScore,
    lives: remoteLives,
    callback: remoteRenderCallback,
    livesCallback: currLives => remoteLives = currLives,
    scoreCallback: currScore => remoteScore = currScore,
};


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
let recordDisplay = document.getElementById('recordDisplay');

// Функция для обновления рекорда
function updateRecord() {
    if (score >= record) {
        record = score;
        // Обновление текста с рекордом над игровым окном
        recordDisplay.innerText = "Рекорд:" + record;
        // Removed localStorage usage // Сохранение рекорда в localStorage
    }
}

// Проверка наличия рекорда в localStorage при начале игры
window.onload = function() {
    // Removed localStorage usage
    if (storedRecord) {
        // Removed localStorage usage // Загрузка рекорда из localStorage
        // Обновление текста с рекордом на странице
        recordDisplay.innerText = "Рекорд: " + record;
    }
};

// Event listener for restart button
restartButton.addEventListener("click", function () {
    if (isLocalGameOver) {
        if (currentAnimation) {
            cancelAnimationFrame(currentAnimation);
        }
        isLocalGameOver = false;
        localLives = 1;
        localScore = 0;
        myCar.X = 158;
        myCar.Y = 400;
        canDrawHeart = true;

        // Скрыть кнопку перезапуска
        restartButton.style.display = "none";
        exitButton.style.display = "none";

        // Сброс флагов движения машины
        okLeft = false;
        okRight = false;
        okUp = false;
        okDown = false;

        render(localRenderOptions);
    }
});

const interval = setInterval(() => {
    if(isLocalGameOver) {
        socket.emit('end-game');
        clearInterval(interval);
    }
}, 10);

// Function to stop the game
function stop(ctx) {
    cancelAnimationFrame(myReq);
    ctx.font = "40px Arial";
    ctx.fillStyle = "Red";
    ctx.fillText("Game over", 100, 200);
    isLocalGameOver = true;
    // restartButton.style.display = "block";
    exitButton.style.display="block"
    updateRecord();
    exitButton.addEventListener("click", function(){
        window.location.href = "/home";

    });
}

// Function to check collision between two cars
function checkCollision(car1, car2) {
    return car1.Y < car2.Y + 100 && car1.Y + 100 > car2.Y && car1.X < car2.X + 65 && car1.X + 65 > car2.X;
}

// Function to draw the background rectangle
function drawRect(ctx) {
    ctx.fillStyle = "Gray";
    ctx.fillRect(0, 0, 400, 500);
}

// Function to draw lives and score
function drawLives({
                       ctx,
                       lives,
                       score
                   }) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "White";
    ctx.fillText("Жизни: " + lives, 235, 48);
    ctx.fillText("Счет: " + score, 35, 48);
}

// Function to draw road lines
function drawLines(ctx) {
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
function drawCar({
                     car,
                     isGameOver,
                     isLeft,
                     isRight,
                     isUp,
                     isDown,
                     ctx
                 }) {

    if (isGameOver) return;

    if (!!isLeft && car.X > 0) {
        car.X -= 7.5;
    }
    if (!!isRight && car.X < 335) {
        car.X += 7.5;
    }
    if (!!isUp && car.Y > 0) {
        car.Y -= 5;
    }
    if (!!isDown && car.Y < 400) {
        car.Y += 5;
    }

    ctx.drawImage(car, car.X, car.Y);
}

// Function to draw the heart bonus
function drawHeart({
                       ctx,
                       lives,
                       score,
                       callback,
                       isGameOver
                   }) {
    if (!isGameOver && score > 30 && canDrawHeart) {
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
                callback(lives++);
                bonus.play();
                lifeLost = true; // Set the life lost flag
            }
            if (lives === 3) {
                canDrawHeart = false; // Set the flag to prevent further heart drawing
            }
            if (lives === 0) {
                stop(ctx);
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

            heart.Y += Math.ceil((score + 1) / 10);
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
function drawEnemyCar1({
                           ctx,
                           lives,
                           score,
                           callback,
                           isGameOver
                       }) {
    if (!isGameOver) {
        if (checkCollision(myCar, enemyCar1)) {
            crash = true;
            enemyCar1.Y = myCar.Y - 500;
            enemyCar1.X = generateRandomCarPosition([enemyCar2]); // Pass the existing car for collision checking

            if (lives !== 1) {
                callback(--lives);
                accident.play();
            } else if (lives === 1) {
                callback(--lives);
            }
            if (lives < 1) {
                stop(ctx);
                end.play();
            }
        } else {
            crash = false;
        }

        if (!crash) {
            ctx.drawImage(enemyCar1, enemyCar1.X, enemyCar1.Y);
            enemyCar1.Y += Math.ceil((score + 1) / 10);
        }
    }
}

// Function to draw the second enemy car
function drawEnemyCar2({
                           ctx,
                           lives,
                           score,
                           callback,
                           isGameOver
                       }) {
    if (!isGameOver) {
        if (checkCollision(myCar, enemyCar2)) {
            crash = true;
            enemyCar2.Y = myCar.Y - 500;
            enemyCar2.X = generateRandomCarPosition([enemyCar1]); // Pass the existing car for collision checking

            if (lives !== 1) {
                callback(lives - 1);
                accident.play();
            } else if (lives === 1) {
                callback(lives - 1);
            }
            if (lives < 1) {
                stop(ctx);
                end.play();
            }
        } else {
            crash = false;
        }

        if (!crash) {
            ctx.drawImage(enemyCar2, enemyCar2.X, enemyCar2.Y);
            enemyCar2.Y += Math.ceil((score + 1) / 10);
        }
    }
}

// Function to handle score updates
function ochki({
                   score,
                   callback
               }) {
    if (enemyCar1.Y >= 500 || enemyCar2.Y >= 500) {
        callback(score + 1); // Increment score
        // score = score + 1;
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
function render({
                    ctx,
                    isGameOver,
                    car,
                    isLeft,
                    isRight,
                    isUp,
                    isDown,
                    callback,
                    isPaused,
                    score,
                    lives,
                    scoreCallback,
                    livesCallback
                }) {
    if (isGameOver) {
        return;
    }

    socket.emit('score', score);

    if (!isPaused) {
        drawRect(ctx);
        drawLines(ctx);
        drawCar({
            car,
            isGameOver,
            isLeft,
            isRight,
            isUp,
            isDown,
            ctx
        });
        drawHeart({
            ctx,
            score,
            lives,
            isGameOver,
            callback: livesCallback
        });
        drawEnemyCar1({
            ctx,
            score,
            lives,
            isGameOver,
            callback: livesCallback
        });
        drawEnemyCar2({
            ctx,
            score,
            lives,
            isGameOver,
            callback: livesCallback
        });
        drawLives({
            ctx,
            score,
            lives,
        });
        ochki({
            score,
            callback: scoreCallback
        });
    }
    if (isPaused) {
        ctx.drawImage(pause, pause.X, pause.Y);
    }

    callback();

    const data = localCanvas.toDataURL();

    socket.emit('data', data);


}

socket.on('data', (data) => {
    var img = new Image;
    img.onload = function(){
        remoteContext.drawImage(img,0,0); // Or at whatever offset you like
    };
    img.src = data;
});

socket.on('score', (data) => {
    remoteScore = data;
})

socket.on('end-game', () => {
    localContext.font = "40px Arial";
    remoteContext.font = "40px Arial";

    stop(localContext);
    if(localScore > remoteScore) {
        localContext.fillStyle = "Green";
        localContext.fillText("Win", 100, 400);
        remoteContext.fillStyle = "Red";
        remoteContext.fillText("Lose", 100, 400);
    } else if(localScore < remoteScore) {
        localContext.fillStyle = "Red";
        localContext.fillText("Lose", 100, 400);
        remoteContext.fillStyle = "Green";
        remoteContext.fillText("Win", 100, 400);
    }
});

// Initial rendering call

// const startGameBTN = document.querySelector('#start-game');
socket.on('start-game', () => {
    const timer = Math.floor(Math.random() * 4000);
    setTimeout(() => {
        render(localRenderOptions);
    }, timer);
});

// startGameBTN.onclick = () => {
//     socket.emit('start-game');
//     render(localRenderOptions);
// }

// render(remoteRenderOptions);

// Event listeners for keydown and keyup events
addEventListener("keydown", function (event) {
    if (!isLocalGameOver) {
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
        // if (newDirect === 32) {
        //     isLocalPaused = !isLocalPaused;
        // }
    }
});
// Handle key release events to stop the corresponding car movement
addEventListener("keyup", function (event) {
    if (!isLocalGameOver) {
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
// Функция для загрузки текущего рекорда пользователя с сервера
function fetchRecord() {
    fetch('/get-record')
        .then(response => response.json())
        .then(data => {
            record = data.record;
            recordDisplay.innerText = "Рекорд: " + record;
        })
        .catch(error => console.error('Error fetching record:', error));
}

// Функция для обновления рекорда на сервере
function updateServerRecord(newRecord) {
    fetch('/update-record', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ record: newRecord }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Record updated:', data);
        })
        .catch(error => console.error('Error updating record:', error));
}

// Изменение функции updateRecord для включения взаимодействия с сервером
function updateRecord() {
    if (localScore > record) {
        record = localScore;
        recordDisplay.innerText = "Рекорд: " + record;
        updateServerRecord(record); // Обновление рекорда на сервере
    }
}

// Запрос текущего рекорда пользователя при загрузке игры
window.onload = function() {
    fetchRecord();
};