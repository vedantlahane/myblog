const User = require('../models/user.model');

// backend/controllers/auth.controller.js


exports.register = (req, res) => {
    // Get the user data from the request body
    const { username, password } = req.body;

    // Create a new user object
    const newUser = new User({
        username,
        password
    });

    // Save the user to the database
    newUser.save((err, user) => {
        if (err) {
            // Handle the error
            return res.status(500).json({ message: 'Error registering user' });
        }

        // User registration successful
        res.status(200).json({ message: 'User registered successfully' });
    });
};

exports.login = (req, res) => {
    // Get the user data from the request body
    const { username, password } = req.body;

    // Find the user in the database
    User.findOne({ username }, (err, user) => {
        if (err) {
            // Handle the error
            return res.status(500).json({ message: 'Error logging in' });
        }

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the password is correct
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // User login successful
        res.status(200).json({ message: 'User logged in successfully' });
    });
};
