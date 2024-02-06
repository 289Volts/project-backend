import { compare } from 'bcrypt';
import { User } from '../../models/userModel.js';
import { signToken } from '../../utils/helpers.js';

export const signin = async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password)
		return res.status(400).json({ status: 'ValidationError', success: 'false', message: 'Please enter all fields' });

	const user = await User.findOne({ username }).select('+password').lean();
	if (!user) return res.status(404).json({ status: 'error', success: 'false', message: 'User not found!' });
	const correctPwd = await compare(password, user.password);
	if (!correctPwd)
		return res.status(401).json({ status: 'error', success: 'false', message: 'Username or password incorrect' });
	if (user.suspended)
		return res.status(401).json({ status: 'suspended', success: 'false', message: 'You have been suspended' });

	const modifiedUser = (({ password, ...rest }) => rest)(user);
	try {
		const accessToken = signToken(modifiedUser._id, modifiedUser.role, process.env.JWT_SECRET, '15m');
		const refreshToken = signToken(modifiedUser._id, modifiedUser.role, process.env.JWT_REFRESH_SECRET, '365d');

		await User.findByIdAndUpdate(modifiedUser._id, { refreshToken });
		res.setHeader('Set-Cookie', [
			`accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=900`,
			`refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=43200`
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
