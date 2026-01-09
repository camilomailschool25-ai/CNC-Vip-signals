import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { AppRoute } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import History from './pages/History';
import Upgrade from './pages/Upgrade';
import RiskCalculatorPage from './pages/RiskCalculatorPage';
import BacktestPage from './pages/BacktestPage';
import Layout from './components/Layout';
import { TrendingUp } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const Splash = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="min-h-screen bg-cnc-900 flex flex-col items-center justify-center animate-fade-in">
      <div className="w-24 h-24 bg-cnc-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-cnc-500/40 animate-bounce-slow">
        <TrendingUp size={48} className="text-white" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">CNC Trading</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm tracking-widest uppercase">Professional Analysis</p>
    </div>
  );
};

const AppRouter = () => {
  const { isAuthenticated } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.SPLASH);

  const navigate = (route: AppRoute) => {
    // Protected Routes: History, Settings, Risk Calculator, Backtest, and now Upgrade
    const protectedRoutes = [
      AppRoute.HISTORY, 
      AppRoute.SETTINGS, 
      AppRoute.RISK_CALCULATOR, 
      AppRoute.BACKTEST,
      AppRoute.UPGRADE
    ];
    
    if (protectedRoutes.includes(route) && !isAuthenticated) {
      setCurrentRoute(AppRoute.LOGIN);
      return;
    }
    setCurrentRoute(route);
  };

  if (currentRoute === AppRoute.SPLASH) return <Splash onFinish={() => setCurrentRoute(AppRoute.DASHBOARD)} />;
  if (currentRoute === AppRoute.LOGIN) return <Login navigate={navigate} />;

  return (
    <Layout activeRoute={currentRoute} navigate={navigate}>
      {currentRoute === AppRoute.DASHBOARD && <Dashboard navigate={navigate} />}
      {currentRoute === AppRoute.RISK_CALCULATOR && <RiskCalculatorPage navigate={navigate} />}
      {currentRoute === AppRoute.BACKTEST && <BacktestPage navigate={navigate} />}
      {currentRoute === AppRoute.SETTINGS && <SettingsPage />}
      {currentRoute === AppRoute.HISTORY && <History />}
      {currentRoute === AppRoute.UPGRADE && <Upgrade navigate={navigate} />}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              padding: '16px',
            },
            duration: 5000,
          }}
        />
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;