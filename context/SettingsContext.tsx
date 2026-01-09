import React, { createContext, useContext, useState, useEffect } from 'react';
import { Translations, Translation, ThemeType } from '../types';
import { TRANSLATIONS } from '../constants';

interface ChartConfig {
  style: string;
  showToolbar: boolean;
  theme: 'dark' | 'light' | 'system';
  timezone: string;
  autoAnalyze: boolean;
}

interface NotificationConfig {
  email: boolean;
  push: boolean;
  soundEnabled: boolean;
  highProbabilityOnly: boolean;
}

interface TradingConfig {
  defaultLotSize: number;
  defaultRiskPercent: number;
  defaultStopLossPips: number;
  defaultTakeProfitPips: number;
  defaultEntryPrice: number;
  defaultStopLossPrice: number;
  defaultTakeProfitPrice: number;
}

interface SettingsContextType {
  language: 'pt' | 'en' | 'fr' | 'es';
  setLanguage: (lang: 'pt' | 'en' | 'fr' | 'es') => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  t: Translation;
  
  chartConfig: ChartConfig;
  setChartConfig: (config: ChartConfig) => void;
  
  notificationConfig: NotificationConfig;
  setNotificationConfig: (config: NotificationConfig) => void;
  
  tradingConfig: TradingConfig;
  setTradingConfig: (config: TradingConfig) => void;
  
  securityConfig: { twoFactor: boolean };
  setSecurityConfig: (config: { twoFactor: boolean }) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'pt' | 'en' | 'fr' | 'es'>(() => {
    return (localStorage.getItem('cnc_lang') as 'pt' | 'en' | 'fr' | 'es') || 'pt';
  });
  
  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem('cnc_app_theme') as ThemeType) || 'dark';
  });

  const [chartConfig, setChartConfig] = useState<ChartConfig>(() => {
    const saved = localStorage.getItem('cnc_chart_config');
    return saved ? JSON.parse(saved) : { 
      style: '1', 
      showToolbar: true, 
      theme: 'dark', 
      timezone: 'Etc/UTC',
      autoAnalyze: false 
    };
  });

  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>(() => {
    const saved = localStorage.getItem('cnc_notif_config');
    return saved ? JSON.parse(saved) : { 
      email: true, 
      push: true, 
      soundEnabled: true,
      highProbabilityOnly: false 
    };
  });

  const [tradingConfig, setTradingConfig] = useState<TradingConfig>(() => {
    const saved = localStorage.getItem('cnc_trading_config');
    return saved ? JSON.parse(saved) : { 
      defaultLotSize: 0.1, 
      defaultRiskPercent: 1.0,
      defaultStopLossPips: 30,
      defaultTakeProfitPips: 60,
      defaultEntryPrice: 0,
      defaultStopLossPrice: 0,
      defaultTakeProfitPrice: 0
    };
  });

  const [securityConfig, setSecurityConfig] = useState(() => {
    const saved = localStorage.getItem('cnc_security_config');
    return saved ? JSON.parse(saved) : { twoFactor: false };
  });

  useEffect(() => {
    localStorage.setItem('cnc_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('cnc_app_theme', theme);
    const html = document.documentElement;
    
    // Remove all theme classes first
    html.classList.remove('dark', 'light', 'theme-cyberpunk', 'theme-nord', 'theme-oled', 'theme-forest');
    
    if (theme === 'dark' || theme === 'oled' || theme === 'cyberpunk' || theme === 'nord' || theme === 'forest') {
      html.classList.add('dark');
    }

    if (theme !== 'dark' && theme !== 'light') {
      html.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  useEffect(() => localStorage.setItem('cnc_chart_config', JSON.stringify(chartConfig)), [chartConfig]);
  useEffect(() => localStorage.setItem('cnc_notif_config', JSON.stringify(notificationConfig)), [notificationConfig]);
  useEffect(() => localStorage.setItem('cnc_trading_config', JSON.stringify(tradingConfig)), [tradingConfig]);
  useEffect(() => localStorage.setItem('cnc_security_config', JSON.stringify(securityConfig)), [securityConfig]);

  const value = {
    language,
    setLanguage,
    theme,
    setTheme,
    t: TRANSLATIONS[language],
    chartConfig,
    setChartConfig,
    notificationConfig,
    setNotificationConfig,
    tradingConfig,
    setTradingConfig,
    securityConfig,
    setSecurityConfig
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};