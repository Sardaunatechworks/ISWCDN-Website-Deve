import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, Plus, Search, Pencil, Trash2, Loader2, BookOpen, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Course {
  id: string | number;
  title: string;
  category: string;
  duration: string;
  type: string;
  description: string;
  order_index?: number;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    category: "diploma",
    duration: "",
    type: "",
    description: "Comprehensive curriculum covering theoretical foundations and practical field applications."
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const data = await api.get<Course[]>('/admin/courses');
      setCourses(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching programs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      category: "diploma",
      duration: "",
      type: "",
      description: "Comprehensive curriculum covering theoretical foundations and practical field applications."
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      category: course.category,
      duration: course.duration,
      type: course.type,
      description: course.description
    });
    setIsDialogOpen(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
        toast({ title: "Updated", description: "Program updated successfully." });
      } else {
        await api.post('/courses', formData);
        toast({ title: "Created", description: "New program added successfully." });
      }
      setIsDialogOpen(false);
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function deleteCourse(id: string | number) {
    if (!confirm("Remove this program from the catalog?")) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter(c => c.id !== id));
      toast({ title: "Removed", description: "Program deleted successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ["diploma", "certificate", "executive", "elearning", "vocational"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-foreground tracking-tight">Programs Setup</h2>
          <p className="text-muted-foreground mt-1">Manage the academic catalog and vocational training programs.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 shadow-md">
          <Plus className="h-4 w-4 mr-2" /> Add New Program
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm bg-white">
        <CardHeader className="border-b bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by title or category..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground font-medium">Loading programs...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-muted-foreground italic">No programs found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                    <th className="px-6 py-4">Program Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-primary">{course.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">{course.description}</div>
                      </td>
                      <td className="px-6 py-4 uppercase">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {course.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {course.duration}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {course.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => handleEdit(course)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => deleteCourse(course.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-primary">
              {editingCourse ? "Edit Program" : "Add New Program"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Program Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={val => setFormData({...formData, category: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="uppercase">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type (Badge)</Label>
                <Input 
                  id="type" 
                  placeholder="e.g. Long-Term"
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input 
                id="duration" 
                placeholder="e.g. 2 Years"
                value={formData.duration} 
                onChange={e => setFormData({...formData, duration: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input 
                id="description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">
                {editingCourse ? "Save Changes" : "Create Program"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
