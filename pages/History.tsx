import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { MarketAnalysis } from '../types';
import { Filter, Calendar } from 'lucide-react';

const History = () => {
  const { history, user } = useAuth();
  const { t } = useSettings();
  
  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!user?.isVip) {
      return (
          <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">VIP Feature Locked</h2>
              <p className="text-gray-400">Upgrade to view your signal history.</p>
          </div>
      )
  }

  // Filter Logic
  const filteredHistory = history.filter(item => {
    if (!startDate && !endDate) return true;
    
    const itemDate = new Date(item.timestamp);
    // Reset time part for accurate date comparison
    itemDate.setHours(0, 0, 0, 0);

    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;

    if (start) start.setHours(0,0,0,0);
    if (end) end.setHours(0,0,0,0);

    if (start && itemDate < start) return false;
    if (end && itemDate > end) return false;

    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">{t.history}</h1>
        
        {/* Date Filter Controls */}
        <div className="flex items-center gap-2 bg-cnc-800 p-2 rounded-xl border border-cnc-700">
           <Filter size={16} className="text-gray-500 ml-2" />
           <div className="flex items-center gap-2">
             <input 
               type="date" 
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
               className="bg-cnc-900 border border-cnc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cnc-500"
               placeholder="Start"
             />
             <span className="text-gray-500">-</span>
             <input 
               type="date" 
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
               className="bg-cnc-900 border border-cnc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cnc-500"
               placeholder="End"
             />
           </div>
           {(startDate || endDate) && (
             <button 
               onClick={() => { setStartDate(''); setEndDate(''); }}
               className="text-xs text-cnc-500 hover:text-white px-2 font-medium"
             >
               Clear
             </button>
           )}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 bg-cnc-800 rounded-2xl border border-cnc-700">
            <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No analysis history found for this period.</p>
        </div>
      ) : (
        <div className="bg-cnc-800 rounded-2xl border border-cnc-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-cnc-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pair</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Signal</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entry</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Confidence</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cnc-700">
                        {filteredHistory.map((item: MarketAnalysis, idx) => (
                            <tr key={idx} className="hover:bg-cnc-700/20 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <div className="flex flex-col">
                                       <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                       <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                                    {item.pair} 
                                    <span className="text-xs font-normal text-gray-500 ml-1 block">{item.timeframe}</span>
                                    {item.imageUrl && (
                                      <span className="text-[10px] text-cnc-500 bg-cnc-500/10 px-1 rounded mt-1 inline-block">Image</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                                        ${item.signal === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 
                                          item.signal === 'SELL' ? 'bg-rose-500/10 text-rose-500' : 
                                          'bg-gray-500/10 text-gray-400'}`}>
                                        {item.signal}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                                    {item.entryPrice > 0 ? item.entryPrice.toFixed(5) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                       <div className="w-16 h-1.5 bg-cnc-700 rounded-full overflow-hidden">
                                          <div className="h-full bg-cnc-500" style={{ width: `${item.confidence}%` }}></div>
                                       </div>
                                       <span className="text-xs">{item.confidence}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default History;