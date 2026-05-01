import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, MessageCircle, Star, MapPin, CheckCircle, Clock,
  DollarSign, Plus, ChevronRight, Bell, User, Settings,
  FileText, AlertCircle, ThumbsUp, Phone, Mail, Calendar,
  TrendingUp, Shield, HelpCircle, LogOut, Edit3, Home,
  ArrowRight, Wrench, Zap, Hammer, PaintBucket, Trees, Wind,
  BarChart2, Award, Search
} from "lucide-react";
import JobPostModal from "@/components/job-post-modal";
import { apiRequest } from "@/lib/queryClient";

type Tab = "overview" | "jobs" | "quotes" | "messages" | "profile";

const PRIMARY = "hsl(217,71%,24%)";
const primaryGradient = { background: "linear-gradient(135deg, hsl(217,71%,24%) 0%, hsl(217,71%,34%) 100%)" };
const goldGradient = { background: "linear-gradient(135deg, hsl(38,95%,38%) 0%, hsl(38,95%,52%) 100%)" };
const GOLD = "hsl(38,95%,42%)";

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  posted:      { label: "Open",        color: "text-emerald-700", bg: "bg-emerald-50",  dot: "bg-emerald-500" },
  open:        { label: "Open",        color: "text-emerald-700", bg: "bg-emerald-50",  dot: "bg-emerald-500" },
  in_progress: { label: "In Progress", color: "text-blue-700",    bg: "bg-blue-50",     dot: "bg-blue-500"    },
  completed:   { label: "Completed",   color: "text-slate-600",   bg: "bg-slate-100",   dot: "bg-slate-400"   },
  cancelled:   { label: "Cancelled",   color: "text-red-700",     bg: "bg-red-50",      dot: "bg-red-500"     },
  pending:     { label: "Pending",     color: "text-amber-700",   bg: "bg-amber-50",    dot: "bg-amber-500"   },
  accepted:    { label: "Accepted",    color: "text-emerald-700", bg: "bg-emerald-50",  dot: "bg-emerald-500" },
  rejected:    { label: "Declined",    color: "text-slate-500",   bg: "bg-slate-100",   dot: "bg-slate-400"   },
};

function StatusPill({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function EmptyCard({ icon: Icon, title, subtitle, action }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="h-7 w-7 text-slate-300" />
      </div>
      <p className="font-bold text-slate-700 mb-1">{title}</p>
      <p className="text-sm text-slate-400 mb-5">{subtitle}</p>
      {action}
    </div>
  );
}

export default function CustomerDashboard() {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { user, logout, isLoading } = useAuth();
  const isLoggingOut = useRef(false);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    isLoggingOut.current = true;
    logout();
  };

  React.useEffect(() => {
    if (isLoggingOut.current) return;
    if (!isLoading && user) {
      const role = user.role || (user as any).userType;
      if (role === "tradie") setLocation("/tradie-dashboard");
    }
    if (!isLoading && !user) setLocation("/auth");
  }, [user, isLoading, setLocation]);

  const { data: jobs = [] } = useQuery<any[]>({ queryKey: ["/api/customer/jobs"] });
  const { data: quotes = [] } = useQuery<any[]>({ queryKey: ["/api/customer/quotes"] });

  const acceptQuote = useMutation({
    mutationFn: (quoteId: number) => apiRequest("PATCH", `/api/quotes/${quoteId}`, { status: "accepted" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/customer/quotes"] }),
  });
  const declineQuote = useMutation({
    mutationFn: (quoteId: number) => apiRequest("PATCH", `/api/quotes/${quoteId}`, { status: "rejected" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/customer/quotes"] }),
  });

  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const safeQuotes = Array.isArray(quotes) ? quotes : [];
  const openJobs = safeJobs.filter(j => ["posted", "open"].includes(j.status));
  const activeJobs = safeJobs.filter(j => j.status === "in_progress");
  const completedJobs = safeJobs.filter(j => j.status === "completed");
  const pendingQuotes = safeQuotes.filter(q => q.status === "pending");

  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "C";

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "overview", label: "Overview",  icon: Home },
    { id: "jobs",     label: "My Jobs",   icon: Briefcase, badge: openJobs.length + activeJobs.length },
    { id: "quotes",   label: "Quotes",    icon: FileText,  badge: pendingQuotes.length },
    { id: "messages", label: "Messages",  icon: MessageCircle },
    { id: "profile",  label: "Profile",   icon: User },
  ];

  const tradeCategories = [
    { label: "Plumbing",    icon: Wrench,      key: "Plumbing"    },
    { label: "Electrical",  icon: Zap,         key: "Electrical"  },
    { label: "Carpentry",   icon: Hammer,      key: "Carpentry"   },
    { label: "Painting",    icon: PaintBucket, key: "Painting"    },
    { label: "Landscaping", icon: Trees,       key: "Landscaping" },
    { label: "HVAC",        icon: Wind,        key: "HVAC"        },
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
        {/* Branded dot-grid + tool decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ opacity: 0.07 }}>
          <svg className="absolute top-0 left-0 w-full h-full text-white" style={{ opacity: 0.5 }}>
            <defs>
              <pattern id="cdots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cdots)"/>
          </svg>
          <svg className="absolute -top-6 -right-6 w-56 h-56 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 2.1L11.9 5.7c-.8.8-.8 2 0 2.8l1.4 1.4-6.3 6.3c-.4.4-.4 1 0 1.4l1.4 1.4c.4.4 1 .4 1.4 0l6.3-6.3 1.4 1.4c.8.8 2 .8 2.8 0l3.6-3.6c.3-.3.3-.8 0-1.1l-1.4-1.4-1.4 1.4-1.4-1.4 1.4-1.4-1.4-1.4-1.4 1.4-1.4-1.4 1.4-1.4-1.1-1.1c-.3-.3-.8-.3-1.2 0z"/>
          </svg>
          <svg className="absolute -bottom-4 left-8 w-44 h-44 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
          </svg>
        </div>

        {/* Trade category pills */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-5">
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {tradeCategories.map(({ label, icon: Icon, key }) => (
              <Link key={key} href={`/browse-tradies?category=${key}`}>
                <a className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-2 transition-all whitespace-nowrap border border-white/20 hover:border-white/40 cursor-pointer">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </a>
              </Link>
            ))}
            <Link href="/browse-tradies">
              <a className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-2 transition-all whitespace-nowrap border border-white/20 hover:border-white/40 cursor-pointer">
                <Search className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">All Trades</span>
              </a>
            </Link>
          </div>
        </div>

        {/* Welcome row */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/30" style={goldGradient}>
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, {user?.firstName}!</h1>
                  <span className="hidden sm:flex items-center gap-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Award className="h-3 w-3" /> Verified
                  </span>
                </div>
                <p className="text-white/70 text-sm">{user?.location || "Find trusted tradies for any job"}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setIsJobModalOpen(true)}
                className="flex items-center gap-2 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all border-2 border-white/40 hover:bg-white/10"
                style={{ background: "hsla(38,95%,42%,0.25)" }}
              >
                <Plus className="h-4 w-4" /> Post a Job
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-red-500/40 text-white border border-white/20 rounded-xl px-3 py-2 text-sm font-medium transition-all">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats in banner */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Open Jobs",    value: openJobs.length,      icon: Briefcase,   col: "text-blue-300"   },
              { label: "In Progress",  value: activeJobs.length,    icon: Clock,       col: "text-amber-300"  },
              { label: "Completed",    value: completedJobs.length, icon: CheckCircle, col: "text-emerald-300"},
              { label: "New Quotes",   value: pendingQuotes.length, icon: FileText,    col: "text-violet-300" },
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

      {/* ── TABS ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1 shadow-sm border border-slate-100 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.id ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
              style={activeTab === tab.id ? primaryGradient : {}}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge ? (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>{tab.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-8">
            {/* Recent jobs - left 2 cols */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Jobs</h2>
                <button onClick={() => setActiveTab("jobs")} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {safeJobs.length === 0 ? (
                <EmptyCard
                  icon={Briefcase}
                  title="No jobs posted yet"
                  subtitle="Post your first job and get quotes from local tradies within hours"
                  action={
                    <Button onClick={() => setIsJobModalOpen(true)} className="text-white font-semibold" style={primaryGradient}>
                      <Plus className="h-4 w-4 mr-1" /> Post a Job
                    </Button>
                  }
                />
              ) : (
                safeJobs.slice(0, 4).map((job: any) => (
                  <div key={job.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <StatusPill status={job.status} />
                          <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">{job.category}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 capitalize truncate mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                          {job.budgetMin && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${job.budgetMin}–${job.budgetMax}</span>}
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))
              )}

              {/* Post another job CTA if they have jobs */}
              {safeJobs.length > 0 && (
                <button
                  onClick={() => setIsJobModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-400 hover:text-blue-600 transition-all text-sm font-semibold"
                >
                  <Plus className="h-4 w-4" /> Post Another Job
                </button>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Pending quotes card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-violet-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">New Quotes</h3>
                  </div>
                  {pendingQuotes.length > 0 && (
                    <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingQuotes.length} new</span>
                  )}
                </div>
                <div className="p-4">
                  {pendingQuotes.length === 0 ? (
                    <div className="text-center py-6">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                      <p className="text-sm text-slate-400">No new quotes yet</p>
                      <p className="text-xs text-slate-300 mt-1">Post a job to start receiving quotes</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingQuotes.slice(0, 3).map((q: any) => (
                        <div key={q.id} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-sm text-slate-900">{q.tradieName}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{q.jobTitle}</p>
                            </div>
                            <p className="font-bold text-lg" style={{ color: PRIMARY }}>${q.price}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 h-7 text-xs text-white font-semibold" style={primaryGradient} onClick={() => acceptQuote.mutate(q.id)}>
                              <ThumbsUp className="h-3 w-3 mr-1" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => declineQuote.mutate(q.id)}>Decline</Button>
                          </div>
                        </div>
                      ))}
                      {pendingQuotes.length > 3 && (
                        <button onClick={() => setActiveTab("quotes")} className="text-xs text-blue-600 font-semibold w-full text-center hover:underline">
                          View all {pendingQuotes.length} quotes →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Quick Actions</h3>
                </div>
                <div className="p-3 space-y-1">
                  {[
                    { label: "Post a New Job",   icon: Plus,          action: () => setIsJobModalOpen(true),        color: "bg-blue-50 text-blue-600" },
                    { label: "Find Tradies",      icon: Search,        href: "/browse-tradies",                      color: "bg-emerald-50 text-emerald-600" },
                    { label: "Browse All Jobs",   icon: Briefcase,     href: "/jobs",                                color: "bg-purple-50 text-purple-600" },
                    { label: "Messages",          icon: MessageCircle, action: () => setActiveTab("messages"),       color: "bg-amber-50 text-amber-600" },
                    { label: "Help & Support",    icon: HelpCircle,    href: "/help-center",                         color: "bg-slate-100 text-slate-600" },
                  ].map(({ label, icon: Icon, action, href, color }) => {
                    const inner = (
                      <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-700 font-medium text-left transition-colors cursor-pointer">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {label}
                        <ChevronRight className="h-3 w-3 text-slate-300 ml-auto" />
                      </div>
                    );
                    return href ? (
                      <Link key={label} href={href}><a>{inner}</a></Link>
                    ) : (
                      <button key={label} onClick={action} className="w-full">{inner}</button>
                    );
                  })}
                </div>
              </div>

              {/* Tips card */}
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800 text-sm mb-2">Tips for better quotes</p>
                    <ul className="text-xs text-amber-700 space-y-1.5">
                      <li className="flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">•</span> Add photos — tradies quote more accurately</li>
                      <li className="flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">•</span> Be specific in your description</li>
                      <li className="flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">•</span> Include your suburb and postcode</li>
                      <li className="flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">•</span> Set a realistic budget range</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MY JOBS ── */}
        {activeTab === "jobs" && (
          <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">My Jobs <span className="text-slate-400 font-normal text-sm">({safeJobs.length})</span></h2>
              <Button onClick={() => setIsJobModalOpen(true)} className="text-white font-semibold text-sm" style={primaryGradient}>
                <Plus className="h-4 w-4 mr-1" /> Post New Job
              </Button>
            </div>
            {safeJobs.length === 0 ? (
              <EmptyCard
                icon={Briefcase}
                title="No jobs posted yet"
                subtitle="Post a job and start receiving quotes from local tradies"
                action={
                  <Button onClick={() => setIsJobModalOpen(true)} className="text-white font-semibold" style={primaryGradient}>
                    <Plus className="h-4 w-4 mr-1" /> Post a Job
                  </Button>
                }
              />
            ) : safeJobs.map((job: any) => (
              <div key={job.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusPill status={job.status} />
                      <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">{job.category}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 capitalize mb-2">{job.title}</h3>
                    {job.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{job.description}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                      {job.budgetMin && <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />${job.budgetMin}–${job.budgetMax}</span>}
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{job.timeline}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs flex-shrink-0">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── QUOTES ── */}
        {activeTab === "quotes" && (
          <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Quotes Received <span className="text-slate-400 font-normal text-sm">({safeQuotes.length})</span></h2>
              {pendingQuotes.length > 0 && (
                <span className="bg-violet-50 text-violet-700 font-semibold px-2.5 py-1 rounded-full text-xs">{pendingQuotes.length} awaiting review</span>
              )}
            </div>
            {safeQuotes.length === 0 ? (
              <EmptyCard
                icon={FileText}
                title="No quotes yet"
                subtitle="Once you post a job, tradies will send you quotes here"
                action={
                  <Button onClick={() => setIsJobModalOpen(true)} className="text-white font-semibold" style={primaryGradient}>
                    <Plus className="h-4 w-4 mr-1" /> Post a Job
                  </Button>
                }
              />
            ) : safeQuotes.map((quote: any) => (
              <div key={quote?.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={primaryGradient}>
                        {quote?.tradieName?.[0] ?? "T"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{quote?.tradieName}</p>
                          <StatusPill status={quote?.status} />
                        </div>
                        {quote?.tradieRating && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-slate-500">{quote?.tradieRating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">For: <span className="font-semibold text-slate-700">{quote?.jobTitle}</span></p>
                    {quote?.message && (
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 mb-3">{quote?.message}</p>
                    )}
                    <div className="flex gap-4 text-xs text-slate-400">
                      {quote?.timeline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{quote?.timeline}</span>}
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(quote?.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold mb-3" style={{ color: PRIMARY }}>${quote?.price}</p>
                    {quote?.status === "pending" && (
                      <div className="flex flex-col gap-2">
                        <Button size="sm" className="text-xs text-white font-semibold w-full" style={primaryGradient} onClick={() => acceptQuote.mutate(quote?.id)}>
                          <ThumbsUp className="h-3 w-3 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50 w-full" onClick={() => declineQuote.mutate(quote?.id)}>
                          Decline
                        </Button>
                      </div>
                    )}
                    {quote?.status === "accepted" && (
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold justify-end">
                        <CheckCircle className="h-4 w-4" /> Accepted
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {activeTab === "messages" && (
          <div className="pb-8">
            <EmptyCard
              icon={MessageCircle}
              title="No messages yet"
              subtitle="Once you accept a quote, you can message your tradie here"
              action={
                <Link href="/messages">
                  <Button variant="outline" className="text-sm">Open Messages</Button>
                </Link>
              }
            />
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-8">
            {/* Left: avatar card */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Gradient top strip */}
                <div className="h-20 relative" style={primaryGradient}>
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full text-white">
                      <defs><pattern id="pdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor"/></pattern></defs>
                      <rect width="100%" height="100%" fill="url(#pdots)"/>
                    </svg>
                  </div>
                </div>
                <div className="px-6 pb-6 -mt-10 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white mx-auto mb-3" style={primaryGradient}>
                    {initials}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-slate-500 text-sm mt-1">Customer Account</p>
                  <div className="flex justify-center gap-2 mt-3">
                    <span className="text-xs bg-blue-50 text-blue-800 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Verified
                    </span>
                  </div>
                  <Button variant="outline" className="mt-4 w-full text-sm">
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Profile
                  </Button>
                </div>
              </div>

              {/* Account menu */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 space-y-1">
                {[
                  { label: "Account Settings", icon: Settings,     href: undefined },
                  { label: "Notifications",    icon: Bell,         href: undefined },
                  { label: "Help & Support",   icon: HelpCircle,   href: "/help-center" },
                  { label: "Safety Tips",      icon: Shield,       href: "/safety-tips" },
                ].map(({ label, icon: Icon, href }) => {
                  const btn = (
                    <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-700 font-medium text-left cursor-pointer">
                      <Icon className="h-4 w-4 text-slate-400" />
                      {label}
                      <ChevronRight className="h-3 w-3 text-slate-300 ml-auto" />
                    </div>
                  );
                  return href ? <Link key={label} href={href}><a>{btn}</a></Link> : <button key={label} className="w-full">{btn}</button>;
                })}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm text-red-600 font-semibold text-left transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>

            {/* Right: details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Contact info */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {[
                    { label: "Full Name", value: `${user?.firstName} ${user?.lastName}`, icon: User },
                    { label: "Email",     value: user?.email,                            icon: Mail },
                    { label: "Phone",     value: user?.phone || "Not set",               icon: Phone },
                    { label: "Location",  value: user?.location || "Not set",            icon: MapPin },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity summary */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-4">Activity Summary</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Jobs Posted", value: safeJobs.length,      icon: Briefcase,   color: "text-blue-600 bg-blue-50"       },
                    { label: "Completed",   value: completedJobs.length, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50"  },
                    { label: "Quotes Got",  value: safeQuotes.length,    icon: FileText,    color: "text-violet-600 bg-violet-50"    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`rounded-2xl p-4 text-center ${color}`}>
                      <Icon className="h-5 w-5 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs font-semibold opacity-80 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex gap-2 z-40 shadow-lg">
        <Button onClick={() => setIsJobModalOpen(true)} className="flex-1 text-white font-semibold" style={primaryGradient}>
          <Plus className="h-4 w-4 mr-1" /> Post a Job
        </Button>
        <Link href="/browse-tradies" className="flex-1">
          <a className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-slate-700 w-full cursor-pointer">
            <Search className="h-4 w-4" /> Find Tradies
          </a>
        </Link>
      </div>
      <div className="sm:hidden h-16" />

      <JobPostModal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} />
    </div>
  );
}
