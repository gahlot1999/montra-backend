import catchAsync from '../utils/catchAsync.js';
import Expense from '../models/expenseModel.js';
import AppError from '../utils/appError.js';

const addExpense = catchAsync(async (req, res) => {
  const expense = await Expense.create({
    budget: req.params.budgetId,
    ...req.body,
  });

  res.status(201).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Expense added successfully',
      data: expense,
    },
  });
});

const getExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findOne({
    _id: req.params.expenseId,
    budget: req.params.budgetId,
  });

  if (!expense) {
    return next(new AppError('No expense found with provided ID', 404));
  }

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Expense retrieved successfully',
      data: expense,
    },
  });
});

const deleteExpense = catchAsync(async (req, res, next) => {
  const deletedExpense = await Expense.findOneAndDelete({
    _id: req.params.expenseId,
    budget: req.params.budgetId,
  });

  if (!deletedExpense) {
    return next(new AppError('No expense found with provided ID', 404));
  }

  res.sendStatus(204);
});

const updateExpense = catchAsync(async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new AppError('Request body is empty', 400));
  }

  const updatedExpense = await Expense.findOneAndUpdate(
    {
      _id: req.params.expenseId,
      budget: req.params.budgetId,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedExpense) {
    return next(new AppError('No expense found with provided ID', 404));
  }

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Expense updated successfully',
      data: updatedExpense,
    },
  });
});

export { addExpense, getExpense, deleteExpense, updateExpense };
