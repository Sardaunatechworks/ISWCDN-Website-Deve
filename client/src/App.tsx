import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/hooks/use-auth";

// Public Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Partners from "@/pages/Partners";
import Courses from "@/pages/Courses";
import Membership from "@/pages/Membership";
import MembershipApplication from "@/pages/MembershipApplication";
import Application from "@/pages/Application";
import Gallery from "@/pages/Gallery";
import Admissions from "@/pages/Admissions";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

// Admin Module
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/partners" component={Partners} />
      <Route path="/courses" component={Courses} />
      <Route path="/membership" component={Membership} />
      <Route path="/membership-application" component={MembershipApplication} />
      <Route path="/application" component={Application} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/admissions" component={Admissions} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");
  const isLoginPage = location === "/admin/login";

  return (
    <AuthProvider>
      <TooltipProvider>
        {isAdminRoute && !isLoginPage ? (
          <AdminLayout />
        ) : (
          <div className="flex flex-col min-h-screen font-sans bg-background text-foreground">
            {!isLoginPage && <Navbar />}
            <main className="flex-grow">
              <Switch>
                <Route path="/admin" component={() => <div className="p-8 text-center"><p>Redirecting to dashboard...</p></div>} />
                <Route path="/admin/login" component={AdminLogin} />
                <Route component={PublicRouter} />
              </Switch>
            </main>
            {!isLoginPage && <Footer />}
          </div>
        )}
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
