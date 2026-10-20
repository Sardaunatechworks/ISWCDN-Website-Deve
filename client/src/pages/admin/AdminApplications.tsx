import { useState, useEffect } from "react";
import { Check, X, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Application {
  id: string | number;
  name: string;
  program: string;
  status: string;
  submitted_at: string;
}

export default function AdminApplications() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      const data = await api.get<Application[]>('/applications', { status: 'Pending' });
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (id: string | number, name: string, action: 'Approved' | 'Rejected') => {
    try {
      await api.patch(`/applications/${id}/status`, { status: action });

      setApplications(applications.filter(app => app.id !== id));
      toast({
        title: `Application ${action}`,
        description: `${name}'s application has been explicitly ${action.toLowerCase()}.`,
        variant: action === 'Rejected' ? 'destructive' : 'default',
      });
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-3xl font-bold font-serif text-primary tracking-tight">Applications Review</h2>
        <p className="text-muted-foreground mt-1">Review and process incoming memberships and course enrollments.</p>
      </div>

      <Card className="border-border/60 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-border/50">
          <CardTitle className="text-lg font-serif">
            {loading ? "Loading..." : `Action Required (${applications.length})`}
          </CardTitle>
          <CardDescription>These applications require your immediate attention.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-xl">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-slate-400" />
              </div>
              <p className="font-bold text-lg text-foreground">You're all caught up!</p>
              <p>No pending applications right now.</p>
              <Button variant="outline" className="mt-4" onClick={fetchApplications}>
                Refresh List
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {applications.map((app) => (
                <div key={app.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 font-bold shrink-0">
                       {app.name.charAt(0)}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg text-foreground">{app.name}</h3>
                       <p className="text-sm text-muted-foreground">Applying for: <span className="font-semibold text-foreground">{app.program}</span></p>
                       <p className="text-xs text-muted-foreground mt-1">Submitted: {formatDate(app.submitted_at)}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:ml-auto shrink-0 w-full md:w-auto justify-end mt-4 md:mt-0">
                    <Button variant="outline" size="sm" className="hidden sm:flex hover:bg-slate-100">
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleAction(app.id, app.name, 'Rejected')}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
                    >
                      <X className="h-4 w-4 mr-2" /> Reject
                    </Button>
                    <Button 
                      onClick={() => handleAction(app.id, app.name, 'Approved')}
                      className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                    >
                      <Check className="h-4 w-4 mr-2" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
