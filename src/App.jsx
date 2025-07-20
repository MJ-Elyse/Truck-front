import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import TripConfiguration from './pages/trip-configuration/TripConfiguration';

import './App.scss';

function App() {
  return (
    <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to={"/login"}/>} />
            <Route path="/trip" element={<TripConfiguration />} />
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;
