import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: {
      value: true,
      message: 'Name is required',
    },
  },
  username: {
    type: String,
    required: {
      value: true,
      message: 'Username is required',
    },
    unique: true,
  },
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: (props) => `${props.value} is not a valid email.`,
    },
    required: {
      value: true,
      message: 'Email is required',
    },
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'seller'],
    default: 'user',
  },
  password: {
    type: String,
    required: {
      value: true,
      message: 'Password is required',
    },
    select: false,
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
  createdAt: { type: Date, default: Date.now, select: false },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.verifyPassword = async function (
  userProvidedPassword,
  correctPassword,
) {
  return await bcrypt.compare(userProvidedPassword, correctPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 1000 * 60 * 60 * 24 * 3;

  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;
