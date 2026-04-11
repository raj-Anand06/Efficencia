import mongoose from 'mongoose';

const EfficiencySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // store date at midnight (one doc per user per day)
    date: { type: Date, required: true },
    problemsSolved: { type: Number, default: 0, required: true },
    // snapshot of overall efficiency that day
    efficiency: { type: Number, default: 0, required: true },
  },
  { timestamps: true }
);

// one record per user per day
EfficiencySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('Efficiency', EfficiencySchema);
