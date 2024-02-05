import { User } from '../models/userModel.js';

export const login = (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ msg: 'Please enter all fields' });
	}
	res.status(200).json({ msg: 'Logged in' });
};

export const logout = (req, res) => {
	res.status(200).json({ msg: 'Logged out' });
};

export const register = async (req, res) => {
	const { data, success, error } = req.body;

	// const user = await User.find({});
	const user = await User.create({
		username: data.username,
		password: 'data.password'
	});
	console.log(user);

	if (!success) {
		const errorMsg = error.issues[0];
		return res.status(400).json({ msg: errorMsg.message });
	}
	res.status(200).json({ msg: 'Registered' });
};
