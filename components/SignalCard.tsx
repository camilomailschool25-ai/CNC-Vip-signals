
import { ArrowUpRight, ArrowDownRight, Minus, Target, Shield, Activity, Copy, Check, ListChecks, Info, Zap } from 'lucide-react';
// Added Zap to the imports above to fix the "Cannot find name 'Zap'" error.
import React, { useState } from 'react';
import { MarketAnalysis } from '../types';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

interface SignalCardProps {
  analysis?: MarketAnalysis;
  loading?: boolean;
}

const SignalCard: React.FC<SignalCardProps> = ({ analysis, loading }) => {
  const { t } = useSettings();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!analysis) return;

    const timestamp = new Date().toLocaleString();
    const text = `🚨 *CNC INSTITUTIONAL SIGNAL* 🚨\n\n` +
      `📅 ${timestamp}\n` +
      `💱 PAIR: ${analysis.pair}\n` +
      `📊 TF: ${analysis.timeframe}\n` +
      `📢 SIGNAL: ${analysis.signal}\n` +
      `🎯 ENTRY: ${analysis.entryPrice.toFixed(5)}\n` +
      `🛑 SL: ${analysis.stopLoss.toFixed(5)}\n` +
      `💰 TP1: ${analysis.takeProfit[0].toFixed(5)}\n` +
      `💰 TP2: ${analysis.takeProfit[1].toFixed(5)}\n` +
      `💰 TP3: ${analysis.takeProfit[2].toFixed(5)}\n\n` +
      `📈 CONFLUENCES: ${analysis.confluences.join(', ')}\n\n` +
      `📝 Logic: ${analysis.reasoning}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Institutional analysis copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="border border-cnc-700 bg-cnc-800 p-8 rounded-[32px] animate-pulse">
        <div className="h-10 w-1/3 bg-cnc-900 rounded-xl mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="h-20 bg-cnc-900 rounded-2xl"></div>
           <div className="h-20 bg-cnc-900 rounded-2xl"></div>
           <div className="h-20 bg-cnc-900 rounded-2xl"></div>
        </div>
        <div className="h-32 bg-cnc-900 rounded-2xl mb-6"></div>
        <div className="h-20 bg-cnc-900 rounded-2xl"></div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="border border-cnc-700 bg-cnc-800 p-10 rounded-[48px] animate-fade-in relative overflow-hidden group shadow-2xl">
      {/* Dynamic Background Watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-700 pointer-events-none scale-150 transform rotate-12">
         <h1 className="text-[140px] font-black tracking-tighter uppercase leading-none">{analysis.signal}</h1>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between mb-10 gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-cnc-900 border border-cnc-700 rounded-full text-[10px] font-mono text-cnc-500 uppercase tracking-[0.2em] shadow-inner">
                    {analysis.pair} / {analysis.timeframe}
                 </div>
                 {analysis.confidence >= 80 && (
                   <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Zap size={10} fill="currentColor"/> HIGH PROBABILITY
                   </div>
                 )}
              </div>
              <div className="flex items-center gap-6">
                 <div className={`p-4 rounded-3xl ${
                   analysis.signal === 'BUY' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 
                   analysis.signal === 'SELL' ? 'bg-rose-500/10 text-rose-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 
                   'bg-gray-500/10 text-gray-500'
                 }`}>
                    {analysis.signal === 'BUY' && <ArrowUpRight size={48} />}
                    {analysis.signal === 'SELL' && <ArrowDownRight size={48} />}
                    {analysis.signal === 'WAIT' && <Minus size={48} />}
                 </div>
                 <div>
                    <h2 className="text-6xl font-black tracking-tighter leading-none text-white">
                      {analysis.signal}
                    </h2>
                    <p className="text-gray-500 uppercase font-bold text-[10px] tracking-[0.4em] mt-2">Strategic Execution</p>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-col items-end gap-6 w-full md:w-auto">
              <div className="bg-cnc-900/50 p-5 rounded-3xl border border-cnc-700 flex flex-col items-center justify-center min-w-[140px] shadow-inner">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-widest">Signal Confidence</div>
                <div className="text-4xl font-mono font-black text-white">{analysis.confidence}%</div>
                <div className="w-full h-1 bg-cnc-700 rounded-full mt-3 overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ${analysis.confidence >= 80 ? 'bg-emerald-500' : analysis.confidence >= 50 ? 'bg-cnc-500' : 'bg-rose-500'}`} 
                    style={{ width: `${analysis.confidence}%` }}
                   />
                </div>
              </div>
              
              <button 
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cnc-900 border border-cnc-700 hover:border-cnc-500 text-[10px] font-bold uppercase tracking-widest transition-all rounded-2xl hover:text-white shadow-lg active:scale-95"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? "Copied to Dashboard" : "Copy Performance Log"}
              </button>
           </div>
        </div>

        {analysis.signal !== 'WAIT' && (
           <div className="space-y-8">
             {/* Main Price Targets */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group bg-cnc-900/50 border border-cnc-700 hover:border-cnc-500/50 p-6 rounded-[32px] transition-all duration-300">
                   <div className="text-[10px] uppercase font-bold text-gray-500 mb-3 tracking-widest flex items-center gap-2">
                     <Activity size={12} className="text-cnc-500" /> Entry Zone
                   </div>
                   <div className="text-3xl font-mono font-bold text-white group-hover:scale-105 transition-transform origin-left">{analysis.entryPrice.toFixed(5)}</div>
                </div>
                <div className="group bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/50 p-6 rounded-[32px] transition-all duration-300">
                   <div className="text-[10px] uppercase font-bold text-rose-500 mb-3 tracking-widest flex items-center gap-2">
                     <Shield size={12} /> Stop Loss
                   </div>
                   <div className="text-3xl font-mono font-bold text-rose-500 group-hover:scale-105 transition-transform origin-left">{analysis.stopLoss.toFixed(5)}</div>
                </div>
                <div className="group bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/50 p-6 rounded-[32px] transition-all duration-300">
                   <div className="text-[10px] uppercase font-bold text-emerald-500 mb-3 tracking-widest flex items-center gap-2">
                     <Target size={12} /> Take Profit
                   </div>
                   <div className="text-3xl font-mono font-bold text-emerald-500 group-hover:scale-105 transition-transform origin-left">{analysis.takeProfit[0].toFixed(5)}</div>
                </div>
             </div>

             {/* Strategy Confluences - NEW SECTION */}
             <div className="bg-cnc-900 border border-cnc-700 rounded-[32px] p-8">
                <div className="flex items-center gap-3 mb-6">
                   <ListChecks size={20} className="text-cnc-500" />
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Institutional Confluences</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                   {analysis.confluences.map((conf, i) => (
                      <div key={i} className="px-4 py-2 bg-cnc-800 border border-cnc-700 rounded-xl flex items-center gap-2 group/conf hover:border-cnc-500/50 transition-all">
                         <div className="w-1.5 h-1.5 rounded-full bg-cnc-500 group-hover/conf:scale-150 transition-transform"></div>
                         <span className="text-[11px] font-bold text-white uppercase tracking-wider">{conf}</span>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-cnc-900/30 border border-dashed border-cnc-700 p-8 rounded-[32px] relative overflow-hidden">
                <div className="absolute top-4 right-4 text-gray-700"><Info size={24} /></div>
                <div className="relative z-10">
                   <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] mb-4">Strategic Reasoning</h4>
                   <p className="font-mono text-sm leading-relaxed text-gray-400 max-w-2xl">
                     {analysis.reasoning}
                   </p>
                </div>
                
                <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-cnc-700/50">
                   {[
                     { l: 'RSI Momentum', v: analysis.indicators.rsi },
                     { l: 'MACD Bias', v: analysis.indicators.macd },
                     { l: 'Structure', v: analysis.indicators.trend }
                   ].map((ind, i) => (
                      <div key={i} className="flex flex-col">
                         <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest mb-1">{ind.l}</span>
                         <span className="text-xs font-mono font-bold text-white uppercase">{ind.v}</span>
                      </div>
                   ))}
                </div>
             </div>
           </div>
        )}

        {analysis.signal === 'WAIT' && (
           <div className="bg-cnc-900 border border-cnc-700 rounded-[32px] p-10 mt-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Activity size={100} /></div>
              <h3 className="text-xl font-bold text-white mb-4">Patience is Key</h3>
              <p className="font-mono text-sm leading-relaxed text-gray-400 max-w-xl">{analysis.reasoning}</p>
              <div className="mt-8 flex gap-4">
                 <div className="px-4 py-2 bg-cnc-800 border border-cnc-700 rounded-xl text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    No Clear SMC BOS
                 </div>
                 <div className="px-4 py-2 bg-cnc-800 border border-cnc-700 rounded-xl text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Wait for Sweep
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default SignalCard;
