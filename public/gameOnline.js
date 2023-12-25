// Retrieving canvas elements for local and remote players
let localCanvas = document.getElementById("canvasLocal");
let localContext = localCanvas.getContext("2d");
let remoteCanvas = document.getElementById("canvasRemote");
let remoteContext = remoteCanvas.getContext("2d");
// Initializing game state variables
let isLocalPaused = false;
let isLocalGameOver = false;
let localLives = 1;
let localScore = 0; // Score instead of rating
// Variables for tracking player movement
let okLeft = false;
let okRight = false;
let okUp = false;
let okDown = false;
// Retrieving the exit button element
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

// Функция обратного вызова для отрисовки локального игрока
const localRenderCallback = function() {
    // Запрашиваем анимацию и передаем объект с параметрами для отрисовки
    render({
        ctx: localContext,  // Контекст канваса для локального игрока
        isGameOver: isLocalGameOver,  // Состояние окончания игры
        car: myCar,  // Объект машины игрока
        // Флаги направления движения
        isLeft: okLeft,
        isRight: okRight,
        isUp: okUp,
        isDown: okDown,
        isPaused: isLocalPaused,  // Состояние паузы игры
        score: localScore,  // Счет игрока
        lives: localLives,  // Количество жизней игрока
        callback: localRenderCallback,  // Функция обратного вызова для непрерывной анимации
        // Callback-функции для обновления счета и количества жизней
        livesCallback: currLives => localLives = currLives,
        scoreCallback: currScore => localScore = currScore,
    });
};
// Параметры для отрисовки локального игрока
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

let accident = new Audio();
let scoreSound = new Audio('audio/dobavlenie.mp3');
let end = new Audio();
let bonus = new Audio();
bonus.src = "audio/bonus.mp3";
accident.src = "audio/accident.mp3";
end.src = "audio/end.mp3";

const interval = setInterval(() => {
    if(isLocalGameOver) {
        socket.emit('end-game');
        clearInterval(interval);
    }
}, 10);

// Function to stop the game
function stop(ctx, isLocalPlayer) {
    if(isLocalPlayer){
        isLocalGameOver = true;  // Установка флага окончания игры для локального игрока
    } else {
        isRemoteGameOver = true; // Установка флага окончания игры для удаленного игрока
    }
    exitButton.style.display="block";  // Отображение кнопки выхода
    exitButton.addEventListener("click", function(){
        window.location.href = "/home";  // Перенаправление на домашнюю страницу при клике на кнопку
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
    if(score !== undefined) ctx.fillText("Счет: " + score, 35, 48);
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

// Function to generate a random X position for a car, avoiding collisions with existing cars
function generateRandomCarPosition(existingCars) {
    let newX;
    do {
        newX = Math.floor(Math.random() * 335);
    } while (existingCars.some(car => Math.abs(newX - car.X) < 50)); // Check for collision with existing cars
    return newX;
}
let k1=0;
let k2=0;
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
            socket.emit('collision', { player: 'local' });
            crash = true;
            enemyCar1.Y = myCar.Y - 500;
            enemyCar1.X = generateRandomCarPosition([enemyCar2]); // Pass the existing car for collision checking
            lives=lives-1;
            k1=k1+1;
            if (lives === 0) {
                callback(0);
                stop(ctx, true);
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
            socket.emit('collision', { player: 'local' });
            crash = true;
            enemyCar2.Y = myCar.Y - 500;
            enemyCar2.X = generateRandomCarPosition([enemyCar1]);

            lives = lives - 1;
            k2 = k2 + 1;
            if (lives === 0) {
                callback(0);
                stop(ctx, true);
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

// Основная функция рендеринга игры
function render({
    ctx,  // Контекст канваса для рисования
    isGameOver,  // Флаг окончания игры
    car,  // Объект автомобиля игрока
    isLeft, isRight, isUp, isDown,  // Направления движения автомобиля
    callback,  // Функция обратного вызова для анимации
    isPaused,  // Флаг паузы игры
    score,  // Текущий счет игрока
    lives,  // Количество жизней игрока
    scoreCallback,  // Callback для обновления счета
    livesCallback  // Callback для обновления жизней
}) {
if (isGameOver) {
return;  // Если игра окончена, прекращаем рендеринг
}
    socket.emit('score', score); // Отправка текущего счета на сервер
    requestAnimationFrame(() => {
        if (!isPaused) {
            // Ряд функций для рисования различных элементов игры на канвасе
            // Эти функции рисуют фон, линии,
            // автомобиль игрока, вражеские автомобили и жизни
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
        callback();// Вызов callback функции для непрерывной анимации
    });
    const data = localCanvas.toDataURL();// Преобразование канваса в строку данных
    socket.emit('data', data);// Отправка данных канваса на сервер
}
// Обработчик события получения данных от удаленного игрока
socket.on('data', (data) => {
    var img = new Image;
    img.onload = function(){
        remoteContext.drawImage(img,0,0); // Отрисовка полученного изображения на удаленном канвасе
    };
    img.src = data;
});
// Обработчик события получения счета от удаленного игрока
socket.on('score', (data) => {
    remoteScore = data;// Обновление счета удаленного игрока
});
// Обработчик события окончания игры
socket.on('end-game', () => {
    // Установка стилей и остановка игры для локального и удаленного игроков
    // Отображение результатов игры (победа/поражение)
    Promise.resolve()
        .then(() => {
            localContext.font = "40px Arial";
            remoteContext.font = "40px Arial";
        })
        .then(() => {
            // socket.on('data');
            if(localScore > remoteScore) {
                // fetch('/incrementUserWins', {
                //     method: 'post'
                // }).then(console.log).catch(console.error);
                localContext.fillStyle = "Green";
                localContext.fillText("Win", 165, 250);
                // remoteContext.fillStyle = "Red";
                // remoteContext.fillText("Lose", 155, 250);
            } 
            if(localScore <= remoteScore) {
                localContext.fillStyle = "Red";
                localContext.fillText("Lose", 155, 250);
                // remoteContext.fillStyle = "Green";
                // remoteContext.fillText("Win", 165, 250);
            }
            

            stop(localContext);
        });
});
// Initial rendering call
socket.on('start-game', () => {
    const timer = Math.floor(Math.random() * 4000);
    setTimeout(() => {
        render(localRenderOptions);
    }, timer);
});

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
