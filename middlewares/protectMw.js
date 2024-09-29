import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = catchAsync(async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }

  token = token.replace('Bearer ', '');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Unauthorized', 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User changed password recently! Please login again.', 401),
    );
  }

  req.user = currentUser;
  next();
});

export default protect;
