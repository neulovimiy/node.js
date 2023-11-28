// Получаем кнопки главного меню
let singlePlayerButton = document.getElementById("singlePlayerButton");
let onlineButton = document.getElementById("onlineButton");
let startScreen = document.querySelector(".start-screen");

// Обработчик события для кнопки "Одиночная игра"
// При нажатии на кнопку "Одиночная игра"

singlePlayerButton.addEventListener("click", function () {
    window.location.href = '/game';
});


// Обработчик события для кнопки "Онлайн"
onlineButton.addEventListener("click", function () {
    // Обработка для режима онлайн
    // Добавьте вашу логику для онлайн-режима здесь
    // Например, переход к онлайн-игре или открытие веб-приложения
});
document.getElementById('leaderboardButton').addEventListener('click', function() {
    window.location.href = '/record';
});
