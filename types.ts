export type SignalType = 'BUY' | 'SELL' | 'WAIT';

export interface TradingStats {
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  netPnL: number;
  averageRiskReward: string;
  bestPair: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  isVip: boolean;
  freeCreditsUsed: number;
  lastResetDate?: string;
  stats?: TradingStats;
  avatar?: string;
  bio?: string;
}

export interface MarketAnalysis {
  pair: string;
  timeframe: string;
  signal: SignalType;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number[];
  riskRewardRatio: string;
  confidence: number;
  confluences: string[];
  reasoning: string;
  indicators: {
    rsi: number;
    macd: string;
    trend: string;
  };
  timestamp: number;
  imageUrl?: string;
}

export interface BacktestReport {
  netProfit: number;
  winRate: number;
  totalTrades: number;
  maxDrawdown: number;
  profitFactor: number;
  equityCurve: { name: string; value: number }[];
  summary: string;
}

export type ThemeType = 'light' | 'dark' | 'cyberpunk' | 'nord' | 'oled' | 'forest';

export interface NewsItem {
  title: string;
  source: string;
  time: string;
}

export enum Timeframe {
  M1 = 'M1',
  M5 = 'M5',
  M15 = 'M15',
  M30 = 'M30',
  H1 = 'H1',
  H4 = 'H4',
  D1 = 'D1',
}

export interface Translation {
  [key: string]: string;
}

export interface Translations {
  pt: Translation;
  en: Translation;
  fr: Translation;
  es: Translation;
}

export enum AppRoute {
  SPLASH = '/',
  LOGIN = '/login',
  REGISTER = '/register',
  DASHBOARD = '/dashboard',
  RISK_CALCULATOR = '/risk-calculator',
  BACKTEST = '/backtest',
  HISTORY = '/history',
  SETTINGS = '/settings',
  UPGRADE = '/upgrade',
}