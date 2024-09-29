import validator from 'validator';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { filterObj } from '../utils/helpers.js';

const getAllUsers = catchAsync(async (req, res) => {
  const user = await User.find({ isActive: true });
  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Users retrieved successfully',
      numOfUsers: user.length,
      data: user,
    },
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError('Updating password is not allowed', 400));
  }

  const filteredBody = filterObj(req.body, 'name', 'username', 'email');

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedUser) {
    return next(new AppError('No user found with provided ID', 404));
  }

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'User updated successfully',
      data: updatedUser,
    },
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  if (!userId || !validator.isMongoId(userId)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    return next(new AppError('No user found with provided ID', 404));
  }

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'User deleted successfully',
    },
  });
});

export { getAllUsers, updateUser, deleteUser };
