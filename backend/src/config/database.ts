import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!, {
      // ! is used in typescript to assert that the value is not null or undefined
    });

    // console.log(`MongoDB Connected: ${conn.connection.host}`);
    //conn.connection.host, here wweare using the connection object to get the host
    console.log('MongoDB Connected');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    // thsi helps to close the connection when the app is terminated to avoid memory leaks
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);// error as Error is a typescript syntex to treat error as an Error object, so that we can access the messagfe property, like error.message, Error is provided by typescript and it is a class 
    process.exit(1);// Exit process with failure status, 1 states failure
  }
};