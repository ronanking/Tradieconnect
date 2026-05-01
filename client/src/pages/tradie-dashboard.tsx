import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useJobCounts } from "@/hooks/useJobCounts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar, Clock, DollarSign, Star, MapPin,
  CheckCircle, AlertCircle, TrendingUp, Users, Briefcase,
  Camera, Wrench, Zap, PaintBucket, Hammer, Wind,
  Trees, CreditCard, ArrowRight, Award, Target,
  BarChart2, FileText, LogOut, Lock, Crown, Zap as ZapIcon,
  Bell, MessageCircle, BarChart, UserPlus, Settings,
  Package, Shield, ChevronRight, Plus, Building
} from "lucide-react";

interface TradieJob {
  id: number; title: string; status: string; category: string;
  location: string; createdAt: string; budgetMin?: string; budgetMax?: string;
  customer: { name: string; rating?: string }; timeline: string;
}
interface TradieQuote {
  id: number; jobId: number; jobTitle: string; customerName: string;
  price: string; message: string; timeline: string; status: string; createdAt: string;
}
interface TradieStats {
  totalJobs: number; completedJobs: number; averageRating: string;
  totalEarnings: number; responseRate: string; completionRate: string;
}
interface Subscription { plan: string; status: string; }

type Tab = "overview" | "available" | "my-jobs" | "quotes" | "analytics" | "team";
type Plan = "starter" | "professional" | "enterprise";

const primaryGradient = { background: "linear-gradient(135deg, hsl(217,71%,24%) 0%, hsl(217,71%,34%) 100%)" };
const goldGradient = { background: "linear-gradient(135deg, hsl(38,95%,38%) 0%, hsl(38,95%,52%) 100%)" };
const proGradient = { background: "linear-gradient(135deg, hsl(262,71%,40%) 0%, hsl(262,71%,55%) 100%)" };
const enterpriseGradient = { background: "linear-gradient(135deg, hsl(38,80%,35%) 0%, hsl(38,90%,48%) 100%)" };
const ACCENT = "hsl(217,71%,24%)";

const PLAN_CONFIG: Record<Plan, {
  label: string; color: string; bgColor: string; textColor: string;
  borderColor: string; gradient: React.CSSProperties; icon: any;
  maxQuotes: number | null;
}> = {
  starter: {
    label: "Starter", color: "slate", bgColor: "bg-slate-100", textColor: "text-slate-700",
    borderColor: "border-slate-200", gradient: { background: "hsl(217,71%,24%)" }, icon: Package,
    maxQuotes: 5
  },
  professional: {
    label: "Professional", color: "purple", bgColor: "bg-purple-100", textColor: "text-purple-700",
    borderColor: "border-purple-200", gradient: proGradient, icon: Crown,
    maxQuotes: null
  },
  enterprise: {
    label: "Enterprise", color: "amber", bgColor: "bg-amber-100", textColor: "text-amber-700",
    borderColor: "border-amber-200", gradient: enterpriseGradient, icon: Building,
    maxQuotes: null
  }
};

function getStatusStyle(status: string) {
  switch (status) {
    case "active": return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" };
    case "completed": return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };
    case "pending": return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
    case "accepted": return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };
    case "rejected": return { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };
    default: return { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  }
}

function StatusPill({ status }: { status: string }) {
  const s = getStatusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function LockedFeature({ plan, feature, description }: { plan: Plan; feature: string; description: string }) {
  const upgradeTo = plan === "starter" ? "Professional" : "Enterprise";
  const upgradePrice = plan === "starter" ? "$39/mo" : "$149/mo";
  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
          <Lock className="h-5 w-5 text-slate-400" />
        </div>
        <p className="font-bold text-slate-700 mb-1">{feature}</p>
        <p className="text-sm text-slate-400 mb-4">{description}</p>
        <Link href="/pricing">
          <a className="inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all" style={plan === "starter" ? proGradient : enterpriseGradient}>
            <Crown className="h-4 w-4" /> Upgrade to {upgradeTo} · {upgradePrice}
          </a>
        </Link>
      </div>
      {/* Blurred preview content behind lock */}
      <div className="p-5 blur-sm select-none pointer-events-none">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
      </div>
    </div>
  );
}

function UpgradeBanner({ plan }: { plan: Plan }) {
  if (plan === "enterprise") return null;
  const isStarter = plan === "starter";
  return (
    <div className="rounded-2xl p-4 mb-5 flex items-center gap-4" style={isStarter ? proGradient : enterpriseGradient}>
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <Crown className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm">
          {isStarter ? "Upgrade to Professional — $39/mo" : "Upgrade to Enterprise — $149/mo"}
        </p>
        <p className="text-white/70 text-xs mt-0.5">
          {isStarter
            ? "Unlimited quotes, analytics, verified badge & more"
            : "Team management, CRM, custom branding & priority support"}
        </p>
      </div>
      <Link href="/pricing">
        <a className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all whitespace-nowrap">
          Upgrade Now
        </a>
      </Link>
    </div>
  );
}

export default function TradieDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { user, logout, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const isLoggingOut = useRef(false);

  const handleLogout = () => {
    isLoggingOut.current = true;
    logout();
  };

  useEffect(() => {
    if (isLoggingOut.current) return;
    if (!isLoading && user) {
      const role = user.role || (user as any).userType;
      if (role === "customer") setLocation("/customer-dashboard");
    }
    if (!isLoading && !user) setLocation("/auth");
  }, [user, isLoading, setLocation]);

  const { data: availableJobs = [] } = useQuery<TradieJob[]>({ queryKey: ["/api/tradie/available-jobs"] });
  const { data: myJobs = [] } = useQuery<TradieJob[]>({ queryKey: ["/api/tradie/my-jobs"] });
  const { data: quotes = [] } = useQuery<TradieQuote[]>({ queryKey: ["/api/tradie/quotes"] });
  const { data: stats } = useQuery<TradieStats>({ queryKey: ["/api/tradie/stats"] });
  const { data: subscription } = useQuery<Subscription>({ queryKey: ["/api/tradie/subscription"] });
  const { data: jobCounts = {} } = useJobCounts();

  const plan: Plan = (subscription?.plan as Plan) || "starter";
  const planConfig = PLAN_CONFIG[plan];
  const PlanIcon = planConfig.icon;

  const safeJobs = Array.isArray(myJobs) ? myJobs : [];
  const safeQuotes = Array.isArray(quotes) ? quotes : [];
  const safeAvailable = Array.isArray(availableJobs) ? availableJobs : [];
  const activeJobs = safeJobs.filter(j => j.status === "active");
  const completedJobs = safeJobs.filter(j => j.status === "completed");
  const pendingQuotes = safeQuotes.filter(q => q?.status === "pending");

  // Starter: max 5 quotes per month
  const quotesThisMonth = safeQuotes.filter(q => {
    const d = new Date(q.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const quotesRemaining = plan === "starter" ? Math.max(0, 5 - quotesThisMonth) : null;
  const canSubmitQuote = plan !== "starter" || quotesThisMonth < 5;

  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "T";

  const tradeCategories = [
    { label: "Plumbing", icon: Wrench, key: "Plumbing" },
    { label: "Carpentry", icon: Hammer, key: "Carpentry" },
    { label: "Electrical", icon: Zap, key: "Electrical" },
    { label: "Landscaping", icon: Trees, key: "Landscaping" },
    { label: "Painting", icon: PaintBucket, key: "Painting" },
    { label: "HVAC", icon: Wind, key: "HVAC" },
  ];

  // Tabs vary by plan
  const tabs: { id: Tab; label: string; count?: number; minPlan?: Plan }[] = [
    { id: "overview",   label: "Overview" },
    { id: "available",  label: "Find Jobs",  count: safeAvailable.length },
    { id: "my-jobs",    label: "My Jobs",    count: safeJobs.length },
    { id: "quotes",     label: "Quotes",     count: safeQuotes.length },
    { id: "analytics",  label: "Analytics",  minPlan: "professional" },
    { id: "team",       label: "Team",       minPlan: "enterprise" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden" style={primaryGradient}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ opacity: 0.07 }}>
          <svg className="absolute top-0 left-0 w-full h-full text-white" style={{ opacity: 0.5 }}>
            <defs><pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
          <svg className="absolute -top-8 -right-8 w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 2.1L11.9 5.7c-.8.8-.8 2 0 2.8l1.4 1.4-6.3 6.3c-.4.4-.4 1 0 1.4l1.4 1.4c.4.4 1 .4 1.4 0l6.3-6.3 1.4 1.4c.8.8 2 .8 2.8 0l3.6-3.6c.3-.3.3-.8 0-1.1l-1.4-1.4-1.4 1.4-1.4-1.4 1.4-1.4-1.4-1.4-1.4 1.4-1.4-1.4 1.4-1.4-1.1-1.1c-.3-.3-.8-.3-1.2 0z"/>
          </svg>
          <svg className="absolute -bottom-6 -left-6 w-56 h-56 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
          </svg>
        </div>

        {/* Category pills */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-5">
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {tradeCategories.map(({ label, icon: Icon, key }) => (
              <Link key={key} href={`/browse-tradies?category=${key}`}>
                <a className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-2 transition-all whitespace-nowrap border border-white/20 hover:border-white/40 cursor-pointer">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs opacity-70 bg-white/20 px-1.5 py-0.5 rounded-full">{(jobCounts as any)[key] || 0}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Welcome + plan badge */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/30" style={goldGradient}>
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, {user?.firstName}!</h1>
                  {/* Plan badge */}
                  <span className={`hidden sm:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                    plan === "enterprise" ? "bg-amber-400/20 border-amber-400/30 text-amber-300" :
                    plan === "professional" ? "bg-purple-400/20 border-purple-400/30 text-purple-300" :
                    "bg-white/10 border-white/20 text-white/70"
                  }`}>
                    <PlanIcon className="h-3 w-3" /> {planConfig.label}
                  </span>
                  {plan === "professional" && (
                    <span className="hidden sm:flex items-center gap-1 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">
                      <Shield className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-white/70 text-sm">{user?.location || "Your trade business dashboard"}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {plan !== "enterprise" && (
                <Link href="/pricing">
                  <a className="flex items-center gap-2 text-white border border-white/20 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:bg-white/10"
                    style={{ background: plan === "starter" ? "hsla(262,71%,50%,0.3)" : "hsla(38,90%,42%,0.3)" }}>
                    <Crown className="h-4 w-4" /> {plan === "starter" ? "Go Pro" : "Go Enterprise"}
                  </a>
                </Link>
              )}
              <Link href="/banking-setup">
                <a className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 py-2 text-sm font-medium transition-all cursor-pointer">
                  <CreditCard className="h-4 w-4" /> Banking
                </a>
              </Link>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 py-2 text-sm font-medium transition-all">
                <Camera className="h-4 w-4" /> Photos
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-red-500/40 text-white border border-white/20 rounded-xl px-3 py-2 text-sm font-medium transition-all">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Active Jobs",  value: activeJobs.length,                          icon: Briefcase,   col: "text-blue-300"   },
              { label: "Completed",    value: stats?.completedJobs || 0,                  icon: CheckCircle, col: "text-emerald-300" },
              { label: "Rating",       value: stats?.averageRating || "—",                icon: Star,        col: "text-amber-300"  },
              { label: plan === "starter" ? `Quotes Left` : "Total Earned",
                value: plan === "starter" ? `${quotesRemaining}/5` : `$${(stats?.totalEarnings || 0).toLocaleString()}`,
                icon: plan === "starter" ? FileText : DollarSign, col: plan === "starter" ? "text-violet-300" : "text-purple-300" },
            ].map(({ label, value, icon: Icon, col }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <Icon className={`h-5 w-5 mb-2 ${col}`} />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/60 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Upgrade banner */}
        <UpgradeBanner plan={plan} />

        {/* Starter quote meter */}
        {plan === "starter" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-600" />
                <span className="font-semibold text-slate-800 text-sm">Monthly Quote Allowance</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{quotesThisMonth} / 5 used</span>
            </div>
            <Progress value={(quotesThisMonth / 5) * 100} className="h-2 mb-2" />
            <p className="text-xs text-slate-400">
              {quotesRemaining === 0
                ? "You've used all your quotes this month. Upgrade to Professional for unlimited quotes."
                : `${quotesRemaining} quote${quotesRemaining !== 1 ? "s" : ""} remaining this month`}
            </p>
          </div>
        )}

        {/* Performance meters - Pro+ only */}
        {plan !== "starter" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-slate-800 text-sm">Response Rate</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{stats?.responseRate || "0%"}</span>
              </div>
              <Progress value={parseInt(stats?.responseRate || "0")} className="h-2 mb-2" />
              <p className="text-xs text-slate-400">Respond within 24h to boost your ranking</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800 text-sm">Completion Rate</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{stats?.completionRate || "0%"}</span>
              </div>
              <Progress value={parseInt(stats?.completionRate || "0")} className="h-2 mb-2" />
              <p className="text-xs text-slate-400">Complete jobs on time to maintain high ratings</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1 shadow-sm border border-slate-100 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {tabs.map(tab => {
            const isLocked = tab.minPlan && (
              (tab.minPlan === "professional" && plan === "starter") ||
              (tab.minPlan === "enterprise" && plan !== "enterprise")
            );
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 justify-center ${
                  isLocked ? "text-slate-300 cursor-not-allowed" :
                  activeTab === tab.id ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
                style={!isLocked && activeTab === tab.id ? primaryGradient : {}}
                disabled={!!isLocked}
              >
                {isLocked ? <Lock className="h-3.5 w-3.5" /> : null}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && !isLocked && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Active jobs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Active Jobs</h3>
                </div>
                <button onClick={() => setActiveTab("my-jobs")} className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {activeJobs.slice(0, 3).map(job => (
                  <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 flex-shrink-0">
                      <Wrench className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{job.title}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="h-3 w-3" />{job.location}
                      </div>
                    </div>
                    <StatusPill status={job.status} />
                  </div>
                ))}
                {activeJobs.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm text-slate-400 font-medium">No active jobs</p>
                    <button onClick={() => setActiveTab("available")} className="mt-2 text-xs text-blue-600 font-semibold hover:underline">
                      Browse available jobs →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent quotes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Recent Quotes</h3>
                </div>
                <button onClick={() => setActiveTab("quotes")} className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {safeQuotes.slice(0, 3).map(quote => (
                  <div key={quote?.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-100 flex-shrink-0">
                      <DollarSign className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{quote?.jobTitle}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Client: {quote?.customerName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm" style={{ color: ACCENT }}>${quote?.price}</p>
                      <StatusPill status={quote?.status} />
                    </div>
                  </div>
                ))}
                {safeQuotes.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm text-slate-400 font-medium">No quotes yet</p>
                    <button onClick={() => setActiveTab("available")} className="mt-2 text-xs text-blue-600 font-semibold hover:underline">
                      Browse jobs to quote →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Performance insights - Starter gets locked version */}
            {plan === "starter" ? (
              <div className="lg:col-span-2">
                <LockedFeature
                  plan="starter"
                  feature="Business Analytics"
                  description="Track response rates, earnings, completion rates and more with Professional"
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Performance Insights</h3>
                  {plan === "professional" && (
                    <span className="ml-auto text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="h-3 w-3" /> Pro
                    </span>
                  )}
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Completed This Month", value: completedJobs.length, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Avg Response Time",    value: "2.5 hrs",            icon: Clock,       color: "text-blue-600 bg-blue-50"     },
                    { label: "Repeat Customers",     value: "42%",                icon: Users,       color: "text-purple-600 bg-purple-50" },
                    { label: "Pending Quotes",       value: pendingQuotes.length, icon: AlertCircle, color: "text-amber-600 bg-amber-50"   },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="text-center">
                      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xl font-bold text-slate-900">{value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AVAILABLE JOBS ── */}
        {activeTab === "available" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Available Jobs Near You</h2>
              <div className="flex items-center gap-2">
                {plan === "starter" && (
                  <span className="text-xs bg-violet-50 text-violet-700 font-semibold px-2.5 py-1 rounded-full">
                    {quotesRemaining} quotes left this month
                  </span>
                )}
                <span className="text-sm text-slate-500">{safeAvailable.length} found</span>
              </div>
            </div>

            {/* Priority notifications banner for Pro+ */}
            {plan !== "starter" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3">
                <Bell className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">Priority job notifications are active — you're first to see new jobs in your area</p>
              </div>
            )}

            {safeAvailable.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                <Briefcase className="h-14 w-14 mx-auto mb-4 text-slate-200" />
                <p className="font-bold text-slate-700 mb-1">No jobs available right now</p>
                <p className="text-sm text-slate-400">New jobs are posted daily — check back soon</p>
              </div>
            ) : safeAvailable.map(job => (
              <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{job.title}</h3>
                      <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-100">{job.category}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />${job.budgetMin}–${job.budgetMax}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.timeline}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{job.customer.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" className="text-xs">Details</Button>
                    {canSubmitQuote ? (
                      <Button size="sm" className="text-xs text-white font-semibold" style={primaryGradient}>Quote Job</Button>
                    ) : (
                      <Link href="/pricing">
                        <a className="inline-flex items-center justify-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
                          <Lock className="h-3 w-3" /> Upgrade
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MY JOBS ── */}
        {activeTab === "my-jobs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">My Jobs</h2>
              <span className="text-sm text-slate-500">{safeJobs.length} total</span>
            </div>
            {safeJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                <Briefcase className="h-14 w-14 mx-auto mb-4 text-slate-200" />
                <p className="font-bold text-slate-700 mb-1">No jobs yet</p>
                <p className="text-sm text-slate-400 mb-4">Start quoting on available jobs</p>
                <Button onClick={() => setActiveTab("available")} className="text-white font-semibold" style={primaryGradient}>Browse Available Jobs</Button>
              </div>
            ) : safeJobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{job.title}</h3>
                      <StatusPill status={job.status} />
                    </div>
                    <p className="text-sm text-slate-500 mb-3">Client: <span className="font-medium text-slate-700">{job.customer.name}</span></p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />${job.budgetMin}–${job.budgetMax}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.timeline}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" className="text-xs">View Details</Button>
                    {job.status === "active" && (
                      <Button size="sm" className="text-xs text-white font-semibold" style={primaryGradient}>Update Progress</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── QUOTES ── */}
        {activeTab === "quotes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">My Quotes</h2>
              <div className="flex gap-2">
                {plan === "starter" && (
                  <span className="bg-violet-50 text-violet-700 font-semibold px-2.5 py-1 rounded-full text-xs">{quotesThisMonth}/5 this month</span>
                )}
                {pendingQuotes.length > 0 && (
                  <span className="bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full text-xs">{pendingQuotes.length} pending</span>
                )}
              </div>
            </div>
            {safeQuotes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                <FileText className="h-14 w-14 mx-auto mb-4 text-slate-200" />
                <p className="font-bold text-slate-700 mb-1">No quotes yet</p>
                <p className="text-sm text-slate-400 mb-4">Browse available jobs and submit your first quote</p>
                <Button onClick={() => setActiveTab("available")} className="text-white font-semibold" style={primaryGradient}>Find Jobs to Quote</Button>
              </div>
            ) : safeQuotes.map(quote => (
              <div key={quote?.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{quote?.jobTitle}</h3>
                      <StatusPill status={quote?.status} />
                    </div>
                    <p className="text-sm text-slate-500 mb-2">Client: <span className="font-medium text-slate-700">{quote?.customerName}</span></p>
                    {quote?.message && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{quote.message}</p>}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{quote?.timeline}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(quote?.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold mb-2" style={{ color: ACCENT }}>${quote?.price}</p>
                    {quote?.status === "pending" && (
                      <div className="flex flex-col gap-1.5">
                        <Button size="sm" variant="outline" className="text-xs w-full">Edit Quote</Button>
                        <Button size="sm" variant="destructive" className="text-xs w-full">Withdraw</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ANALYTICS (Pro+) ── */}
        {activeTab === "analytics" && (
          <div className="space-y-5">
            {plan === "starter" ? (
              <LockedFeature plan="starter" feature="Business Analytics Dashboard" description="Upgrade to Professional to access full analytics" />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-bold text-slate-900">Analytics Dashboard</h2>
                  <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" /> {plan === "enterprise" ? "Enterprise" : "Pro"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Jobs",      value: stats?.totalJobs || 0,                       icon: Briefcase,   color: "text-blue-600 bg-blue-50"     },
                    { label: "Completed",        value: stats?.completedJobs || 0,                   icon: CheckCircle, color: "text-emerald-600 bg-emerald-50"},
                    { label: "Total Earned",     value: `$${(stats?.totalEarnings || 0).toLocaleString()}`, icon: DollarSign, color: "text-purple-600 bg-purple-50"},
                    { label: "Avg Rating",       value: stats?.averageRating || "—",                icon: Star,        color: "text-amber-600 bg-amber-50"    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`rounded-2xl p-5 ${color}`}>
                      <Icon className="h-5 w-5 mb-3" />
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs font-semibold opacity-80 mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-4 w-4 text-blue-600" />
                      <h3 className="font-bold text-slate-900 text-sm">Response Rate</h3>
                      <span className="ml-auto font-bold text-slate-900 text-sm">{stats?.responseRate || "0%"}</span>
                    </div>
                    <Progress value={parseInt(stats?.responseRate || "0")} className="h-3 mb-2" />
                    <p className="text-xs text-slate-400">Respond within 24h to rank higher in search results</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart2 className="h-4 w-4 text-emerald-600" />
                      <h3 className="font-bold text-slate-900 text-sm">Completion Rate</h3>
                      <span className="ml-auto font-bold text-slate-900 text-sm">{stats?.completionRate || "0%"}</span>
                    </div>
                    <Progress value={parseInt(stats?.completionRate || "0")} className="h-3 mb-2" />
                    <p className="text-xs text-slate-400">High completion rates attract more customer inquiries</p>
                  </div>
                </div>

                {/* Enterprise-only: Custom reporting */}
                {plan !== "enterprise" ? (
                  <LockedFeature plan="professional" feature="Custom Reporting Suite" description="Upgrade to Enterprise for advanced reporting, CRM data and bulk analytics" />
                ) : (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-200">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart className="h-4 w-4 text-amber-600" />
                      <h3 className="font-bold text-slate-900 text-sm">Custom Reports</h3>
                      <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Building className="h-3 w-3" /> Enterprise
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">Custom reporting suite — export revenue, job history, customer data and more.</p>
                    <Button className="mt-3 text-xs text-white font-semibold" style={enterpriseGradient}>Generate Report</Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── TEAM (Enterprise only) ── */}
        {activeTab === "team" && (
          <div className="space-y-5">
            {plan !== "enterprise" ? (
              <LockedFeature
                plan={plan}
                feature="Team Member Management"
                description="Add team members, assign jobs and manage your crew with Enterprise"
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900">Team Management</h2>
                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Building className="h-3 w-3" /> Enterprise
                    </span>
                  </div>
                  <Button className="text-xs text-white font-semibold" style={enterpriseGradient}>
                    <UserPlus className="h-4 w-4 mr-1" /> Add Member
                  </Button>
                </div>
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                  <Users className="h-14 w-14 mx-auto mb-4 text-slate-200" />
                  <p className="font-bold text-slate-700 mb-1">No team members yet</p>
                  <p className="text-sm text-slate-400 mb-4">Invite your team to collaborate on jobs</p>
                  <Button className="text-xs text-white font-semibold" style={enterpriseGradient}>
                    <UserPlus className="h-4 w-4 mr-1" /> Invite Team Member
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Advanced Scheduling", icon: Calendar, desc: "Assign jobs and manage team availability" },
                    { label: "CRM Integration",     icon: Settings, desc: "Connect your existing CRM tools" },
                    { label: "Bulk Quote Management", icon: FileText, desc: "Submit and manage quotes in bulk" },
                  ].map(({ label, icon: Icon, desc }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
                      <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                        <Icon className="h-4 w-4 text-amber-600" />
                      </div>
                      <p className="font-bold text-slate-900 text-sm mb-1">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Mobile bottom bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex gap-2 z-40 shadow-lg">
          <Link href="/banking-setup" className="flex-1">
            <a className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-slate-700 w-full cursor-pointer">
              <CreditCard className="h-4 w-4" /> Banking
            </a>
          </Link>
          {plan !== "enterprise" && (
            <Link href="/pricing" className="flex-1">
              <a className="flex items-center justify-center gap-2 text-white rounded-xl py-2.5 text-sm font-semibold w-full cursor-pointer"
                style={plan === "starter" ? proGradient : enterpriseGradient}>
                <Crown className="h-4 w-4" /> {plan === "starter" ? "Go Pro" : "Go Enterprise"}
              </a>
            </Link>
          )}
        </div>
        <div className="sm:hidden h-16" />
      </div>
    </div>
  );
}
