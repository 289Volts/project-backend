import 'dotenv/config';
import mongoose from 'mongoose';

const { MONGODB_URI } = process.env;
export const connectDb = async () => {
	if (mongoose.connection.readyState === 1) {
		console.log('Already connected.');
		return mongoose.connection.asPromise();
	}

	try {
		await mongoose.connect(MONGODB_URI);
		console.log('Connected to MongoDB');
	} catch (error) {
		console.error('Error connecting to MongoDB:', error);
	}
};
