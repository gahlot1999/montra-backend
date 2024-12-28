import Budget from '../models/budgetModel.js';
import EMI from '../models/emiModel.js';
import Expense from '../models/expenseModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const addEmiExpenses = async (budget, userId) => {
  //> 1. Check for active EMIs
  const activeEMIs = await EMI.find({
    user: userId,
    startMonth: { $lte: budget.month },
    endMonth: { $gte: budget.month },
  });

  //> 2. Add EMIs as expenses
  const emiExpenses = activeEMIs.map((emi) => ({
    budget: budget._id,
    name: emi.name,
    amount: emi.amount,
    category: emi.description,
    isEmi: true,
    paid: false,
    emiMetaData: {
      startMonth: emi.startMonth,
      endMonth: emi.endMonth,
    },
  }));

  await Expense.insertMany(emiExpenses);
};

const getAllBudget = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Budget.aggregate([
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
          totalSavings: {
            $subtract: ['$amount', { $sum: '$expenses.amount' }],
          },
        },
      },
      {
        $project: {
          expenses: 0,
          user: 0,
        },
      },
    ]),
    req.query,
  )
    .sort()
    .paginate();

  const budgets = await features.query;

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

  if (req.query.addEmi === 'true') {
    await addEmiExpenses(budget, req.user.id);
  }

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

  if (req.query.addEmi === 'true') {
    await Expense.deleteMany({ budget: updatedBudget._id, isEmi: true });
    await addEmiExpenses(updatedBudget, req.user.id);
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

export { addBudget, deleteBudget, getAllBudget, getBudget, updateBudget };
