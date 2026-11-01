import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, BookOpen, ChevronRight, Search, GraduationCap, Award, Briefcase, Wrench, Laptop, CheckCircle2, Sparkles, Filter } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export interface Course {
  id: string | number;
  title: string;
  category: "diploma" | "certificate" | "executive" | "vocational" | "elearning";
  duration: string;
  type: string;
  description: string;
  highlights?: string[];
  level?: string;
}

export const ALL_COURSES: Course[] = [
  // 1. Diplomas
  {
    id: 1,
    title: "Diploma in Social Work",
    category: "diploma",
    duration: "2 Years",
    type: "Long-Term Diploma",
    level: "National Diploma Equivalent",
    description: "Foundational training in social casework, community mobilization, human behavior, ethics, and field practicum for professional practice.",
    highlights: ["Clinical casework & counseling", "Social policy & legislation", "Supervised 300-hour field practicum"]
  },
  {
    id: 2,
    title: "Project Planning & Management",
    category: "diploma",
    duration: "18 Months",
    type: "Long-Term Diploma",
    level: "Professional Diploma",
    description: "Comprehensive instruction in designing, executing, and evaluating high-impact development initiatives and donor-funded projects.",
    highlights: ["Logframe matrix & proposal writing", "Monitoring & Evaluation frameworks", "Donor grant management & compliance"]
  },
  {
    id: 3,
    title: "Community Development Studies",
    category: "diploma",
    duration: "2 Years",
    type: "Long-Term Diploma",
    level: "National Diploma Equivalent",
    description: "Equips grassroots change-makers with participatory rural appraisal (PRA), rural economics, leadership, and sustainable community empowerment.",
    highlights: ["Participatory community appraisals", "Micro-credit & cooperative models", "Civic engagement & local governance"]
  },
  {
    id: 4,
    title: "Public Administration",
    category: "diploma",
    duration: "2 Years",
    type: "Long-Term Diploma",
    level: "Professional Diploma",
    description: "Rigorous curriculum covering public sector governance, administrative law, personnel management, policy design, and public budgeting.",
    highlights: ["Public policy formulation", "Civil service ethics & administration", "Budgeting and public procurement"]
  },
  {
    id: 5,
    title: "Diploma in Disaster & Humanitarian Aid Management",
    category: "diploma",
    duration: "2 Years",
    type: "Long-Term Diploma",
    level: "Specialized Diploma",
    description: "Specialized training in emergency preparedness, refugee camp management, logistics, Sphere standards, and humanitarian field response.",
    highlights: ["Sphere humanitarian standards", "Emergency relief logistics", "Crisis response & camp coordination"]
  },
  {
    id: 6,
    title: "Diploma in Peace, Conflict & Community Safety",
    category: "diploma",
    duration: "2 Years",
    type: "Long-Term Diploma",
    level: "Professional Diploma",
    description: "Focuses on alternative dispute resolution, early warning systems, restorative justice, and community policing partnerships.",
    highlights: ["Mediation & ADR mechanisms", "Early warning systems", "Post-conflict reconciliation"]
  },

  // 2. Certificates & Specializations
  {
    id: 7,
    title: "MHPSS (Mental Health & Psychosocial Support)",
    category: "certificate",
    duration: "6 Months",
    type: "Short Course",
    level: "Professional Certificate",
    description: "Evidence-based psychosocial first aid, trauma counseling, and community-based mental health support for conflict-affected populations.",
    highlights: ["Psychological first aid (PFA)", "Trauma-informed care", "Community resilience circles"]
  },
  {
    id: 8,
    title: "Social Accountability & Governance",
    category: "certificate",
    duration: "3 Months",
    type: "Short Course",
    level: "Executive Certificate",
    description: "Empowering citizens and civil society with tools for public expenditure tracking, citizen report cards, and anti-corruption advocacy.",
    highlights: ["Public expenditure tracking (PETS)", "Community scorecards", "Social audit methodologies"]
  },
  {
    id: 9,
    title: "Child Protection Services",
    category: "certificate",
    duration: "4 Months",
    type: "Short Course",
    level: "Professional Certificate",
    description: "In-depth study of child rights legislation, safeguarding protocols, case management for vulnerable minors, and foster systems.",
    highlights: ["Child Rights Act compliance", "Safeguarding case management", "Family tracing & reunification"]
  },
  {
    id: 10,
    title: "Health Social Work & Hospital Welfare",
    category: "certificate",
    duration: "1 Year",
    type: "Specialization",
    level: "Advanced Certificate",
    description: "Integrating social work into clinical and hospital environments, patient advocacy, palliative care support, and public health campaigns.",
    highlights: ["Clinical social work methods", "Palliative & terminal care advocacy", "Healthcare navigation & subsidies"]
  },
  {
    id: 11,
    title: "Justice, Corrections & Rehabilitation",
    category: "certificate",
    duration: "1 Year",
    type: "Specialization",
    level: "Advanced Certificate",
    description: "Rehabilitative social work, correctional facility welfare, probation services, and post-release social reintegration.",
    highlights: ["Correctional facility welfare", "Probation & parole supervision", "Restorative community reintegration"]
  },
  {
    id: 12,
    title: "Tech4Dev (Technology for Development)",
    category: "certificate",
    duration: "6 Months",
    type: "Technical Certificate",
    level: "Skill Specialization",
    description: "Leveraging mobile data collection (KoboToolbox, ODK), GIS mapping, and digital tools to amplify social welfare interventions.",
    highlights: ["Mobile data collection (ODK/Kobo)", "GIS spatial mapping for projects", "Digital inclusion strategies"]
  },
  {
    id: 13,
    title: "Monitoring & Evaluation (M&E) for Social Programs",
    category: "certificate",
    duration: "6 Months",
    type: "Professional Certificate",
    level: "Industry Standard",
    description: "Design rigorous KPI indicators, theory of change, data quality audits, and quantitative/qualitative impact assessments.",
    highlights: ["Theory of Change & Indicator design", "Statistical impact analysis", "Real-time dashboard reporting"]
  },

  // 3. Executive Programs
  {
    id: 14,
    title: "Advanced Leadership in Social Sector",
    category: "executive",
    duration: "5 Days",
    type: "Executive Workshop",
    level: "Senior Management",
    description: "Tailored for directors, trustees, and senior managers seeking high-level strategic positioning, change management, and governance.",
    highlights: ["Board governance & stewardship", "Executive crisis leadership", "Institutional resource mobilization"]
  },
  {
    id: 15,
    title: "Strategic NGO & Non-Profit Management",
    category: "executive",
    duration: "1 Week",
    type: "Executive Intensive",
    level: "Leadership Cadre",
    description: "Intensive immersion into international fundraising, donor contract negotiation, statutory tax filings, and brand leadership.",
    highlights: ["Multi-lateral donor negotiation", "Institutional compliance & audits", "Sustainable organizational scaling"]
  },
  {
    id: 16,
    title: "Public Policy & Social Protection Leadership",
    category: "executive",
    duration: "2 Weeks",
    type: "Executive Masterclass",
    level: "Policy Makers & Leaders",
    description: "Designed for government officials, policymakers, and senior development consultants driving national social safety nets.",
    highlights: ["Social safety net architecture", "Policy lobbying & stakeholder coalitions", "Fiscal sustainability of social welfare"]
  },

  // 4. Vocational Skills
  {
    id: 17,
    title: "Computer & Information Technology",
    category: "vocational",
    duration: "3 Months",
    type: "Vocational & Practical",
    level: "Vocational Certificate",
    description: "Hands-on computing skills covering office productivity suites, digital literacy, internet research, and cloud administration.",
    highlights: ["Full Office Suite mastery", "Cloud workspace collaboration", "Basic hardware & networking setup"]
  },
  {
    id: 18,
    title: "Welding & Metal Fabrication",
    category: "vocational",
    duration: "6 Months",
    type: "Vocational & Practical",
    level: "Technical Skill Certificate",
    description: "Workshop-based training in structural welding, oxy-acetylene cutting, arc welding, and metal safety standards for industrial self-reliance.",
    highlights: ["Arc & gas welding mastery", "Blueprint & engineering drafting", "Workshop safety & entrepreneurship"]
  },
  {
    id: 19,
    title: "Fashion Designing, Garment & Tailoring",
    category: "vocational",
    duration: "1 Year",
    type: "Vocational & Practical",
    level: "Trade Certificate",
    description: "Pattern drafting, textile selection, precision cutting, industrial sewing machinery, and apparel enterprise startup skills.",
    highlights: ["Traditional & contemporary designs", "Industrial sewing machines", "Fashion enterprise launchpad"]
  },
  {
    id: 20,
    title: "Automobile Diagnostics, Repair & Maintenance",
    category: "vocational",
    duration: "6 Months",
    type: "Vocational & Practical",
    level: "Technical Trade Certificate",
    description: "Diagnostic OBD scanning, electrical systems, brake and transmission overhaul, and engine mechanics for modern vehicular fleets.",
    highlights: ["Computerized OBD diagnostics", "Engine & electrical mechanics", "Workshop fleet servicing"]
  },

  // 5. E-Learning Programs
  {
    id: 21,
    title: "Certificate in Humanitarian Field Operations (Online)",
    category: "elearning",
    duration: "3 Months",
    type: "E-Learning / Virtual",
    level: "Online Certificate",
    description: "Self-paced digital modules on international humanitarian law, security in the field, remote team management, and supply chain logistics.",
    highlights: ["100% self-paced virtual modules", "Interactive case simulations", "Global verified digital credential"]
  },
  {
    id: 22,
    title: "Diploma in Community Health & Social Care (Online)",
    category: "elearning",
    duration: "18 Months",
    type: "E-Learning / Blended",
    level: "Online Diploma",
    description: "Flexible blended learning model combining online lectures, virtual seminars, and local mentor-supervised field projects.",
    highlights: ["Live faculty masterclasses", "Virtual discussion forums", "Regional practicum placements"]
  }
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>(ALL_COURSES);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await api.get<Course[]>('/courses');
        if (Array.isArray(data) && data.length > 0) {
          // Merge API courses with rich seeds so custom additions show alongside complete catalog
          const seededMap = new Map<string, Course>();
          ALL_COURSES.forEach(c => seededMap.set(c.title.toLowerCase().trim(), c));
          
          data.forEach(apiCourse => {
            const key = apiCourse.title.toLowerCase().trim();
            if (seededMap.has(key)) {
              // Update with any custom fields from backend
              seededMap.set(key, { ...seededMap.get(key)!, ...apiCourse });
            } else {
              // New custom course from DB
              seededMap.set(key, {
                ...apiCourse,
                category: (apiCourse.category as any) || "diploma",
                type: apiCourse.type || "Special Program",
                description: apiCourse.description || "Comprehensive curriculum covering theoretical foundations and practical field applications."
              });
            }
          });
          setCourses(Array.from(seededMap.values()));
        }
      } catch (error) {
        console.warn("Live courses fetch fallback to full catalog:", error);
      }
    }
    fetchCourses();
  }, []);

  // Filter courses by category and search query
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory =
        activeTab === "all" || course.category.toLowerCase() === activeTab.toLowerCase();
      
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        course.title.toLowerCase().includes(query) ||
        course.duration.toLowerCase().includes(query) ||
        course.type.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        (course.level && course.level.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [courses, activeTab, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: courses.length,
      diploma: 0,
      certificate: 0,
      executive: 0,
      vocational: 0,
      elearning: 0,
    };
    courses.forEach((c) => {
      const cat = c.category.toLowerCase();
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });
    return counts;
  }, [courses]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <PageHeader 
        title="Academic & Professional Programs" 
        description="Explore our accredited diploma, professional certification, executive, and vocational programs designed to build recognized expertise in social welfare."
      />

      <div className="container mx-auto px-4 py-12">
        {/* Search & Statistics Bar */}
        <div className="max-w-6xl mx-auto mb-10 bg-white p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search programs by title, skill, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-border/80 focus:bg-white transition-all text-sm rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground bg-slate-200 hover:bg-slate-300 rounded-full h-5 w-5 flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-sm text-muted-foreground">
              <span className="font-medium">
                Showing <strong className="text-primary font-bold text-base">{filteredCourses.length}</strong> of {courses.length} Academic Programs
              </span>
              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="h-8 text-xs text-primary">
                  Clear Search
                </Button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-border/60">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-2">
              <Filter className="h-3.5 w-3.5" /> Filter By:
            </span>

            {[
              { id: "all", label: "All Programs", icon: GraduationCap },
              { id: "diploma", label: "Diploma", icon: Award },
              { id: "certificate", label: "Certificates", icon: BookOpen },
              { id: "executive", label: "Executive", icon: Briefcase },
              { id: "vocational", label: "Vocational Skills", icon: Wrench },
              { id: "elearning", label: "E-Learning", icon: Laptop },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = categoryCounts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                      : "bg-slate-100 hover:bg-slate-200/70 text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-white text-muted-foreground border border-border"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Courses Display Grid */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[320px] w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-border p-8 shadow-sm">
              <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Academic Programs Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find any courses matching "{searchQuery}". Try searching for another keyword or clear filters.
              </p>
              <Button onClick={() => { setActiveTab("all"); setSearchQuery(""); }} variant="outline">
                View All Programs
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>

        {/* E-Learning Highlight Section */}
        <div className="max-w-6xl mx-auto mt-16 bg-gradient-to-br from-primary/10 via-white to-primary/5 rounded-3xl border border-primary/20 p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Flexible Distance Education
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-primary">
              Study Anywhere with ISOWCOD E-Learning
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Are you an active working practitioner or located outside Bauchi? Our digital learning management system delivers flexible online lectures, downloadable coursework, and accredited credentials at your pace.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/application?course=E-Learning%20Program">
              <Button className="bg-primary hover:bg-primary/90 h-12 px-6 font-bold shadow-lg shadow-primary/20">
                Enroll Online
              </Button>
            </Link>
            <Link href="/admissions">
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 h-12 px-6 font-bold">
                Admission Guide
              </Button>
            </Link>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="max-w-6xl mx-auto mt-16 p-8 md:p-12 bg-primary rounded-[2rem] text-primary-foreground text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-4">
              2025 / 2026 Academic Session
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to Begin Your Academic Journey?</h3>
            <p className="mb-8 opacity-90 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Applications are reviewed continuously by the ISOWCOD Academic Board. Review our standard admission guidelines or submit your online enrollment now.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/admissions">
                <Button variant="secondary" className="font-bold px-8 h-12 text-primary shadow-lg">
                  View Admission Requirements
                </Button>
              </Link>
              <Link href="/application">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 h-12 font-bold">
                  Start Admission Application
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  // Category styling helpers
  const categoryBadgeStyles = {
    diploma: "bg-emerald-100 text-emerald-800 border-emerald-200",
    certificate: "bg-blue-100 text-blue-800 border-blue-200",
    executive: "bg-amber-100 text-amber-800 border-amber-200",
    vocational: "bg-purple-100 text-purple-800 border-purple-200",
    elearning: "bg-cyan-100 text-cyan-800 border-cyan-200",
  }[course.category] || "bg-slate-100 text-slate-800 border-slate-200";

  const categoryLabel = {
    diploma: "Diploma",
    certificate: "Certificate",
    executive: "Executive",
    vocational: "Vocational",
    elearning: "E-Learning",
  }[course.category] || "Academic";

  return (
    <Card className="flex flex-col hover:shadow-xl transition-all duration-300 border-border/70 group bg-white rounded-2xl overflow-hidden hover:border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center gap-2 mb-3">
          <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border ${categoryBadgeStyles}`}>
            {categoryLabel}
          </Badge>
          <div className="flex items-center text-xs font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" /> {course.duration}
          </div>
        </div>
        
        <CardTitle className="text-lg font-bold text-foreground font-serif group-hover:text-primary transition-colors tracking-tight line-clamp-2 min-h-[3.25rem]">
          {course.title}
        </CardTitle>

        {course.level && (
          <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide">
            {course.level}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
          {course.description}
        </p>

        {course.highlights && course.highlights.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {course.highlights.map((item, idx) => (
              <div key={idx} className="flex items-start text-xs text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-6 px-6 border-t border-slate-100 mt-auto">
        <Link 
          href={`/application?course=${encodeURIComponent(course.title)}`}
          className="w-full"
        >
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/10 group/btn rounded-xl h-11">
            Apply for this Course
            <ChevronRight className="ml-1.5 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
