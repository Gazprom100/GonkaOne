import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import TelegramAuth from './components/TelegramAuth';
import Home from './pages/Home';
import Mining from './pages/Mining';
import Profile from './pages/Profile';
import Referrals from './pages/Referrals';
import Support from './pages/Support';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <TelegramAuth />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mining" element={<Mining />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/support" element={<Support />} />
          </Routes>
          <Navigation />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
