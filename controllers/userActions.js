import { compare } from 'bcrypt';
import { User } from '../models/userModel.js';
import { signToken } from '../utils/helpers.js';

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
		const accessToken = signToken(user._id, user.role, process.env.JWT_SECRET, '15m');
		const refreshToken = signToken(user._id, user.role, process.env.JWT_REFRESH_SECRET, '365d');

		await User.findByIdAndUpdate(user._id, { refreshToken });

		res.setHeader('Set-Cookie', [
			`accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=900`,
			`refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=900`
		]);

		res.status(200).json({ status: 'success', message: 'Registration successful' });
	} catch (error) {
		res.status(500).json({ status: 'error', message: 'Registration failed' });
	}
};

export const login = async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password)
		return res.status(400).json({ status: 'ValidationError', success: 'false', message: 'Please enter all fields' });

	const user = await User.findOne({ username }).select('+password').lean();
	if (!user) return res.status(404).json({ status: 'error', success: 'false', message: 'User not found!' });
	const correctPwd = await compare(password, user.password);
	if (!correctPwd)
		return res.status(401).json({ status: 'error', success: 'false', message: 'Username or password incorrect' });
	if (user.suspended)
		return res.status(401).json({ status: 'error', success: 'false', message: 'You have been suspended' });

	const modifiedUser = (({ password, ...rest }) => rest)(user);
	try {
		const accessToken = signToken(modifiedUser._id, modifiedUser.role, process.env.JWT_SECRET, '15m');
		const refreshToken = signToken(modifiedUser._id, modifiedUser.role, process.env.JWT_REFRESH_SECRET, '365d');

		await User.findByIdAndUpdate(modifiedUser._id, { refreshToken });
		res.setHeader('Set-Cookie', [
			`accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=900`,
			`refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=900`
		]);
		return res.status(200).json({ status: 'success', success: 'true', modifiedUser });
	} catch (error) {
		return res.status(401).json({ message: '' })({
			status: 'error',
			success: 'false',
			message: 'Username or password incorrect'
		});
	}
};

export const logout = (req, res) => {
	res.status(200).json({ msg: 'Logged out' });
};
