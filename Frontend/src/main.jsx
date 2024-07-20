import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App.jsx';
import './index.css';
import AuthProvider from './context/AuthProvider.jsx';
import { EfficiencyProvider } from './context/EfficiencyContext.jsx';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
  <AuthProvider>
    <EfficiencyProvider/>
    <App />
  </AuthProvider>
    
  </BrowserRouter>
);
