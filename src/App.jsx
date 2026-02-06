import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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

import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <ModalProvider>
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

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
  );
}

export default App;
