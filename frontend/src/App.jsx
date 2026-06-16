import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import SocketListener from './components/common/SocketListener';
import FCMInitializer from './components/common/FCMInitializer';
import { ThemeProvider } from './components/ThemeProvider';
import InstallPWA from './components/common/InstallPWA';
import { PWAProvider } from './context/PWAContext';

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="gramsathi-ui-theme">
      <PWAProvider>
        <Router>
          <SocketProvider>
            <SocketListener />
            <FCMInitializer />
            <Toaster position="top-right" />
            <InstallPWA />
            <AppRoutes />
          </SocketProvider>
        </Router>
      </PWAProvider>
    </ThemeProvider>
  );
};

export default App;
