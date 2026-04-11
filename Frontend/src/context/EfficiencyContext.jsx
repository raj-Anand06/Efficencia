// src/context/EfficiencyContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthProvider.jsx';
import { buildAuthConfig } from '../utils/auth.js';

export const EfficiencyContext = createContext(null);
export const useEfficiency = () => useContext(EfficiencyContext);

const EfficiencyProvider = ({ children }) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:1402';

  const { user, token, logout } = useAuth();
  const userId = user?._id || null;

  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [totalEfficiency, setTotalEfficiency] = useState(0);
  const [efficiencyHistory, setEfficiencyHistory] = useState([]);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const setAllFromResponse = (data) => {
    setTotalQuestions(data.totalQuestions ?? 0);
    setQuestionsSolved(data.questionsSolved ?? 0);
    setTotalEfficiency(data.totalEfficiency ?? 0);
    setEfficiencyHistory(data.efficiencyHistory ?? []);
  };

  // 👇 memoize to keep stable identity
  const resetStats = useCallback(() => {
    setTotalQuestions(0);
    setQuestionsSolved(0);
    setTotalEfficiency(0);
    setEfficiencyHistory([]);
    setDailyRecords([]);
  }, []);

  const handleRequestError = useCallback((err) => {
    if (err?.response?.status === 401) {
      logout();
      resetStats();
      return true;
    }

    return false;
  }, [logout, resetStats]);

  const loadStats = useCallback(async () => {
    if (!userId || !token) return;
    const { data } = await axios.get(
      `${baseURL}/user/stats`,
      buildAuthConfig(token)
    );
    setAllFromResponse(data);
  }, [userId, token, baseURL]);

  const loadDailyRecords = useCallback(async () => {
    if (!userId || !token) return;
    const { data } = await axios.get(
      `${baseURL}/dashboard/efficiency`,
      buildAuthConfig(token)
    );
    setDailyRecords(Array.isArray(data) ? data : []);
  }, [userId, token, baseURL]);

  const refreshStats = useCallback(async () => {
    await loadStats();
    await loadDailyRecords();
  }, [loadStats, loadDailyRecords]);

  useEffect(() => {
    let cancelled = false;

    if (!userId || !token) {
      resetStats();
      setLoading(false);
      return () => { cancelled = true; };
    }

    (async () => {
      try {
        setLoading(true);
        await refreshStats();
      } catch (err) {
        if (handleRequestError(err)) return;
        console.error('Efficiency load error:', err?.response?.data || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, token, refreshStats, handleRequestError, resetStats]);

  const addQuestionSolved = async () => {
    if (!userId || !token) return;
    try {
      const { data } = await axios.post(
        `${baseURL}/user/solve-question`,
        {},
        buildAuthConfig(token)
      );
      setAllFromResponse(data);
      await loadDailyRecords();
    } catch (err) {
      if (handleRequestError(err)) return;
      console.error('Failed to record solved question:', err?.response?.data || err.message);
    }
  };

  const syncTotalQuestions = async (total) => {
    if (!userId || !token) return;
    try {
      const { data } = await axios.post(
        `${baseURL}/user/sync-questions`,
        { totalQuestions: total },
        buildAuthConfig(token)
      );
      setAllFromResponse(data);
      await loadDailyRecords();
    } catch (err) {
      if (handleRequestError(err)) return;
      console.error('Failed to sync totalQuestions:', err?.response?.data || err.message);
    }
  };

  return (
    <EfficiencyContext.Provider
      value={{
        totalQuestions,
        questionsSolved,
        totalEfficiency,
        efficiencyHistory,
        dailyRecords,
        loading,
        addQuestionSolved,
        syncTotalQuestions,
        refreshStats, // now memoized
      }}
    >
      {children}
    </EfficiencyContext.Provider>
  );
};

export default EfficiencyProvider;
export { EfficiencyProvider };
