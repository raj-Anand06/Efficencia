// controller/dashboard.controller.js
import Efficiency from '../model/dashboard.js';

export const saveEfficiencyData = async (req, res) => {
  try {
    const { date, problemsSolved, efficiency } = req.body;
    const efficiencyData = new Efficiency({ date, problemsSolved, efficiency });
    await efficiencyData.save();
    res.status(201).json(efficiencyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEfficiencyData = async (req, res) => {
  try {
    const efficiencies = await Efficiency.find();
    res.json(efficiencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
