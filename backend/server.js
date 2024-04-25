const express = require('express'); // Express framework for building web applications
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const mongoose = require('mongoose'); // MongoDB object modeling tool
const cors = require('cors'); // Middleware for enabling cross-origin resource sharing
const socketIo = require('socket.io'); // Real-time bidirectional event-based communication library
const http = require('http'); // HTTP server module
const path = require('path'); // Module for working with file paths
const dbConfig = require('./config/db.config'); // Import the MongoDB configuration
const authRoutes = require('./routes/auth.route'); // Import the authentication routes
const blogRoutes = require('./routes/blog.route'); // Import the blog routes

// backend/server.js

// Import required modules

const app = express(); // Create an instance of the Express application
const server = http.createServer(app); // Create an HTTP server using the Express application
const io = socketIo(server); // Create a Socket.IO server instance


// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes

// Routes

app.use('/api/auth', authRoutes); // Mount the authentication routes at /api/auth
app.use('/api/blogs', blogRoutes); // Mount the blog routes at /api/blogs

// Connect to MongoDB
mongoose.connect(dbConfig.url).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// Socket.io logic can be implemented here

// Start the server
/*API root*/
app.use('/api', require('./routes/api');
const PORT = process.env.PORT || 9000; // Set the port number
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
