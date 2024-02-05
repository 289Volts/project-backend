import { Router } from 'express';
import { login, logout } from '../controllers/userActions.js';

const route = Router();

// route.get('/login', login);
route.post('/login', logout);

export default route;
