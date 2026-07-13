import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {
            dbName: 'Zomato_Clone',
        });
        console.log('MongoDB connected successfully');
    } catch (error) {  
        console.error('MongoDB connection failed:', error);
    }
};

export default connectDB;