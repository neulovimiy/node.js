// Получаем кнопки главного меню
let singlePlayerButton = document.getElementById("singlePlayerButton");
let onlineButton = document.getElementById("onlineButton");
let startScreen = document.querySelector(".start-screen");
// Обработчик события для кнопки "Одиночная игра"
singlePlayerButton.addEventListener("click", function () {
    window.location.href = '/game';
});
// Обработчик события для кнопки "Онлайн"
document.getElementById('onlineButton').addEventListener('click', function() {
    window.location.href = '/gameOnline'; // перенаправление на страницу /expectation
});
document.getElementById('leaderboardButton').addEventListener('click', function() {
    window.location.href = '/record';
});
document.getElementById('winboardButton').addEventListener('click', function() {
    window.location.href = '/wintable';
});
