import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function createSendToken(userId, data, message, statusCode = 200, req, res) {
  const token = signToken(userId);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    secure: true,
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message,
      data,
      token,
    },
  });
}

const signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });

  createSendToken(
    newUser._id,
    {
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
    },
    'User created successfully',
    201,
    req,
    res,
  );
});

const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return next(new AppError('Missing credentials', 400));
  }

  const user = await User.findOne({
    $or: [{ username: username }, { email: username }],
  }).select('+password');

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  createSendToken(
    user._id,
    undefined,
    'User logged in successfully',
    200,
    req,
    res,
  );
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.username }],
  });

  if (!user) {
    return next(new AppError('No user found with provided credentials', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save();

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/resetPassword/${resetToken}`;

  const message = `Forgot your password?\n ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset Token - Valid for 10 min',
      message,
    });

    res.status(200).json({
      request: {
        status: 'success',
        timestamp: req.requestTime,
      },
      response: {
        message: 'Token sent to email!',
      },
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return next(new AppError('There was an error while sending email.', 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or expired', 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  await user.save();

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Password changed!',
    },
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new AppError('Please provide both old and new password', 400));
  }

  if (oldPassword === newPassword) {
    return next(
      new AppError('New password cannot be the same as old password', 400),
    );
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user || !(await user.verifyPassword(oldPassword, user.password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  user.password = newPassword;
  await user.save();

  createSendToken(user._id, undefined, 'Password changed!', 200, req, res);
});

export { signup, login, forgotPassword, resetPassword, updatePassword };
