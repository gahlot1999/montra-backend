import catchAsync from '../utils/catchAsync.js';
import Budget from '../models/budgetModel.js';
import AppError from '../utils/appError.js';

const getAllBudget = catchAsync(async (req, res) => {
  const budgets = await Budget.aggregate([
    {
      $match: { user: req.user._id },
    },
    {
      $lookup: {
        from: 'expenses',
        localField: '_id',
        foreignField: 'budget',
        as: 'expenses',
      },
    },
    {
      $addFields: {
        totalExpenses: { $sum: '$expenses.amount' },
        totalSavings: { $subtract: ['$amount', { $sum: '$expenses.amount' }] },
      },
    },
    {
      $project: {
        expenses: 0,
        user: 0,
      },
    },
  ]);

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Budget retrieved successfully',
      numOfBudgets: budgets.length,
      data: { budgets },
    },
  });
});

const getBudget = catchAsync(async (req, res, next) => {
  const budget = await Budget.findOne({
    _id: req.params.budgetId,
    user: req.user.id,
  }).select('+user');

  if (!budget) {
    return next(new AppError('Budget not found', 404));
  }

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Budget retrieved successfully',
      data: budget,
    },
  });
});

const addBudget = catchAsync(async (req, res) => {
  req.body.user = req.user.id;
  const budget = await Budget.create(req.body);

  res.status(201).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Budget added successfully',
      data: {
        name: budget.name,
        month: budget.month,
        amount: budget.amount,
        description: budget.description,
      },
    },
  });
});

const updateBudget = catchAsync(async (req, res, next) => {
  if (!Object.keys(req.body)?.length > 0) {
    return next(new AppError('No data provided', 400));
  }

  const updatedBudget = await Budget.findOneAndUpdate(
    {
      _id: req.params.budgetId,
      user: req.user.id,
    },
    req.body,
    { new: true, runValidators: true },
  );

  if (!updatedBudget) {
    return next(new AppError('Budget not found', 404));
  }

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Budget updated successfully',
      data: { updatedBudget },
    },
  });
});

const deleteBudget = catchAsync(async (req, res, next) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.budgetId,
    user: req.user.id,
  });

  if (!budget) {
    return next(new AppError('Budget not found', 404));
  }

  res.status(204).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Budget deleted successfully',
    },
  });
});

export { getAllBudget, getBudget, addBudget, updateBudget, deleteBudget };
