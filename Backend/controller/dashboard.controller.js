import Efficiency from '../model/efficiency.model.js';

// GET /dashboard/efficiency
export const getEfficiencyData = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const rows = await Efficiency.find({ user: userId }).sort({ date: 1 }).lean();
    return res.json(rows);
  } catch (err) {
    console.error('getEfficiencyData error:', err);
    return res.status(500).json({ message: 'Failed to load efficiency data' });
  }
};
