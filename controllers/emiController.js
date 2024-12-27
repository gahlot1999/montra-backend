import EMI from '../models/emiModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const getAllEmi = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    EMI.find({ user: req.user.id }),
    req.query,
  ).sort();

  const emis = await features.query;

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'EMIs fetched successfully',
      numOfEMIs: emis.length,
      data: emis,
    },
  });
});

const addEmi = catchAsync(async (req, res) => {
  req.body.user = req.user.id;
  const emi = await EMI.create(req.body);

  res.status(201).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'EMI added successfully',
      data: {
        id: emi._id,
        name: emi.name,
        description: emi.description,
        amount: emi.amount,
        startMonth: emi.startMonth,
        endMonth: emi.endMonth,
      },
    },
  });
});

const updateEmi = catchAsync(async (req, res, next) => {
  if (!Object.keys(req.body)?.length > 0)
    return next(new AppError('No data provided', 400));

  const updatedEMI = await EMI.findOneAndUpdate(
    {
      _id: req.params.emiId,
      user: req.user.id,
    },
    req.body,
    { new: true, runValidators: true },
  );

  if (!updatedEMI) return next(new AppError('No EMI found', 404));

  res.status(200).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'EMI updated successfully',
      data: {
        id: updatedEMI._id,
        name: updatedEMI.name,
        description: updatedEMI.description,
        amount: updatedEMI.amount,
        startMonth: updatedEMI.startMonth,
        endMonth: updatedEMI.endMonth,
      },
    },
  });
});

const deleteEmi = catchAsync(async (req, res, next) => {
  const emi = await EMI.findOneAndDelete({
    _id: req.params.emiId,
    user: req.user.id,
  });

  if (!emi) return next(new AppError('No EMI found', 404));

  res.status(204).json({
    request: {
      status: 'success',
      timestamp: req.requestTime,
    },
    response: {
      message: 'EMI deleted successfully',
    },
  });
});

export { addEmi, deleteEmi, getAllEmi, updateEmi };
