import React, { useState, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { generateAvatar } from '../services/geminiService';
import { ThemeType } from '../types';
import { 
  Globe, Moon, Sun, Bell, Shield, FileText, BarChart2, TrendingUp, Lock, Trash2, 
  Smartphone, Mail, Layout, MousePointer, CheckCircle, AlertTriangle, Volume2, 
  Clock, Zap, Target, Activity, BellRing, Camera, Wand2, Edit3, Save, X, Loader2,
  QrCode, Copy, ShieldCheck, ChevronRight, Palette, Cpu, Wind, Trees
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SectionProps {
  title: string;
  children?: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="mb-8 animate-fade-in">
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">{title}</h3>
    <div className="bg-cnc-800 rounded-xl border border-cnc-700 overflow-hidden transition-colors duration-300 shadow-sm">
      {children}
    </div>
  </div>
);

interface RowProps {
  icon: any;
  label: string;
  right: React.ReactNode;
  description?: string;
}

const Row = ({ icon: Icon, label, right, description }: RowProps) => (
  <div className="flex items-center justify-between p-4 border-b border-cnc-700 last:border-0 hover:bg-cnc-700/30 transition-colors">
    <div className="flex items-center space-x-3 flex-1">
      <div className="p-2 bg-cnc-900 rounded-lg text-gray-500 dark:text-gray-400 border border-cnc-700/50">
        <Icon size={18} />
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-slate-900 dark:text-gray-200 block text-sm">{label}</span>
        {description && <span className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">{description}</span>}
      </div>
    </div>
    <div className="pl-4 shrink-0">{right}</div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button 
    onClick={(e) => { e.preventDefault(); onChange(); }}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 border border-transparent focus:outline-none ${checked ? 'bg-cnc-500' : 'bg-cnc-900 border-cnc-700'}`}
  >
    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const SettingsPage = () => {
  const { 
    language, setLanguage, 
    theme, setTheme, 
    t,
    chartConfig, setChartConfig,
    tradingConfig, setTradingConfig,
    securityConfig, setSecurityConfig
  } = useSettings();
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'app'>('profile');

  // Profile Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState("");
  const [showGenModal, setShowGenModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveBio = () => {
    updateProfile({ bio: bioInput });
    setIsEditing(false);
    toast.success("Profile saved");
  };

  const handleGenerateAvatar = async () => {
    if (!avatarPrompt) return;
    setIsGenerating(true);
    try {
      const img = await generateAvatar(avatarPrompt);
      updateProfile({ avatar: img });
      toast.success("AI Avatar created!");
      setShowGenModal(false);
    } catch (e) {
      toast.error("Generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const themes: { id: ThemeType; icon: any; preview: string[]; label: string }[] = [
    { id: 'light', icon: Sun, preview: ['bg-white', 'bg-slate-100', 'bg-slate-900'], label: 'Light' },
    { id: 'dark', icon: Moon, preview: ['bg-slate-900', 'bg-slate-800', 'bg-white'], label: 'Professional' },
    { id: 'oled', icon: Lock, preview: ['bg-black', 'bg-zinc-900', 'bg-white'], label: 'OLED Pure' },
    { id: 'cyberpunk', icon: Cpu, preview: ['bg-black', 'bg-indigo-950', 'bg-emerald-400'], label: 'Neon Cyber' },
    { id: 'nord', icon: Wind, preview: ['bg-[#2e3440]', 'bg-[#3b4252]', 'bg-[#88c0d0]'], label: 'Nordic Blue' },
    { id: 'forest', icon: Trees, preview: ['bg-[#0b120b]', 'bg-[#1a241a]', 'bg-[#c1e4c1]'], label: 'Deep Forest' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-32 px-4 md:px-0 mt-10">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
         <h1 className="text-4xl font-bold text-white tracking-tighter mb-4 md:mb-0">{t.settings}</h1>
         <div className="bg-cnc-800 p-1.5 rounded-xl border border-cnc-700 flex shadow-inner">
            <button onClick={() => setActiveTab('profile')} className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-cnc-500 text-cnc-900 shadow-lg' : 'text-gray-500 hover:text-white'}`}>Identity & Performance</button>
            <button onClick={() => setActiveTab('app')} className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'app' ? 'bg-cnc-500 text-cnc-900 shadow-lg' : 'text-gray-500 hover:text-white'}`}>System Configuration</button>
         </div>
      </div>

      {activeTab === 'profile' && (
        <div className="animate-fade-in space-y-8">
           {/* Profile Header Card */}
           <div className="bg-cnc-800 border border-cnc-700 p-8 flex flex-col md:flex-row items-start gap-8 rounded-[40px] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-6">
                 <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase border tracking-widest ${user?.isVip ? 'bg-cnc-500/10 border-cnc-500 text-cnc-500' : 'bg-gray-600/10 border-gray-600 text-gray-500'}`}>
                    {user?.isVip ? 'VIP PRO ACCOUNT' : 'BASIC ACCOUNT'}
                 </span>
              </div>
              <div className="relative group shrink-0">
                <div className="w-28 h-28 bg-cnc-900 rounded-[32px] flex items-center justify-center text-4xl font-bold border-2 border-cnc-700 overflow-hidden shadow-2xl">
                   {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span>{user?.name.charAt(0)}</span>}
                </div>
                <div className="absolute inset-0 bg-black/70 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                   <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-cnc-500 rounded-xl hover:bg-white transition-all transform hover:scale-110"><Camera size={16} className="text-black" /></button>
                   <button onClick={() => setShowGenModal(true)} className="p-2 bg-indigo-500 rounded-xl hover:bg-white transition-all transform hover:scale-110"><Wand2 size={16} className="text-white" /></button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
              </div>

              <div className="flex-1 w-full text-center md:text-left pt-2">
                 <h2 className="text-3xl font-bold mb-1 tracking-tight text-white">{user?.name}</h2>
                 <p className="text-gray-500 text-xs font-mono mb-6 tracking-wider">{user?.email}</p>
                 <div className="relative group/bio">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <textarea value={bioInput} onChange={(e) => setBioInput(e.target.value)} className="w-full bg-cnc-900 border border-cnc-700 rounded-2xl p-4 text-sm focus:border-cnc-500 outline-none transition-all" rows={2} placeholder="Define your trading philosophy..." />
                        <div className="flex flex-col gap-2">
                          <button onClick={saveBio} className="p-3 bg-cnc-500 text-cnc-900 rounded-xl hover:bg-white transition-colors"><Save size={18}/></button>
                          <button onClick={() => setIsEditing(false)} className="p-3 bg-cnc-700 text-white rounded-xl hover:bg-rose-500 transition-colors"><X size={18}/></button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative p-5 bg-cnc-900/50 border border-dashed border-cnc-700 rounded-2xl min-h-[80px] cursor-pointer hover:border-cnc-500 transition-all group" onClick={() => setIsEditing(true)}>
                        <p className="text-sm text-gray-400 italic font-medium">{user?.bio || "Describe your professional trading style..."}</p>
                        <Edit3 size={14} className="absolute top-4 right-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                 </div>
                 <div className="flex items-center justify-center md:justify-start gap-6 mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-2"><Smartphone size={14} className="text-cnc-500"/> {user?.phone || 'NOT LINKED'}</span>
                    <span className="flex items-center gap-2"><Shield size={14} className={user?.isVerified ? "text-emerald-500" : "text-gray-500"}/> {user?.isVerified ? "KYC VERIFIED" : "UNVERIFIED"}</span>
                 </div>
              </div>
           </div>

           {/* Performance Hub */}
           <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] px-2">Performance Analytics</h3>
              {user?.stats ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { l: 'Profitability Rate', v: `${user.stats.winRate}%`, c: user.stats.winRate > 60 ? 'text-emerald-500' : 'text-white', icon: Activity },
                      { l: 'Execution History', v: user.stats.totalTrades, c: 'text-white', icon: Layout },
                      { l: 'Efficiency Factor', v: user.stats.profitFactor.toFixed(2), c: 'text-white', icon: Zap },
                      { l: 'Projected Yield', v: `$${user.stats.netPnL}`, c: user.stats.netPnL > 0 ? 'text-emerald-500' : 'text-rose-500', icon: TrendingUp },
                      { l: 'Risk Profile', v: user.stats.averageRiskReward, c: 'text-white', icon: Shield },
                      { l: 'Primary Asset', v: user.stats.bestPair, c: 'text-cnc-500', icon: Target },
                    ].map((s, i) => (
                      <div key={i} className="bg-cnc-800 border border-cnc-700 p-6 rounded-3xl text-center group hover:border-cnc-500 transition-all shadow-lg relative overflow-hidden">
                          <div className="absolute top-2 right-2 opacity-5"><s.icon size={24}/></div>
                          <div className="text-gray-500 text-[9px] uppercase font-bold mb-1 tracking-widest">{s.l}</div>
                          <div className={`text-2xl font-mono font-bold ${s.c}`}>{s.v}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-12 bg-cnc-800 border border-cnc-700 rounded-3xl text-center">
                   <p className="text-gray-500 text-sm">No institutional performance data available.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'app' && (
        <div className="animate-fade-in space-y-8">
          {/* Enhanced Theme Selector */}
          <Section title="Appearance Themes">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {themes.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col gap-3 p-4 rounded-3xl border transition-all duration-300 relative group ${
                       theme === t.id ? 'bg-cnc-900 border-cnc-500 shadow-xl' : 'bg-cnc-900/50 border-cnc-700 text-gray-500 hover:border-cnc-500/50'
                    }`}
                  >
                     <div className="flex items-center justify-between w-full">
                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${theme === t.id ? 'text-white' : 'text-gray-500'}`}>{t.label}</span>
                        {theme === t.id && <CheckCircle size={14} className="text-cnc-500" />}
                     </div>
                     <div className="flex gap-1.5 h-10 w-full rounded-xl overflow-hidden shadow-inner border border-cnc-700/50 p-1">
                        {t.preview.map((c, idx) => <div key={idx} className={`flex-1 rounded-lg ${c}`} />)}
                     </div>
                     {theme === t.id && (
                       <div className="absolute -bottom-1 -right-1 bg-cnc-500 p-1 rounded-full shadow-lg">
                          <Zap size={8} className="text-cnc-900" />
                       </div>
                     )}
                  </button>
               ))}
            </div>
          </Section>

          <Section title="Interface Options">
            <Row 
              icon={Globe} 
              label="System Language"
              right={
                <div className="flex bg-cnc-900 rounded-xl p-1 border border-cnc-700">
                  {(['en', 'pt', 'fr', 'es'] as const).map((lang) => (
                    <button 
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${language === lang ? 'bg-cnc-500 text-cnc-900 shadow-md' : 'text-gray-500 hover:text-white'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              }
            />
             <Row 
                icon={BarChart2} label="Default Chart Render"
                right={
                  <select value={chartConfig.style} onChange={(e) => setChartConfig({ ...chartConfig, style: e.target.value })} className="bg-cnc-900 border border-cnc-700 text-white text-[10px] rounded-xl p-2.5 outline-none uppercase font-bold tracking-widest focus:border-cnc-500 transition-all">
                    <option value="1">Candles (OHLC)</option>
                    <option value="2">Line Chart</option>
                    <option value="3">Area Projection</option>
                    <option value="8">Heikin Ashi</option>
                  </select>
                }
             />
          </Section>

          <Section title="Security Protocol">
            <Row icon={Lock} label="Double Factor Authentication" description="Require secure code on every session access" right={<Toggle checked={securityConfig.twoFactor} onChange={() => setSecurityConfig({...securityConfig, twoFactor: !securityConfig.twoFactor})} />} />
            <button className="w-full flex items-center p-6 bg-rose-500/5 hover:bg-rose-500/10 transition-colors border-t border-cnc-700 group">
                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all mr-4 shadow-sm"><Trash2 size={20} /></div>
                <div className="text-left">
                   <span className="font-bold text-rose-500 text-sm block uppercase tracking-widest">Permanent Deletion</span>
                   <span className="text-[10px] text-gray-500">Purge all history and performance metrics</span>
                </div>
            </button>
          </Section>
        </div>
      )}

      {showGenModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
           <div className="bg-cnc-800 w-full max-w-md border border-cnc-700 rounded-[32px] p-8 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-cnc-500/10 rounded-xl"><Wand2 size={24} className="text-cnc-500"/></div>
                    <h3 className="font-bold uppercase tracking-[0.2em] text-sm text-white">AI Vision Generator</h3>
                 </div>
                 <button onClick={() => setShowGenModal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed font-medium uppercase tracking-widest px-1">Describe your trading identity for the strategic avatar.</p>
              <textarea 
                className="w-full bg-cnc-900 border border-cnc-700 rounded-2xl p-4 text-sm focus:border-cnc-500 outline-none mb-6 text-white min-h-[120px] transition-all"
                placeholder="E.g. A digital fox wearing futuristic glasses, glowing eyes, dark background, ultra high detail..."
                value={avatarPrompt}
                onChange={(e) => setAvatarPrompt(e.target.value)}
              />
              <button 
                onClick={handleGenerateAvatar}
                disabled={isGenerating || !avatarPrompt}
                className="w-full py-5 bg-cnc-500 hover:bg-white text-cnc-900 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-xl shadow-cnc-500/20"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <><Zap size={16}/> Initiate Synthesis</>}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;