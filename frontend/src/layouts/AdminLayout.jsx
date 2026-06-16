import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, Users, CalendarRange, Tractor, 
  Wrench, Menu, FileText, AlertTriangle, 
  Bell, BarChart, LogOut, X, User, Sun, Moon, Briefcase, Settings, ShieldCheck, Terminal, Database
} from 'lucide-react';
import { logout } from '../redux/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../components/ThemeProvider';
import NotificationDropdown from '../components/common/NotificationDropdown';
import { useTranslation } from 'react-i18next';


const menuItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { text: 'Users', icon: Users, path: '/admin/users' },
  { text: 'Providers', icon: Briefcase, path: '/admin/providers' },
  { text: 'Verifications', icon: ShieldCheck, path: '/admin/verifications' },
  { text: 'Tractor Owners', icon: Tractor, path: '/admin/tractors' },
  { text: 'JCB Owners', icon: Wrench, path: '/admin/jcb' },
  { text: 'Labour', icon: Users, path: '/admin/labour' },
  { text: 'Electricians', icon: Wrench, path: '/admin/electricians' },
  { text: 'Plumbers', icon: Wrench, path: '/admin/plumbers' },
  { text: 'Bookings', icon: CalendarRange, path: '/admin/bookings' },
  { text: 'Government Schemes', icon: FileText, path: '/admin/schemes' },
  { text: 'CMS Management', icon: FileText, path: '/admin/cms' },
  { text: 'Lost & Found', icon: AlertTriangle, path: '/admin/lost-found' },
  { text: 'Emergency Contacts', icon: AlertTriangle, path: '/admin/emergency' },
  { text: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { text: 'Analytics', icon: BarChart, path: '/admin/analytics' },
  { text: 'Role Management', icon: ShieldCheck, path: '/admin/roles', superAdminOnly: true },
  { text: 'SMTP Settings', icon: Settings, path: '/admin/smtp', superAdminOnly: true },
  { text: 'API Config', icon: Settings, path: '/admin/api-config', superAdminOnly: true },
  { text: 'System Logs', icon: Terminal, path: '/admin/logs', superAdminOnly: true },
  { text: 'Backup & Recovery', icon: Database, path: '/admin/backups', superAdminOnly: true },
  { text: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    const nextLng = i18n.language?.startsWith('hi') ? 'en' : 'hi';
    i18n.changeLanguage(nextLng);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card p-8 rounded-2xl shadow-xl text-center border border-destructive/20 max-w-sm w-full mx-4">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold text-card-foreground mb-2 font-heading">Access Denied</h2>
          <p className="text-muted-foreground mb-6">Admin Privileges Required.</p>
          <button onClick={() => navigate('/')} className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium transition-colors hover:bg-primary/90">Return Home</button>
        </div>
      </div>
    );
  }

  const filteredMenuItems = menuItems.filter(item => !item.superAdminOnly || user?.role === 'super_admin');

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border text-card-foreground">
      <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0">
        <h1 className="text-lg font-bold tracking-tight font-heading flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-black">G</span>
          </div>
          GramSathi
        </h1>
        <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 no-scrollbar">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu</div>
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.text}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon strokeWidth={isActive ? 2.5 : 2} className={`w-4 h-4 mr-3 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'}`} />
              {item.text}
            </button>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border shrink-0">
        <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 shadow-2xl z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-10">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-medium text-muted-foreground flex items-center">
                Admin <span className="mx-2 text-border">/</span> <span className="text-foreground">{menuItems.find(m => m.path === location.pathname)?.text || 'Overview'}</span>
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
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
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <NotificationDropdown />
              
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
                >
                  <User className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 rounded-xl bg-popover shadow-xl border border-border z-50 overflow-hidden"
                      >
                        <div className="py-1">
                          <button onClick={() => { setUserMenuOpen(false); navigate('/'); }} className="flex items-center w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                            <LayoutDashboard className="w-4 h-4 mr-2 text-muted-foreground" />
                            View Main Site
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
