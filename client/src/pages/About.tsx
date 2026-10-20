import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Lightbulb, Shield, Heart, Scale, Users, BookOpen, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getMediaUrl, getMediaFallbackUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  image_url: string;
  bio: string;
}

const SEEDED_TEAM: TeamMember[] = [
  {
    id: 1,
    name: 'Baheejah Mahmood Abdullah',
    role: 'CEO/ED',
    image_url: '/profiles/kib1znf1xm9.jpeg',
    bio: 'Executive Director providing strategic leadership and oversight for community development initiatives across Nigeria.',
  },
  {
    id: 2,
    name: 'Cmr Aminu Umar Malu',
    role: 'Secretary',
    image_url: '/profiles/raud9oln95e.jpeg',
    bio: 'Secretariat administration, council documentation, and institutional correspondence.',
  },
  {
    id: 3,
    name: 'Prof. Abubakar Yahaya',
    role: 'Director Academic Planning',
    image_url: '/profiles/wtylxoxtmh.jpeg',
    bio: 'Director of Academic Planning leading curriculum standards and accreditation.',
  },
  {
    id: 4,
    name: 'Amb. Sulaiman Ashiru',
    role: 'HR/program Manager',
    image_url: '/profiles/jc2td6zvu9p.jpeg',
    bio: 'Human Resources and Program Manager steering organizational development and field outreach.',
  },
  {
    id: 5,
    name: 'Abba Dauda',
    role: 'DLP Coordinator',
    image_url: '/profiles/yqqbphwssj9.jpeg',
    bio: 'Distance Learning Program (DLP) Coordinator expanding educational access nationwide.',
  },
  {
    id: 6,
    name: 'Muhammad Dini Ibrahim',
    role: 'Monitoring and Evaluation',
    image_url: '/profiles/38jbt3lboal.jpeg',
    bio: 'Monitoring and Evaluation Officer ensuring data integrity, impact assessment, and project fidelity.',
  },
  {
    id: 7,
    name: 'Barr Najib Rabiu',
    role: 'Legal Adviser',
    image_url: '/profiles/jsfxd0x7w2l.jpeg',
    bio: 'Legal Adviser overseeing regulatory compliance, governance, and statutory affairs.',
  },
];

export default function About() {
  const [team, setTeam] = useState<TeamMember[]>(SEEDED_TEAM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const data = await api.get<TeamMember[]>('/team');
        if (Array.isArray(data) && data.length > 0) {
          setTeam(data);
        }
      } catch (error) {
        console.warn("Live team fetch fallback to seeded data:", error);
      }
    }
    fetchTeam();
  }, []);

  const values = [
    { icon: Scale, title: "Equity and Social Justice", desc: "Ensuring fairness and justice in all community dealings." },
    { icon: Shield, title: "Professionalism", desc: "Upholding the highest ethical standards." },
    { icon: Lightbulb, title: "Innovation", desc: "Creative solutions to social challenges." },
    { icon: Users, title: "Collaboration and Partnership", desc: "Working together for greater impact." },
    { icon: Heart, title: "Empowerment", desc: "Enabling individuals to reach their potential." },
    { icon: BookOpen, title: "Knowledge and Learning", desc: "Continuous learning and professional growth." },
    { icon: Target, title: "Sustainability", desc: "Long-term positive change in communities." },
    { icon: Shield, title: "Integrity and Transparency", desc: "Honest and open practices in all we do." },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Who We Are"
        description="The Institute of Social Welfare and Community Development of Nigeria (ISWCDN) is a professional body dedicated to excellence in social work."
      />

      <div className="container mx-auto px-4 py-20">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="bg-slate-50 p-10 rounded-3xl border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              To advance social welfare and inclusive community development in
              Nigeria by promoting professional excellence, capacity building,
              evidence-based research, policy innovation, and transformative
              leadership that uplifts vulnerable populations and fosters
              sustainable, equitable growth.
            </p>
          </div>

          <div className="bg-primary p-10 rounded-3xl text-primary-foreground">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Our Vision</h2>
            <p className="text-primary-foreground/90 text-lg leading-relaxed">
              To be Nigeria’s foremost institute for social welfare and
              community development recognized globally for setting standards of
              excellence in social innovation, inclusive practice, and community
              resilience.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Our Core Values</h2>
            <p className="text-muted-foreground">
              These principles guide every action, decision, and partnership at the Institute.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <Card key={idx} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary">
                      <val.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{val.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{val.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Board Members */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Board of Trustees</h2>
            <p className="text-muted-foreground text-lg">Meet the distinguished leaders and professionals guiding our institute.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-1/2 mx-auto sm:mx-0" />
                </div>
              ))
            ) : team.length === 0 ? (
              <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-border rounded-3xl text-center">
                <Users className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium italic">Our board profiles are being updated. Check back soon!</p>
              </div>
            ) : (
              team.map((member) => (
                <div key={member.id} className="group relative bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={getMediaUrl(member.image_url)}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = getMediaFallbackUrl(member.image_url);
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-bold text-xl text-primary font-serif mb-1">{member.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground mb-6">{member.role}</p>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5 text-primary tracking-wide font-bold">Read Bio</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl text-primary">{member.name}</DialogTitle>
                          <DialogDescription className="font-bold text-foreground py-1 border-b border-border mb-4">{member.role}</DialogDescription>
                        </DialogHeader>
                        <div className="text-muted-foreground leading-relaxed">
                          {member.bio}
                        </div>
                      </DialogContent>
                    </Dialog>
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
