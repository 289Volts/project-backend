import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

const { sign, verify, decode } = jwt;
const signToken = (id, role, secret, expiresIn) => {
	return sign(
		{
			id,
			role
		},
		secret,
		{
			expiresIn
		}
	);
};

const decodeToken = (token, secret) => {
	return verify(token, secret);
};

const verifyToken = async (res, accessToken, refreshToken) => {
	if (!accessToken) return false;

	try {
		verify(accessToken, process.env.JWT_SECRET);
		return true;
	} catch (error) {
		if ((error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') && refreshToken) {
			try {
				const decoded = decodeToken(refreshToken, process.env.JWT_REFRESH_SECRET);
				console.log(decoded);
				const user = await User.findOne({ _id: decoded.id }).select('+refreshToken');
				if (!user) return res.status(401).json({ message: 'You are unauthenticated' });
				console.log('no user');
				if (user.refreshToken !== refreshToken) return res.status(401).json({ message: 'You are unauthenticated' });
				if (user.deleted) return res.status(401).json({ message: 'You are unauthenticated' });
				if (user.suspended) return res.status(401).json({ message: 'You are unauthenticated' });

				const newAccessToken = signToken({ id: user._id, role: user.role }, process.env.JWT_SECRET, '15m');
				const newRefreshToken = signToken({ id: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, '365d');
				await User.findByIdAndUpdate(user._id, { newRefreshToken });

				res.setHeader('Set-Cookie', [
					`accessToken=${newAccessToken}; HttpOnly; Path=/; Max-Age=900`,
					`refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=900`
				]);
				return true;
			} catch (error) {
				console.log('error');
				return res.status(401).json({ message: 'You are unauthenticated' });
			}
		} else return res.status(401).json({ message: 'You are unauthenticated' });
	}
};

const setCookie = (res, name, value, options) => {
	res.cookie(name, value, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		sameSite: 'none',

		...options
	});
};

export { setCookie, verifyToken, signToken };
