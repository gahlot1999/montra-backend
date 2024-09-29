import AppError from '../utils/appError.js';

function handleDuplicateError(err) {
  const duplicateFields = Object.entries(err?.keyValue);

  const messages = duplicateFields
    ?.map(([field, value]) => `${field} - ${value}`)
    .join(', ');

  const message = `Already exist: ${messages}.`;

  return new AppError(message, 400);
}

function handleValidationErrorDB(err) {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path} - ${err.value}. Please use a valid value!`;
  return new AppError(message, 400);
}

function handleJWTError() {
  return new AppError('Invalid token. Please log in again.', 401);
}

export default function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = Object.assign(err);
  error.message = err.message;

  if (error.code === 11000) error = handleDuplicateError(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();

  res.status(error.statusCode).json({
    request: {
      status: error.status,
      timestamp: req.requestTime,
    },
    response: {
      message: error.message,
      stack: err.stack,
      error: err,
    },
  });

  next();
}
