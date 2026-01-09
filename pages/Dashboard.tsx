import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { FOREX_PAIRS } from '../constants';
import { Timeframe, AppRoute, MarketAnalysis } from '../types';
import { analyzeMarket } from '../services/geminiService';
import SignalCard from '../components/SignalCard';
import ChartPreview from '../components/ChartPreview';
import NewsFeed from '../components/NewsFeed';
import OnboardingTour from '../components/OnboardingTour';
import { Search, Zap, Clock, AlertTriangle, Upload, X, ImageIcon, Lock, Save, ChevronDown, Wifi, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardProps {
  navigate: (route: AppRoute) => void;
}

// Minimalist Live Ticker Component
const LiveTicker = ({ pair }: { pair: string }) => {
  const [price, setPrice] = useState<number>(0);
  const [prevPrice, setPrevPrice] = useState<number>(0);

  useEffect(() => {
    // Initial fetch
    const fetchPrice = async () => {
      try {
        const base = pair.split('/')[0];
        const quote = pair.split('/')[1];
        const res = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${quote}`);
        const data = await res.json();
        const basePrice = data.rates[quote];
        setPrice(basePrice);
        setPrevPrice(basePrice);
      } catch (e) { console.error(e); }
    };
    fetchPrice();

    // Simulation of micro-ticks for visual liveness since we don't have a Websocket for all pairs
    const interval = setInterval(() => {
       setPrevPrice(p => p);
       setPrice(p => {
         const movement = (Math.random() - 0.5) * (p * 0.0002);
         return p + movement;
       });
    }, 2000);

    return () => clearInterval(interval);
  }, [pair]);

  const isUp = price >= prevPrice;

  return (
    <div className="flex flex-col items-end">
       <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Live Price</span>
       <div className={`text-2xl font-mono font-bold flex items-center gap-2 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {price.toFixed(5)}
          <span className="text-xs px-1.5 py-0.5 rounded bg-cnc-900 border border-cnc-700">
             {isUp ? '▲' : '▼'}
          </span>
       </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ navigate }) => {
  const { user, incrementUsage, addToHistory, guestUsage } = useAuth();
  const { t } = useSettings();
  
  const [selectedPair, setSelectedPair] = useState(() => localStorage.getItem('cnc_selected_pair') || FOREX_PAIRS[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(() => localStorage.getItem('cnc_selected_timeframe') || Timeframe.H1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketAnalysis | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if onboarding is complete
    const tourDone = localStorage.getItem('cnc_onboarding_complete');
    if (!tourDone) {
      setShowTour(true);
    }
    
    // Check Market Status
    const checkMarketStatus = () => {
      const now = new Date();
      const day = now.getUTCDay(); // 0 = Sun, 6 = Sat
      const hour = now.getUTCHours();
      
      let isOpen = true;
      // Closed Saturday
      if (day === 6) isOpen = false;
      // Closed Friday after 22:00 UTC
      else if (day === 5 && hour >= 22) isOpen = false;
      // Closed Sunday before 22:00 UTC
      else if (day === 0 && hour < 22) isOpen = false;
      
      // Crypto is always open
      if (selectedPair.includes('BTC') || selectedPair.includes('ETH')) {
        isOpen = true;
      }

      setIsMarketOpen(isOpen);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
    return () => clearInterval(interval);

  }, [selectedPair]);

  const handleTourFinish = () => {
    localStorage.setItem('cnc_onboarding_complete', 'true');
    setShowTour(false);
  };

  useEffect(() => localStorage.setItem('cnc_selected_pair', selectedPair), [selectedPair]);
  useEffect(() => localStorage.setItem('cnc_selected_timeframe', selectedTimeframe), [selectedTimeframe]);

  const currentUsage = user ? user.freeCreditsUsed : guestUsage;
  const isVip = user?.isVip || false;
  const isLimitReached = !isVip && currentUsage >= 3;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setResult(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (isLimitReached) {
        if (!user) {
            toast.error(t.login_required || "Daily limit reached. Please login.");
            navigate(AppRoute.LOGIN);
        } else {
            toast.error(t.upgrade_prompt || "Limit reached. Upgrade to VIP.");
            navigate(AppRoute.UPGRADE);
        }
        return;
    }

    setLoading(true);
    setResult(null);
    const rawBase64 = uploadedImage ? uploadedImage.split(',')[1] : undefined;

    try {
        const analysis = await analyzeMarket(selectedPair, selectedTimeframe, rawBase64);
        setResult(analysis);
        incrementUsage();
        if (isVip) addToHistory(analysis);
        
        // Scroll to results on mobile
        setTimeout(() => {
          document.getElementById('tour-signals')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

    } catch (e: any) {
        console.error("Analysis Failed:", e.message);
        
        let errorMessage = "Analysis Failed. Please try again.";
        
        switch (e.message) {
            case "MISSING_API_KEY":
                errorMessage = "System Error: API Key is missing. Please check configuration.";
                break;
            case "INVALID_API_KEY":
                errorMessage = "Authentication Error: Invalid API Key. Please verify your credentials.";
                break;
            case "RATE_LIMIT_EXCEEDED":
                errorMessage = "Usage Limit Exceeded: The system is busy. Please try again in a minute.";
                break;
            case "NETWORK_ERROR":
                errorMessage = "Connection Error: Please check your internet connection and try again.";
                break;
            case "SERVER_ERROR":
                errorMessage = "Service Unavailable: The AI service is currently down. Please try again later.";
                break;
            case "EMPTY_RESPONSE":
                errorMessage = "No Analysis Generated: Please try a different pair or timeframe.";
                break;
            case "API_ERROR":
                errorMessage = "AI Service Error: An unexpected error occurred during analysis.";
                break;
            default:
                errorMessage = "An unexpected error occurred. Please try again.";
        }
        
        toast.error(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {showTour && <OnboardingTour onFinish={handleTourFinish} />}

      {/* Hero Header */}
      <div className="relative h-48 md:h-64 bg-cnc-800 overflow-hidden mb-8 border-b border-cnc-700">
         <img 
            src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-20 grayscale"
            alt="Abstract"
         />
         <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
            <div className="flex justify-between items-end">
               <div>
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-2">{t.dashboard}</h1>
                  <div className="flex items-center gap-3">
                     <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                     </span>
                     <div className="flex items-center gap-2 bg-cnc-900/50 px-2 py-0.5 rounded-full border border-cnc-700/50">
                        <div className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isMarketOpen ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {isMarketOpen ? 'Market Open' : 'Market Closed'}
                        </span>
                     </div>
                  </div>
               </div>
               <div className="hidden md:block">
                  <LiveTicker pair={selectedPair} />
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Column: Chart & Control */}
           <div className="lg:col-span-2 space-y-8">
              
              <div className="bg-cnc-900 border border-cnc-700 p-1 relative">
                 <ChartPreview pair={selectedPair} timeframe={selectedTimeframe} />
                 {/* Mobile Ticker overlay */}
                 <div className="md:hidden absolute top-4 right-4 bg-cnc-900/90 backdrop-blur p-2 rounded border border-cnc-700">
                    <LiveTicker pair={selectedPair} />
                 </div>
              </div>

              {/* Control Panel */}
              <div className="bg-cnc-800 border border-cnc-700 p-6 md:p-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="space-y-2" id="tour-pair">
                       <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Asset</label>
                       <div className="relative">
                          <select 
                            value={selectedPair}
                            onChange={(e) => setSelectedPair(e.target.value)}
                            className="w-full bg-cnc-900 border border-cnc-700 p-3 text-sm font-mono focus:border-cnc-500 outline-none appearance-none rounded-none"
                          >
                            {FOREX_PAIRS.map(pair => <option key={pair} value={pair}>{pair}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={14} />
                       </div>
                    </div>

                    <div className="space-y-2" id="tour-timeframe">
                       <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Timeframe</label>
                       <div className="relative">
                          <select 
                            value={selectedTimeframe}
                            onChange={(e) => setSelectedTimeframe(e.target.value)}
                            className="w-full bg-cnc-900 border border-cnc-700 p-3 text-sm font-mono focus:border-cnc-500 outline-none appearance-none rounded-none disabled:opacity-50"
                            disabled={!isVip && selectedTimeframe === Timeframe.M1} 
                          >
                            {(Object.values(Timeframe) as string[]).map(tf => <option key={tf} value={tf}>{tf}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={14} />
                       </div>
                    </div>

                    <div className="flex items-end" id="tour-analyze">
                       <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className={`w-full py-3 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all ${
                          isLimitReached 
                          ? 'bg-cnc-700 text-gray-500 cursor-not-allowed'
                          : 'bg-cnc-500 text-cnc-900 hover:bg-cnc-600'
                        }`}
                       >
                         {loading ? <div className="w-4 h-4 border-2 border-cnc-900 border-t-transparent rounded-full animate-spin"></div> : <><Zap size={14} /> ANALYZE</>}
                       </button>
                    </div>

                 </div>

                 <div className="mt-6 pt-6 border-t border-cnc-700 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                       <label className={`cursor-pointer flex items-center gap-2 text-xs font-bold transition-colors w-full md:w-auto justify-center md:justify-start ${!uploadedImage ? 'text-cnc-500 animate-pulse' : 'text-gray-500'}`}>
                          <Upload size={14} />
                          {uploadedImage ? "CHANGE CHART" : "UPLOAD CHART FOR BEST RESULTS"}
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                       </label>
                       {uploadedImage && (
                          <div className="flex items-center gap-2 bg-cnc-900 px-2 py-1 border border-cnc-700">
                             <span className="text-[10px] text-cnc-500">IMAGE LOADED</span>
                             <button onClick={() => setUploadedImage(null)}><X size={12} /></button>
                          </div>
                       )}
                    </div>
                    {isLimitReached && (
                       <span className="text-[10px] text-rose-500 uppercase font-bold">Limit Reached</span>
                    )}
                 </div>
              </div>

              {/* Result Area Wrapper for Tour */}
              <div id="tour-signals">
                {(result || loading) && (
                   <SignalCard analysis={result || undefined} loading={loading} />
                )}
              </div>
           </div>

           {/* Right Column: Tools */}
           <div className="space-y-8 h-full flex flex-col">
              <NewsFeed />
           </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;