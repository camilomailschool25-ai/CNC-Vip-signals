import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { AppRoute } from '../types';
import { LayoutDashboard, History, Settings, LogOut, LogIn, TrendingUp, Crown, Menu, X, ChevronRight, Calculator, FlaskConical } from 'lucide-react';
import AIChatAssistant from './AIChatAssistant';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: AppRoute;
  navigate: (route: AppRoute) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, navigate }) => {
  const { user, logout } = useAuth();
  const { t } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(AppRoute.LOGIN);
  };

  const NavItem = ({ route, icon: Icon, label, pro }: { route: AppRoute, icon: any, label: string, pro?: boolean }) => (
    <button
      onClick={() => {
        navigate(route);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-none border-l-2 transition-all duration-200 group ${
        activeRoute === route 
          ? 'border-cnc-500 bg-cnc-800 text-cnc-500' 
          : 'border-transparent text-gray-500 hover:text-cnc-500 hover:bg-cnc-800'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon size={20} className="transition-transform group-hover:scale-105" />
        <span className="font-medium tracking-wide uppercase text-xs">{label}</span>
        {pro && (
          <span className="bg-cnc-500/10 text-cnc-500 text-[8px] font-bold px-1 rounded border border-cnc-500/20">PRO</span>
        )}
      </div>
      {activeRoute === route && <ChevronRight size={14} />}
    </button>
  );

  return (
    <div className="flex h-screen bg-cnc-900 text-slate-900 dark:text-white overflow-hidden">
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-cnc-900 border-r border-cnc-700 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-cnc-700">
           <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-cnc-500 flex items-center justify-center">
               <TrendingUp size={24} className="text-cnc-900" />
             </div>
             <div>
               <span className="text-xl font-bold tracking-tighter block leading-none">CNC</span>
               <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Trading</span>
             </div>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-cnc-500">
             <X size={24} />
           </button>
        </div>

        {user && (
          <div className="p-6 border-b border-cnc-700">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cnc-800 border border-cnc-700 flex items-center justify-center font-bold text-lg rounded-full overflow-hidden">
                   {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                   <p className="font-bold truncate">{user.name}</p>
                   <p className="text-xs text-gray-500 uppercase tracking-wide">{user.isVip ? 'VIP MEMBER' : 'FREE PLAN'}</p>
                </div>
             </div>
          </div>
        )}

        <div className="flex-1 py-6 space-y-1">
          <NavItem route={AppRoute.DASHBOARD} icon={LayoutDashboard} label={t.dashboard} />
          <NavItem route={AppRoute.RISK_CALCULATOR} icon={Calculator} label={t.risk_calculator || "Risk Calculator"} pro />
          <NavItem route={AppRoute.BACKTEST} icon={FlaskConical} label={t.backtest || "Backtesting"} pro />
          <NavItem route={AppRoute.HISTORY} icon={History} label={t.history} />
          <NavItem route={AppRoute.SETTINGS} icon={Settings} label={t.settings} />
        </div>

        <div className="p-6 border-t border-cnc-700 space-y-4">
          {!user?.isVip && (
            <button
              onClick={() => { navigate(AppRoute.UPGRADE); setIsSidebarOpen(false); }}
              className="w-full py-3 bg-cnc-500 hover:bg-cnc-600 text-cnc-900 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Crown size={16} />
              Upgrade to VIP
            </button>
          )}
          
          {user ? (
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-rose-500 transition-colors py-2">
              <LogOut size={14} /> <span>{t.logout}</span>
            </button>
          ) : (
             <button onClick={() => { navigate(AppRoute.LOGIN); setIsSidebarOpen(false); }} className="w-full py-3 border border-cnc-500 text-cnc-500 hover:bg-cnc-500 hover:text-cnc-900 font-bold uppercase tracking-wider text-xs transition-all">
              Log In
            </button>
          )}
        </div>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col h-full relative">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-cnc-700 bg-cnc-900 z-30">
           <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-cnc-500 flex items-center justify-center"><TrendingUp size={16} className="text-cnc-900" /></div>
             <span className="font-bold tracking-tight">CNC</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 border border-cnc-700 text-cnc-500 hover:bg-cnc-800"><Menu size={20} /></button>
        </div>
        <main className="flex-1 overflow-y-auto p-0 md:p-0 relative scroll-smooth">{children}</main>
        <AIChatAssistant />
      </div>
    </div>
  );
};

export default Layout;