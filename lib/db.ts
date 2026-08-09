import mongoose from "mongoose";


const connectDB = async () => {

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
        console.log('Using existing database connection');
        return
    }

    // if not connected, try to connect
    try {
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log("Successfully Connected to Database...");

        mongoose.connection.on('connected', () => {
            console.log('Mongoose Connected to Database...');
        })

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose Connection Error...')
        })

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose Disconnected from Database');
        })
    } catch (error) {
        console.error("Catch => Error connecting to Database");
        throw new Error('Database connection failed');
    }
}

export default connectDB