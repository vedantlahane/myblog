import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!, {
      // ! is used in typescript to assert that the value is not null or undefined
    });//{} means we are passing an empty object, which means we are using default options

    // console.log(`MongoDB Connected: ${conn.connection.host}`);
    //conn.connection.host, here wweare using the connection object to get the host
    console.log('MongoDB Connected');

    // Handle connection events
    mongoose.connection.on('error', (err) => {// mongoose is a keyword in mongoose library, connection is a property of mongoose, on is a method of connection object, error is an event that we are listening to, it is provided by mongoose library
      console.error(`MongoDB connection error: ${err}`);
    });


    // disconnected event is emitted when the connection to the database is lost, disconnected is a built-in event in mongoose
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
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};