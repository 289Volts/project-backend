import { Router } from 'express';
import { register } from '../controllers/userActions.js';
import { newUser, validate } from '../utils/validator.js';

const route = Router();

// route.get('/login', login);
route.post('/register', validate(newUser), register);

export default route;
