import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, ExternalLink } from 'lucide-react';
import { fetchMarketNews } from '../services/geminiService';
import { NewsItem } from '../types';

const NewsFeed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketNews();
      setNews(data.news);
      setSources(data.sources);
    } catch (error) {
      console.error("Failed to load news", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="bg-cnc-800 rounded-2xl border border-cnc-700 p-6 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Newspaper className="text-cnc-500" size={24} />
          <h2 className="text-xl font-bold">Market News</h2>
        </div>
        <button 
          onClick={loadNews}
          disabled={loading}
          className={`p-2 rounded-lg bg-cnc-900 text-gray-500 hover:text-cnc-500 transition-colors ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {loading && news.length === 0 ? (
          [1, 2, 3, 4].map((i) => (
             <div key={i} className="animate-pulse">
               <div className="h-4 bg-cnc-900 rounded w-3/4 mb-2"></div>
               <div className="h-3 bg-cnc-900 rounded w-1/4"></div>
             </div>
          ))
        ) : (
          news.map((item, index) => (
            <div key={index} className="group p-3 rounded-xl bg-cnc-900/40 border border-cnc-700/50 hover:border-cnc-500/30 transition-all">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-200 mb-2 leading-tight group-hover:text-cnc-400 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium px-2 py-0.5 bg-cnc-800 rounded text-gray-400">{item.source}</span>
                <span>{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-cnc-700">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Sources</p>
          <div className="flex flex-wrap gap-2">
            {sources.map((url, idx) => {
              try {
                const domain = new URL(url).hostname.replace('www.', '');
                return (
                  <a 
                    key={idx} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-cnc-500 hover:text-white bg-cnc-900/80 px-2 py-1 rounded-full transition-colors"
                  >
                    {domain} <ExternalLink size={10} />
                  </a>
                );
              } catch (e) { return null; }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;