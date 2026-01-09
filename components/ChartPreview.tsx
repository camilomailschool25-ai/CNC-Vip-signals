import React, { useEffect, useRef } from 'react';
import { Timeframe } from '../types';
import { useSettings } from '../context/SettingsContext';

interface ChartPreviewProps {
  pair: string;
  timeframe: string;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({ pair, timeframe }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { chartConfig, theme: appTheme } = useSettings();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    // Map timeframe to TradingView interval
    const getInterval = (tf: string) => {
      switch (tf) {
        case Timeframe.M1: return '1';
        case Timeframe.M5: return '5';
        case Timeframe.M15: return '15';
        case Timeframe.M30: return '30';
        case Timeframe.H1: return '60';
        case Timeframe.H4: return '240';
        case Timeframe.D1: return 'D';
        default: return '60';
      }
    };

    // Clean pair format (remove slash) e.g., "EUR/USD" -> "EURUSD"
    const symbol = `FX:${pair.replace('/', '')}`;

    // Determine theme
    const widgetTheme = chartConfig.theme === 'system' ? appTheme : chartConfig.theme;

    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": getInterval(timeframe),
      "timezone": chartConfig.timezone || "Etc/UTC",
      "theme": widgetTheme,
      "style": chartConfig.style,
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": !chartConfig.showToolbar,
      "hide_legend": false,
      "save_image": false,
      "calendar": false,
      "hide_volume": true,
      "support_host": "https://www.tradingview.com"
    });

    containerRef.current.appendChild(script);

    return () => {
      // Cleanup handled by innerHTML = '' on next effect run
    };
  }, [pair, timeframe, chartConfig, appTheme]);

  return (
    <div className="h-[450px] w-full bg-cnc-800 rounded-2xl border border-cnc-700 overflow-hidden shadow-xl relative animate-fade-in transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 group">
      <div className="absolute inset-0" ref={containerRef}>
        <div className="tradingview-widget-container" style={{ height: "100%", width: "100%" }}>
          <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
        </div>
      </div>
    </div>
  );
};

export default ChartPreview;