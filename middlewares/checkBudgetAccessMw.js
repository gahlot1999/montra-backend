import catchAsync from '../utils/catchAsync.js';
import Budget from '../models/budgetModel.js';
import AppError from '../utils/appError.js';

const checkBudgetAccess = catchAsync(async (req, res, next) => {
  const budget = await Budget.findOne({
    _id: req.params.budgetId,
    user: req.user.id,
  });

  if (!budget) {
    return next(new AppError('No budget found', 404));
  }

  next();
});

export default checkBudgetAccess;
