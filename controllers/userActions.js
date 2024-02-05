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

export const register = (req, res) => {
	const data = req.body;

	if (!data.success) {
		const error = data.error.issues[0];
		return res.status(400).json({ msg: error.message });
	}
	res.status(200).json({ msg: 'Registered' });
};
