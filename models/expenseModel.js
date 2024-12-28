import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  budget: {
    type: Schema.Types.ObjectId,
    ref: 'Budget',
    required: {
      value: true,
      message: 'Budget ID is required',
    },
  },
  name: {
    type: String,
    required: {
      value: true,
      message: 'Expense name is required',
    },
  },
  amount: {
    type: Number,
    required: {
      value: true,
      message: 'Expense amount is required',
    },
    min: [0, 'Expense amount must be a positive number'],
  },
  category: {
    type: String,
    required: {
      value: true,
      message: 'Expense category is required',
    },
  },
  isEmi: {
    type: Boolean,
    default: false,
  },
  emiMetaData: {
    type: JSON,
    default: null,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
});

expenseSchema.index({ budget: 1, name: 1, isEmi: 1 }, { unique: true });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
