import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Zap, Target, Shield, Info } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const RiskCalculator = () => {
  const { tradingConfig } = useSettings();
  
  const [lotSize, setLotSize] = useState<number>(tradingConfig.defaultLotSize);
  const [entryPrice, setEntryPrice] = useState<string>(tradingConfig.defaultEntryPrice > 0 ? tradingConfig.defaultEntryPrice.toString() : '');
  const [stopLoss, setStopLoss] = useState<string>(tradingConfig.defaultStopLossPrice > 0 ? tradingConfig.defaultStopLossPrice.toString() : '');
  const [takeProfit, setTakeProfit] = useState<string>(tradingConfig.defaultTakeProfitPrice > 0 ? tradingConfig.defaultTakeProfitPrice.toString() : '');
  const [isJpy, setIsJpy] = useState(false);
  
  const [results, setResults] = useState({
    riskUsd: 0,
    rewardUsd: 0,
    riskPips: 0,
    rewardPips: 0,
    ratio: 0
  });

  useEffect(() => {
    setLotSize(tradingConfig.defaultLotSize);
    if (tradingConfig.defaultEntryPrice > 0) setEntryPrice(tradingConfig.defaultEntryPrice.toString());
    if (tradingConfig.defaultStopLossPrice > 0) setStopLoss(tradingConfig.defaultStopLossPrice.toString());
    if (tradingConfig.defaultTakeProfitPrice > 0) setTakeProfit(tradingConfig.defaultTakeProfitPrice.toString());
  }, [tradingConfig]);

  useEffect(() => {
    calculate();
  }, [lotSize, entryPrice, stopLoss, takeProfit, isJpy]);

  const calculate = () => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);

    if (!entry || !sl || !lotSize) {
      setResults({ riskUsd: 0, rewardUsd: 0, riskPips: 0, rewardPips: 0, ratio: 0 });
      return;
    }

    const multiplier = isJpy ? 100 : 10000;
    const riskPips = Math.abs(entry - sl) * multiplier;
    const rewardPips = tp ? Math.abs(tp - entry) * multiplier : 0;
    const valuePerPip = 10 * lotSize;

    const riskUsd = riskPips * valuePerPip;
    const rewardUsd = rewardPips * valuePerPip;
    const ratio = riskUsd > 0 ? rewardUsd / riskUsd : 0;

    setResults({
      riskUsd,
      rewardUsd,
      riskPips,
      rewardPips,
      ratio
    });
  };

  return (
    <div className="bg-cnc-800 rounded-[40px] border border-cnc-700 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header Panel */}
      <div className="bg-cnc-900/50 border-b border-cnc-700 px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cnc-500/10 rounded-2xl border border-cnc-500/20">
             <Calculator className="text-cnc-500" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Position Lab</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Risk Management Protocol</span>
               <span className="w-1 h-1 rounded-full bg-gray-700"></span>
               <span className="text-[10px] uppercase font-bold text-cnc-500 tracking-widest">Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex bg-cnc-900 p-1.5 rounded-2xl border border-cnc-700">
            <button 
                onClick={() => setIsJpy(false)}
                className={`px-6 py-2.5 text-[10px] font-bold rounded-xl transition-all ${!isJpy ? 'bg-cnc-500 text-cnc-900 shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
                STANDARD PAIR
            </button>
            <button 
                onClick={() => setIsJpy(true)}
                className={`px-6 py-2.5 text-[10px] font-bold rounded-xl transition-all ${isJpy ? 'bg-cnc-500 text-cnc-900 shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
                JPY PAIR
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Input Console */}
        <div className="lg:col-span-6 p-10 space-y-10 border-r border-cnc-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Trading Size</label>
                  <span className="text-[10px] text-cnc-500 font-bold bg-cnc-500/10 px-2 py-0.5 rounded">LOTS</span>
               </div>
               <div className="relative group">
                 <input 
                    type="number" 
                    step="0.01"
                    value={lotSize}
                    onChange={(e) => setLotSize(parseFloat(e.target.value) || 0)}
                    className="w-full bg-cnc-900/50 border border-cnc-700 rounded-2xl px-6 py-5 text-white font-mono text-xl focus:border-cnc-500 focus:bg-cnc-900 outline-none transition-all"
                    placeholder="0.00"
                 />
               </div>
            </div>
            
            <div className="space-y-3">
               <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Entry Level</label>
               <div className="relative">
                 <input 
                    type="number" 
                    step={isJpy ? "0.01" : "0.00001"}
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full bg-cnc-900/50 border border-cnc-700 rounded-2xl px-6 py-5 text-white font-mono text-xl focus:border-cnc-500 focus:bg-cnc-900 outline-none transition-all"
                    placeholder={isJpy ? "150.00" : "1.08000"}
                 />
                 <Zap className="absolute right-6 top-1/2 -translate-y-1/2 text-cnc-500/30" size={18} />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-rose-500">
                  <Shield size={14} />
                  <label className="text-[10px] uppercase font-bold tracking-widest">Stop Loss</label>
               </div>
               <input 
                  type="number" 
                  step={isJpy ? "0.01" : "0.00001"}
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-rose-500/5 border border-rose-500/20 rounded-2xl px-6 py-5 text-rose-500 font-mono text-xl focus:border-rose-500 focus:bg-rose-500/10 outline-none transition-all placeholder-rose-900/30"
                  placeholder="0.00000"
               />
            </div>
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-emerald-500">
                  <Target size={14} />
                  <label className="text-[10px] uppercase font-bold tracking-widest">Take Profit</label>
               </div>
               <input 
                  type="number" 
                  step={isJpy ? "0.01" : "0.00001"}
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-6 py-5 text-emerald-500 font-mono text-xl focus:border-emerald-500 focus:bg-emerald-500/10 outline-none transition-all placeholder-emerald-900/30"
                  placeholder="0.00000"
               />
            </div>
          </div>
          
          <div className="bg-cnc-900/30 p-4 rounded-2xl border border-dashed border-cnc-700 flex gap-3 items-start">
             <Info className="text-gray-500 mt-0.5" size={16} />
             <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
               Os cálculos assumem pares baseados em USD. Para outros cruzamentos, os valores de pip podem variar ligeiramente conforme a taxa de conversão da conta.
             </p>
          </div>
        </div>

        {/* Right: Analytics Panel */}
        <div className="lg:col-span-6 bg-cnc-900 p-10 flex flex-col justify-between">
           <div className="space-y-6">
              {/* Risk Segment */}
              <div className="group bg-cnc-800 border border-cnc-700 hover:border-rose-500/30 rounded-[32px] p-8 transition-all duration-500 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                    <ArrowDownRight size={80} className="text-rose-500" />
                 </div>
                 <div className="relative z-10 flex justify-between items-start">
                    <div>
                       <div className="text-[10px] uppercase font-bold text-rose-500 mb-2 tracking-[0.2em] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Capital At Risk
                       </div>
                       <div className="text-4xl font-mono font-bold text-white">
                          -${results.riskUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                       </div>
                       <div className="text-xs text-gray-500 mt-2 font-mono flex items-center gap-2">
                          <span className="bg-cnc-900 px-2 py-0.5 rounded border border-cnc-700">{results.riskPips.toFixed(1)} Pips</span>
                          <span>Exposure Level</span>
                       </div>
                    </div>
                    <div className="p-3 bg-rose-500/10 rounded-2xl">
                       <Shield className="text-rose-500" size={24} />
                    </div>
                 </div>
              </div>

              {/* Reward Segment */}
              <div className="group bg-cnc-800 border border-cnc-700 hover:border-emerald-500/30 rounded-[32px] p-8 transition-all duration-500 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                    <ArrowUpRight size={80} className="text-emerald-500" />
                 </div>
                 <div className="relative z-10 flex justify-between items-start">
                    <div>
                       <div className="text-[10px] uppercase font-bold text-emerald-500 mb-2 tracking-[0.2em] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Target Profit
                       </div>
                       <div className="text-4xl font-mono font-bold text-white">
                          +${results.rewardUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                       </div>
                       <div className="text-xs text-gray-500 mt-2 font-mono flex items-center gap-2">
                          <span className="bg-cnc-900 px-2 py-0.5 rounded border border-cnc-700">{results.rewardPips.toFixed(1)} Pips</span>
                          <span>Projected Yield</span>
                       </div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                       <Target className="text-emerald-500" size={24} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Efficiency Meter */}
           <div className="mt-8 bg-cnc-800 border border-cnc-700 rounded-[32px] p-8 flex items-center justify-between">
              <div>
                 <div className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] mb-2">Efficiency Ratio</div>
                 <div className={`text-5xl font-mono font-bold ${results.ratio >= 2 ? 'text-cnc-500' : 'text-yellow-500'}`}>
                    1:{results.ratio.toFixed(2)}
                 </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                 <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
                    results.ratio >= 3 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 
                    results.ratio >= 1.5 ? 'bg-cnc-500/10 border-cnc-500 text-cnc-500' : 
                    'bg-rose-500/10 border-rose-500 text-rose-500'
                 }`}>
                    {results.ratio >= 3 ? 'Institutional Grade' : results.ratio >= 1.5 ? 'Market Standard' : 'Low Efficiency'}
                 </div>
                 <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                       <div key={i} className={`w-6 h-1 rounded-full ${i <= Math.floor(results.ratio) ? 'bg-cnc-500' : 'bg-cnc-700'}`}></div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCalculator;