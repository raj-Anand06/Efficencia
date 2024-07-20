import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import NotesRender from './components/NotesRender';
import Efficiency from './components/Efficiency';
import Signup from './components/Signup';
import Profile from './components/Profile';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthProvider';
import { EfficiencyProvider } from './context/EfficiencyContext';

function App() {
  const [authUser, setAuthUser] = useAuth();
  console.log(authUser);

  return (
    <>
      <EfficiencyProvider>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/notes" element={authUser ? <NotesRender /> : <Navigate to="/signup" />} />
          <Route path="/efficiency" element={authUser ? <Efficiency /> : <Navigate to="/signup" />} />
          <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/signup" />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </EfficiencyProvider>
      <Toaster />
    </>
  );
}

export default App;
