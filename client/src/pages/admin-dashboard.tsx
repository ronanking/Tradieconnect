import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ROLE_OPTIONS = ["user", "admin", "enterprise"];
const PLAN_OPTIONS = ["free", "starter", "professional", "enterprise"];
const TRADIE_PLAN_OPTIONS = ["starter", "professional", "enterprise"];
const STATUS_OPTIONS = ["active", "cancelled", "expired"];

const PLAN_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-600",
  starter: "bg-blue-100 text-blue-700",
  professional: "bg-purple-100 text-purple-700",
  enterprise: "bg-amber-100 text-amber-700",
};
const STATUS_COLORS: Record<string, string> = {
  posted: "bg-blue-50 text-blue-700 border border-blue-200",
  open: "bg-blue-50 text-blue-700 border border-blue-200",
  accepted: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  in_progress: "bg-orange-50 text-orange-700 border border-orange-200",
  completed: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
};
const ROLE_COLORS: Record<string, string> = {
  user: "bg-slate-100 text-slate-600",
  admin: "bg-red-100 text-red-700",
  enterprise: "bg-amber-100 text-amber-700",
};

const TABS = [
  { key: "overview", label: "Overview", emoji: "📊" },
  { key: "users", label: "Users", emoji: "👥" },
  { key: "jobs", label: "Jobs", emoji: "💼" },
  { key: "tradies", label: "Tradies", emoji: "🔧" },
  { key: "finances", label: "Finances", emoji: "💰" },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [tradieSearch, setTradieSearch] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<any>({ 
    queryKey: ["/api/admin/stats"],
    retry: 2,
    staleTime: 30 * 1000,
  });
  const { data: usersRaw, isLoading: usersLoading } = useQuery<any>({ 
    queryKey: ["/api/admin/users"], enabled: activeTab === "users", retry: 2 
  });
  const users = Array.isArray(usersRaw) ? usersRaw : [];
  const { data: jobsRaw, isLoading: jobsLoading } = useQuery<any>({ 
    queryKey: ["/api/admin/all-jobs"], enabled: activeTab === "jobs", retry: 2 
  });
  const jobs = Array.isArray(jobsRaw) ? jobsRaw : [];
  const { data: tradiesRaw, isLoading: tradiesLoading } = useQuery<any>({ 
    queryKey: ["/api/admin/all-tradies"], enabled: activeTab === "tradies", retry: 2 
  });
  const tradies = Array.isArray(tradiesRaw) ? tradiesRaw : [];
  const { data: finances, isLoading: financesLoading } = useQuery<any>({ 
    queryKey: ["/api/admin/finances"], enabled: activeTab === "finances", retry: 2 
  });

  const updateUser = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/admin/users/${data.id}`, { role: data.role, subscriptionPlan: data.plan }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "✅ User updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const updateTradie = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/admin/tradies/${data.id}/plan`, { subscriptionPlan: data.plan, subscriptionStatus: data.status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/all-tradies"] }); toast({ title: "✅ Tradie updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const filteredUsers = users.filter((u: any) =>
    !userSearch || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredJobs = jobs.filter((j: any) =>
    !jobSearch || `${j.title} ${j.category} ${j.location} ${j.customer_first} ${j.customer_last}`.toLowerCase().includes(jobSearch.toLowerCase())
  );
  const filteredTradies = tradies.filter((t: any) =>
    !tradieSearch || `${t.first_name} ${t.last_name} ${t.trade_name} ${t.email}`.toLowerCase().includes(tradieSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">TradieConnect platform management</p>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-red-700">Admin Access</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Tab Nav */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.emoji}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: statsLoading ? "..." : (stats?.totalUsers ?? 0), sub: "registered accounts", color: "text-blue-600", bg: "bg-blue-50", emoji: "👥" },
                { label: "Total Jobs", value: statsLoading ? "..." : (stats?.totalJobs ?? 0), sub: "jobs posted", color: "text-green-600", bg: "bg-green-50", emoji: "💼" },
                { label: "Messages", value: statsLoading ? "..." : (stats?.totalMessages ?? 0), sub: "sent on platform", color: "text-purple-600", bg: "bg-purple-50", emoji: "💬" },
                { label: "Contracts", value: statsLoading ? "..." : (stats?.totalContracts ?? 0), sub: "contracts created", color: "text-orange-600", bg: "bg-orange-50", emoji: "📄" },
              ].map(({ label, value, sub, color, bg, emoji }) => (
                <Card key={label} className="border border-slate-200 shadow-none">
                  <CardContent className="p-5">
                    <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{emoji}</div>
                    <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
                    <p className="text-sm font-medium text-slate-700 mt-1">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border border-slate-200 shadow-none">
                <CardHeader className="pb-3"><CardTitle className="text-base">Activity — Last 7 Days</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  {[
                    { label: "New Users", value: stats?.recentActivity?.newUsers ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "New Jobs", value: stats?.recentActivity?.newJobs ?? 0, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Contracts", value: stats?.recentActivity?.signedContracts ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-slate-500 mt-1">{label}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-none">
                <CardHeader className="pb-3"><CardTitle className="text-base">Platform Health</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "User Growth (7d)", value: stats?.totalUsers > 0 ? Math.round(((stats?.recentActivity?.newUsers ?? 0) / stats.totalUsers) * 100) : 0, color: "bg-blue-500" },
                    { label: "Job Activity (7d)", value: stats?.totalJobs > 0 ? Math.round(((stats?.recentActivity?.newJobs ?? 0) / stats.totalJobs) * 100) : 0, color: "bg-green-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-slate-500 mb-1"><span>{label}</span><span className="font-medium text-slate-700">{value}%</span></div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === "users" && (
          <Card className="border border-slate-200 shadow-none">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">All Users</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">{users.length} total accounts</p>
                </div>
                <input
                  type="text" placeholder="Search users..."
                  value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u: any) => (
                      <UserRow key={u.id} user={u} onSave={(role, plan) => updateUser.mutate({ id: u.id, role, plan })} />
                    ))}
                  </tbody>
                </table>
                {usersLoading && <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading users...</td></tr>}
                {filteredUsers.length === 0 && !usersLoading && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-3xl mb-2">👥</p>
                    <p className="text-sm">{userSearch ? "No users match your search" : "No users yet"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── JOBS ── */}
        {activeTab === "jobs" && (
          <Card className="border border-slate-200 shadow-none">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">All Jobs</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">{jobs.length} total jobs posted</p>
                </div>
                <input
                  type="text" placeholder="Search jobs..."
                  value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Job</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Posted By</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned To</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredJobs.map((j: any) => (
                      <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900 max-w-[200px] truncate">{j.title}</p>
                          <p className="text-xs text-slate-400">#{j.id}{j.budget_min ? ` · $${j.budget_min}–$${j.budget_max}` : ""}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-700">{j.customer_first} {j.customer_last}</p>
                          <p className="text-xs text-slate-400">{j.customer_email}</p>
                        </td>
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">{j.category}</span></td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{j.location}</td>
                        <td className="py-3 px-4"><span className={`px-2 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[j.status] || "bg-slate-100 text-slate-600"}`}>{j.status.replace("_", " ")}</span></td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{j.trade_name ? `${j.tradie_first} ${j.tradie_last}` : <span className="text-slate-300">Unassigned</span>}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{new Date(j.created_at).toLocaleDateString("en-AU")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {jobsLoading && <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading jobs...</td></tr>}
                {filteredJobs.length === 0 && !jobsLoading && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-3xl mb-2">💼</p>
                    <p className="text-sm">{jobSearch ? "No jobs match your search" : "No jobs yet"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TRADIES ── */}
        {activeTab === "tradies" && (
          <Card className="border border-slate-200 shadow-none">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">All Tradies</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">{tradies.length} registered tradies</p>
                </div>
                <input
                  type="text" placeholder="Search tradies..."
                  value={tradieSearch} onChange={e => setTradieSearch(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tradie</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trade</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Jobs Done</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sub Status</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTradies.map((t: any) => (
                      <TradieRow key={t.id} tradie={t} onSave={(plan, status) => updateTradie.mutate({ id: t.id, plan, status })} />
                    ))}
                  </tbody>
                </table>
                {tradiesLoading && <tr><td colSpan={8} className="text-center py-8 text-slate-400">Loading tradies...</td></tr>}
                {filteredTradies.length === 0 && !tradiesLoading && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-3xl mb-2">🔧</p>
                    <p className="text-sm">{tradieSearch ? "No tradies match your search" : "No tradies yet"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── FINANCES ── */}
        {activeTab === "finances" && !finances && (
          <div className="text-center py-12 text-slate-400"><p className="text-3xl mb-2">💰</p><p>Loading financial data...</p></div>
        )}
        {activeTab === "finances" && finances && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Est. Monthly Revenue", value: `$${(finances.monthlyRevenue || 0).toLocaleString()}`, sub: "from subscriptions", emoji: "💰", color: "text-green-600", bg: "bg-green-50" },
                { label: "Invoice Revenue", value: `$${(finances.invoiceRevenue || 0).toLocaleString()}`, sub: `${finances.paidInvoices || 0} paid invoices`, emoji: "🧾", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Total Jobs", value: (finances.totalJobs || 0).toLocaleString(), sub: `${finances.completedJobs || 0} completed`, emoji: "✅", color: "text-slate-700", bg: "bg-slate-100" },
                { label: "Completion Rate", value: `${finances.totalJobs > 0 ? Math.round((finances.completedJobs / finances.totalJobs) * 100) : 0}%`, sub: "jobs completed", emoji: "📈", color: "text-purple-600", bg: "bg-purple-50" },
              ].map(({ label, value, sub, emoji, color, bg }) => (
                <Card key={label} className="border border-slate-200 shadow-none">
                  <CardContent className="p-5">
                    <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{emoji}</div>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    <p className="text-sm font-medium text-slate-700 mt-1">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border border-slate-200 shadow-none">
                <CardHeader className="pb-3 border-b border-slate-100"><CardTitle className="text-base">Subscription Plan Breakdown</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 text-left">
                      <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                      <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Users</th>
                      <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Price/mo</th>
                      <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {(finances.planBreakdown || []).map((p: any) => (
                        <tr key={p.plan} className="hover:bg-slate-50">
                          <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${PLAN_COLORS[p.plan] || "bg-slate-100 text-slate-600"}`}>{p.plan}</span></td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{p.count}</td>
                          <td className="py-3 px-4 text-slate-500">{p.pricePerMonth === 0 ? <span className="text-slate-400">Free</span> : `$${p.pricePerMonth}`}</td>
                          <td className="py-3 px-4 font-semibold text-green-600">${(p.revenue || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 border-t-2 border-slate-200">
                        <td colSpan={3} className="py-3 px-4 font-bold text-slate-700">Total Monthly Revenue</td>
                        <td className="py-3 px-4 font-bold text-green-600 text-base">${(finances.monthlyRevenue || 0).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-none">
                <CardHeader className="pb-3 border-b border-slate-100"><CardTitle className="text-base">Tradie Subscription Plans</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 text-left">
                      <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                      <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Count</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {(finances.tradiePlans || []).map((p: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${PLAN_COLORS[p.subscription_plan] || "bg-slate-100 text-slate-600"}`}>{p.subscription_plan}</span></td>
                          <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-xs capitalize ${p.subscription_status === "active" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>{p.subscription_status}</span></td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{p.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, onSave }: { user: any; onSave: (role: string, plan: string) => void }) {
  const [role, setRole] = useState(user.role || "user");
  const [plan, setPlan] = useState(user.subscription_plan || "free");
  const [changed, setChanged] = useState(false);
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">{initials}</div>
          <div>
            <p className="font-medium text-slate-900">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs capitalize">{user.user_type}</span></td>
      <td className="py-3 px-4">
        <Select value={role} onValueChange={v => { setRole(v); setChanged(true); }}>
          <SelectTrigger className="w-28 h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>{ROLE_OPTIONS.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
        </Select>
      </td>
      <td className="py-3 px-4">
        <Select value={plan} onValueChange={v => { setPlan(v); setChanged(true); }}>
          <SelectTrigger className="w-32 h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>{PLAN_OPTIONS.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
        </Select>
      </td>
      <td className="py-3 px-4 text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString("en-AU")}</td>
      <td className="py-3 px-4">
        {changed
          ? <Button size="sm" className="h-7 text-xs bg-slate-900 hover:bg-slate-700" onClick={() => { onSave(role, plan); setChanged(false); }}>Save</Button>
          : <span className="text-xs text-slate-300">—</span>
        }
      </td>
    </tr>
  );
}

function TradieRow({ tradie, onSave }: { tradie: any; onSave: (plan: string, status: string) => void }) {
  const [plan, setPlan] = useState(tradie.subscription_plan || "starter");
  const [status, setStatus] = useState(tradie.subscription_status || "active");
  const [changed, setChanged] = useState(false);
  const initials = `${tradie.first_name?.[0] || ""}${tradie.last_name?.[0] || ""}`.toUpperCase();
  const rating = parseFloat(tradie.rating || "0");
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">{initials}</div>
          <div>
            <p className="font-medium text-slate-900">{tradie.first_name} {tradie.last_name}</p>
            <p className="text-xs text-slate-400">{tradie.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{tradie.trade_name}</span></td>
      <td className="py-3 px-4 text-xs text-slate-500">{tradie.location || "—"}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span className="text-xs font-medium text-slate-700">{rating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({tradie.total_reviews})</span>
        </div>
      </td>
      <td className="py-3 px-4 text-xs font-medium text-slate-700">{tradie.total_jobs}</td>
      <td className="py-3 px-4">
        <Select value={plan} onValueChange={v => { setPlan(v); setChanged(true); }}>
          <SelectTrigger className="w-32 h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>{TRADIE_PLAN_OPTIONS.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
        </Select>
      </td>
      <td className="py-3 px-4">
        <Select value={status} onValueChange={v => { setStatus(v); setChanged(true); }}>
          <SelectTrigger className="w-28 h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
        </Select>
      </td>
      <td className="py-3 px-4">
        {changed
          ? <Button size="sm" className="h-7 text-xs bg-slate-900 hover:bg-slate-700" onClick={() => { onSave(plan, status); setChanged(false); }}>Save</Button>
          : <span className="text-xs text-slate-300">—</span>
        }
      </td>
    </tr>
  );
}
