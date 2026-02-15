import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../App.css';
import { Toaster } from 'sonner';
import Landing from './Landing';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Entries from './Entries';
import Statistics from './Statistics';
import TodosReminders from './TodosReminders';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setUser(data);
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-serif text-[#3E2723]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth setUser={setUser} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
          <Route path="/entries" element={user ? <Entries user={user} /> : <Navigate to="/auth" />} />
          <Route path="/statistics" element={user ? <Statistics user={user} /> : <Navigate to="/auth" />} />
          <Route path="/todos-reminders" element={user ? <TodosReminders user={user} /> : <Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;