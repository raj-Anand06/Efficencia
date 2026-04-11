import React from 'react';

function EfficiencyCalculation({ taskEfficiency, questionEfficiency, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="app-card-strong w-11/12 max-w-2xl rounded-[28px] p-6 shadow-lg">
        <h2 className="app-heading mb-4 text-xl font-bold">Efficiency Calculation</h2>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="dashboard-muted">Task Efficiency:</p>
            <p className="text-3xl font-bold text-emerald-400">{taskEfficiency}%</p>
          </div>
          <div>
            <p className="dashboard-muted">Question Efficiency:</p>
            <p className="text-3xl font-bold text-emerald-400">{questionEfficiency}%</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="app-button-secondary rounded-xl px-4 py-2">
          Close
        </button>
      </div>
    </div>
  );
}

export default EfficiencyCalculation;
