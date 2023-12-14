const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://127.0.0.1:27017/Racer");

// Check database connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
    .catch((err) => {
        console.log(err);
        console.log("Database cannot be Connected");
    })

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    record:{
        type: Number,
        required: 0
    }
});

// collection part
const collection = new mongoose.model("users", Loginschema);

module.exports = collection;