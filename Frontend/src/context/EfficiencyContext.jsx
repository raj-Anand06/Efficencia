// src/context/EfficiencyContext.js
import React, { createContext, useState } from 'react';

export const EfficiencyContext = createContext();

export const EfficiencyProvider = ({ children }) => {
  const [totalEfficiency, setTotalEfficiency] = useState(0);

  return (
    <EfficiencyContext.Provider value={{ totalEfficiency, setTotalEfficiency }}>
      {children}//new
    </EfficiencyContext.Provider>
  );
};
