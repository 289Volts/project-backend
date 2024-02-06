import { User } from '../../models/userModel.js';
import { setCookie, signToken } from '../../utils/helpers.js';

export const register = async (req, res) => {
	const { data, success, error } = req.body;
	if (!success) {
		const errorMsg = error.issues[0];
		return res.status(400).json({ status: 'ValidationError', success: 'false', msg: errorMsg.message });
	}
	const existingUser = await User.findOne({ username: data.username });
	if (existingUser)
		return res.status(400).json({ status: 'ValidationError', success: 'false', message: 'Username already exists' });

	try {
		const user = await User.create({
			username: data.username,
			password: data.password
		});
		console.log('User created');
		const accessToken = signToken(user._id, user.role, process.env.JWT_SECRET, '15m');
		const refreshToken = signToken(user._id, user.role, process.env.JWT_REFRESH_SECRET, '365d');

		await User.findByIdAndUpdate(user._id, { refreshToken });
		setCookie(res, 'accessToken', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			expires: new Date(Date.now() + 900000)
		});
		setCookie(res, 'refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			expires: new Date(Date.now() + 900000)
		});

		res.status(200).redirect('/api/test');
	} catch (error) {
		res.status(500).json({ status: 'error', message: 'Registration failed' });
	}
};
