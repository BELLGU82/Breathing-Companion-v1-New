import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomeView } from './views/HomeView';
import { SessionView } from './views/SessionView';
import { ProfileView } from './views/ProfileView';
import { BreatheView } from './views/BreatheView';
import { CategoryView } from './views/CategoryView';
import { BottomNavigation } from './components/BottomNavigation';
import { StorageService } from './services/StorageService';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize Dark Mode
    const isDark = StorageService.getDarkMode();
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <div className="h-screen w-screen bg-neu-base text-neu-text overflow-hidden font-sans relative">
        <div className="h-full w-full max-w-md mx-auto bg-neu-base relative shadow-2xl overflow-hidden sm:border-x border-gray-200/20">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/breathe" element={<BreatheView />} />
            <Route path="/category/:categoryId" element={<CategoryView />} />
            <Route path="/session/:patternId" element={<SessionView />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNavigation />
        </div>
      </div>
    </Router>
  );
};

export default App;