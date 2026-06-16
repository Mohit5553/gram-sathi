import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../components/ThemeProvider';
import { Moon, Sun, Menu, LogOut, WifiOff } from 'lucide-react';
import BottomNavigation from '../components/navigation/BottomNavigation';
import Button from '../components/ui/Button';
import NotificationDropdown from '../components/common/NotificationDropdown';
import { logout } from '../redux/authSlice';
import { usePWA } from '../context/PWAContext';
import { useTranslation } from 'react-i18next';

const MainLayout = () => {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isOffline } = usePWA();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    const nextLng = i18n.language?.startsWith('hi') ? 'en' : 'hi';
    i18n.changeLanguage(nextLng);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <nav className="bg-background/80 backdrop-blur-xl border-b border-border px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight font-heading">
            GramSathi
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('nav.home')}</Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('nav.about')}</Link>
          <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('nav.services')}</Link>
          <Link to="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('nav.faq')}</Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('nav.contact')}</Link>
          <div className="w-px h-6 bg-border mx-2"></div>
          
          <button 
            onClick={toggleLanguage}
            className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-lg transition-colors cursor-pointer border border-border"
            title="Switch Language / भाषा बदलें"
          >
            {i18n.language?.startsWith('hi') ? 'English' : 'हिन्दी'}
          </button>
          
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <>
              <NotificationDropdown />
              {user?.role === 'admin' && (
                <Button variant="secondary" size="sm" asChild className="border-sky-500 text-sky-600 hover:bg-sky-50">
                  <Link to="/admin/dashboard">{t('nav.adminPanel')}</Link>
                </Button>
              )}
              {user?.role === 'provider' && (
                <Button variant="primary" size="sm" asChild>
                  <Link to="/provider/dashboard">Dashboard</Link>
                </Button>
              )}
              {user?.role === 'user' && (
                <Button variant="primary" size="sm" asChild>
                  <Link to="/profile">Profile</Link>
                </Button>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center p-2 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-650 transition-colors ml-2"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('nav.login')}</Link>
          )}
        </div>

        {/* Mobile Header Icons */}
        <div className="flex md:hidden items-center space-x-2">
          <button 
            onClick={toggleLanguage}
            className="px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-border"
          >
            {i18n.language?.startsWith('hi') ? 'EN' : 'हि'}
          </button>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="p-2 rounded-full hover:bg-accent text-foreground">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {isOffline && (
        <div className="bg-amber-500 text-white text-xs font-bold text-center py-2 sticky top-[72px] z-40 flex items-center justify-center gap-2 shadow-sm animate-in slide-in-from-top duration-200">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. Viewing cached offline data.</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      <footer className="hidden md:block bg-slate-50 dark:bg-slate-900/40 border-t border-border py-12 text-sm mt-auto text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground font-heading">GramSathi</h3>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              GramSathi connects rural communities directly with machinery owners and technicians. Bridging digital gaps, fostering transparent pricing, and empowering day contractors.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-foreground font-heading">Quick Links</h4>
            <div className="flex flex-col space-y-2 text-xs">
              <Link to="/" className="hover:text-primary transition-colors">Home Landing</Link>
              <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link to="/services" className="hover:text-primary transition-colors">Services Directory</Link>
              <Link to="/faq" className="hover:text-primary transition-colors">Help & FAQ</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-foreground font-heading">Legal Policy</h4>
            <div className="flex flex-col space-y-2 text-xs">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-foreground font-heading">Support Desk</h4>
            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <p>📍 Panchayat Building Center, Rampur</p>
              <p>📞 Helpline: +91 98765 43210</p>
              <p>✉️ Email: support@gramsathi.in</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-border mt-8 pt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} GramSathi. Digitizing rural India. Developed by Google DeepMind team.
        </div>
      </footer>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
