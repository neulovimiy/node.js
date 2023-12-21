const express = require("express");  // Importing Express framework
const collection = require("./mongo");  // Importing MongoDB connection
const bcrypt = require('bcrypt');  // Importing bcrypt for password hashing
const session = require('express-session');  // Importing session middleware for Express
const app = express();  // Creating an Express application
const http = require("http");  // Importing HTTP module
const server = http.Server(app);  // Creating an HTTP server with the Express app
const { Server } = require('socket.io');  // Importing Socket.IO
const io = new Server(server);  // Creating a new Socket.IO server
const { v4: uuidv4 } = require('uuid');  // Importing UUID for unique identifier generation
const logger = require('./logger');  // Importing a custom logger module
// Function to get all active rooms
const getRooms = () => io.sockets.adapter.rooms;
// Функция для получения подробностей обо всех активных комнатах
const getRoomsWithDetails = () => {
    const rooms = [];  // Создаем массив для хранения информации о комнатах
    for(let [key, value] of getRooms()) {  // Перебираем все комнаты
        rooms.push({  // Добавляем информацию о каждой комнате в массив
            name: key,  // Название комнаты
            clients: value,  // Клиенты в комнате
            clientsSize: value.size,  // Количество клиентов в комнате
        });
    }
    return rooms;  // Возвращаем массив с информацией о комнатах
}
// Обработчик событий для передачи данных между клиентами в комнате
const onRoomData = (socket, roomName) => socket.on('data', (data) => {
    socket.broadcast.to(roomName).emit('data', data);  // Передача данных всем клиентам в комнате, кроме отправителя
});

// Обработчик события начала игры
const onStartGame = (socket, roomName) => socket.on('start-game', () => {
    socket.broadcast.to(roomName).emit('start-game');  // Уведомление всех клиентов в комнате о начале игры
});

// Обработчик события окончания игры
const onEndGame = (socket, roomName) => socket.on('end-game', () => {
    io.to(roomName).emit('end-game');  // Уведомление всех клиентов в комнате об окончании игры
    socket.leave(roomName);  // Выход клиента из комнаты
});

// Обработчик события обновления счета
const onScore = (socket, roomName) => socket.on('score', data => {
    socket.broadcast.to(roomName).emit('score', data);  // Передача информации о счете всем клиентам в комнате
});

// Обработка подключения нового клиента
io.on('connection', (socket) => {
    // Получаем информацию об активных игровых комнатах
    const roomsWithDetails = getRoomsWithDetails();
    const gameRooms = roomsWithDetails.filter(room => room.name.indexOf('game__') > -1);
    const roomWithOneClient = gameRooms.find(room => room.clientsSize === 1);
    // Если есть комната с одним клиентом, присоединяем к ней
    if(roomWithOneClient) {
        logger.debug('join');
        logger.debug('socketId: ', socket.id);
        socket.join(roomWithOneClient.name);
        // Установка обработчиков событий для комнаты
        onRoomData(socket, roomWithOneClient.name);
        onStartGame(socket, roomWithOneClient.name);
        io.emit('start-game');
        onEndGame(socket, roomWithOneClient.name);
        onScore(socket, roomWithOneClient.name);
    } else {
        // Если подходящей комнаты нет, создаем новую
        logger.debug('create');
        logger.debug('socketId: ', socket.id);
        const newRoomName = 'game__' + uuidv4();
        socket.join(newRoomName);
        // Установка обработчиков событий для новой комнаты
        onRoomData(socket, newRoomName);
        onStartGame(socket, newRoomName);
        onEndGame(socket, newRoomName);
        onScore(socket, newRoomName);
    }

    logger.debug(getRoomsWithDetails());
});

const APP_PORT = process.env.APP_PORT || 3000;

app.set("port", APP_PORT);
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'some-secret-value',
    resave: true,
    saveUninitialized: true,
    expires : new Date(Date.now() + 3600000),
}));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});
app.get("/wintable", async (req, res) => {
    try {
        const users = await collection.find({}).sort({ winsCount: -1 }); // Замените 'win' на название соответствующего поля в вашей базе данных
        res.render("wintable", { users: users });
    } catch (error) {
        logger.error('Ошибка при получении данных для таблицы побед:', error);
        res.redirect('/home');
    }
});
app.get("/expectation", (req, res) => {
    res.render("expectation");
});
app.get('/game', requireAuth, (req, res) => {
    if (req.session.user) {
        res.render('game');
    } else {
        res.redirect('/');
    }
});
app.get("/errorPassword", (req, res) => {
    res.render("errorPassword")
});
app.get("/unknown", (req, res) => {
    res.render("unknown")
});
app.get("/occupied", (req, res) => {
    res.render("occupied")
});

app.get('/gameOnline', function(req, res) {
    res.render('gameOnline');
});

app.get('/home', (req, res) => {
    // console.log('USER');
    // console.log(req.session.user);
    // Убедитесь, что пользователь авторизован и у вас есть данные пользователя
    if (req.session.user) {
        res.render('home', { user: req.session.user });
    } else {
        // Если пользователь не авторизован, перенаправьте его на страницу входа или другую страницу
        res.redirect('/');
    }
});

app.post('/incrementUserWins', async (req, res) => {
    const user = await collection.findOne({_id: req.session.user._id});
    await collection.updateOne({_id: req.session.user._id}, {winsCount: ++user.winsCount});
    logger.debug('WIN: ' + req.session.user.name);
});

app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password,
        record: 0
    }

    logger.debug(data);

    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.redirect('/occupied');
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        const userdata = await collection.insertMany(data);
        logger.debug(userdata);
        res.redirect("/");
    }
});

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.redirect('/unknown'); // Перенаправление на страницу ошибки
        }
        else{
            const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
            if (!isPasswordMatch) {
                res.redirect('/errorPassword');
            } else {
                req.session.user = check;
                res.redirect("/home");
            }
        }
    } catch {
        res.send("Wrong Details");
    }
});


function requireAuth(req, res, next) {
    if (!req.session.user) {
        res.redirect('/home'); // Если пользователь не авторизован, перенаправляем на /home
    } else {
        next();
    }
}

// Маршрут для получения текущего рекорда пользователя
app.get('/get-record', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Неавторизованный доступ' });
    }
    try {
        const user = await collection.findOne({ name: req.session.user.name });
        return res.json({ record: user.record });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ error: 'Ошибка сервера при получении рекорда' });
    }
});

// Маршрут для обновления рекорда пользователя
app.post('/update-record', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Неавторизованный доступ' });
    }
    try {
        const newRecord = req.body.record;
        await collection.updateOne(
            { name: req.session.user.name },
            { $set: { record: newRecord } }
        );
        return res.json({ message: 'Рекорд обновлен' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ error: 'Ошибка сервера при обновлении рекорда' });
    }
});
// Маршрут для страницы "Таблица лидеров"
app.get('/record', async (req, res) => {
    try {
        const users = await collection.find({}).sort({ record: -1 }); // Получаем пользователей и сортируем по рекорду
        res.render('record', { users: users });
    } catch (error) {
        logger.error('Ошибка при получении данных для таблицы лидеров:', error);
        res.redirect('/home');
    }
});
server.listen(APP_PORT,function () {
    logger.debug(`Server is running on port ${APP_PORT}`);
});