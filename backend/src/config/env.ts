// Import the 'dotenv' package, which helps us load environment variables from a .env file
import dotenv from 'dotenv';

// Call the config() method to load all variables from .env into process.env
dotenv.config(); // Now you can use process.env.PORT, process.env.JWT_SECRET, etc.


// Exporting a configuration object that reads values from environment variables
export const config = {
  // Use PORT from .env, or default to 5000 if not defined
  port: process.env.PORT || 5000,

  // Get MongoDB URI from .env — the '!' tells TypeScript that we're sure it's defined
  mongoUri: process.env.MONGODB_URI!,

  // Get JWT secret key from .env
  jwtSecret: process.env.JWT_SECRET!,

  // Token expiration setting — use value from .env or default to 7 days
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // Node environment — usually 'development' or 'production'
  nodeEnv: process.env.NODE_ENV || 'development',

  // Frontend client URL — fallback is Angular default (localhost:4200)
  clientUrl: process.env.CLIENT_URL || 'http://localhost:4200'
};


// List of environment variables that must be defined for the app to work properly
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

// Check each required variable
for (const envVar of requiredEnvVars) {
  // If the variable is not set, throw an error and stop the app from running
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
