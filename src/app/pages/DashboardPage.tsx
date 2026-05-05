import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { motion } from "motion/react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart";
import {
  User, Calendar, Heart, TrendingUp, Sparkles, ShoppingBag,
  Settings, MessageCircle, Package, Award, Clock, ArrowRight,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

export function DashboardPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth() as any;
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comparisonSlider, setComparisonSlider] = useState(50);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";
        const res = await axios.get(`${API}/users/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error("Dashboard Fetch Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchStats();
  }, [token, isAuthenticated]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fbf3fe] deepskyn-atmosphere">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
        <p className="text-[#c95785] font-bold tracking-widest uppercase text-xs">Deciphering your skin...</p>
    </div>
  );

  const metrics = dashboardData?.metrics || [];
  const chartData = dashboardData?.chartData || [];
  const improvement = dashboardData?.improvementPercentage || 0;
  const firstName = dashboardData?.firstName || "User";
  const normalizedMetrics = metrics.map((metric: any) => {
    const numericValue = Number.parseInt(String(metric.value).replace(/[^0-9]/g, ""), 10);
    const progress = Number.isFinite(numericValue) ? Math.min(Math.max(numericValue, 0), 100) : 72;

    return {
      ...metric,
      progress,
    };
  });

  const recommendations = [
    {
      title: "Barrier Recovery Pair",
      reason: "Hydration trend dipped 8% this week; add ceramide + panthenol at night.",
      impact: "+14% moisture stability",
    },
    {
      title: "UV Defense Upgrade",
      reason: "Pigmentation signals increased around cheeks after outdoor exposure.",
      impact: "Reduce dark spot risk by 22%",
    },
    {
      title: "3-Min Retinol Buffer",
      reason: "Your sensitivity is moderate. Buffering limits irritation while maintaining results.",
      impact: "Boost turnover without redness",
    },
  ];

  const fallbackTrend = [
    { month: "Jan", score: 58 },
    { month: "Feb", score: 62 },
    { month: "Mar", score: 66 },
    { month: "Apr", score: 70 },
    { month: "May", score: 74 },
    { month: "Jun", score: 78 },
  ];

  const trendData = (chartData.length ? chartData : fallbackTrend).map((item: any, index: number) => ({
    month: item.month || item.label || `M${index + 1}`,
    score: Number(item.score ?? item.value ?? 0),
    forecast: Math.min(100, Number(item.score ?? item.value ?? 0) + 6 + index * 2),
  }));

  const metricCardStyles = [
    "bg-gradient-to-br from-[#fff4fa] to-[#ffe7ef] border-[#f2bfd1]",
    "bg-white/78 border-[#ead9fb]",
    "bg-gradient-to-br from-[#f4f0ff] to-[#eef8ff] border-[#d9e4fb]",
  ];

  const recommendationCardStyles = [
    "bg-gradient-to-br from-[#fff7fb] to-[#ffe9ef] border-[#f3bfd1]",
    "bg-white/72 border-[#ead9fb]",
    "bg-gradient-to-br from-[#f6f1ff] to-[#f0f8ff] border-[#d9e4fb]",
  ];

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] p-6 py-12 deepskyn-atmosphere premium-body">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl text-gray-800 mb-2 font-black tracking-tight premium-heading">Welcome Back, {firstName}</h1>
                <p className="text-gray-500 text-xl font-medium">Your skin twin is getting healthier every day.</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/profile")} className="flex items-center gap-2 rounded-2xl p-4">
                <Settings className="w-5 h-5" /> Settings
              </Button>
            </div>
          </motion.div>

          {/* Visual Improvement Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <GlassCard className="relative overflow-hidden bg-gradient-to-r from-[#fff1f6]/95 via-[#fff8ef]/95 to-[#f7f1ff]/95 border border-[#f3bed1] p-8">
              <span className="ai-scan-overlay" />
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#d96b95] to-[#f29b77] flex items-center justify-center shadow-xl shadow-[#e27da8]/30">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight premium-heading">Visual Improvement</h3>
                    <p className="text-gray-600">Your consistency is producing clinically visible results.</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black text-[#c95785]">+{improvement}%</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#b4537a] mt-1">Total Improvement</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Before/After Comparison Slider */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <GlassCard className="relative overflow-hidden p-10 bg-white/80 border border-[#ead9fb]">
              <span className="ai-scan-overlay" />
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Before & After Comparison</h3>
                  <p className="text-gray-500 text-sm">Real visual tracking of your skin transformation</p>
                </div>
                <div className="flex items-center gap-4 bg-white/70 px-6 py-2 rounded-full border border-white shadow-sm">
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Initial ({dashboardData?.comparison?.beforeDate})</p>
                    <p className="text-sm font-black text-gray-700">Score: {dashboardData?.previousScore}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Current ({dashboardData?.comparison?.afterDate})</p>
                    <p className="text-sm font-black text-emerald-600">Score: {dashboardData?.currentScore}</p>
                  </div>
                </div>
              </div>

              <div className="relative w-full h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                <div className="ai-scan-overlay" />
                {/* Background Image (OLD) */}
                <img src={dashboardData?.comparison?.before || "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1000"} className="absolute inset-0 w-full h-full object-cover" alt="Before" />
                
                {/* Foreground Image (NEW) */}
                <div className="absolute inset-0 overflow-hidden border-r-2 border-white/50" style={{ width: `${comparisonSlider}%` }}>
                    <img src={dashboardData?.comparison?.after || "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1000"} className="absolute inset-0 w-full h-[500px] object-cover" style={{ width: 'calc(100vw - 48px)', maxWidth: '1200px' }} alt="After" />
                </div>

                {/* Handles */}
                <div className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 pointer-events-none" style={{ left: `${comparisonSlider}%` }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-purple-50">
                        <div className="flex gap-0.5"><div className="w-0.5 h-4 bg-purple-300 rounded-full" /><div className="w-0.5 h-4 bg-purple-300 rounded-full" /></div>
                    </div>
                </div>

                <input type="range" min="0" max="100" value={comparisonSlider} onChange={(e) => setComparisonSlider(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
              </div>
            </GlassCard>
          </motion.div>

          {/* Skin Score Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-12">
            <GlassCard className="relative overflow-hidden p-10 bg-white/82 border border-[#ead9fb]">
              <span className="ai-scan-overlay" />
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Monthly Skin Score Progress</h3>
                <div className="flex items-center gap-2 px-5 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-emerald-600 uppercase">+{improvement}% Trend</span>
                </div>
              </div>

              <div className="h-80">
                <ChartContainer
                  config={{
                    score: { label: "Skin score", color: "#8b63d3" },
                    forecast: { label: "Forecast", color: "#f29b77" },
                  }}
                  className="h-full w-full aspect-auto"
                >
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="dashboardTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b63d3" stopOpacity={0.34} />
                        <stop offset="95%" stopColor="#8b63d3" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="dashboardForecastFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f29b77" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#f29b77" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e6f8" />
                    <XAxis dataKey="month" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} dy={10} />
                    <YAxis domain={[0, 100]} hide />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area type="monotone" dataKey="forecast" stroke="#f29b77" strokeWidth={2} fill="url(#dashboardForecastFill)" dot={{ fill: "#f29b77", r: 4, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    <Area type="monotone" dataKey="score" stroke="#8b63d3" strokeWidth={4} fill="url(#dashboardTrendFill)" dot={{ fill: "#8b63d3", r: 5, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 9 }} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {normalizedMetrics.map((metric: any, index: number) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                <GlassCard hover className={`relative overflow-hidden text-left p-10 ${metricCardStyles[index % metricCardStyles.length]}`}>
                  <span className="ai-scan-overlay" />
                  <div className="flex items-start justify-between gap-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${metric.bgColor} rounded-[1.5rem] mb-6 shadow-sm`}>
                      <TrendingUp className={`w-8 h-8 ${metric.color}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b86687] bg-white/70 px-3 py-1 rounded-full border border-white/60">
                      {metric.trend}
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{metric.label}</h3>
                  <p className="text-4xl font-black text-gray-800 mb-2">{metric.value}</p>
                  <div className="v2-progress-track mt-5">
                    <div className="v2-progress-bar" style={{ width: `${metric.progress}%` }} />
                  </div>
                  <p className="text-emerald-500 text-[10px] font-black uppercase mt-3">Performance this month</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }} className="mb-12">
            <GlassCard className="relative overflow-hidden p-8 bg-white/78 border border-[#ead9fb]">
              <span className="ai-scan-overlay" />
              <div className="flex items-center justify-between flex-wrap gap-4 mb-7">
                <h3 className="text-2xl font-black text-gray-800 premium-heading">Smart Recommendations</h3>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-[#ffe6ee] text-[#b4507b] border border-[#f5bfd1]">
                  AI CURATED
                </span>
              </div>
              <div className="grid lg:grid-cols-3 gap-4">
                {recommendations.map((item, index) => (
                  <div key={item.title} className={`rounded-[1.75rem] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${recommendationCardStyles[index % recommendationCardStyles.length]}`}>
                    <p className="text-xs font-bold tracking-[0.12em] text-[#b86687] mb-2">RECOMMENDATION {index + 1}</p>
                    <h4 className="font-extrabold text-gray-800 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{item.reason}</p>
                    <div className="text-xs font-semibold text-[#c95785]">{item.impact}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { n: "Routine", i: Calendar, c: "from-purple-400 to-pink-400", r: "/routine" },
                { n: "Orders", i: Package, c: "from-blue-400 to-cyan-400", r: "/orders" },
                { n: "AI Chat", i: MessageCircle, c: "from-green-400 to-teal-400", r: "/chatbot" },
                { n: "Results", i: Sparkles, c: "from-orange-400 to-rose-400", r: "/results" },
            ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.r)} className={`relative overflow-hidden bg-white/80 backdrop-blur-md p-10 rounded-[3rem] shadow-xl hover:scale-105 transition-all text-center border group ${i === 0 ? "border-[#ead9fb]" : i === 1 ? "border-[#dce9ff]" : i === 2 ? "border-[#dff3ea]" : "border-[#fbe0d9]"}`}>
                    <span className="ai-scan-overlay" />
                    <div className={`w-16 h-16 mx-auto rounded-[1.5rem] bg-gradient-to-br ${a.c} flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-6 transition-transform`}><a.i size={32} /></div>
                    <h4 className="font-black text-gray-800 text-lg tracking-tight premium-heading">{a.n}</h4>
                </button>
            ))}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}