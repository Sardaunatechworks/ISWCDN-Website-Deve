import { useState, useEffect } from "react";
import { Mail, Trash2, Search, Download, Loader2, ArrowRight, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Subscriber {
  id: string | number;
  email: string;
  created_at: string;
}

interface Broadcast {
  id: string | number;
  subject: string;
  content: string;
  recipient_count: number;
  sent_at: string;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({ subject: "", content: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    await Promise.all([fetchSubscribers(), fetchBroadcasts()]);
    setLoading(false);
  }

  async function fetchBroadcasts() {
    try {
      const data = await api.get<Broadcast[]>('/admin/newsletter/broadcasts');
      setBroadcasts(data || []);
    } catch (err: any) {
      console.error('Error fetching broadcasts:', err.message);
    }
  }

  async function fetchSubscribers() {
    try {
      setLoading(true);
      const data = await api.get<Subscriber[]>('/admin/newsletter/subscribers');
      setSubscribers(data || []);
    } catch (error: any) {
      console.error('Error fetching subscribers:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string | number, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email}?`)) return;

    try {
      await api.delete(`/admin/newsletter/subscribers/${id}`);

      setSubscribers(subscribers.filter(s => s.id !== id));
      toast({
        title: "Subscriber Removed",
        description: `${email} has been removed from the list.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribers.length === 0) {
      toast({ title: "No recipients", description: "You have no subscribers to send to.", variant: "destructive" });
      return;
    }

    try {
      setSending(true);
      await api.post('/admin/newsletter/broadcast', {
        subject: newBroadcast.subject,
        content: newBroadcast.content,
      });

      toast({
        title: "Broadcast Sent!",
        description: `Your newsletter has been queued for ${subscribers.length} recipients.`,
      });
      setIsComposeOpen(false);
      setNewBroadcast({ subject: "", content: "" });
      fetchBroadcasts();
    } catch (error: any) {
      toast({ title: "Broadcast Failed", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-primary tracking-tight">Email Newsletter</h2>
          <p className="text-muted-foreground mt-1">Manage your institute's network of email subscribers.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="flex-1 sm:flex-none">
            Refresh Dashboard
          </Button>
          <Button onClick={() => {
            const emails = subscribers.map(s => s.email).join("\n");
            const blob = new Blob([emails], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "iswcdn_subscribers.txt";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }} disabled={loading || subscribers.length === 0} variant="secondary" className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" /> Export Emails
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 pb-12">
        <Card className="col-span-1 lg:col-span-2 border-border/60 shadow-sm bg-white overflow-hidden">
          <Tabs defaultValue="list">
             <div className="border-b border-border/50 px-6 pt-4 flex justify-between items-center bg-slate-50/30">
                <TabsList className="bg-slate-100/50">
                  <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Subscriber List</TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Broadcast History</TabsTrigger>
                </TabsList>
             </div>
             
             <TabsContent value="list" className="m-0">
                <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg font-serif tracking-wide">Active Subscribers ({filteredSubscribers.length})</CardTitle>
                    <p className="text-xs text-muted-foreground">Manage your current audience.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Find email..."
                      className="pl-9 bg-slate-50 border-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-slate-50/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Email Account</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Joined Date</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4 font-medium italic text-muted-foreground animate-pulse">Fetching records...</td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></td>
                          </tr>
                        ))
                      ) : filteredSubscribers.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">
                            {searchTerm ? "No subscribers match your search." : "No subscribers yet."}
                          </td>
                        </tr>
                      ) : (
                        filteredSubscribers.map((subscriber) => (
                          <tr key={subscriber.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground">{subscriber.email}</td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {new Date(subscriber.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(subscriber.id, subscriber.email)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
             </TabsContent>

             <TabsContent value="history" className="m-0">
                <div className="p-6 border-b border-border/50">
                  <CardTitle className="text-lg font-serif">Sent Broadcasts</CardTitle>
                  <p className="text-xs text-muted-foreground italic">Review previous mass communications.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left font-medium">
                    <thead className="text-xs text-muted-foreground bg-slate-50/50 border-b border-border font-bold uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4 text-center">Recipients</th>
                        <th className="px-6 py-4 text-right">Sent Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {broadcasts.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">
                            No broadcasts sent yet.
                          </td>
                        </tr>
                      ) : (
                        broadcasts.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-primary font-bold">{b.subject}</td>
                            <td className="px-6 py-4 text-center">
                               <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                                 {b.recipient_count}
                               </Badge>
                            </td>
                            <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                              {new Date(b.sent_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
             </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-lg bg-primary text-primary-foreground overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-serif">Reach Your Audience</CardTitle>
              <CardDescription className="text-primary-foreground/70 font-medium tracking-tight">Broadcast a newsletter to all {subscribers.length} verified subscribers.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setIsComposeOpen(true)}
                className="w-full bg-white text-primary hover:bg-white/90 font-bold tracking-wide shadow-xl shadow-black/10"
              >
                <Plus className="h-4 w-4 mr-2" /> Start New Broadcast
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Support Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-border">
                <p className="text-sm font-bold text-primary">Active Reach</p>
                <p className="text-3xl font-black text-primary/90 mt-1">{subscribers.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Growth is steady
                </p>
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed px-1">
                Use the broadcast tool to send mass updates. All sent messages are permanently logged for audit.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Broadcast Composer Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-primary">New Newsletter Broadcast</DialogTitle>
            <p className="text-sm font-bold text-muted-foreground">
              Direct communication to {subscribers.length} subscribers.
            </p>
          </DialogHeader>
          <form onSubmit={handleSendBroadcast} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="font-bold uppercase tracking-wider text-[10px]">Email Subject Line</Label>
              <Input
                id="subject"
                placeholder="e.g. Monthly Professional Updates - April 2024"
                className="bg-slate-50"
                value={newBroadcast.subject}
                onChange={(e) => setNewBroadcast({ ...newBroadcast, subject: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="font-bold uppercase tracking-wider text-[10px]">Newsletter Content (HTML/Plain Text)</Label>
              <Textarea
                id="content"
                placeholder="Insert your newsletter body here..."
                className="h-64 bg-slate-50 font-mono text-sm leading-relaxed"
                value={newBroadcast.content}
                onChange={(e) => setNewBroadcast({ ...newBroadcast, content: e.target.value })}
                required
              />
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
               <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-xs text-amber-700 leading-relaxed">
                 <span className="font-bold text-amber-900">Important:</span> This broadcast will be tracked in the history. Ensure your content adheres to professional standards before clicking broadcast.
               </p>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={sending} className="bg-primary hover:bg-primary/90 font-bold px-8 shadow-lg shadow-primary/20">
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                {sending ? 'Sending...' : 'Broadcast Now'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
