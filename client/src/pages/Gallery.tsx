import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { getMediaUrl, getMediaFallbackUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

interface GalleryImage {
  id: string | number;
  title: string;
  image_url: string;
  category: string;
}

const SEEDED_GALLERY: GalleryImage[] = [
  { id: 1, title: 'Inauguration Ceremony', category: 'Events', image_url: '/inaguration.png' },
  { id: 2, title: 'Partnership Handshake', category: 'Corporate', image_url: '/handshake.png' },
  { id: 3, title: 'Youth Development Project', category: 'Community', image_url: '/kids.png' },
  { id: 4, title: 'Community Outreach Program', category: 'Community', image_url: '/kids2.png' },
  { id: 5, title: 'Exhibition Hall', category: 'Institute', image_url: '/image1.png' },
  { id: 6, title: 'Learning Session', category: 'Training', image_url: '/image2.png' },
  { id: 7, title: 'Professional Seminar', category: 'Events', image_url: '/image3.png' },
  { id: 8, title: 'Regional Conference', category: 'Events', image_url: '/image4.png' },
  { id: 9, title: 'Award Presentation', category: 'Awards', image_url: '/image5.png' },
  { id: 10, title: 'Social Work Workshop', category: 'Training', image_url: '/image6.png' },
  { id: 11, title: 'Facility Inspection', category: 'General', image_url: '/image7.png' },
  { id: 12, title: 'Delegate Meeting', category: 'Meetings', image_url: '/image8.png' },
  { id: 13, title: 'Certification Ceremony', category: 'Awards', image_url: '/image9.png' },
  { id: 14, title: 'Leadership Summit', category: 'Events', image_url: '/image10.png' },
  { id: 15, title: 'Keynote Speaker', category: 'Training', image_url: '/speaker.png' },
  { id: 16, title: 'Dignitary Visit', category: 'Corporate', image_url: '/ashiru.png' },
];

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>(SEEDED_GALLERY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const data = await api.get<GalleryImage[]>('/gallery');
        if (Array.isArray(data) && data.length > 0) {
          setImages(data);
        }
      } catch (error) {
        console.warn("Live gallery fetch fallback to seeded data:", error);
      }
    }
    fetchGallery();
  }, []);


  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Gallery"
        description="Highlights from our events, trainings, and community development projects."
      />

      <div className="container mx-auto px-4 py-20">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-3xl border-2 border-dashed border-border flex flex-col items-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <p className="text-xl font-serif font-bold text-foreground">No gallery items yet</p>
            <p className="text-muted-foreground mt-2">Check back soon for updates from our institute!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={getMediaUrl(img.image_url)}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = getMediaFallbackUrl(img.image_url);
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-xs font-bold text-primary-foreground/70 uppercase tracking-widest mb-1">{img.category}</p>
                    <p className="text-white font-serif text-xl font-bold">
                      {img.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
