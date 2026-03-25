"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, Suspense } from "react";
import { 
  ArrowLeft, TrendingUp, Users, Eye, PlaySquare, Calendar, Filter, AlertTriangle, 
  Flame, Zap, Clock, Download, Plus, X, Sparkles, BarChart2, Activity, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { fetchYoutubeData, type ChannelData, type VideoStat } from "../actions";

// Enhanced Mock data generator for fallback
function generateMockData(url: string, prefix = ""): ChannelData {
  const baseVideos = [
    { title: `${prefix} I built a SaaS in 24 hours`, views: 450000, likes: 23000, daysAgo: 5 },
    { title: `${prefix} Why you should stop using React`, views: 890000, likes: 45000, daysAgo: 15 },
    { title: `${prefix} My $10k/mo side hustle revealed`, views: 250000, likes: 12000, daysAgo: 8 },
    { title: `${prefix} 10 VS Code extensions you need`, views: 120000, likes: 5000, daysAgo: 45 },
    { title: `${prefix} How to get your first 1000 users`, views: 75000, likes: 3500, daysAgo: 60 },
    { title: `${prefix} Next.js 15 is a game changer`, views: 320000, likes: 18000, daysAgo: 12 },
    { title: `${prefix} A day in the life of a software engineer`, views: 1500000, likes: 85000, daysAgo: 120 },
    { title: `${prefix} I quit my $300k Google job`, views: 2100000, likes: 115000, daysAgo: 200 },
  ];

  const now = new Date();
  const videos = baseVideos.map((v, i) => {
    const pubDate = new Date(now.getTime() - v.daysAgo * 24 * 60 * 60 * 1000);
    return {
      id: `vid-${prefix}-${i}`,
      title: v.title,
      thumbnail: `https://picsum.photos/seed/${prefix ? (i+50) : (i+150)}/320/180`,
      views: v.views,
      likes: v.likes,
      publishedAt: pubDate.toISOString(),
    };
  });

  return {
    name: url.includes("youtube.com") ? (prefix ? "Competitor Channel" : "Tech Entrepreneur") : "Unknown Channel",
    subscribers: prefix ? "850K" : "1.2M",
    totalViews: prefix ? "28M" : "45M",
    videos,
  };
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-6">
        <div className="h-16 w-16 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="flex-1 space-y-4">
          <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
        ))}
      </div>
    </div>
  );
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "";
  
  const [data, setData] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Controls
  const [timeFilter, setTimeFilter] = useState<"30" | "90" | "all">("30");
  const [sortBy, setSortBy] = useState<"views" | "score">("score");
  
  // State messages
  const [errorMsg, setErrorMsg] = useState("");
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Competitor logic
  const [compareUrl, setCompareUrl] = useState("");
  const [compareData, setCompareData] = useState<ChannelData | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [showCompareInput, setShowCompareInput] = useState(false);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetchYoutubeData(url).then(res => {
      if (res.error && res.isMock) {
        setIsUsingMock(true);
        setData(generateMockData(url));
        setLoading(false);
      } else if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
      } else {
        setData(res);
        setLoading(false);
      }
    });
  }, [url]);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareUrl.trim()) return;
    setCompareLoading(true);
    const res = await fetchYoutubeData(compareUrl);
    
    if (res.error && res.isMock) {
      setCompareData(generateMockData(compareUrl, "Comp - "));
    } else if (!res.error) {
      setCompareData(res);
    }
    setCompareLoading(false);
  };

  // Process Original Channel
  const processedVideos = useMemo(() => {
    if (!data || !data.videos) return [];
    let processed = data.videos.map(v => {
      const daysSincePosted = Math.max(1, Math.floor((new Date().getTime() - new Date(v.publishedAt).getTime()) / (1000 * 3600 * 24)));
      const viewsPerDay = Math.floor(v.views / daysSincePosted);
      // Enhanced Score: heavily weigh views per day, plus flat views factor
      const score = viewsPerDay * 2 + Math.floor(v.views / 1000); 
      return { ...v, daysSincePosted, viewsPerDay, score };
    });

    if (timeFilter !== "all") {
      const days = parseInt(timeFilter, 10);
      processed = processed.filter(v => v.daysSincePosted <= days);
    }

    processed.sort((a, b) => b[sortBy] - a[sortBy]);
    return processed;
  }, [data, sortBy, timeFilter]);

  // Insights derived directly from processed data
  const insights = useMemo(() => {
    if (!processedVideos.length) return null;
    
    const avgViews = Math.floor(processedVideos.reduce((acc, v) => acc + v.views, 0) / processedVideos.length);
    const mostViral = [...processedVideos].sort((a,b) => b.viewsPerDay - a.viewsPerDay)[0];
    const fastestGrowing = processedVideos.find(v => v.daysSincePosted <= 30) || mostViral;
    const underperforming = [...processedVideos].sort((a,b) => a.viewsPerDay - b.viewsPerDay)[0];

    // Posting Frequency (videos per week)
    let postingFreqStr = "N/A";
    let videosPerWeek = 0;
    if (processedVideos.length > 1) {
      const dates = processedVideos.map(v => new Date(v.publishedAt).getTime()).sort();
      const oldest = dates[0];
      const newest = dates[dates.length - 1];
      const weeksDiff = Math.max(1, (newest - oldest) / (1000 * 3600 * 24 * 7));
      videosPerWeek = processedVideos.length / weeksDiff;
      postingFreqStr = `${videosPerWeek.toFixed(1)} / week`;
    }

    const aiSummary = `This channel posts around ${postingFreqStr} and averages ${(avgViews/1000).toFixed(1)}k views per video. Recent content like "${fastestGrowing.title.substring(0, 30)}..." shows strong momentum. To maximize growth, replicate the format of highly viral videos which exceed ${(mostViral.viewsPerDay).toLocaleString()} daily views.`;

    return { avgViews, mostViral, fastestGrowing, underperforming, postingFreqStr, videosPerWeek, aiSummary };
  }, [processedVideos]);

  // Export to CSV
  const exportToCSV = () => {
    if (!processedVideos.length) return;
    const headers = ["Title", "Views", "Likes", "Days Ago", "Views per Day", "Score"];
    const rows = processedVideos.map(v => [
      `"${v.title.replace(/"/g, '""')}"`,
      v.views,
      v.likes,
      v.daysSincePosted,
      v.viewsPerDay,
      v.score
    ]);
    
    // \uFEFF is BOM. Semicolon (;) ensures columns split correctly in European/AZ Excel regions.
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${data?.name?.replace(/[^a-z0-9]/gi, '_') || 'channel'}_analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusBadge = (viewsPerDay: number) => {
    if (viewsPerDay > 1000) return <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold bg-rose-50 border border-rose-200 text-rose-700 shadow-sm whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>Viral</span>;
    if (viewsPerDay > 200) return <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold bg-amber-50 border border-amber-200 text-amber-700 shadow-sm whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>Growing</span>;
    return <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold bg-slate-50 border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>Slow</span>;
  };

  if (!url) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No Channel URL provided</h2>
        <Link href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Go back home</Link>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;

  if (errorMsg && !isUsingMock) {
     return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">An Error Occurred</h2>
        <p className="text-slate-500 max-w-md mb-8">{errorMsg}</p>
        <Link href="/" className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:shadow-lg transition-all active:scale-95">Search Again</Link>
      </div>
     )
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Toast Notification */}
      <div className={`fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="font-medium text-sm">Report downloaded successfully!</span>
      </div>

      <div className="flex items-center justify-between mb-8 animate-in slide-in-from-left-4 duration-500 delay-100">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors group font-medium">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Search
        </Link>
        <button onClick={exportToCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm active:scale-95">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {isUsingMock && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in fade-in duration-700">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Temporary Sample Data (Mock Data)</p>
              <p className="text-sm mt-1">Add your <strong>YOUTUBE_API_KEY</strong> to the <code>.env.local</code> file to fetch real statistics instead of mock data.</p>
            </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 mb-8 flex flex-col lg:flex-row items-start justify-between gap-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        <div className="absolute top-0 right-0 p-32 bg-indigo-50 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
              <PlaySquare className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{data?.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 truncate w-[250px] sm:w-[400px] text-sm">{url}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> Subscribers</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{data?.subscribers}</span>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5"/> Total Views</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{data?.totalViews}</span>
            </div>
          </div>
        </div>
        
        {/* Competitor Compare Action */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60 lg:w-[400px] w-full shrink-0">
          {!showCompareInput ? (
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium">Want to benchmark against a rival?</p>
              <button onClick={() => setShowCompareInput(true)} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:shadow-md transition-all active:scale-95">
                <Plus className="w-4 h-4" /> Compare Competitor
              </button>
            </div>
          ) : (
            <form onSubmit={handleCompare} className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Competitor URL</label>
                <button type="button" onClick={() => setShowCompareInput(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4"/>
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Paste channel URL..." 
                className="w-full pl-3 pr-24 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={compareUrl}
                onChange={(e) => setCompareUrl(e.target.value)}
                disabled={compareLoading}
              />
              <button disabled={compareLoading || !compareUrl.trim()} className="absolute bottom-1.5 right-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50">
                {compareLoading ? "Loading..." : "Compare"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Competitor Side-by-Side Validation */}
      {compareData && insights && (
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-3xl p-6 md:p-8 border border-indigo-100 dark:border-indigo-900 mb-8 animate-in slide-in-from-top-4 duration-500 ring-1 ring-white/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <BarChart2 className="w-6 h-6" /> Head-to-Head Benchmark
            </h2>
            <button onClick={() => setCompareData(null)} className="text-sm font-medium text-slate-500 hover:text-slate-700 bg-white/50 px-3 py-1 rounded-full border border-slate-200">Clear</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-right">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate" title={data?.name}>{data?.name}</h3>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Primary Channel</p>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center font-black text-slate-300 dark:text-slate-700 text-3xl italic">VS</div>
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate" title={compareData.name}>{compareData.name}</h3>
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Competitor</p>
            </div>
          </div>
          
          <div className="mt-8 space-y-6 max-w-4xl mx-auto bg-white/60 dark:bg-slate-900/40 p-6 rounded-2xl backdrop-blur-sm border border-white/40 dark:border-slate-800">
            {/* Metric: Subs */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                <span>{data?.subscribers} Subs</span>
                <span className="text-[10px] tracking-widest text-slate-400">Audience Size</span>
                <span>{compareData.subscribers} Subs</span>
              </div>
              <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                <div className="bg-indigo-500 relative" style={{ width: '50%' }}></div>
                <div className="bg-violet-500 relative" style={{ width: '50%' }}></div>
              </div>
            </div>

            {/* Metric: Avg Views */}
            {(() => {
              const compAvg = Math.floor(compareData.videos.reduce((acc, v) => acc + v.views, 0) / Math.max(compareData.videos.length, 1));
              const mainAvg = insights.avgViews;
              const total = mainAvg + compAvg || 1;
              const p1 = (mainAvg / total) * 100;
              return (
                <div>
                   <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                    <span>{(mainAvg/1000).toFixed(1)}k Avg Views</span>
                    <span className="text-[10px] tracking-widest text-slate-400">Engagement</span>
                    <span>{(compAvg/1000).toFixed(1)}k Avg Views</span>
                  </div>
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <div className="bg-indigo-500 relative" style={{ width: `${p1}%` }}></div>
                    <div className="bg-violet-500 relative" style={{ width: `${100-p1}%` }}></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Smart Insights (Product Thinking Layer) */}
      {insights && (
        <div className="mb-10 space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-2 text-rose-500 mb-3">
                <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg group-hover:scale-110 transition-transform"><Flame className="w-5 h-5" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Most Viral</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white truncate" title={insights.mostViral?.title}>{insights.mostViral?.title || "N/A"}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">{insights.mostViral ? `${(insights.mostViral.viewsPerDay).toLocaleString()} views/d` : ''}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-2 text-emerald-500 mb-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform"><TrendingUp className="w-5 h-5" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Fastest Growing</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate" title={insights.fastestGrowing?.title}>{insights.fastestGrowing?.title || "N/A"}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">{insights.fastestGrowing ? `${(insights.fastestGrowing.viewsPerDay).toLocaleString()} views/d (Recent)` : ''}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-2 text-indigo-500 mb-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform"><Activity className="w-5 h-5" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Avg Views / Vid</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{(insights.avgViews/1000).toFixed(1)}k</div>
              <div className="text-sm font-medium text-slate-500 mt-1">Consistency Metric</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-2 text-amber-500 mb-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg group-hover:scale-110 transition-transform"><Clock className="w-5 h-5" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Posting Freq</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{insights.postingFreqStr}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">Content Pace</div>
            </div>
          </div>
          
          <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-16 bg-gradient-to-br from-indigo-500 to-violet-500 opacity-20 blur-3xl rounded-full"></div>
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-white/10 p-2 rounded-xl border border-white/20">
                <Sparkles className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-1.5">Actionable Insight</h3>
                <p className="text-lg leading-relaxed text-slate-200">{insights.aiSummary}</p>
              </div>
            </div>
          </div>
          
          {/* Top 5 Videos Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" /> Top 5 Drivers
            </h2>
            <div className="space-y-5">
              {(() => {
                const top5 = [...processedVideos].sort((a, b) => b.views - a.views).slice(0, 5);
                if (top5.length === 0) return <p className="text-slate-500">No data available.</p>;
                const maxViews = Math.max(...top5.map((v) => v.views), 1);
                
                return top5.map((video, idx) => (
                  <div key={`chart-${video.id}`} className="group relative cursor-default">
                    <div className="flex justify-between items-end text-sm mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate pr-4 text-base flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-sm w-4">{idx + 1}.</span> 
                        {video.title} {idx === 0 && <Flame className="w-4 h-4 text-rose-500 inline fill-rose-500/20"/>}
                      </span>
                      <span className="font-black text-slate-900 dark:text-white shrink-0">{(video.views / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner flex border border-slate-200/50 dark:border-slate-700/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-[1200ms] ease-out group-hover:brightness-110 ${idx === 0 ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                        style={{ width: `${(video.views / maxViews) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Constraints / Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Video Roster</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Time Filter */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl flex items-center shadow-inner w-full sm:w-auto border border-slate-200 dark:border-slate-700/50">
            {[ {label: "30D", val: "30"}, {label: "90D", val: "90"}, {label: "All", val: "all"} ].map(opt => (
              <button 
                key={opt.val}
                onClick={() => setTimeFilter(opt.val as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex-1 sm:flex-none ${timeFilter === opt.val ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

          {/* Sort Filter */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl flex items-center shadow-inner w-full sm:w-auto border border-slate-200 dark:border-slate-700/50">
            <button 
              onClick={() => setSortBy("score")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex-1 sm:flex-none ${sortBy === 'score' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Trending Score
            </button>
            <button 
              onClick={() => setSortBy("views")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex-1 sm:flex-none ${sortBy === 'views' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Total Views
            </button>
          </div>
        </div>
      </div>

      {/* Upgraded Video Cards Table / Grid approach */}
      <div className="space-y-3">
        {processedVideos.length === 0 ? (
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 py-20 flex flex-col items-center">
            <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-4"><Filter className="w-8 h-8 text-slate-400" /></div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No videos matched your filter.</p>
            <button onClick={() => setTimeFilter("all")} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg transition-colors">Show All Time</button>
          </div>
        ) : (
          processedVideos.map((video, idx) => {
            const isTop = sortBy === 'score' && idx === 0;
            return (
              <div 
                key={video.id} 
                className={`relative bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm border ${isTop ? 'border-amber-400 dark:border-amber-500/50 shadow-amber-500/10 ring-1 ring-amber-400/50' : 'border-slate-200 dark:border-slate-800'}`}
              >
                {/* Ranking / Thumbnail */}
                <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 relative">
                  {isTop && (
                    <div className="absolute -top-3 -left-3 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg z-10 shadow-lg flex items-center gap-1 animate-bounce">
                      <Flame className="w-3 h-3"/> #1 Ranking
                    </div>
                  )}
                  <div className="relative w-full sm:w-44 aspect-video rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 group">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 md:pr-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">{video.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {video.daysSincePosted} days ago</span>
                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400"><Eye className="w-4 h-4"/> {(video.views > 1000 ? (video.views / 1000).toFixed(1) + 'k' : video.views)} views</span>
                    <span className="flex items-center gap-1.5">👍 {(video.likes > 1000 ? (video.likes / 1000).toFixed(1) + 'k' : video.likes)}</span>
                  </div>
                </div>

                {/* Score & Status */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-3 border-t border-slate-100 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">PVD Score</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{(video.viewsPerDay).toLocaleString()}</span>
                  </div>
                  {getStatusBadge(video.viewsPerDay)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AnalyzeContent />
    </Suspense>
  );
}
