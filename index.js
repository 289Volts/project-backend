import bodyParser from 'body-parser';
import 'dotenv/config';
import express from 'express';
import route from './routes/userRoutes.js';
import { connectDb } from './utils/connectDb.js';
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', route);

app.listen(PORT, async () => {
	try {
		await connectDb();
		console.log(`Server running on port ${PORT}`);
	} catch (error) {
		console.log(error);
	}
});
