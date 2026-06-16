import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, CalendarDays, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Services', path: '/tractors', icon: LayoutGrid },
    { label: 'Bookings', path: '/bookings', icon: CalendarDays },
    { label: 'Alerts', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-xl border-t border-border z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={idx}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full text-xs font-medium"
            >
              <div className={`p-1 mb-1 rounded-full transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`transition-colors ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 w-12 h-1 bg-primary rounded-b-full"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
