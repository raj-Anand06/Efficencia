import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import NotesRender from './components/NotesRender';
import Efficiency from './components/Efficiency';
import About from './components/About';

function App() {
  return (
    <>
      <Navbar/>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/notes" element={<NotesRender />} />
        <Route path="/efficiency" element={<Efficiency />} />
        <Route path="/about" element={<About />} />
      </Routes>

    </>
  );
}

export default App;
