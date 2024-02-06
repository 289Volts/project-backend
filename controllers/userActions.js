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
};

export const login = async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password)
		return res.status(400).json({ status: 'ValidationError', success: 'false', message: 'Please enter all fields' });

	const user = await User.findOne({ username }).select('+password').lean();
	if (!user) return res.status(404).json({ message: 'User not found!' });
	const correctPwd = await compare(password, user.password);
	if (!correctPwd) return res.status(401).json({ message: 'Username or password incorrect' });
	if (user.deleted) return res.status(401).json({ message: 'Your account has been deleted' });
	if (user.suspended) return res.status(401).json({ message: 'You are have been suspended' });
	res.status(200).json({ msg: 'Logged in' });
};

export const logout = (req, res) => {
	res.status(200).json({ msg: 'Logged out' });
};
