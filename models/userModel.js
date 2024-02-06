import { genSalt, hash } from 'bcrypt';
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
	username: { type: String, required: [true, 'Please provide a username!'], unique: true },
	password: { type: String, required: [true, 'Please provide a password!'], select: false },
	role: { type: String, enum: ['admin', 'user', 'dev'], default: 'user' },
	deleted: { type: Boolean, default: false },
	suspended: { type: Boolean, default: false },
	refreshToken: { type: String, select: false },
	createdAt: { type: Date, default: Date.now }
});

UserSchema.pre(/^find/, function (next) {
	this.find({ deleted: { $ne: true } });
	next();
});

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	try {
		const salt = await genSalt(10);
		const hashedPassword = await hash(this.password, salt);
		this.password = hashedPassword;
		next();
	} catch (error) {
		next(error);
	}
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
