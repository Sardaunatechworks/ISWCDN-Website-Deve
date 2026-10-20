import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, Activity, ArrowUpRight, Plus, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import { Link } from "wouter";

// Mock data remains for the chart until more historic data is available in DB
const chartData = [
  { name: 'Jan', enrollments: 40, applications: 24 },
  { name: 'Feb', enrollments: 30, applications: 13 },
  { name: 'Mar', enrollments: 20, applications: 98 },
  { name: 'Apr', enrollments: 27, applications: 39 },
  { name: 'May', enrollments: 18, applications: 48 },
  { name: 'Jun', enrollments: 23, applications: 38 },
  { name: 'Jul', enrollments: 34, applications: 43 },
];

interface DashboardStats {
  totalMembers: number;
  activeApplications: number;
  totalCourses: number;
  totalGallery: number;
}

interface RecentApp {
  id: string | number;
  name: string;
  program: string;
  submitted_at: string;
  status: string;
}

interface RecentMessage {
  id: string | number;
  name: string;
  subject: string;
  created_at: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeApplications: 0,
    totalCourses: 0,
    totalGallery: 0
  });
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const res = await api.get<{
        stats: DashboardStats;
        recentApps: RecentApp[];
        recentMessages: RecentMessage[];
      }>('/dashboard/stats');

      if (res && res.stats) {
        setStats({
          totalMembers: res.stats.totalMembers || 0,
          activeApplications: res.stats.activeApplications || 0,
          totalCourses: res.stats.totalCourses || 0,
          totalGallery: res.stats.totalGallery || 0,
        });
        setRecentApps(res.recentApps || []);
        setRecentMessages(res.recentMessages || []);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { title: "Total Members", value: stats.totalMembers.toLocaleString(), change: "+12%", icon: Users, color: "text-blue-600" },
    { title: "Pending Applications", value: stats.activeApplications.toLocaleString(), change: "Review required", icon: FileText, color: "text-amber-600" },
    { title: "Courses Offered", value: stats.totalCourses.toLocaleString(), change: "Active catalog", icon: BookOpen, color: "text-green-600" },
    { title: "Gallery Items", value: stats.totalGallery.toLocaleString(), icon: Activity, color: "text-purple-600" },
  ];

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground font-medium">Loading Overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-foreground tracking-tight">Overview</h2>
          <p className="text-muted-foreground mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/members">
            <Button className="bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 font-semibold tracking-wide">
              <Plus className="h-4 w-4 mr-2" /> New Member
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="border-border/60 hover:border-primary/30 transition-colors shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-primary font-medium mt-1 inline-flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {stat.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Chart Block */}
      <Card className="border-border/60 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-primary">Enrollment Trends</CardTitle>
          <CardDescription>Monthly overview of new enrollments vs applications (Historical Mock Data).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="enrollments" name="Enrollments" fill="#15803d" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="applications" name="Applications" fill="#86efac" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 border-border/60 shadow-sm bg-white overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-primary">Recent Applications</CardTitle>
            <CardDescription>The newest membership and course applications from our portal.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-x-auto">
            {recentApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground italic border-t border-dashed">
                <p>No recent applications found.</p>
              </div>
            ) : (
              <div className="space-y-4 min-w-[500px]">
                {recentApps.map((app) => (
                  <div key={app.id} className="flex flex-row items-center justify-between p-4 bg-slate-50/80 hover:bg-slate-50 transition-colors rounded-xl border border-border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {app.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.program} • {new Date(app.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 w-fit rounded-full text-xs font-bold ${
                      app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      app.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {app.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-primary">Messages</CardTitle>
            <CardDescription>Latest inquiries from contact page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  No recent messages found.
                </p>
              ) : (
                recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border-b last:border-0 border-dashed">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${msg.status === 'New' ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{msg.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{msg.subject || "No Subject"}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(msg.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/admin/messages">
              <Button variant="outline" className="w-full mt-6 text-primary border-primary/20 font-bold hover:bg-primary/5">
                View All Messages
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
