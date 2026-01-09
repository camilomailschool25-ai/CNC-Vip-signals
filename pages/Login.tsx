import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { AppRoute } from '../types';
import { TrendingUp, Mail, Lock, ArrowRight, User as UserIcon, AlertCircle, Smartphone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginProps {
  navigate: (route: AppRoute) => void;
}

const Login: React.FC<LoginProps> = ({ navigate }) => {
  const { login, register, verifyUser } = useAuth();
  const { t } = useSettings();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MOCK_VERIFICATION_CODE = "123456";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
        setError('Please fill in all fields');
        return;
    }

    setLoading(true);

    try {
        if (isRegistering) {
            if (!name || !phone) {
                setError('Name and Phone are required');
                setLoading(false);
                return;
            }
            const success = await register(email, name, password, phone);
            if (!success) {
                setError('Account already exists');
                setLoading(false);
            } else {
                setLoading(false);
                setIsVerifying(true);
                setTimeout(() => {
                  toast.success(t.code_sent || "Verification code sent!");
                  toast((t_toast) => (
                    <span className="flex items-center gap-2 font-mono text-sm">
                      Code: <b className="text-cnc-500">{MOCK_VERIFICATION_CODE}</b>
                    </span>
                  ), { duration: 6000 });
                }, 500);
            }
        } else {
            const success = await login(email, password);
            if (!success) {
                setError('Invalid email or password');
                setLoading(false);
            } else {
                navigate(AppRoute.DASHBOARD);
            }
        }
    } catch (err) {
        setError('An unexpected error occurred');
        setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (verificationCode === MOCK_VERIFICATION_CODE) {
      await verifyUser();
      toast.success("Verified");
      setLoading(false);
      navigate(AppRoute.DASHBOARD);
    } else {
      setError(t.invalid_code || "Invalid code");
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-cnc-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-cnc-800 border border-cnc-700 p-8 shadow-2xl animate-fade-in text-center">
            <div className="w-16 h-16 bg-cnc-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-cnc-900" />
            </div>
            <h1 className="text-2xl font-bold mb-2 uppercase tracking-wide">{t.verify_phone}</h1>
            <p className="text-gray-500 text-sm mb-8 font-mono">Code sent to {phone}</p>

            <form onSubmit={handleVerify} className="space-y-6">
              <input 
                  type="text" 
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-cnc-900 border border-cnc-700 p-4 text-center text-3xl tracking-[0.5em] text-cnc-500 focus:border-cnc-500 outline-none font-mono"
                  placeholder="000000"
                  required
                />
               <button 
                type="submit"
                disabled={loading || verificationCode.length < 6}
                className="w-full bg-cnc-500 hover:bg-cnc-600 text-cnc-900 font-bold py-4 uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : t.verify_btn}
              </button>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-cnc-900">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 border-r border-cnc-700">
        <div className="w-full max-w-md animate-fade-in">
           <div className="mb-12">
             <div className="w-12 h-12 bg-cnc-500 flex items-center justify-center mb-6">
                <TrendingUp size={24} className="text-cnc-900" />
             </div>
             <h1 className="text-4xl font-bold tracking-tighter mb-2">CNC Trading</h1>
             <p className="text-gray-500 uppercase tracking-widest text-xs">Professional Analysis Platform</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
             {error && (
                <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-3 text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
             )}

             {isRegistering && (
                <>
                   <div className="relative group">
                     <UserIcon className="absolute left-4 top-4 text-gray-500 group-hover:text-cnc-500 transition-colors" size={18} />
                     <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-cnc-900 border border-cnc-700 p-3 pl-12 text-sm focus:border-cnc-500 outline-none transition-colors"
                      placeholder="Full Name"
                    />
                   </div>
                   <div className="relative group">
                     <Smartphone className="absolute left-4 top-4 text-gray-500 group-hover:text-cnc-500 transition-colors" size={18} />
                     <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-cnc-900 border border-cnc-700 p-3 pl-12 text-sm focus:border-cnc-500 outline-none transition-colors"
                      placeholder="Phone Number"
                    />
                   </div>
                </>
             )}

             <div className="relative group">
                <Mail className="absolute left-4 top-4 text-gray-500 group-hover:text-cnc-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cnc-900 border border-cnc-700 p-3 pl-12 text-sm focus:border-cnc-500 outline-none transition-colors"
                  placeholder="Email Address"
                />
             </div>

             <div className="relative group">
                <Lock className="absolute left-4 top-4 text-gray-500 group-hover:text-cnc-500 transition-colors" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cnc-900 border border-cnc-700 p-3 pl-12 text-sm focus:border-cnc-500 outline-none transition-colors"
                  placeholder="Password"
                />
             </div>

             <button 
               type="submit"
               disabled={loading}
               className="w-full bg-cnc-500 hover:bg-cnc-600 text-cnc-900 font-bold py-4 uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 mt-4"
             >
               {loading ? 'Processing...' : (isRegistering ? t.register_btn : t.login_btn)}
               {!loading && <ArrowRight size={16} />}
             </button>
           </form>

           <div className="mt-8 text-center border-t border-cnc-700 pt-6">
             <button 
               onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
               className="text-xs font-bold text-gray-500 hover:text-cnc-500 uppercase tracking-wide transition-colors"
             >
                {isRegistering ? "Already have an account? Log In" : t.register_link}
             </button>
           </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block w-1/2 relative bg-cnc-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
          alt="Architecture" 
          className="w-full h-full object-cover grayscale opacity-80"
        />
        <div className="absolute bottom-16 left-16 z-20 max-w-md">
           <h2 className="text-4xl font-bold text-white mb-4">Precision in every trade.</h2>
           <p className="text-gray-300 text-lg">Advanced AI analytics meeting minimalist design for the modern trader.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;