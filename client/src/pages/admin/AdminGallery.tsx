import { useState, useEffect } from "react";
import { Upload, Trash2, Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface GalleryImage {
  id: string | number;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
}

export default function AdminGallery() {
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTitle, setNewImageTitle] = useState("");

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      setLoading(true);
      const data = await api.get<GalleryImage[]>('/gallery');
      setImages(data || []);
    } catch (error: any) {
      console.error('Error fetching gallery:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAddImage = async () => {
    if (!newImageUrl || !newImageTitle) {
      toast({ title: "Error", description: "Please provide both title and URL", variant: "destructive" });
      return;
    }

    try {
      const created = await api.post<GalleryImage>('/gallery', {
        title: newImageTitle,
        image_url: newImageUrl,
        category: 'General',
      });

      setImages([created, ...images]);
      setIsDialogOpen(false);
      setNewImageUrl("");
      setNewImageTitle("");
      
      toast({
        title: "Image Added",
        description: "The image has been added to the gallery successfully.",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string | number, title: string) => {
    try {
      await api.delete(`/gallery/${id}`);

      setImages(images.filter(img => img.id !== id));
      toast({
        title: "Image Deleted",
        description: `${title} has been removed from the gallery.`,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-serif text-primary tracking-tight">Gallery Management</h2>
          <p className="text-muted-foreground mt-1">Upload and organize images for the public gallery.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Add Image URL
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Gallery Image</DialogTitle>
              <DialogDescription>Enter the image details to add it to the gallery.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Image Title</label>
                <Input 
                  placeholder="e.g. Graduation 2024" 
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Image URL</label>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddImage}>Add to Gallery</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Helper Note */}
        <Card className="col-span-1 border-border/60 shadow-sm bg-white h-fit">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg font-serif mb-4 flex items-center text-foreground">
              <ImageIcon className="h-5 w-5 mr-2 text-primary" /> Gallery Info
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Managing the global gallery allows you to showcase the institute's activities. 
              Currently, you can add images via external URLs. 
              <br /><br />
              <span className="font-bold text-primary">Pro Tip:</span> Use high-quality landscape images (16:9) for the best display results.
            </p>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        <div className="col-span-1 lg:col-span-2">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/60 overflow-hidden bg-white">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : images.length === 0 ? (
              <div className="col-span-full w-full p-12 text-center rounded-xl border border-dashed border-border bg-slate-50 text-muted-foreground flex flex-col items-center">
                <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-bold text-foreground">The gallery is currently empty.</p>
                <p className="text-sm">Add some images to brighten up the place!</p>
              </div>
            ) : (
              images.map((img) => (
                <div key={img.id} className="group relative rounded-xl border border-border/60 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img src={img.image_url} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(img.id, img.title)}
                        className="shadow-lg font-bold"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <p className="font-bold text-sm text-foreground truncate" title={img.title}>{img.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{img.category}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
