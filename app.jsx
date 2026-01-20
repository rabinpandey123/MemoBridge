// src/app.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/contexts/authcontext';
import './app.css';
import Header from './components/layout/header';
import HomePage from './components/home/homepage';
import MemoriesPage from './components/memories/memoriespage';
import FamilyPage from './components/family/familypage';
import TodayPage from './components/today/todaypage';
import MusicPlayerPage from './components/music/musicplayerpage';
import LoginPage from './components/auth/loginpage';
import SignupPage from './components/auth/signuppage';
import HelpButton from './components/shared/helpbutton';
import DailyActivities from './components/activities/dailyactivities';
import GamesTab from './components/games/gamestab'; // ADD THIS IMPORT

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/memories" element={<MemoriesPage />} />
              <Route path="/family" element={<FamilyPage />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/music" element={<MusicPlayerPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/activities" element={<DailyActivities />} />
              <Route path="/games" element={<GamesTab />} /> {/* ADD THIS ROUTE */}
            </Routes>
          </main>
          <HelpButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;