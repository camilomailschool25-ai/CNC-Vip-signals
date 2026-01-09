import React from 'react';
import RiskCalculator from '../components/RiskCalculator';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Crown, Lock, ChevronRight } from 'lucide-react';
import { AppRoute } from '../types';

interface RiskCalculatorPageProps {
  navigate: (route: AppRoute) => void;
}

const RiskCalculatorPage: React.FC<RiskCalculatorPageProps> = ({ navigate }) => {
  const { t } = useSettings();
  const { user } = useAuth();
  
  if (!user?.isVip) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 animate-fade-in">
        <div className="max-w-md w-full bg-cnc-800 border border-cnc-700 p-10 rounded-[40px] text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Crown size={120} />
          </div>
          
          <div className="w-20 h-20 bg-cnc-500/10 border border-cnc-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
            <Lock className="text-cnc-500" size={32} />
            <div className="absolute -top-2 -right-2 bg-cnc-500 text-cnc-900 p-1.5 rounded-lg shadow-lg">
              <Crown size={14} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-white mb-4">
            Acesso VIP Necessário
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-10 px-4">
            A Calculadora de Risco Profissional é um recurso exclusivo para membros VIP. 
            Gira o seu capital com precisão institucional.
          </p>
          
          <button 
            onClick={() => navigate(AppRoute.UPGRADE)}
            className="w-full py-5 bg-cnc-500 hover:bg-white text-cnc-900 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-cnc-500/20 transition-all flex items-center justify-center gap-2 group/btn"
          >
            <span>Upgrade para VIP PRO</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in">
       <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-cnc-500 animate-pulse"></div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.3em]">Institutional Protocol</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white">
            {t.risk_calculator || "Calculadora de Risco"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm max-w-xl">
            Calcule o tamanho da posição e parâmetros de gestão de risco com precisão matemática antes de executar as suas ordens.
          </p>
       </div>
       <div className="h-auto">
         <RiskCalculator />
       </div>
    </div>
  );
};

export default RiskCalculatorPage;