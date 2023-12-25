// Importing Mongoose for MongoDB interaction
const mongoose = require('mongoose'); 
// Setting up the MongoDB connection string
const connectionString = process.env.DB_CONNECTION_STRING || 'mongodb://127.0.0.1:27017/Racer';
// Establishing a connection to MongoDB
const connect = mongoose.connect(connectionString);

// Handling the database connection status
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
        required: true,
        default: 0
    }
});
// collection part
const collection = new mongoose.model("users", Loginschema);
module.exports = collection;