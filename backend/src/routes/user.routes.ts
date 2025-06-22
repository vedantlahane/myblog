import express, { Request, Response } from 'express';
import registerUser from '../controllers/user.controller';
import loginUser from '../controllers/user.controller';


const router = express.Router();

// Route to register a new user
router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);

// Export the router to be used in the main app
export default router;