import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { HomeView } from './views/HomeView';
import { SessionView } from './views/SessionView';
import { ProfileView } from './views/ProfileView';
import { BreatheView } from './views/BreatheView';
import { CategoryView } from './views/CategoryView';
import { BottomNavigation } from './components/BottomNavigation';
import { StorageService } from './services/StorageService';
import { NotificationService } from './services/NotificationService';
import { OnboardingView } from './views/onboarding/OnboardingView';

// Component to handle onboarding redirect
const OnboardingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if onboarding is completed
    const isCompleted = StorageService.isOnboardingCompleted();
    const isOnOnboardingRoute = location.pathname.startsWith('/onboarding');

    if (!isCompleted && !isOnOnboardingRoute) {
      // Redirect to onboarding if not completed and not already there
      navigate('/onboarding', { replace: true });
    } else if (isCompleted && isOnOnboardingRoute) {
      // Redirect to home if completed but somehow on onboarding route
      navigate('/', { replace: true });
    }
  }, [navigate, location]);

  return <>{children}</>;
};

const App: React.FC = () => {
  useEffect(() => {
    // Initialize Dark Mode
    const isDark = StorageService.getDarkMode();
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check for missed reminders
    NotificationService.checkAndSchedule();
  }, []);

  return (
    <Router>
      <OnboardingGate>
        <div className="h-screen w-screen bg-neu-base overflow-hidden font-sans relative">
          <div className="h-full w-full max-w-md mx-auto bg-neu-base relative shadow-2xl overflow-hidden sm:border-x border-white/20">
            <Routes>
              {/* Onboarding Route */}
              <Route path="/onboarding" element={<OnboardingView />} />

              {/* Main Routes */}
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
      </OnboardingGate>
    </Router>
  );
};

export default App;
