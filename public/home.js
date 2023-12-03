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
    window.location.href = '/expectation'; // перенаправление на страницу /expectation
});
document.getElementById('leaderboardButton').addEventListener('click', function() {
    window.location.href = '/record';
});
const socket = new WebSocket('ws://localhost:3000');

// В home.js
socket.onopen = function(e) {
  console.log("Connection established!");
  socket.send(JSON.stringify({ type: 'username', name: username }));
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
  } else {
    // например, сервер процесс убил или сеть недоступна
    console.log('Connection died');
  }
};
socket.onerror = function(error) {
  console.log(`WebSocket error: ${error.message}`);
};
