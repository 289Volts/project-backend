import bodyParser from 'body-parser';
import { Router } from 'express';
import { login, register } from '../controllers/userActions.js';
import { newUser, validate } from '../utils/validator.js';

const route = Router();
route.use(bodyParser.json());

route.route('/login').post(login);
route.route('/register').post(validate(newUser), register);

export default route;
