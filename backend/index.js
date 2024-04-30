// Import required modules
const express = require('express'); // Express framework for building web applications
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const mongoose = require('mongoose'); // MongoDB object modeling tool
const cors = require('cors'); // Middleware for enabling cross-origin resource sharing
const http = require('http'); // HTTP server module

// Create an instance of the Express application
const app = express(); 

// Create an HTTP server using the Express application
const server = http.createServer(app); 

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

// Define schemas
const { Schema } = mongoose;

// Define user schema
const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    confirmPassword: String,
});

// Define blog schema
const blogSchema = new Schema({
    title: String,
    author: String,
    body: String,
    date: {
        type: Date,
        default: Date.now
    }
});

// Create models
const User = mongoose.model('User', userSchema);
const Blog = mongoose.model('Blog', blogSchema);

// Define routes

// Root route
app.get('/', (req, res) => {
    res.send("hello world");
});

// Register endpoint
app.post('/register', (req, res) => {
    console.log("register API");

    const {
        firstName, lastName, email, password, confirmPassword
    } = req.body;

    const createUser = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        confirmPassword: confirmPassword
    });
    createUser.save().then((result) => {
        res.status(200).json({ message: "User Created Successfully", result });
    }).catch((err) => {
        console.log(err);
    });
});

// Create blog endpoint
app.post('/createblog', (req, res) => {
    console.log("Create Blog API");

    const { title, body } = req.body;
    const author = "Vedant"; // Assuming the user's first name is available in the request object
    
    // Check if title and body are provided
   //

    // Create a new blog instance with the author's first name
    const newBlog = new Blog({
        title: title,
        author: author,
        body: body
    });

    // Save the new blog entry to the database
    newBlog.save().then((result) => {
        // Send success response with the created blog entry
        res.status(201).json({ message: "Blog Created Successfully", result });
    }).catch((err) => {
        // Handle database errors
        console.error("Error creating blog:", err);
        res.status(500).json({ error: "Failed to create blog" });
    });
});

// Endpoint to fetch all blogs
app.get('/blogs', (req, res) => {
    // Query the database to find all blogs
    Blog.find({})
    .then(blogs => {
        res.status(200).json(blogs);
    })
    .catch(err => {
        console.error("Error fetching blogs:", err);
        res.status(500).json({ error: "Failed to fetch blogs" });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    console.log(req.body);

    const { email, password } = req.body;

    User.findOne({ email: email }).then((result) => {
        console.log(result);
        if (result) {
            if (result.password === password) {
                res.status(200).send({ message: "Login Successful", result });
            } else {
                res.status(500).send({ message: "Please enter valid password", result });
            }
        } else {
            res.status(500).send({ message: "Please enter valid email", result });
        }
    }).catch((err) => {
        console.error("Error in login:", err);
        res.status(500).send({ error: "Internal Server Error" }); // Handle internal server errors
    });
});

// Start the server
const PORT = process.env.PORT || 9000; // Set the port number
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
