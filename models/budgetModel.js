import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const budgetSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      select: false,
      required: {
        value: true,
        message: 'User ID is required',
      },
    },
    name: {
      type: String,
      required: {
        value: true,
        message: 'Budget name is required',
      },
      unique: true,
      minlength: [3, 'Budget name must be at least 3 characters long'],
      maxlength: [40, 'Budget name cannot be more than 50 characters long'],
    },
    month: {
      type: Date,
      required: {
        value: true,
        message: 'Month is required',
      },
    },
    amount: {
      type: Number,
      required: {
        value: true,
        message: 'Budget amount is required',
      },
      min: [1, 'Budget amount must be at least ₹1'],
      max: [1000000, 'Budget amount must not exceed ₹1,000,000'],
    },
    description: {
      type: String,
      maxlength: [
        200,
        'Budget description cannot be more than 200 characters long',
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

budgetSchema.virtual('expense', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'budget',
});

budgetSchema.virtual('totalExpenses').get(function () {
  return this?.expense?.reduce((acc, item) => acc + item.amount, 0);
});

budgetSchema.virtual('totalSavings').get(function () {
  return this?.amount - this?.totalExpenses;
});

budgetSchema.pre(/^findOne/, function (next) {
  this.populate({
    path: 'expense',
    select: '-__v -user',
    sort: '-createdAt',
  });
  next();
});

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
