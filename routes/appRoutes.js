import { Router } from 'express';
import { test } from '../controllers/app/test.js';

const appRoute = Router();

appRoute.route('/test').get(test);
// route.route('/register').post(validate(newUser), register);

export default appRoute;
