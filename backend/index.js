const express = require('express'); // Express framework for building web applications
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const mongoose = require('mongoose'); // MongoDB object modeling tool
const cors = require('cors'); // Middleware for enabling cross-origin resource sharing
//const socketIo = require('socket.io'); // Real-time bidirectional event-based communication library
const http = require('http'); // HTTP server module
const path = require('path'); // Module for working with file paths
const { title } = require('process');
const { get } = require('jquery');

// backend/server.js

// Import required modules

const app = express(); // Create an instance of the Express application
const server = http.createServer(app); // Create an HTTP server using the Express application
//const io = socketIo(server); // Create a Socket.IO server instance


// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myblog').then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// Socket.io logic can be implemented here

// Start the server
/*API root*/
//app.use('/api', require('./routes/api'));
const PORT = process.env.PORT || 9000; // Set the port number
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/',(req,res)=>{
    res.send("hello world");
});


app.post('/login',(req,res)=>{
    console.log('body data: ',req.body);

    const{email,password}=req.body;

    res.send("login");
})

app.post('/register',(req,res)=>{
    console.log("register API");

    res.send("register API");
    const{
        firstName,lastName,email,password,confirmPassword
    }=req.body;

    const createnewUser = new user({
        firstName:firstName,
        lastName:lastName,
        email:email,
        password:password,
        confirmPassword:confirmPassword
    });
createnewUser.save().then((result)=>{
    res.status(200).json({message:"User Created Successfully",result});
}).catch((err)=>{
    console.log(err);
})

})

const {Schema} = mongoose;
const blogSchema = new Schema({
    title: String,
    author: String,
    body: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    confirmPassword: String,
});

const user = mongoose.model('User', userSchema);