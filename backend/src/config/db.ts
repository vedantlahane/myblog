import mongoose from "mongoose";


export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI || '');
        console.log(`MongoDB Connected: ${conn.connection.host}`);  
    }
    catch(err: unknown) {
        console.error(`Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
        process.exit(1);
    }
}