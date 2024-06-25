import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';


function QuoteSection() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    fetch('https://api.adviceslip.com/advice')
      .then(response => response.json())
      .then(data => {
        const advice = data.slip.advice;
        setQuote(advice);
      })
      .catch(error => console.error('Error fetching advice:', error));
  }, []);

  return (
    <div className="quote-section text-center">
      <p className="text-xl font-semibold">{quote}</p>
    </div>
  );
}

function Home() {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));

    useEffect(() => {
      const intervalId = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString([], { hour:'2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      }, 1000);
  
      return () => clearInterval(intervalId);
    }, []);

  return (
    <>
      <Navbar/>
      <h1 className="md:font-serif mr-6 font-serif mt-40 font-bold md:pt-13  lg:ml-32 pl-12 text-3xl  md:text-6xl">Efficiencia: Master Your Day</h1>
      <p className='md:font-serif font-serif lg:ml-32 pl-12 md:mt-4 mt-3 text-1xl md:text-2xl'>Where Your Daily To-Dos Transform into Daily Triumphs</p>
      {/* TIME */}
      <div className="card pl-10 ml-6 md:ml-40 w-52  transform translate-x-5 mt-5 md:w-60 h-32 bg-gradient-to-r from-red-300 to-blue-300">
        <div className="card-body flex text-white items-center justify-center mr-12 flex-auto font-bold text-5xl ">
          <div id="time" className="font-sans">{currentTime}</div>
        </div>
      </div>
      <div className='mt-64 md:mt-36'>
      <QuoteSection />
      </div>
      
    </>
  );
}

export default Home;
