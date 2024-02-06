import { Router } from 'express';
import { register } from '../controllers/auth/register.js';
import { signin } from '../controllers/auth/signin.js';
import { newUser, validate } from '../utils/validator.js';

const userRoute = Router();

userRoute.route('/signin').post(signin);
userRoute.route('/register').post(validate(newUser), register);

export default userRoute;
