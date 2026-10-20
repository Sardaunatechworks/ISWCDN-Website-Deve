import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Pencil, Upload, Users, Loader2, Image as ImageIcon, ExternalLink, MoveUp, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  image_url: string;
  bio: string;
  order_index: number;
}

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    image_url: "",
    order_index: 0
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      const data = await api.get<TeamMember[]>('/admin/team');
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching board",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      role: "",
      bio: "",
      image_url: "",
      order_index: members.length + 1
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image_url: member.image_url,
      order_index: member.order_index
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const res = await api.upload<{ image_url: string }>('/team/upload', file, 'image');
      setFormData(prev => ({ ...prev, image_url: res.image_url }));
      toast({ title: "Image Uploaded", description: "Profile photo uploaded successfully." });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingMember) {
        await api.put(`/team/${editingMember.id}`, formData);
        toast({ title: "Record Updated", description: "Board member profile saved successfully." });
      } else {
        await api.post('/team', formData);
        toast({ title: "Profile Created", description: "New board member added to the institute." });
      }
      setIsDialogOpen(false);
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function deleteMember(id: string | number) {
    if (!confirm("Are you sure? This will remove the profile from the public site immediately.")) return;
    try {
      await api.delete(`/team/${id}`);
      setMembers(members.filter(m => m.id !== id));
      toast({ title: "Profile Removed", description: "Record deleted successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  async function updateOrder(member: TeamMember, direction: 'up' | 'down') {
    const currentIndex = members.findIndex(m => m.id === member.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === members.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapMember = members[swapIndex];

    try {
      await api.put(`/team/${member.id}`, { order_index: swapMember.order_index });
      await api.put(`/team/${swapMember.id}`, { order_index: member.order_index });
      fetchMembers();
    } catch (error: any) {
      toast({ title: "Ordering failed", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-foreground tracking-tight">Board of Trustees</h2>
          <p className="text-muted-foreground mt-1">Manage the leadership profiles displayed on the About Us page.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 shadow-md">
          <Plus className="h-4 w-4 mr-2" /> Add Board Member
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-slate-100 rounded-t-xl" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </CardContent>
            </Card>
          ))
        ) : members.length === 0 ? (
          <Card className="col-span-full py-20 border-border/60 shadow-sm bg-white text-center">
            <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground italic">No board members found. Click the button above to add one.</p>
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id} className="border-border/60 shadow-sm bg-white overflow-hidden group">
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                {member.image_url ? (
                  <img src={member.image_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleEdit(member)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteMember(member.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-primary font-serif truncate">{member.name}</h3>
                <p className="text-sm text-muted-foreground font-medium mb-4">{member.role}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                   <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateOrder(member, 'up')}>
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateOrder(member, 'down')}>
                        <MoveDown className="h-3 w-3" />
                      </Button>
                   </div>
                   <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-wider" onClick={() => handleEdit(member)}>
                      Edit Profile
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-primary">
              {editingMember ? "Edit Board Member" : "New Board Member"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role / Title</Label>
                  <Input 
                    id="role" 
                    placeholder="e.g. Chairman, Board of Trustees"
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                   <Label>Profile Picture</Label>
                   <div className="flex items-center gap-3">
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-100 border border-border">
                         {formData.image_url ? (
                           <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                         ) : (
                           <div className="flex items-center justify-center h-full text-slate-300">
                             <ImageIcon className="h-8 w-8" />
                           </div>
                         )}
                      </div>
                      <div className="flex-1">
                        <Input 
                          type="file" 
                          id="file-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        <Label 
                          htmlFor="file-upload" 
                          className={`flex items-center justify-center h-10 px-4 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors ${uploading ? 'opacity-50' : ''}`}
                        >
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2 text-primary" />}
                          <span className="text-sm font-bold text-primary">{uploading ? 'Uploading...' : 'Choose Image'}</span>
                        </Label>
                      </div>
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Biography</Label>
                <Textarea 
                  id="bio" 
                  className="h-[210px] resize-none"
                  placeholder="Enter detailed bio..."
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary" disabled={uploading}>
                {editingMember ? "Save Changes" : "Create Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
