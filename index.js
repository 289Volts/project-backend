import 'dotenv/config';
import express from 'express';
import route from './routes/userRoutes.js';
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());

app.use('/api', route);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
