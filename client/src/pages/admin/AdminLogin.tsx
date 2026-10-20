import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);

      toast({
        title: "Success",
        description: "Welcome back, Admin!",
      });
      setLocation("/admin");
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 flex items-center justify-center">
        <div className="absolute w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -top-48 -left-24" />
        <div className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -bottom-24 -right-12" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none z-10 bg-white/80 backdrop-blur-md">
        <CardHeader className="space-y-2 text-center pb-8 border-b border-border/50">
          <div className="mx-auto bg-primary h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg transform -translate-y-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-serif font-bold text-primary tracking-tight pt-2">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Sign in to manage the ISWCDN institute dashboard.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="pl-10 h-11 bg-slate-50/50 border-border focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10 h-11 bg-slate-50/50 border-border focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest leading-loose">
              Security Notice
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Unauthorized access attempt is logged. IP: 192.168.1.1 (Masked)
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Logo Branding */}
      <div className="absolute bottom-6 flex items-center gap-2 opacity-50 z-10">
        <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
          <img src="/logo.png" alt="ISWCDN Logo" className="h-6 w-6 object-contain" />
        </div>
        <span className="font-serif font-bold text-primary tracking-tight text-sm uppercase">ISWCDN INSTITUTE</span>
      </div>
    </div>
  );
}
