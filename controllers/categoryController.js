import Category from '../models/categoryModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const getAllCategory = catchAsync(async (req, res) => {
  const categories = await Category.find({ user: req.user.id, active: true });

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Categories retrieved successfully',
      data: categories,
    },
  });
});

const addCategory = catchAsync(async (req, res) => {
  req.body.user = req.user.id;
  const category = await Category.create(req.body);

  res.status(201).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Category added successfully',
      data: {
        name: category.name,
      },
    },
  });
});

const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOneAndUpdate(
    {
      _id: req.params.categoryId,
      user: req.user.id,
      active: true,
    },
    {
      active: false,
    },
  );

  if (!category) {
    return next(new AppError('No category found', 404));
  }

  res.status(204).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'Category deleted successfully',
    },
  });
});

export { addCategory, deleteCategory, getAllCategory };
