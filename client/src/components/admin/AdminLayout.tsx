import { Link, useLocation, Switch, Route } from "wouter";
import { LayoutDashboard, Users, GraduationCap, Settings, LogOut, Menu, User, Image, FileText, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminMembers from "@/pages/admin/AdminMembers";
import AdminApplications from "@/pages/admin/AdminApplications";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminNewsletter from "@/pages/admin/AdminNewsletter";
import AdminMessages from "@/pages/admin/AdminMessages";
import AdminTeam from "@/pages/admin/AdminTeam";

const adminNav = [
  { name: "Members", href: "/admin/members", icon: Users },
  { name: "Board Mgt", href: "/admin/team", icon: Users },
  { name: "Applications", href: "/admin/applications", icon: FileText },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { name: "Courses Setup", href: "/admin/courses", icon: GraduationCap },
  { name: "Messages", href: "/admin/messages", icon: Mail },
  { name: "Gallery Mgt", href: "/admin/gallery", icon: Image },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout() {
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/admin/login");
    }
  }, [user, loading, setLocation]);

  const handleLogout = async () => {
    await signOut();
    setLocation("/admin/login");
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Initializing Secure Session...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-foreground">
      {/* Sidebar - Desktop & Tablet */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground border-r border-primary/20 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col shrink-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-primary-foreground/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shrink-0">
              <img src="/logo.png" alt="ISWCDN Logo" className="h-8 w-8 object-contain" />
            </div>
            <span className="font-serif font-bold text-lg leading-tight">ISWCDN Admin</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-primary shadow-md font-bold"
                      : "text-primary-foreground/80 hover:bg-white/10 hover:text-white font-medium"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10 space-y-2">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-red-200 hover:text-white hover:bg-red-500/20"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-primary-foreground/60 hover:text-white hover:bg-white/5 text-xs">
              Back to Website
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-border h-16 shrink-0 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 text-slate-500 hover:text-primary transition-colors"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-serif font-bold text-xl text-primary hidden md:block">
              {adminNav.find(n => n.href === location)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-bold text-foreground">Administrator</p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20 transition-colors">
              <User className="h-5 w-5" />
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/members" component={AdminMembers} />
            <Route path="/admin/team" component={AdminTeam} />
            <Route path="/admin/applications" component={AdminApplications} />
            <Route path="/admin/courses" component={AdminCourses} />
            <Route path="/admin/gallery" component={AdminGallery} />
            <Route path="/admin/settings" component={AdminSettings} />
            <Route path="/admin/newsletter" component={AdminNewsletter} />
            <Route path="/admin/messages" component={AdminMessages} />
            <Route>
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-xl bg-white/50">
                <p className="text-muted-foreground font-medium">This module could not be found.</p>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}
