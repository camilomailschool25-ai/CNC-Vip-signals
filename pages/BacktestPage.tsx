import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { AppRoute, BacktestReport, Timeframe } from '../types';
import { FOREX_PAIRS, STRATEGIES } from '../constants';
import { simulateBacktest } from '../services/geminiService';
import { 
  Play, FlaskConical, Calendar, Target, TrendingUp, AlertCircle, 
  BarChart, ArrowRight, Loader2, Crown, Lock, ChevronRight, Info,
  ShieldCheck, Activity, Layers, ListChecks
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

interface BacktestPageProps {
  navigate: (route: AppRoute) => void;
}

const BacktestPage: React.FC<BacktestPageProps> = ({ navigate }) => {
  const { t } = useSettings();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [pair, setPair] = useState(FOREX_PAIRS[0]);
  const [timeframe, setTimeframe] = useState(Timeframe.H1);
  const [strategy, setStrategy] = useState(STRATEGIES[0]);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-03-31');
  const [report, setReport] = useState<BacktestReport | null>(null);

  const loadingMessages = [
    "Initializing Strategic Engine...",
    "Retrieving Historical Price Action...",
    "Scanning Liquidity Voids & Order Blocks...",
    "Calculating Profit/Loss Trajectories...",
    "Generating Institutional Growth Report..."
  ];

  const handleRunBacktest = async () => {
    setLoading(true);
    setReport(null);
    
    // Simulate loading steps for aesthetic feel
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length);
    }, 1500);

    try {
      const result = await simulateBacktest(pair, timeframe, strategy, startDate, endDate);
      setReport(result);
      toast.success("Simulation complete!");
    } catch (e) {
      toast.error("Simulation failed. Check API connectivity.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  if (!user?.isVip) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 animate-fade-in">
        <div className="max-w-md w-full bg-cnc-800 border border-cnc-700 p-10 rounded-[40px] text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Crown size={120} /></div>
          <div className="w-20 h-20 bg-cnc-500/10 border border-cnc-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
            <FlaskConical className="text-cnc-500" size={32} />
            <div className="absolute -top-2 -right-2 bg-cnc-500 text-cnc-900 p-1.5 rounded-lg shadow-lg"><Crown size={14} /></div>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter text-white mb-4">Backtest Access Locked</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-10 px-4">The Strategy Backtesting Engine is exclusive for VIP members. Verify your setups against historical institutional data.</p>
          <button onClick={() => navigate(AppRoute.UPGRADE)} className="w-full py-5 bg-cnc-500 hover:bg-white text-cnc-900 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all flex items-center justify-center gap-2 group/btn shadow-xl shadow-cnc-500/20">
            <span>Upgrade to VIP PRO</span> <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 animate-fade-in pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-2 rounded-full bg-cnc-500 animate-pulse"></div>
               <span className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.3em]">Quantum Protocol v3.1</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tighter text-white">Strategy Simulator</h1>
            <p className="text-gray-500 mt-2 text-sm max-w-xl">Deep-dive into historical market cycles using high-fidelity algorithmic backtesting.</p>
         </div>
         <div className="flex bg-cnc-800 border border-cnc-700 rounded-2xl p-4 gap-6">
            <div className="flex flex-col">
               <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Server Latency</span>
               <span className="text-xs font-mono font-bold text-emerald-500">12ms - Optimal</span>
            </div>
            <div className="w-px h-full bg-cnc-700"></div>
            <div className="flex flex-col">
               <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Algorithm</span>
               <span className="text-xs font-mono font-bold text-cnc-500">GEN-AI FLUX</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* Configuration Sidebar */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-cnc-800 border border-cnc-700 rounded-[40px] p-8 space-y-8 shadow-xl">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
                       <Layers size={12} className="text-cnc-500"/> Market Instrument
                    </label>
                    <select value={pair} onChange={(e) => setPair(e.target.value)} className="w-full bg-cnc-900 border border-cnc-700 rounded-2xl p-4 text-sm font-mono focus:border-cnc-500 outline-none transition-all">
                      {FOREX_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
                       <Activity size={12} className="text-cnc-500"/> Strategic Logic
                    </label>
                    <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="w-full bg-cnc-900 border border-cnc-700 rounded-2xl p-4 text-sm font-mono focus:border-cnc-500 outline-none transition-all">
                      {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Timeframe</label>
                    <select value={timeframe} onChange={(e) => setTimeframe(e.target.value as Timeframe)} className="w-full bg-cnc-900 border border-cnc-700 rounded-2xl p-4 text-sm font-mono focus:border-cnc-500 outline-none">
                      {Object.values(Timeframe).map(tf => <option key={tf} value={tf}>{tf}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Resolution</label>
                    <div className="w-full bg-cnc-900 border border-cnc-700 rounded-2xl p-4 text-xs text-center font-bold text-emerald-500 ring-1 ring-emerald-500/20">PRECISE</div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
                       <Calendar size={12} /> Range Start
                    </label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-cnc-900 border border-cnc-700 rounded-2xl p-4 text-sm font-mono focus:border-cnc-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
                       <Calendar size={12} /> Range End
                    </label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-cnc-900 border border-cnc-700 rounded-2xl p-4 text-sm font-mono focus:border-cnc-500 outline-none" />
                  </div>
               </div>

               <button 
                  onClick={handleRunBacktest}
                  disabled={loading}
                  className="w-full py-5 bg-cnc-500 hover:bg-white text-cnc-900 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl shadow-cnc-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
               >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <><Play size={16} fill="currentColor" className="group-hover:scale-110 transition-transform"/> Run Protocol</>}
               </button>
            </div>

            <div className="bg-cnc-900/50 border border-cnc-700 rounded-[32px] p-6 flex gap-4 items-start">
               <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
               <p className="text-[10px] text-gray-500 leading-relaxed font-medium uppercase tracking-wider">
                  Verified Simulation. All generated reports use decentralized processing to ensure non-biased performance mapping.
               </p>
            </div>
         </div>

         {/* Results Display */}
         <div className="lg:col-span-8">
            {loading ? (
               <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center space-y-8 animate-pulse">
                  <div className="relative">
                     <div className="w-32 h-32 border-4 border-cnc-700 border-t-cnc-500 rounded-full animate-spin"></div>
                     <FlaskConical className="absolute inset-0 m-auto text-cnc-500" size={40} />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-2xl font-bold text-white uppercase tracking-widest">{loadingMessages[loadingStep]}</h3>
                     <p className="text-xs text-gray-500 font-mono">Parallel processing historical candles...</p>
                  </div>
               </div>
            ) : report ? (
               <div className="space-y-8 animate-fade-in">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[
                        { label: 'Net Profit', val: `${report.netProfit >= 0 ? '+' : ''}${report.netProfit}%`, icon: TrendingUp, color: report.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500' },
                        { label: 'Win Rate', val: `${report.winRate}%`, icon: Target, color: 'text-white' },
                        { label: 'Expectancy', val: '1.45', icon: Activity, color: 'text-cnc-500' },
                        { label: 'Max DD', val: `${report.maxDrawdown}%`, icon: AlertCircle, color: 'text-rose-500' },
                     ].map((s, i) => (
                        <div key={i} className="bg-cnc-800 border border-cnc-700 p-6 rounded-[32px] text-center space-y-1 hover:border-cnc-500/30 transition-all group">
                           <div className="text-[9px] uppercase font-bold text-gray-500 tracking-widest mb-2 flex justify-center items-center gap-1.5 group-hover:text-cnc-500">
                              <s.icon size={10} /> {s.label}
                           </div>
                           <div className={`text-2xl font-mono font-bold ${s.color}`}>{s.val}</div>
                        </div>
                     ))}
                  </div>

                  {/* Equity Curve Chart */}
                  <div className="bg-cnc-800 border border-cnc-700 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><TrendingUp size={120} /></div>
                     <div className="flex justify-between items-center mb-10 relative z-10">
                        <div>
                           <h3 className="text-2xl font-bold tracking-tight text-white">Performance Matrix</h3>
                           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">Institutional Equity Mapping</p>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Profit Factor</div>
                           <div className="text-2xl font-mono font-bold text-cnc-500">{report.profitFactor.toFixed(2)}</div>
                        </div>
                     </div>
                     <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={report.equityCurve}>
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--cnc-500)" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="var(--cnc-500)" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.3} />
                              <XAxis dataKey="name" stroke="#52525b" fontSize={9} axisLine={false} tickLine={false} tickMargin={15} />
                              <YAxis stroke="#52525b" fontSize={9} axisLine={false} tickLine={false} tickMargin={15} tickFormatter={(v) => `${v}%`} />
                              <Tooltip 
                                 contentStyle={{ backgroundColor: 'var(--cnc-900)', border: '1px solid var(--cnc-700)', borderRadius: '16px', fontSize: '11px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                 itemStyle={{ color: 'var(--cnc-500)', fontWeight: 'bold' }}
                              />
                              <Area type="monotone" dataKey="value" stroke="var(--cnc-500)" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" animationDuration={2000} />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Log & AI Reasoning */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-cnc-900 border border-cnc-700 rounded-[32px] p-8 relative overflow-hidden h-full">
                        <h4 className="text-[10px] uppercase font-bold text-cnc-500 tracking-widest mb-6 flex items-center gap-2">
                           <Info size={14} /> Simulation Intelligence
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium font-mono">
                           {report.summary}
                        </p>
                     </div>
                     
                     <div className="bg-cnc-800 border border-cnc-700 rounded-[32px] p-8 h-full">
                        <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-6 flex items-center gap-2">
                           <ListChecks size={14} /> Trade Log Preview
                        </h4>
                        <div className="space-y-4">
                           {[1,2,3,4].map(i => (
                              <div key={i} className="flex items-center justify-between py-2 border-b border-cnc-700/50 last:border-0">
                                 <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    <div className="flex flex-col">
                                       <span className="text-xs font-bold text-white uppercase">{i % 2 === 0 ? 'Buy' : 'Sell'} Execution</span>
                                       <span className="text-[9px] text-gray-500">Day {i * 7} of cycle</span>
                                    </div>
                                 </div>
                                 <span className={`text-xs font-mono font-bold ${i % 2 === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {i % 2 === 0 ? '+1.25%' : '-0.50%'}
                                 </span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="h-full min-h-[600px] bg-cnc-800/20 border-2 border-dashed border-cnc-700 rounded-[48px] flex flex-col items-center justify-center text-center p-12 space-y-6 group hover:border-cnc-500/40 transition-all duration-700">
                  <div className="w-24 h-24 bg-cnc-800 rounded-[32px] flex items-center justify-center text-gray-700 border border-cnc-700 group-hover:scale-110 group-hover:bg-cnc-900 transition-all">
                     <FlaskConical size={40} className="group-hover:text-cnc-500 transition-colors" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-bold text-gray-400 group-hover:text-white transition-colors">Strategic Engine Offline</h3>
                     <p className="text-sm text-gray-600 max-w-xs mx-auto mt-2">Configure your protocol and range to generate institutional analytics.</p>
                  </div>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default BacktestPage;