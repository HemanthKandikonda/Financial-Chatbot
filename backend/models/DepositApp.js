import mongoose from 'mongoose';

const depositAppSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Platform name is required'],
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['hysa', 'cd', 'treasury', 'money_market'],
      default: 'hysa',
    },
    categoryLabel: {
      type: String,
      default: 'High-Yield Savings',
    },
    apy: {
      type: Number,
      required: [true, 'APY rate is required'],
      min: 0,
      max: 100,
    },
    apyBoost: {
      type: String,
      default: '',
    },
    term: {
      type: String,
      default: 'Instant Access (No Lock-in)',
    },
    termType: {
      type: String,
      enum: ['liquid', 'fixed'],
      default: 'liquid',
    },
    minDeposit: {
      type: Number,
      default: 0,
    },
    insurance: {
      type: String,
      default: 'FDIC Insured up to $250,000',
    },
    features: {
      type: [String],
      default: [],
    },
    url: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const DepositApp = mongoose.model('DepositApp', depositAppSchema);
export default DepositApp;
