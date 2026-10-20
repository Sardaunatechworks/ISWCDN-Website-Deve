import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Trash2, Eye, CheckCircle, Loader2, Search, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Message {
  id: string | number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      setLoading(true);
      const data = await api.get<Message[]>('/messages');
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string | number) {
    try {
      await api.patch(`/messages/${id}/status`, { status: 'Read' });
      
      setMessages(messages.map(m => m.id === id ? { ...m, status: 'Read' } : m));
      if (selectedMessage?.id === id) setSelectedMessage({ ...selectedMessage, status: 'Read' });
      
      toast({
        title: "Success",
        description: "Message marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function deleteMessage(id: string | number) {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await api.delete(`/messages/${id}`);

      setMessages(messages.filter(m => m.id !== id));
      setSelectedMessage(null);
      
      toast({
        title: "Message Deleted",
        description: "The inquiry has been permanently removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting message",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-foreground tracking-tight">Messages</h2>
          <p className="text-muted-foreground mt-1">Manage and respond to student inquiries and general contact requests.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchMessages} 
          disabled={loading}
          className="border-primary/20 hover:bg-primary/5 font-semibold"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
          Refresh List
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email or subject..."
                className="pl-9 bg-white border-border/60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground font-medium">Fetching inquiries...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Mail className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No messages found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {searchTerm ? "Try adjusting your search filters." : "All quiet! No students have reached out recently."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                    <th className="px-6 py-4">Sender</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Received</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMessages.map((msg) => (
                    <tr 
                      key={msg.id} 
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${msg.status === 'New' ? 'bg-primary/5 font-semibold' : ''}`}
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{msg.name}</span>
                          <span className="text-xs text-muted-foreground">{msg.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm truncate max-w-[200px] block">{msg.subject || "No Subject"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`
                          ${msg.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            msg.status === 'Replied' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'}
                        `}>
                          {msg.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString()} at {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => setSelectedMessage(msg)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => deleteMessage(msg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message View Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-serif text-primary">Message Inquiry</DialogTitle>
              {selectedMessage?.status === 'New' && (
                <Badge className="bg-blue-600">New Inquiry</Badge>
              )}
            </div>
            <DialogDescription className="text-sm">
              Received on {selectedMessage && new Date(selectedMessage.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-border">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">From</p>
                  <p className="text-sm font-bold text-foreground">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Email</p>
                  <a href={`mailto:${selectedMessage.email}`} className="text-sm font-bold text-primary hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Subject</p>
                  <p className="text-sm font-bold text-foreground">{selectedMessage.subject || "No Subject Provided"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Message Body</p>
                <div className="bg-white p-6 rounded-xl border border-border shadow-inner min-h-[150px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => selectedMessage && deleteMessage(selectedMessage.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Inquiry
            </Button>
            {selectedMessage?.status === 'New' && (
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => selectedMessage && markAsRead(selectedMessage.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Read
              </Button>
            )}
            <a href={`mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject}`}>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <Mail className="h-4 w-4 mr-2" />
                Reply via Email
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
