import mongoose from 'mongoose';

const efficiencySchema = new mongoose.Schema({
    date: { type: Date, required: true, unique: true },
    problemsSolved: { type: Number, required: true },
    efficiency: { type: Number, required: true },
});

const Efficiency = mongoose.model('Efficiency', efficiencySchema);

export default Efficiency;
