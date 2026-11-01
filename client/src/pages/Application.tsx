import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  BookOpen, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Mail, 
  Building2, 
  Sparkles,
  Award
} from "lucide-react";
import { Link } from "wouter";

// Standard Comprehensive Admission Application Schema
const admissionSchema = z.object({
  // 1. Personal Information
  title: z.string().min(1, "Title is required"),
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(7, "Valid primary phone number is required"),
  altPhone: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Please select gender",
  }),
  dob: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(2, "Nationality is required"),
  stateOfOrigin: z.string().min(2, "State of origin is required"),
  lga: z.string().min(2, "LGA is required"),
  address: z.string().min(5, "Residential address is required"),
  city: z.string().min(2, "City is required"),

  // 2. Program Selection
  programCategory: z.enum([
    "Diploma",
    "Certificate",
    "Executive",
    "Vocational",
    "E-Learning"
  ], {
    required_error: "Please select program category",
  }),
  course: z.string().min(2, "Please select your course of study"),
  studyMode: z.enum(["Full-Time (Regular)", "Part-Time / Weekend", "Distance Learning (Online)"], {
    required_error: "Please select study mode",
  }),
  campus: z.enum(["Main Campus (Bauchi)", "Online Virtual Campus"], {
    required_error: "Please select preferred campus",
  }),

  // 3. Educational Background
  qualification: z.string().min(2, "Highest qualification is required"),
  institution: z.string().min(2, "Previous institution name is required"),
  graduationYear: z.string().min(4, "Year of completion is required"),
  olevelExam: z.enum(["WAEC", "NECO", "NABTEB", "GCE", "A-Levels", "Awaiting Results"], {
    required_error: "Please select O'Level examination type",
  }),
  olevelYear: z.string().min(4, "O'Level examination year is required"),
  olevelCredits: z.enum([
    "5 Credits or More (including English & Maths)",
    "5 Credits (excluding English or Maths)",
    "4 Credits or Less",
    "Awaiting Results"
  ], {
    required_error: "Please confirm O'Level credit passes",
  }),

  // 4. Next of Kin & Work Experience
  nextOfKinName: z.string().min(3, "Next of kin full name is required"),
  nextOfKinRelationship: z.string().min(2, "Relationship is required"),
  nextOfKinPhone: z.string().min(7, "Next of kin phone number is required"),
  nextOfKinAddress: z.string().min(5, "Next of kin address is required"),
  currentEmployment: z.string().optional(),
  yearsExperience: z.string().optional(),

  // 5. Declaration
  declaration: z.boolean().refine(val => val === true, {
    message: "You must accept the academic declaration to submit.",
  }),
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

const PROGRAM_OPTIONS = [
  // Diplomas
  { category: "Diploma", title: "Diploma in Social Work (2 Years)" },
  { category: "Diploma", title: "Project Planning & Management (18 Months)" },
  { category: "Diploma", title: "Community Development Studies (2 Years)" },
  { category: "Diploma", title: "Public Administration (2 Years)" },
  { category: "Diploma", title: "Diploma in Disaster & Humanitarian Aid Management (2 Years)" },
  { category: "Diploma", title: "Diploma in Peace, Conflict & Community Safety (2 Years)" },
  
  // Certificates
  { category: "Certificate", title: "MHPSS (Mental Health & Psychosocial Support) (6 Months)" },
  { category: "Certificate", title: "Social Accountability & Governance (3 Months)" },
  { category: "Certificate", title: "Child Protection Services (4 Months)" },
  { category: "Certificate", title: "Health Social Work & Hospital Welfare (1 Year)" },
  { category: "Certificate", title: "Justice, Corrections & Rehabilitation (1 Year)" },
  { category: "Certificate", title: "Tech4Dev (Technology for Development) (6 Months)" },
  { category: "Certificate", title: "Monitoring & Evaluation (M&E) for Social Programs (6 Months)" },

  // Executive
  { category: "Executive", title: "Advanced Leadership in Social Sector (5 Days)" },
  { category: "Executive", title: "Strategic NGO & Non-Profit Management (1 Week)" },
  { category: "Executive", title: "Public Policy & Social Protection Leadership (2 Weeks)" },

  // Vocational
  { category: "Vocational", title: "Computer & Information Technology (3 Months)" },
  { category: "Vocational", title: "Welding & Metal Fabrication (6 Months)" },
  { category: "Vocational", title: "Fashion Designing, Garment & Tailoring (1 Year)" },
  { category: "Vocational", title: "Automobile Diagnostics, Repair & Maintenance (6 Months)" },

  // E-Learning
  { category: "E-Learning", title: "Certificate in Humanitarian Field Operations (Online) (3 Months)" },
  { category: "E-Learning", title: "Diploma in Community Health & Social Care (Online) (18 Months)" }
];

export default function Application() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedData, setSubmittedData] = useState<{
    referenceId: string;
    data: AdmissionFormValues;
  } | null>(null);

  // Extract query parameter ?course= if user clicked "Apply" from /courses
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialCourse = searchParams ? (searchParams.get("course") || "") : "";

  // Auto-detect matching category from initialCourse
  const matchingProgram = PROGRAM_OPTIONS.find(p => 
    p.title.toLowerCase().includes(initialCourse.toLowerCase()) ||
    initialCourse.toLowerCase().includes(p.title.toLowerCase())
  );

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      title: "Mr",
      fullName: "",
      email: "",
      phone: "",
      altPhone: "",
      gender: "Male",
      dob: "",
      nationality: "Nigerian",
      stateOfOrigin: "",
      lga: "",
      address: "",
      city: "",
      programCategory: (matchingProgram?.category as any) || "Diploma",
      course: matchingProgram?.title || (initialCourse ? initialCourse : "Diploma in Social Work (2 Years)"),
      studyMode: "Full-Time (Regular)",
      campus: "Main Campus (Bauchi)",
      qualification: "SSCE / WAEC / NECO",
      institution: "",
      graduationYear: "",
      olevelExam: "WAEC",
      olevelYear: "",
      olevelCredits: "5 Credits or More (including English & Maths)",
      nextOfKinName: "",
      nextOfKinRelationship: "Parent",
      nextOfKinPhone: "",
      nextOfKinAddress: "",
      currentEmployment: "",
      yearsExperience: "",
      declaration: false,
    },
    mode: "onBlur"
  });

  // Keep course field updated when category changes if course doesn't match
  const selectedCategory = form.watch("programCategory");
  const filteredCourses = PROGRAM_OPTIONS.filter(p => p.category === selectedCategory);

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof AdmissionFormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ["title", "fullName", "email", "phone", "gender", "dob", "nationality", "stateOfOrigin", "lga", "address", "city"];
    } else if (step === 2) {
      fieldsToValidate = ["programCategory", "course", "studyMode", "campus"];
    } else if (step === 3) {
      fieldsToValidate = ["qualification", "institution", "graduationYear", "olevelExam", "olevelYear", "olevelCredits"];
    } else if (step === 4) {
      fieldsToValidate = ["nextOfKinName", "nextOfKinRelationship", "nextOfKinPhone", "nextOfKinAddress", "declaration"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    return isValid;
  };

  const handleNext = async () => {
    const isStepValid = await validateStep(currentStep);
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 300, behavior: "smooth" });
    } else {
      toast({
        title: "Incomplete Fields",
        description: "Please fill out all required fields marked in red before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  async function onSubmit(data: AdmissionFormValues) {
    try {
      const res = await api.post('/applications/submit', {
        name: `${data.title} ${data.fullName}`,
        email: data.email,
        phone: data.phone,
        program: data.course,
        qualification: `${data.qualification} (${data.institution}, ${data.graduationYear}) - O'Level: ${data.olevelExam} (${data.olevelCredits})`,
        application_type: 'Admission',
        // Extended standard details payload for DB & Admin Review
        details: {
          title: data.title,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          alt_phone: data.altPhone || '',
          gender: data.gender,
          dob: data.dob,
          nationality: data.nationality,
          state_of_origin: data.stateOfOrigin,
          lga: data.lga,
          address: data.address,
          city: data.city,
          program_category: data.programCategory,
          course: data.course,
          study_mode: data.studyMode,
          campus: data.campus,
          qualification: data.qualification,
          institution: data.institution,
          graduation_year: data.graduationYear,
          olevel_exam: data.olevelExam,
          olevel_year: data.olevelYear,
          olevel_credits: data.olevelCredits,
          next_of_kin_name: data.nextOfKinName,
          next_of_kin_relationship: data.nextOfKinRelationship,
          next_of_kin_phone: data.nextOfKinPhone,
          next_of_kin_address: data.nextOfKinAddress,
          current_employment: data.currentEmployment || 'None',
          years_experience: data.yearsExperience || '0',
          academic_session: '2025/2026',
        }
      });

      const year = new Date().getFullYear();
      const generatedRef = `ISOWCOD-ADM-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

      setSubmittedData({
        referenceId: generatedRef,
        data,
      });

      toast({
        title: "Application Successfully Submitted!",
        description: `Thank you, ${data.fullName}. Your admission application has been registered with reference ${generatedRef}.`,
      });
      window.scrollTo({ top: 150, behavior: "smooth" });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit admission application. Please check your network and try again.",
        variant: "destructive",
      });
    }
  }

  // If application has been successfully submitted, display the official Admission Slip
  if (submittedData) {
    const { referenceId, data } = submittedData;
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 print:p-0 print:bg-white">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12 print:border-none print:shadow-none">
          {/* Institutional Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-8 border-b border-border gap-6">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="ISOWCOD Logo" className="h-16 w-16 object-contain" />
              <div>
                <h1 className="text-xl md:text-2xl font-serif font-extrabold text-primary leading-tight">
                  ISOWCOD
                </h1>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Institute of Social Welfare and Community Development
                </p>
                <p className="text-xs text-primary font-bold mt-0.5">
                  Office of the Registrar & Academic Board
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-3 py-1 font-bold">
                Application Received
              </Badge>
              <p className="text-xs text-muted-foreground mt-2 font-mono">Ref: {referenceId}</p>
            </div>
          </div>

          {/* Confirmation Notice */}
          <div className="my-8 bg-primary/5 rounded-2xl p-6 border border-primary/20 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-serif font-bold text-primary mb-1">
              Admission Application Slip
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Your academic enrollment application for the <strong>2025/2026 Academic Session</strong> has been successfully lodged with the Admissions Registry.
            </p>
          </div>

          {/* Slip Summary Grid */}
          <div className="space-y-6 text-sm">
            <div>
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-primary border-b pb-1 mb-3">
                1. Candidate Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-muted-foreground block">Full Name:</span>
                  <span className="font-bold text-foreground">{data.title} {data.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Email Address:</span>
                  <span className="font-semibold text-foreground truncate block">{data.email}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Phone Number:</span>
                  <span className="font-semibold text-foreground">{data.phone}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Gender:</span>
                  <span className="font-semibold text-foreground">{data.gender}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Date of Birth:</span>
                  <span className="font-semibold text-foreground">{data.dob}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">State of Origin / LGA:</span>
                  <span className="font-semibold text-foreground">{data.stateOfOrigin} / {data.lga}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-primary border-b pb-1 mb-3">
                2. Program of Study
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">Selected Program:</span>
                  <span className="font-bold text-primary">{data.course}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Program Cadre:</span>
                  <span className="font-semibold text-foreground">{data.programCategory}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Study Mode:</span>
                  <span className="font-semibold text-foreground">{data.studyMode}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Assigned Campus:</span>
                  <span className="font-semibold text-foreground">{data.campus}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Academic Year:</span>
                  <span className="font-semibold text-foreground">2025/2026 Session</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-primary border-b pb-1 mb-3">
                3. Qualifications & Next of Kin
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-muted-foreground block">Highest Qualification:</span>
                  <span className="font-semibold text-foreground">{data.qualification}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Institution Attended:</span>
                  <span className="font-semibold text-foreground">{data.institution} ({data.graduationYear})</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">O'Level Passed:</span>
                  <span className="font-semibold text-foreground">{data.olevelExam} ({data.olevelCredits})</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Next of Kin:</span>
                  <span className="font-semibold text-foreground">{data.nextOfKinName} ({data.nextOfKinRelationship})</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">Next of Kin Phone:</span>
                  <span className="font-semibold text-foreground">{data.nextOfKinPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1.5">
            <p className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Next Steps for Verification:
            </p>
            <p>1. Please print or save this confirmation slip for your records.</p>
            <p>2. Keep your O'Level original results, birth certificate, and two passport photographs ready for physical or digital verification.</p>
            <p>3. The Admissions Board will notify you via <strong>{data.email}</strong> and SMS upon approval of your admission letter.</p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 print:hidden">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="gap-2 font-bold h-12 px-6 border-slate-300 hover:bg-slate-100"
            >
              <Printer className="h-4 w-4" /> Print Application Slip
            </Button>
            <div className="flex gap-3">
              <Link href="/courses">
                <Button variant="ghost" className="h-12 font-medium">Explore More Courses</Button>
              </Link>
              <Button
                onClick={() => {
                  setSubmittedData(null);
                  setCurrentStep(1);
                  form.reset();
                }}
                className="bg-primary hover:bg-primary/90 font-bold h-12 px-6"
              >
                Submit Another Application
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <PageHeader
        title="Admission Application"
        description="Begin your academic journey with ISOWCOD. Complete the standard institutional application form below to enroll for the 2025/2026 academic session."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Institutional Accreditation Banner */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Official Institutional Portal
              </span>
              <h2 className="text-xl md:text-2xl font-serif font-bold">
                Institute of Social Welfare and Community Development
              </h2>
              <p className="text-xs md:text-sm text-white/90">
                National Centre for Social Work Education, Governance, Community Development & Practical Vocational Training
              </p>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <div className="bg-white/15 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                <p className="text-xs font-bold text-white/80">Current Academic Session</p>
                <p className="text-lg font-extrabold text-white">2025 / 2026</p>
              </div>
            </div>
          </div>

          {/* Stepper Header */}
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-border shadow-sm mb-8">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { step: 1, title: "Personal Details", icon: User },
                { step: 2, title: "Program Selection", icon: BookOpen },
                { step: 3, title: "Academic Background", icon: GraduationCap },
                { step: 4, title: "Next of Kin & Submit", icon: Users },
              ].map((s) => {
                const Icon = s.icon;
                const isCurrent = currentStep === s.step;
                const isPast = currentStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      if (s.step < currentStep) {
                        setCurrentStep(s.step);
                      }
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                      isCurrent
                        ? "bg-primary/10 text-primary font-bold border border-primary/30"
                        : isPast
                        ? "text-emerald-700 font-semibold cursor-pointer hover:bg-slate-50"
                        : "text-muted-foreground opacity-60"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold ${
                      isCurrent
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {isPast ? <CheckCircle2 className="h-4 w-4" /> : s.step}
                    </div>
                    <span className="text-xs md:text-sm hidden sm:block truncate w-full">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Application Form Container */}
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-border/70">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* STEP 1: PERSONAL INFORMATION */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-border pb-4">
                      <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" /> Step 1: Personal Profile & Contact Information
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please provide your full legal name as it appears on your birth certificate or academic certificates.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-1">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 bg-slate-50">
                                    <SelectValue placeholder="Title" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Mal", "Alh", "Barr", "Engr"].map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Legal Name (Surname First)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Ibrahim, Aminu Usman" className="h-12 bg-slate-50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="applicant@example.com" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Your official admission decision will be sent to this email.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Phone Number (Active WhatsApp)</FormLabel>
                            <FormControl>
                              <Input placeholder="+234 803 000 0000" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50">
                                  <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <FormControl>
                              <Input placeholder="Nigerian" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="stateOfOrigin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State of Origin</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Bauchi, Kano, Kaduna, Lagos..." className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lga"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local Government Area (LGA)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Bauchi LGA" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Residential / Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="House No, Street Name, Quarter" className="h-12 bg-slate-50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div>
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City / Town</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Bauchi" className="h-12 bg-slate-50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="bg-primary hover:bg-primary/90 h-12 px-8 font-bold gap-2"
                      >
                        Proceed to Program Selection <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: PROGRAM OF STUDY */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-border pb-4">
                      <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" /> Step 2: Academic Program Selection & Study Mode
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select your preferred academic department, specific curriculum, and flexible delivery schedule.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="programCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Program Cadre / Category</FormLabel>
                            <Select
                              onValueChange={(val: any) => {
                                field.onChange(val);
                                // Default first course in this category
                                const available = PROGRAM_OPTIONS.filter(p => p.category === val);
                                if (available.length > 0) {
                                  form.setValue("course", available[0].title);
                                }
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50 font-medium">
                                  <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Diploma">Diploma Programs (18 - 24 Months)</SelectItem>
                                <SelectItem value="Certificate">Certificate & Specializations (3 - 12 Months)</SelectItem>
                                <SelectItem value="Executive">Executive Leadership & Workshops (1 - 2 Weeks)</SelectItem>
                                <SelectItem value="Vocational">Vocational & Practical Skills (3 - 12 Months)</SelectItem>
                                <SelectItem value="E-Learning">Distance E-Learning (Self-Paced / Online)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="course"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specific Academic Course</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50 font-bold text-primary">
                                  <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-72">
                                {filteredCourses.map((c) => (
                                  <SelectItem key={c.title} value={c.title}>
                                    {c.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              Curriculum accredited by the ISOWCOD Academic Board.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <FormField
                        control={form.control}
                        name="studyMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Study Mode</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50">
                                  <SelectValue placeholder="Select Study Mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Full-Time (Regular)">Full-Time (Regular Campus Lectures)</SelectItem>
                                <SelectItem value="Part-Time / Weekend">Part-Time / Weekend (For Working Professionals)</SelectItem>
                                <SelectItem value="Distance Learning (Online)">Distance Learning (Virtual Campus)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="campus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Campus / Centre</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50">
                                  <SelectValue placeholder="Select Campus" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Main Campus (Bauchi)">Main Campus (Bauchi State Headquarters)</SelectItem>
                                <SelectItem value="Online Virtual Campus">Online Virtual Campus</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-6 flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrev}
                        className="h-12 px-6 gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="bg-primary hover:bg-primary/90 h-12 px-8 font-bold gap-2"
                      >
                        Proceed to Qualifications <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: ACADEMIC BACKGROUND */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-border pb-4">
                      <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" /> Step 3: Educational History & O'Level Verification
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        General admission requires minimum 5 credits in WAEC/NECO/NABTEB including English & Mathematics.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="qualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Highest Qualification Obtained</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50 font-medium">
                                  <SelectValue placeholder="Select Qualification" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SSCE / WAEC / NECO">SSCE / WAEC / NECO (Secondary)</SelectItem>
                                <SelectItem value="OND / NCE">OND / National Certificate of Education</SelectItem>
                                <SelectItem value="HND">Higher National Diploma (HND)</SelectItem>
                                <SelectItem value="BSc / BA">Bachelor's Degree (BSc / BA)</SelectItem>
                                <SelectItem value="PGD">Post Graduate Diploma (PGD)</SelectItem>
                                <SelectItem value="MSc / MA">Master's Degree (MSc / MA)</SelectItem>
                                <SelectItem value="PhD">Doctorate Degree (PhD)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Previous School / Institution Attended</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Government College, Bauchi" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="graduationYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year of Completion / Graduation</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 2022" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-border/80 space-y-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <h4 className="font-bold text-foreground">O'Level Examination Pass Verification</h4>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="olevelExam"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Examination Body</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 bg-white">
                                    <SelectValue placeholder="Select Exam" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="WAEC">WAEC (WASSCE)</SelectItem>
                                  <SelectItem value="NECO">NECO (SSCE)</SelectItem>
                                  <SelectItem value="NABTEB">NABTEB (NTC/NBC)</SelectItem>
                                  <SelectItem value="GCE">GCE Ordinary Level</SelectItem>
                                  <SelectItem value="A-Levels">A-Levels / Cambridge</SelectItem>
                                  <SelectItem value="Awaiting Results">Awaiting Results</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="olevelYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Examination Year</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 2020" className="h-12 bg-white" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="olevelCredits"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Credit Passes Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 bg-white">
                                    <SelectValue placeholder="Select Status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="5 Credits or More (including English & Maths)">
                                    5 Credits or More (Inc. English & Maths)
                                  </SelectItem>
                                  <SelectItem value="5 Credits (excluding English or Maths)">
                                    5 Credits (Deficiency in English/Maths)
                                  </SelectItem>
                                  <SelectItem value="4 Credits or Less">
                                    4 Credits or Less
                                  </SelectItem>
                                  <SelectItem value="Awaiting Results">
                                    Awaiting Results
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="pt-6 flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrev}
                        className="h-12 px-6 gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="bg-primary hover:bg-primary/90 h-12 px-8 font-bold gap-2"
                      >
                        Proceed to Next of Kin & Submit <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: NEXT OF KIN & DECLARATION */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-border pb-4">
                      <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" /> Step 4: Next of Kin, Experience & Academic Declaration
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please provide emergency contact details and confirm your declaration to conclude enrollment.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="nextOfKinName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Next of Kin Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Mal. Usman Ibrahim" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nextOfKinRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship with Applicant</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50">
                                  <SelectValue placeholder="Select Relationship" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {["Parent", "Spouse", "Sibling", "Guardian", "Employer", "Relative", "Other"].map((r) => (
                                  <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="nextOfKinPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Next of Kin Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+234 800 000 0000" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nextOfKinAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Next of Kin Residential Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Residential Address / City" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <FormField
                        control={form.control}
                        name="currentEmployment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Employer / Organization (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Ministry of Women Affairs / NGO / Self-employed" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearsExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Field Experience (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 2 Years" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Declaration Checkbox */}
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
                      <FormField
                        control={form.control}
                        name="declaration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-bold text-foreground text-sm cursor-pointer">
                                Applicant Formal Academic Declaration & Ethical Pledge
                              </FormLabel>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                I hereby declare that all information given by me in this application is true, accurate, and complete. I understand that any false statement or suppression of material facts will lead to immediate cancellation of admission and forfeiture of fees. I pledge to abide by all the rules, academic regulations, and codes of conduct of the Institute of Social Welfare and Community Development (ISOWCOD).
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormMessage>{form.formState.errors.declaration?.message}</FormMessage>
                    </div>

                    <div className="pt-6 flex justify-between items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrev}
                        className="h-12 px-6 gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-13 px-10 text-base shadow-xl shadow-primary/20"
                      >
                        {form.formState.isSubmitting ? (
                          "Submitting Application..."
                        ) : (
                          "Submit Admission Application"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

