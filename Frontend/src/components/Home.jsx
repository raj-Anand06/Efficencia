import React, { useState, useEffect } from 'react';
import AppShell from './layout/AppShell.jsx';


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
      <p className="app-copy text-xl font-semibold leading-8">{quote}</p>
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
    <AppShell contentClassName="pt-10 md:pt-16">
      <section className="grid gap-8 lg:grid-cols-[1.25fr_0.85fr] lg:items-center">
        <div className="space-y-6 px-2 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500 dark:text-cyan-300/80">
            Personal Productivity System
          </p>
          <h1 className="app-heading font-serif text-4xl font-bold md:text-6xl">
            Efficiencia: Master Your Day
          </h1>
          <p className="app-copy max-w-2xl font-serif text-lg leading-8 md:text-2xl">
            Where your daily to-dos, coding practice, and consistency metrics
            come together in one focused workspace.
          </p>
        </div>

        <div className="space-y-5">
          <div className="app-card-strong rounded-[32px] p-6 md:p-8">
            <p className="app-subtle-copy text-xs uppercase tracking-[0.28em]">
              Live Clock
            </p>
            <div
              id="time"
              className="app-heading mt-5 font-sans text-5xl font-bold md:text-6xl"
            >
              {currentTime}
            </div>
          </div>

          <div className="app-card rounded-[28px] p-6">
            <p className="app-subtle-copy mb-3 text-xs uppercase tracking-[0.28em]">
              Daily Note
            </p>
            <QuoteSection />
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default Home;
