import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string | number;
  title: string;
  category: string;
  duration: string;
  type: string;
  description: string;
}

const SEEDED_COURSES: Course[] = [
  { id: 1, title: 'Diploma in Social Work', category: 'diploma', duration: '2 Years', type: 'Long-Term', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 2, title: 'Project Planning & Management', category: 'diploma', duration: '18 Months', type: 'Long-Term', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 3, title: 'Community Development Studies', category: 'diploma', duration: '2 Years', type: 'Long-Term', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 4, title: 'Public Administration', category: 'diploma', duration: '2 Years', type: 'Long-Term', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 5, title: 'MHPSS (Mental Health & Psychosocial Support)', category: 'certificate', duration: '6 Months', type: 'Short Course', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 6, title: 'Social Accountability & Governance', category: 'certificate', duration: '3 Months', type: 'Short Course', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 7, title: 'Child Protection Services', category: 'certificate', duration: '4 Months', type: 'Short Course', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 8, title: 'Health Social Work', category: 'certificate', duration: '1 Year', type: 'Specialization', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 9, title: 'Justice & Rehabilitation', category: 'certificate', duration: '1 Year', type: 'Specialization', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 10, title: 'Tech4Dev (Technology for Development)', category: 'certificate', duration: '6 Months', type: 'Technical', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 11, title: 'Advanced Leadership in Social Sector', category: 'executive', duration: '5 Days', type: 'Workshop', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 12, title: 'Strategic NGO Management', category: 'executive', duration: '1 Week', type: 'Intensive', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 13, title: 'Welding & Fabrication', category: 'vocational', duration: '6 Months', type: 'Vocational', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 14, title: 'Fashion Designing & Tailoring', category: 'vocational', duration: '1 Year', type: 'Vocational', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 15, title: 'Automobile Repair & Maintenance', category: 'vocational', duration: '6 Months', type: 'Vocational', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
  { id: 16, title: 'Computer & Information Technology', category: 'vocational', duration: '3 Months', type: 'Vocational', description: 'Comprehensive curriculum covering theoretical foundations and practical field applications.' },
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>(SEEDED_COURSES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await api.get<Course[]>('/courses');
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      } catch (error) {
        console.warn("Live courses fetch fallback to seeded catalog:", error);
      }
    }
    fetchCourses();
  }, []);

  const getCoursesByCategory = (category: string) => {
    return courses.filter(c => c.category.toLowerCase() === category.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <PageHeader 
        title="Academic Programs" 
        description="Comprehensive training designed to build expertise in social work and community development."
      />

      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="diploma" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 mb-12 bg-white border border-border rounded-xl shadow-sm">
            <TabsTrigger value="diploma" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">Diploma</TabsTrigger>
            <TabsTrigger value="certificate" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">Certificate</TabsTrigger>
            <TabsTrigger value="executive" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">Executive</TabsTrigger>
            <TabsTrigger value="elearning" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">E-Learning</TabsTrigger>
            <TabsTrigger value="vocational" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">Vocational</TabsTrigger>
          </TabsList>

          {["diploma", "certificate", "executive", "vocational"].map((cat) => (
            <TabsContent key={cat} value={cat}>
              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[250px] w-full rounded-xl" />)}
                </div>
              ) : (
                <CourseGrid>
                  {getCoursesByCategory(cat).map((course) => (
                    <CourseCard 
                      key={course.id}
                      title={course.title} 
                      duration={course.duration} 
                      type={course.type}
                      description={course.description}
                    />
                  ))}
                  {getCoursesByCategory(cat).length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed">
                      <p className="text-muted-foreground italic">No programs found in this category.</p>
                    </div>
                  )}
                </CourseGrid>
              )}
            </TabsContent>
          ))}

          <TabsContent value="elearning">
             <div className="text-center py-16 bg-white rounded-2xl border border-border shadow-sm">
               <BookOpen className="h-16 w-16 text-primary/20 mx-auto mb-6" />
               <h3 className="text-2xl font-bold text-foreground mb-4">Online Learning Portal</h3>
               <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                 Access our world-class curriculum from anywhere. Our e-learning platform offers flexible schedules for working professionals.
               </p>
               <Button className="bg-primary">Visit E-Learning Portal</Button>
             </div>
          </TabsContent>
        </Tabs>

        <div className="mt-20 p-8 md:p-12 bg-primary rounded-[2rem] text-primary-foreground text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to Enroll?</h3>
            <p className="mb-10 opacity-90 max-w-2xl mx-auto text-lg leading-relaxed">
              Check the admission requirements and start your journey towards a rewarding career in social development.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/admissions">
                <Button variant="secondary" className="font-bold px-8 h-12">View Requirements</Button>
              </Link>
              <Link href="/application">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 h-12">Apply Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">{children}</div>;
}

function CourseCard({ title, duration, type, description }: { title: string; duration: string; type: string; description: string }) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-border/60 group">
      <CardHeader>
        <div className="flex justify-between items-start mb-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 font-semibold">{type}</Badge>
          <div className="flex items-center text-sm text-muted-foreground bg-slate-50 px-2 py-1 rounded">
            <Clock className="h-4 w-4 mr-1.5 text-primary" /> {duration}
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-primary font-serif group-hover:text-primary/80 transition-colors uppercase tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description || "Comprehensive curriculum covering theoretical foundations and practical field applications."}
        </p>
      </CardContent>
      <CardFooter className="flex pt-4">
        <Link href="/application" className="w-full">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold group/btn border-0 shadow-lg shadow-primary/20">
            Apply Now <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
