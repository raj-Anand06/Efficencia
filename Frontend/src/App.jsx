import React from 'react';
import { Navigate,Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import NotesRender from './components/NotesRender';
import Efficiency from './components/Efficiency';
import About from './components/About';
import Signup from './components/Signup';
import {Toaster} from "react-hot-toast"
import {useAuth} from "./context/AuthProvider"

function App() {
  const[authUser,setAuthUser]=useAuth()
  console.log(authUser)
  return (
    <>
      
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/notes" element={authUser?<NotesRender />:<Navigate to="/signup"/>} />
        <Route path="/efficiency" element={authUser?<Efficiency />:<Navigate to="/signup"/>} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup/>} />
      </Routes>
      <Toaster/>
    </>
  );
}

export default App;
