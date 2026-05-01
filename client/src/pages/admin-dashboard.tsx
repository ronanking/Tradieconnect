import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, MessageSquare, FileCheck, TrendingUp, Activity } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalMessages: number;
  totalContracts: number;
  recentActivity: {
    newUsers: number;
    newJobs: number;
    signedContracts: number;
  };
}

interface RecentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  createdAt: string;
}

interface RecentJob {
  id: number;
  title: string;
  category: string;
  location: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminDashboard() {
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: recentUsers = [] } = useQuery<RecentUser[]>({
    queryKey: ["/api/admin/recent-users"],
  });

  const { data: recentJobs = [] } = useQuery<RecentJob[]>({
    queryKey: ["/api/admin/recent-jobs"],
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Monitor platform activity and user engagement</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalJobs || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Messages</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalMessages || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileCheck className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Contracts</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalContracts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Array.isArray(recentUsers) ? recentUsers : []).slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.userType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Array.isArray(recentJobs) ? recentJobs : []).slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{job.title}</p>
                      <p className="text-sm text-slate-600">{job.category} • {job.location}</p>
                      <p className="text-xs text-slate-500">By {job.customer.firstName} {job.customer.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats?.recentActivity.newUsers || 0}</p>
                <p className="text-sm text-slate-600">New Users</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats?.recentActivity.newJobs || 0}</p>
                <p className="text-sm text-slate-600">New Jobs Posted</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats?.recentActivity.signedContracts || 0}</p>
                <p className="text-sm text-slate-600">Contracts Signed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}