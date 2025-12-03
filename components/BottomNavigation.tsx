import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shell, Wind, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HapticService } from '../services/HapticService';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide nav on session view OR onboarding
  if (location.pathname.includes('/session') || location.pathname.includes('/onboarding')) {
    return null;
  }

  const NavItem = ({ path, icon: Icon, label }: any) => {
    // Check if active (handle sub-routes for Breathe category)
    const isActive = location.pathname === path || (path === '/breathe' && location.pathname.startsWith('/category'));
    const [isHovered, setHovered] = useState(false);

    return (
      <button
        onClick={() => {
          HapticService.trigger();
          navigate(path);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="relative flex items-center justify-center w-full h-full outline-none group hover-soft"
        aria-label={label}
      >
        {/* Active Indicator - Circular Background */}
        {isActive && (
          <motion.div
            layoutId="navBubble"
            className="absolute w-12 h-12 rounded-full bg-neu-base shadow-neu-pressed z-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Floating Tooltip (Only on Hover) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: '-50%' }}
              animate={{ opacity: 1, y: -7, x: '-50%' }}
              exit={{ opacity: 0, y: 10, x: '-50%' }}
              className="absolute left-1/2 top-0 bg-neu-base shadow-neu-flat border border-white/40 px-3 py-1 rounded-lg text-meta whitespace-nowrap z-50 pointer-events-none"
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          className="z-10 relative"
          animate={{
            scale: isHovered ? 1.2 : 1
          }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Icon className="icon-primary" strokeWidth={isActive ? 1.2 : 1} />
        </motion.div>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-neu-base/95 backdrop-blur-sm shadow-[0_-5px_20px_rgba(163,177,198,0.2)] flex justify-around items-center px-6 z-50 rounded-t-[30px] border-t border-white/30">
      {/* Right (First in RTL) */}
      <NavItem path="/" icon={Shell} label="בית" />
      {/* Center */}
      <NavItem path="/breathe" icon={Wind} label="לנשום" />
      {/* Left */}
      <NavItem path="/profile" icon={User} label="פרופיל" />
    </div>
  );
};
