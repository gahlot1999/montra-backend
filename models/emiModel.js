import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const emiSchema = new Schema(
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
        message: 'EMI name is required',
      },
      minlength: [3, 'EMI name must be at least 3 characters long'],
      maxlength: [50, 'EMI name cannot be more than 50 characters long'],
    },
    description: {
      type: String,
      maxlength: [
        200,
        'EMI description cannot be more than 200 characters long',
      ],
    },
    amount: {
      type: Number,
      required: {
        value: true,
        message: 'EMI amount is required',
      },
      min: [0, 'EMI amount must be a positive number'],
    },
    startMonth: {
      type: Date,
      required: {
        value: true,
        message: 'Start month is required',
      },
    },
    endMonth: {
      type: Date,
      required: {
        value: true,
        message: 'End month is required',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

emiSchema.virtual('isActive').get(function () {
  const today = new Date();
  const todayDate = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), 1),
  );

  return todayDate >= this.startMonth && todayDate <= this.endMonth;
});

emiSchema.index({ user: 1, name: 1 }, { unique: true });

const EMI = mongoose.model('EMI', emiSchema);

export default EMI;
