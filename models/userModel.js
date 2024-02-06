import { genSalt, hash } from 'bcrypt';
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
	{
		username: { type: String, required: [true, 'Please provide a username!'], unique: true },
		password: { type: String, required: [true, 'Please provide a password!'], select: false },
		role: { type: String, enum: ['admin', 'user', 'dev'], default: 'user' },
		isDeleted: { type: Boolean, default: false },
		isSuspended: { type: Boolean, default: false },
		refreshToken: { type: String, select: false },
		createdAt: { type: Date, default: Date.now },
		passwordChangedAt: { type: Date, select: false },
		passwordResetToken: { type: String, select: false },
		passwordResetExpires: { type: Date, select: false },
		passwordResetRetries: { type: Number, default: 0, select: false },
		accountRestoreToken: { type: String, select: false }
	},
	{
		timestamps: true,
		versionKey: false
	}
);

UserSchema.pre(/^find/, function (next) {
	this.find({ $or: [{ isDeleted: { $ne: true } }, { isSuspended: { $ne: true } }] });
	next();
});

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	try {
		const salt = await genSalt(12);
		const hashedPassword = await hash(this.password, salt);
		this.password = hashedPassword;
		next();
	} catch (error) {
		next(error);
	}
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
