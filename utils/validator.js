import { z } from 'zod';

export const newUser = z.object({
	username: z
		.string({
			required_error: 'Username is required',
			invalid_type_error: 'Username must be a string'
		})
		.min(3)
		.trim(),
	password: z
		.string({
			required_error: 'Password is required',
			invalid_type_error: 'Password must be a string'
		})
		.min(6, { message: 'Password must be 6 or more characters long' })
});

export const validate = (schema) => (req, res, next) => {
	const data = schema.safeParse(req.body);
	req.body = data;
	next();
};
