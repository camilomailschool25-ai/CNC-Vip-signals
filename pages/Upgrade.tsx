import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Check, Crown, Zap, X, CreditCard, Smartphone, Wallet, Lock, CheckCircle, Loader2, ArrowLeft, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { AppRoute } from '../types';
import toast from 'react-hot-toast';

interface UpgradeProps {
  navigate: (route: AppRoute) => void;
}

type PaymentStatus = 'idle' | 'processing' | 'redirecting' | 'verifying' | 'success' | 'error';
type PaymentMethod = 'stripe' | 'card' | 'apple' | 'google' | 'mbway';

const Upgrade: React.FC<UpgradeProps> = ({ navigate }) => {
  const { upgradeToVip, user } = useAuth();
  const { t } = useSettings();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const resetForm = () => {
    setStatus('idle');
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setZip('');
    setPhoneNumber('');
  };

  const handleStripeFlow = () => {
    setStatus('redirecting');
    const toastId = toast.loading("Connecting to Stripe...");
    
    // Simulate redirection to Stripe
    setTimeout(() => {
      toast.dismiss(toastId);
      // In a real app: window.location.href = stripeSessionUrl;
      // Here we simulate the user "returning" from Stripe after 3 seconds
      setStatus('verifying');
      toast.loading("Verifying transaction status...", { id: "verify-stripe" });
      
      setTimeout(() => {
        toast.success("Payment confirmed by Stripe!", { id: "verify-stripe" });
        handleSuccess();
      }, 3000);
    }, 2000);
  };

  const handleCardPayment = () => {
    if (cardNumber.length < 16 || expiry.length < 5 || cvc.length < 3) {
      toast.error("Please check card details");
      return;
    }
    setStatus('processing');
    setTimeout(() => {
        handleSuccess();
    }, 2500);
  };

  const handleMBWayPayment = () => {
    const phoneRegex = /^(9[1236]\d{7}|2\d{8})$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      toast.error("Invalid number");
      return;
    }
    setStatus('processing');
    setTimeout(() => {
      // Simulate MBWay Push
      toast.success("Notification sent to your device");
      setTimeout(handleSuccess, 4000);
    }, 1500);
  };

  const handleSuccess = () => {
    setStatus('success');
    setTimeout(() => {
        upgradeToVip();
        navigate(AppRoute.DASHBOARD);
        toast.success("Welcome to VIP, " + (user?.name || "Trader") + "!");
    }, 2000);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod === 'stripe') handleStripeFlow();
    else if (selectedMethod === 'card') handleCardPayment();
    else if (selectedMethod === 'mbway') handleMBWayPayment();
    else { 
      setStatus('processing'); 
      setTimeout(handleSuccess, 2000); 
    }
  };

  const renderPaymentContent = () => {
    if (status === 'success') {
      return (
        <div className="p-12 flex flex-col items-center justify-center h-[450px] text-center animate-fade-in">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-500/10">
             <CheckCircle size={48} className="text-white" />
          </div>
          <h3 className="text-3xl font-bold uppercase tracking-tighter text-slate-900 dark:text-white">Payment Approved</h3>
          <p className="text-gray-500 font-mono mt-4 max-w-[240px]">Initializing your PRO features and analysis workspace...</p>
        </div>
      );
    }

    if (status === 'redirecting' || status === 'verifying') {
       return (
         <div className="p-12 flex flex-col items-center justify-center h-[450px] text-center animate-fade-in space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-cnc-700 border-t-cnc-500 rounded-full animate-spin"></div>
              <Lock className="absolute inset-0 m-auto text-cnc-500" size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {status === 'redirecting' ? 'Secure Gateway' : 'Syncing Payment Data'}
              </h3>
              <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                {status === 'redirecting' ? 'Redirecting to Stripe...' : 'Finalizing with bank...'}
              </p>
            </div>
         </div>
       );
    }

    return (
      <div className="p-8">
         <div className="mb-8 bg-cnc-900/50 p-6 rounded-2xl border border-cnc-700 flex justify-between items-center">
            <div>
               <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Subscription Plan</div>
               <div className="text-xl font-bold text-slate-900 dark:text-white">VIP Monthly Pro</div>
            </div>
            <div className="text-right">
               <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white">€11.00</div>
               <div className="text-[10px] text-gray-500 font-bold uppercase">Billed Monthly</div>
            </div>
         </div>

         <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid grid-cols-5 gap-3">
               {[
                 { id: 'stripe', icon: ShieldCheck, label: 'Stripe' },
                 { id: 'card', icon: CreditCard, label: 'Card' },
                 { id: 'apple', icon: Wallet, label: 'Apple' },
                 { id: 'google', icon: Wallet, label: 'Google' },
                 { id: 'mbway', icon: Smartphone, label: 'MB WAY' }
               ].map(m => (
                  <button 
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as any)}
                    className={`p-3 border flex flex-col items-center justify-center gap-2 transition-all rounded-xl ${
                        selectedMethod === m.id 
                        ? 'bg-cnc-500 text-cnc-900 border-cnc-500 shadow-xl shadow-cnc-500/20 ring-2 ring-cnc-500/20' 
                        : 'bg-cnc-900 border-cnc-700 hover:border-cnc-500 text-gray-500'
                    }`}
                  >
                     <m.icon size={20} />
                     <span className="text-[10px] font-bold uppercase tracking-tighter">{m.label}</span>
                  </button>
               ))}
            </div>

            <div className="min-h-[140px]">
              {selectedMethod === 'stripe' && (
                 <div className="bg-cnc-900 border border-cnc-700 rounded-2xl p-8 text-center space-y-4 animate-fade-in">
                    <div className="w-16 h-16 bg-[#635BFF]/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-[#635BFF]/30">
                       <ShieldCheck size={32} className="text-[#635BFF]" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 dark:text-white">Stripe Checkout</h3>
                       <p className="text-xs text-gray-500 mt-2 leading-relaxed px-4">
                          Safe, secure, and encrypted. Support for cards, iDEAL, and regional methods.
                       </p>
                    </div>
                 </div>
              )}

              {selectedMethod === 'card' && (
                 <div className="space-y-4 animate-fade-in">
                    <div className="bg-cnc-900 border border-cnc-700 rounded-2xl p-6 space-y-4">
                        <div className="relative">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Card Number</label>
                            <input 
                              type="text" 
                              placeholder="0000 0000 0000 0000" 
                              className="w-full bg-transparent border-b border-cnc-700 py-2 text-slate-900 dark:text-white font-mono focus:border-cnc-500 outline-none transition-colors"
                              required 
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Expiry</label>
                              <input 
                                type="text" 
                                placeholder="MM / YY" 
                                className="w-full bg-transparent border-b border-cnc-700 py-2 text-slate-900 dark:text-white font-mono focus:border-cnc-500 outline-none"
                                required 
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                              />
                           </div>
                           <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">CVC</label>
                              <input 
                                type="text" 
                                placeholder="000" 
                                className="w-full bg-transparent border-b border-cnc-700 py-2 text-slate-900 dark:text-white font-mono focus:border-cnc-500 outline-none"
                                required 
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                              />
                           </div>
                        </div>
                    </div>
                 </div>
              )}
              
              {selectedMethod === 'mbway' && (
                  <div className="bg-cnc-900 border border-cnc-700 rounded-2xl p-6 animate-fade-in">
                      <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Phone Number (MB WAY)</label>
                      <input 
                        type="tel" 
                        placeholder="9xx xxx xxx" 
                        className="w-full bg-transparent border-b border-cnc-700 py-2 text-slate-900 dark:text-white font-mono text-xl outline-none focus:border-cnc-500" 
                        required 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                      />
                  </div>
              )}

              {(selectedMethod === 'apple' || selectedMethod === 'google') && (
                 <div className="bg-cnc-900 border border-cnc-700 rounded-2xl p-8 text-center animate-fade-in flex flex-col items-center justify-center space-y-3">
                    <Wallet className="text-gray-500" size={32} />
                    <p className="text-xs text-gray-500">Pay using your device wallet</p>
                 </div>
              )}
            </div>

            <div className="space-y-4">
              <button 
                  type="submit" 
                  disabled={status !== 'idle'} 
                  className={`w-full py-5 font-bold uppercase tracking-[0.2em] text-xs flex justify-center items-center gap-3 rounded-2xl transition-all ${
                      status !== 'idle' 
                      ? 'bg-cnc-700 text-gray-400 cursor-not-allowed' 
                      : selectedMethod === 'stripe'
                          ? 'bg-[#635BFF] hover:bg-[#5349E0] text-white shadow-xl shadow-indigo-500/20'
                          : 'bg-cnc-500 text-cnc-900 hover:bg-cnc-600 shadow-xl shadow-cnc-500/20'
                  }`}
              >
                 {status === 'processing' ? <Loader2 className="animate-spin" size={18} /> : (
                     selectedMethod === 'stripe' ? (
                         <>
                           <span>Proceed to Stripe</span>
                           <ExternalLink size={16} />
                         </>
                     ) : `Complete Purchase`
                 )}
              </button>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Lock size={12} />
                <span className="text-[10px] uppercase font-bold tracking-widest">256-Bit SSL Encrypted</span>
              </div>
            </div>
         </form>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
       <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cnc-500/10 border border-cnc-500/20 rounded-full text-cnc-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Zap size={12} /> Pro Access
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white">Master the markets.</h1>
          <p className="text-gray-500 uppercase tracking-[0.3em] text-xs">Unlock professional institutional-grade analysis</p>
       </div>

       <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="border border-cnc-700 p-10 flex flex-col opacity-60 hover:opacity-100 transition-all rounded-[32px] bg-cnc-900/20 backdrop-blur-sm group">
             <div className="mb-8">
               <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Basic</h3>
               <p className="text-xs text-gray-500">For traders getting started</p>
             </div>
             <div className="text-5xl font-mono font-bold mb-10 text-slate-900 dark:text-white">€0</div>
             <ul className="space-y-5 mb-10 flex-1">
                <li className="flex gap-3 text-sm text-gray-500 items-center"><Check size={18} className="text-gray-700" /> 3 Daily Analysis</li>
                <li className="flex gap-3 text-sm text-gray-500 items-center"><Check size={18} className="text-gray-700" /> Major FX Pairs Only</li>
                <li className="flex gap-3 text-sm text-gray-500 items-center"><X size={18} className="text-gray-700" /> No AI Chart Upload</li>
                <li className="flex gap-3 text-sm text-gray-500 items-center"><X size={18} className="text-gray-700" /> Standard Latency</li>
             </ul>
             <button className="w-full py-5 border border-cnc-700 text-[10px] font-bold uppercase tracking-widest cursor-default rounded-2xl group-hover:border-gray-500 transition-colors">Current Tier</button>
          </div>

          {/* VIP Tier */}
          <div className="border-2 border-cnc-500 bg-cnc-800 p-10 flex flex-col relative transform hover:-translate-y-2 transition-all duration-500 shadow-3xl rounded-[32px] overflow-hidden">
             <div className="absolute top-0 right-0 bg-cnc-500 text-cnc-900 text-[10px] font-bold px-5 py-2 uppercase tracking-widest rounded-bl-3xl">Active</div>
             <div className="mb-8">
               <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white flex items-center gap-2">
                 <Crown className="text-cnc-500" size={20} /> VIP PRO
               </h3>
               <p className="text-xs text-cnc-500 font-bold uppercase tracking-widest">Professional Tier</p>
             </div>
             <div className="text-5xl font-mono font-bold mb-10 text-slate-900 dark:text-white">€11<span className="text-xl text-gray-500 font-normal ml-2">/mo</span></div>
             <ul className="space-y-5 mb-10 flex-1">
                <li className="flex gap-3 text-sm text-slate-700 dark:text-gray-300 items-center"><Check size={18} className="text-cnc-500" /> Unlimited AI Deep Analysis</li>
                <li className="flex gap-3 text-sm text-slate-700 dark:text-gray-300 items-center"><Check size={18} className="text-cnc-500" /> AI Vision Chart Uploads</li>
                <li className="flex gap-3 text-sm text-slate-700 dark:text-gray-300 items-center"><Check size={18} className="text-cnc-500" /> Full M1 to D1 Timeframes</li>
                <li className="flex gap-3 text-sm text-slate-700 dark:text-gray-300 items-center"><Check size={18} className="text-cnc-500" /> Priority Server Node Access</li>
                <li className="flex gap-3 text-sm text-slate-700 dark:text-gray-300 items-center"><Check size={18} className="text-cnc-500" /> Real-time 24/7 AI Support</li>
             </ul>
             <button 
               onClick={() => setShowPaymentModal(true)}
               className="w-full py-5 bg-cnc-500 hover:bg-white text-cnc-900 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl shadow-cnc-500/40 transition-all active:scale-95"
             >
               Start Membership
             </button>
          </div>
       </div>

       {showPaymentModal && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
             <div className="bg-cnc-800 w-full max-w-xl border border-cnc-700 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[32px] overflow-hidden">
                <div className="flex justify-between items-center p-8 border-b border-cnc-700 bg-cnc-900/50">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-xl">
                        <ShieldCheck size={24} className="text-emerald-500"/>
                      </div>
                      <h2 className="font-bold uppercase tracking-[0.2em] text-sm text-slate-900 dark:text-white">Secure Checkout</h2>
                   </div>
                   <button 
                    onClick={() => { setShowPaymentModal(false); resetForm(); }} 
                    className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-cnc-700 transition-all"
                   >
                    <X size={20} />
                   </button>
                </div>
                <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                  {renderPaymentContent()}
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default Upgrade;