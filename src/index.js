const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'some-secret-value',
    resave: false,
    saveUninitialized: true
}));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
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



app.get('/home', requireAuth, (req, res) => {
    if (req.session.user) {
        res.render('home');
    } else {
        res.redirect('/');
    }
});

app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    }

    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.redirect('/occupied')
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        const userdata = await collection.insertMany(data);
        console.log(userdata);
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

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});
