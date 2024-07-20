import React from 'react';

function EfficiencyCalculation({ taskEfficiency, questionEfficiency, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-600 p-6 rounded-lg shadow-lg w-11/12 max-w-2xl">
        <h2 className="text-white text-xl font-bold mb-4">Efficiency Calculation</h2>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-white">Task Efficiency:</p>
            <p className="text-green-400 text-3xl font-bold">{taskEfficiency}%</p>
          </div>
          <div>
            <p className="text-white">Question Efficiency:</p>
            <p className="text-green-400 text-3xl font-bold">{questionEfficiency}%</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400">
          Close
        </button>
      </div>
    </div>
  );
}

export default EfficiencyCalculation;
