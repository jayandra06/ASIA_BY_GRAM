import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import { ModalProvider } from './context/ModalContext';
import { AuthProvider } from './context/AuthContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Home />
          </motion.div>
        } />
        <Route path="/menu" element={
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Menu />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
};


function App() {
  // Wake up backend on mount to handle Render cold start
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(apiUrl).catch(() => {
      // Ignore errors, we just want to wake it up
    });
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <ModalProvider>
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

 vercel/set-up-vercel-web-analytics-in-35kcpc
            {/* Public Routes wrapped in Main Layout */}
            <Route path="/*" element={
              <Layout>
                <AnimatedRoutes />
              </Layout>
            } />
          </Routes>
          <Analytics />
        </ModalProvider>
      </AuthProvider>
    </Router>

              {/* Public Routes wrapped in Main Layout */}
              <Route path="/*" element={
                <Layout>
                  <AnimatedRoutes />
                </Layout>
              } />
            </Routes>
          </ModalProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
 main
  );
}

export default App;
