import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './components/Home';
import NotesRender from './components/NotesRender';
import Efficiency from './components/Efficiency';
import Signup from './components/Signup';
import Profile from './components/Profile';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthProvider.jsx';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-center">Loading…</div>;
  return user ? children : <Navigate to="/" replace state={{ openLogin: true, from: location.pathname }} />;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<ProtectedRoute><NotesRender /></ProtectedRoute>} />
        <Route path="/efficiency" element={<ProtectedRoute><Efficiency /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
