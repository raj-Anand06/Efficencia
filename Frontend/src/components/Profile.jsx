import React, { useEffect, useRef, useContext } from 'react';
import Navbar from './Navbar';
import { Chart, LineElement, LineController, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { EfficiencyContext } from '../context/EfficiencyContext';

Chart.register(LineElement, LineController, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

const Profile = () => {
  const chartRef = useRef(null);
  const { totalEfficiency } = useContext(EfficiencyContext);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    const options = {
      plugins: {
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: 60,
              yMax: 60,
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 2,
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: '#FFF7F8'
          }
        },
        y: {
          grid: {
            color: '#FFF7F8'
          }
        }
      }
    };
    const config = {
      type: 'line',
      data: {
        labels: ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'],
        datasets: [{
          label: 'Efficiency',
          data: [65, 70, 74, 76, 84, 80, 90],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options
    };

    new Chart(ctx, config);
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex flex-col mt-36 md:mt-4 items-center justify-center h-screen">
        <h1 className="text-2xl  mb-4 text-[#ddb076] font-bold">Profile</h1>
        <div className="flex flex-col md:flex-row justify-center gap-12">
          {/* Today's Efficiency */}
          <div className="w-80 h-48 bg-gradient-to-r from-blue-200 to-blue-100 rounded-lg shadow-lg flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold">Today's Efficiency</h3>
            <p className="text-2xl font-bold mt-4">{totalEfficiency}%</p>
          </div>

          {/* Total Questions Solved */}
          <div className="w-80 h-48 bg-gradient-to-r from-green-200 to-green-100 rounded-lg shadow-lg flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold text-center">Total Questions Solved</h3>
            <p className="text-2xl font-bold text-center mt-4">80</p>
          </div>

          {/* Average Efficiency */}
          <div className="w-80 h-48 bg-gradient-to-r from-yellow-200 to-yellow-100 rounded-lg shadow-lg flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold text-center">Average Efficiency</h3>
            <p className="text-2xl font-bold text-center mt-4">70%</p>
          </div>
        </div>

        {/* Chart */}
        <div className="flex items-center justify-center w-full md:w-3/4 h-96 mt-16">
          <canvas ref={chartRef} />
        </div>
      </div>
    </>
  );
};

export default Profile;
