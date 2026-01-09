import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TradingStats, MarketAnalysis } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  incrementUsage: () => void;
  upgradeToVip: () => void;
  verifyUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  history: any[];
  addToHistory: (item: any) => void;
  guestUsage: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [guestUsage, setGuestUsage] = useState(0);

  // Helper to sync user state to both session and "db" (localStorage list)
  const persistUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('cnc_active_session', JSON.stringify(updatedUser));
    
    // Sync with users list
    const users = JSON.parse(localStorage.getItem('cnc_users') || '[]');
    const index = users.findIndex((u: any) => u.email === updatedUser.email);
    if (index !== -1) {
      // Merge updated fields while keeping password
      users[index] = { ...users[index], ...updatedUser };
      localStorage.setItem('cnc_users', JSON.stringify(users));
    }
  };

  // Initialize from localStorage
  useEffect(() => {
    // 1. Load User Session and Handle Daily Reset
    const storedUser = localStorage.getItem('cnc_active_session');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const today = new Date().toDateString();
      
      // Daily Reset Logic
      if (parsedUser.lastResetDate !== today) {
        parsedUser.freeCreditsUsed = 0;
        parsedUser.lastResetDate = today;
        // We update the state and storage immediately
        localStorage.setItem('cnc_active_session', JSON.stringify(parsedUser));
        
        // Sync reset to DB
        const users = JSON.parse(localStorage.getItem('cnc_users') || '[]');
        const idx = users.findIndex((u: any) => u.email === parsedUser.email);
        if (idx !== -1) {
             users[idx].freeCreditsUsed = 0;
             users[idx].lastResetDate = today;
             localStorage.setItem('cnc_users', JSON.stringify(users));
        }
      }
      setUser(parsedUser);
    }
    
    // 2. Load History
    const storedHistory = localStorage.getItem('cnc_user_history');
    if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
    }

    // 3. Guest Logic
    const today = new Date().toDateString();
    const storedGuestData = localStorage.getItem('cnc_guest_tracker');
    if (storedGuestData) {
      const { date, count } = JSON.parse(storedGuestData);
      if (date === today) {
        setGuestUsage(count);
      } else {
        setGuestUsage(0);
        localStorage.setItem('cnc_guest_tracker', JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      localStorage.setItem('cnc_guest_tracker', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  // Update Stats based on History
  useEffect(() => {
    if (user && history.length > 0) {
      const totalTrades = history.length;
      
      // Calculate realistic metrics from history
      const wins = history.filter((h: MarketAnalysis) => h.confidence > 75).length; 
      const winRate = (wins / totalTrades) * 100;
      
      // Best Pair Logic (Most signals generated)
      const pairMap: Record<string, number> = {};
      history.forEach((h: MarketAnalysis) => {
        pairMap[h.pair] = (pairMap[h.pair] || 0) + 1;
      });
      const bestPair = Object.entries(pairMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

      // Avg R/R Calculation
      const rrValues = history.map((h: MarketAnalysis) => {
        const parts = h.riskRewardRatio.split(':');
        return parts.length === 2 ? parseFloat(parts[1]) : 2;
      });
      const avgRRValue = rrValues.reduce((a, b) => a + b, 0) / (rrValues.length || 1);

      const newStats: TradingStats = {
        totalTrades,
        winRate: parseFloat(winRate.toFixed(1)),
        profitFactor: 1.1 + (wins * 0.1),
        netPnL: totalTrades * 125 - (totalTrades - wins) * 75,
        averageRiskReward: `1:${avgRRValue.toFixed(1)}`,
        bestPair: bestPair
      };

      const updatedUser = { ...user, stats: newStats };
      if (JSON.stringify(user.stats) !== JSON.stringify(newStats)) {
         persistUserUpdate(updatedUser);
      }
      localStorage.setItem('cnc_user_history', JSON.stringify(history));
    }
  }, [history]);

  const getUsers = () => {
    const users = localStorage.getItem('cnc_users');
    return users ? JSON.parse(users) : [];
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const today = new Date().toDateString();
      if (foundUser.lastResetDate !== today) {
        foundUser.freeCreditsUsed = 0;
        foundUser.lastResetDate = today;
        const index = users.findIndex((u: any) => u.email === email);
        users[index] = foundUser;
        localStorage.setItem('cnc_users', JSON.stringify(users));
      }

      const { password: _, ...userSafe } = foundUser;
      setUser(userSafe);
      localStorage.setItem('cnc_active_session', JSON.stringify(userSafe));
      return true;
    }
    return false;
  };

  const register = async (email: string, name: string, password: string, phone: string): Promise<boolean> => {
    const users = getUsers();
    if (users.find((u: any) => u.email === email)) return false;

    const newUser: any = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      password,
      isVip: false,
      isVerified: false,
      freeCreditsUsed: 0,
      lastResetDate: new Date().toDateString(),
      stats: {
        winRate: 0,
        totalTrades: 0,
        profitFactor: 0,
        netPnL: 0,
        averageRiskReward: "0:0",
        bestPair: "-"
      }
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('cnc_users', JSON.stringify(updatedUsers));
    
    const { password: _, ...userSafe } = newUser;
    setUser(userSafe);
    localStorage.setItem('cnc_active_session', JSON.stringify(userSafe));
    return true;
  };

  const verifyUser = async () => {
    if (user) {
      persistUserUpdate({ ...user, isVerified: true });
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      persistUserUpdate({ ...user, ...data });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cnc_active_session');
    setHistory([]); 
  };

  const incrementUsage = () => {
    if (user && !user.isVip) {
      persistUserUpdate({ ...user, freeCreditsUsed: user.freeCreditsUsed + 1 });
    } else if (!user) {
      const newCount = guestUsage + 1;
      setGuestUsage(newCount);
      const today = new Date().toDateString();
      localStorage.setItem('cnc_guest_tracker', JSON.stringify({ date: today, count: newCount }));
    }
  };

  const upgradeToVip = () => {
    if (user) {
      persistUserUpdate({ ...user, isVip: true });
    }
  };

  const addToHistory = (item: any) => {
    if (user) {
      setHistory(prev => [item, ...prev]);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      incrementUsage,
      upgradeToVip,
      verifyUser,
      updateProfile,
      history,
      addToHistory,
      guestUsage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
