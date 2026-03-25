"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, PlaySquare, ArrowRight } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    // Proceed to analyze page
    router.push(`/analyze?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-3xl w-full space-y-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium border border-indigo-100 dark:border-indigo-500/20 mb-4 transition-transform hover:scale-105 cursor-default">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
          VidMetrics Lite is running
        </div>

        {/* Hero Typography */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Analyze any YouTube <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
            competitor instantly.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Instantly discover which videos are performing best on any YouTube channel. Uncover the strategies that drive viral growth.
        </p>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="mt-10 max-w-2xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <PlaySquare className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-40 py-5 text-lg rounded-2xl border border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="Paste YouTube Channel URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            required
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-600/30 active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Features / Social Proof */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-500" />
            <span>Deep Data Extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-500 text-lg">🔥</span>
            <span>Viral "Crushing" Scores</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-500 text-lg">⚡</span>
            <span>Lightning Fast Results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
