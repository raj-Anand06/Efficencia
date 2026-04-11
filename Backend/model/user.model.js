// model/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const EfficiencyHistorySchema = new Schema({
  date:       { type: String, required: true }, // YYYY-MM-DD
  efficiency: { type: Number, required: true }  // 0..100
});

const UserSchema = new Schema({
  name:     { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },

  totalQuestions:  { type: Number, default: 0 },
  questionsSolved: { type: Number, default: 0 },

  efficiencyHistory: { type: [EfficiencyHistorySchema], default: [] }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // only hash if changed/new
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to check password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.calculateEfficiency = function () {
  if (this.totalQuestions === 0) return 0;
  return Math.round((this.questionsSolved / this.totalQuestions) * 100);
};

export default mongoose.model('User', UserSchema);
