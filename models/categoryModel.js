import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const categorySchema = new Schema({
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
    required: true,
    trim: true,
    minlength: [3, 'Category name must be at least 3 characters long'],
    maxlength: [20, 'Category name must be at most 20 characters long'],
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

categorySchema.index({ user: 1, name: 1, active: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
