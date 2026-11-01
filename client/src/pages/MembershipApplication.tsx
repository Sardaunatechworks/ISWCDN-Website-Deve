import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Award, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Building,
  HeartHandshake
} from "lucide-react";
import { Link } from "wouter";

// Standard Comprehensive Professional Membership Schema
const membershipSchema = z.object({
  // 1. Personal / Profile Details
  title: z.string().min(1, "Title is required"),
  fullName: z.string().min(3, "Full legal name must be at least 3 characters"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(7, "Primary phone number is required"),
  altPhone: z.string().optional(),
  gender: z.enum(["Male", "Female", "Corporate"], {
    required_error: "Please select gender or corporate status",
  }),
  dob: z.string().min(1, "Date of birth or incorporation date is required"),
  nationality: z.string().min(2, "Nationality is required"),
  stateOfOrigin: z.string().min(2, "State of origin is required"),
  stateOfResidence: z.string().min(2, "State of residence is required"),
  address: z.string().min(5, "Postal / physical address is required"),
  city: z.string().min(2, "City is required"),

  // 2. Membership Cadre & Specialization
  category: z.enum([
    "Fellow (FISOWCOD)",
    "Full Member (MISOWCOD)",
    "Associate (AISOWCOD)",
    "Graduate Member (GISOWCOD)",
    "Student Member",
    "Corporate Member"
  ], {
    required_error: "Please select membership cadre",
  }),
  specialization: z.enum([
    "Child & Family Welfare",
    "Community Development & Grassroots Mobilization",
    "Mental Health & Psychosocial Support (MHPSS)",
    "Clinical & Hospital Social Work",
    "Non-Profit & NGO Executive Leadership",
    "Social Policy, Governance & Advocacy",
    "Criminal Justice, Probation & Rehabilitation",
    "Youth Development & Vocational Empowerment",
    "Corporate Social Responsibility (CSR)",
    "Disaster Management & Emergency Relief",
    "General Social Welfare Practice"
  ], {
    required_error: "Please select primary area of specialization",
  }),

  // 3. Employment & Practice Experience
  employmentStatus: z.enum([
    "Employed (Full-Time)",
    "Self-Employed / Independent Consultant",
    "NGO / Civil Society Organization",
    "Public Sector / Civil Service",
    "Academic / Research Institution",
    "Student / Trainee",
    "Corporate Organization"
  ], {
    required_error: "Please select employment status",
  }),
  employerName: z.string().min(2, "Current employer or organization name is required"),
  jobTitle: z.string().min(2, "Current job title / designation is required"),
  yearsExperience: z.string().min(1, "Years of professional experience is required"),

  // 4. Academic Background & Other Affiliations
  qualification: z.string().min(2, "Highest qualification is required"),
  discipline: z.string().min(2, "Discipline / course of study is required"),
  institution: z.string().min(2, "Awarding institution is required"),
  graduationYear: z.string().min(4, "Graduation year is required"),
  otherMemberships: z.string().optional(),

  // 5. Professional Sponsor / Referee
  refereeName: z.string().min(3, "Referee / sponsor name is required"),
  refereeOrganization: z.string().min(2, "Referee organization & title is required"),
  refereePhone: z.string().min(7, "Referee phone number is required"),
  refereeEmail: z.string().email("Valid referee email is required"),

  // 6. Code of Conduct Declaration
  declaration: z.boolean().refine(val => val === true, {
    message: "You must accept the ethical declaration and code of conduct to submit.",
  }),
});

type MembershipFormValues = z.infer<typeof membershipSchema>;

export default function MembershipApplication() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedData, setSubmittedData] = useState<{
    referenceId: string;
    data: MembershipFormValues;
  } | null>(null);

  // Extract ?cadre= query parameter if user clicked from /membership
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialCadre = searchParams ? (searchParams.get("cadre") || "") : "";

  // Normalize initialCadre to match enum
  const getNormalizedCadre = (param: string): any => {
    const lower = param.toLowerCase();
    if (lower.includes("fellow")) return "Fellow (FISOWCOD)";
    if (lower.includes("full")) return "Full Member (MISOWCOD)";
    if (lower.includes("associate")) return "Associate (AISOWCOD)";
    if (lower.includes("graduate")) return "Graduate Member (GISOWCOD)";
    if (lower.includes("student")) return "Student Member";
    if (lower.includes("corporate")) return "Corporate Member";
    return "Associate (AISOWCOD)";
  };

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
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
      stateOfResidence: "",
      address: "",
      city: "",
      category: getNormalizedCadre(initialCadre),
      specialization: "Community Development & Grassroots Mobilization",
      employmentStatus: "Employed (Full-Time)",
      employerName: "",
      jobTitle: "",
      yearsExperience: "3 - 5 Years",
      qualification: "Bachelor's Degree (BSc / BA / BSW)",
      discipline: "Social Work",
      institution: "",
      graduationYear: "",
      otherMemberships: "",
      refereeName: "",
      refereeOrganization: "",
      refereePhone: "",
      refereeEmail: "",
      declaration: false,
    },
    mode: "onBlur"
  });

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof MembershipFormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ["title", "fullName", "email", "phone", "gender", "dob", "nationality", "stateOfOrigin", "stateOfResidence", "address", "city"];
    } else if (step === 2) {
      fieldsToValidate = ["category", "specialization", "employmentStatus", "employerName", "jobTitle", "yearsExperience"];
    } else if (step === 3) {
      fieldsToValidate = ["qualification", "discipline", "institution", "graduationYear"];
    } else if (step === 4) {
      fieldsToValidate = ["refereeName", "refereeOrganization", "refereePhone", "refereeEmail", "declaration"];
    }

    return await form.trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isStepValid = await validateStep(currentStep);
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 300, behavior: "smooth" });
    } else {
      toast({
        title: "Incomplete Form Fields",
        description: "Please check all required fields highlighted in red before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  async function onSubmit(data: MembershipFormValues) {
    try {
      await api.post('/applications/submit', {
        name: `${data.title} ${data.fullName}`,
        email: data.email,
        phone: data.phone,
        program: `${data.category}`,
        qualification: `${data.qualification} in ${data.discipline} (${data.institution}, ${data.graduationYear}) - ${data.yearsExperience} Exp`,
        application_type: 'Membership',
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
          state_of_residence: data.stateOfResidence,
          address: data.address,
          city: data.city,
          category: data.category,
          specialization: data.specialization,
          employment_status: data.employmentStatus,
          employer_name: data.employerName,
          job_title: data.jobTitle,
          years_experience: data.yearsExperience,
          qualification: data.qualification,
          discipline: data.discipline,
          institution: data.institution,
          graduation_year: data.graduationYear,
          other_memberships: data.otherMemberships || 'None',
          referee_name: data.refereeName,
          referee_organization: data.refereeOrganization,
          referee_phone: data.refereePhone,
          referee_email: data.refereeEmail,
        }
      });

      const year = new Date().getFullYear();
      const generatedRef = `ISOWCOD-MEM-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

      setSubmittedData({
        referenceId: generatedRef,
        data,
      });

      toast({
        title: "Membership Application Lodged!",
        description: `Thank you, ${data.fullName}. Your application has been registered with reference ${generatedRef}.`,
      });
      window.scrollTo({ top: 150, behavior: "smooth" });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit membership application. Please check your network and try again.",
        variant: "destructive",
      });
    }
  }

  // If application has been successfully submitted, display the official Membership Slip
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
                  National Secretariat & Membership Accreditation Council
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
                Application Received
              </Badge>
              <p className="text-xs text-muted-foreground mt-2 font-mono">Ref: {referenceId}</p>
            </div>
          </div>

          {/* Confirmation Notice */}
          <div className="my-8 bg-primary/5 rounded-2xl p-6 border border-primary/20 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-serif font-bold text-primary mb-1">
              Professional Membership Application Slip
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Your application for admission into the <strong>{data.category}</strong> cadre has been submitted to the Membership Accreditation Committee.
            </p>
          </div>

          {/* Slip Summary Grid */}
          <div className="space-y-6 text-sm">
            <div>
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-primary border-b pb-1 mb-3">
                1. Member Identification
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
                  <span className="text-xs text-muted-foreground block">State of Residence:</span>
                  <span className="font-semibold text-foreground">{data.stateOfResidence}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Registration Status:</span>
                  <span className="font-semibold text-amber-700">Under Review</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-primary border-b pb-1 mb-3">
                2. Membership Cadre & Professional Practice
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">Cadre Applied:</span>
                  <span className="font-bold text-primary text-base">{data.category}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Years Experience:</span>
                  <span className="font-semibold text-foreground">{data.yearsExperience}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">Primary Specialization:</span>
                  <span className="font-semibold text-foreground">{data.specialization}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Current Employer:</span>
                  <span className="font-semibold text-foreground">{data.employerName}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-primary border-b pb-1 mb-3">
                3. Qualifications & Professional Referee
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-muted-foreground block">Highest Qualification:</span>
                  <span className="font-semibold text-foreground">{data.qualification}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Discipline / Course:</span>
                  <span className="font-semibold text-foreground">{data.discipline}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Institution:</span>
                  <span className="font-semibold text-foreground">{data.institution} ({data.graduationYear})</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Professional Referee:</span>
                  <span className="font-semibold text-foreground">{data.refereeName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">Referee Contact:</span>
                  <span className="font-semibold text-foreground">{data.refereeOrganization} ({data.refereePhone})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secretariat Guidelines */}
          <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1.5">
            <p className="font-bold text-sm text-blue-950 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Secretariat Vetting & Induction Notice:
            </p>
            <p>1. Please print or save this confirmation slip for documentation.</p>
            <p>2. The Membership Accreditation Board verifies degrees, professional experience, and referee recommendations before issuing official registration numbers.</p>
            <p>3. Following approval, induction guidelines, annual dues invoice, and induction ceremony date will be transmitted to <strong>{data.email}</strong>.</p>
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
              <Link href="/membership">
                <Button variant="ghost" className="h-12 font-medium">View Membership Cadres</Button>
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
        title="Membership Application"
        description="Join the premier professional body for social workers and community development practitioners. Complete the standard institutional accreditation form below."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Institutional Banner */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Professional Body Accreditation
              </span>
              <h2 className="text-xl md:text-2xl font-serif font-bold">
                Institute of Social Welfare and Community Development
              </h2>
              <p className="text-xs md:text-sm text-white/90">
                Official National Register of Certified Practitioners, Fellows, Associates, and Corporate Development Partners
              </p>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <div className="bg-white/15 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                <p className="text-xs font-bold text-white/80">Membership Status</p>
                <p className="text-lg font-extrabold text-white">Enrollment Open</p>
              </div>
            </div>
          </div>

          {/* Stepper Header */}
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-border shadow-sm mb-8">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { step: 1, title: "Member Profile", icon: User },
                { step: 2, title: "Cadre & Practice", icon: Award },
                { step: 3, title: "Qualifications", icon: GraduationCap },
                { step: 4, title: "Referee & Pledge", icon: ShieldCheck },
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

          {/* Main Membership Form Container */}
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-border/70">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* STEP 1: PERSONAL & CONTACT INFORMATION */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-border pb-4">
                      <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" /> Step 1: Member Identification & Contact Profile
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please provide your official legal and contact details for membership register records.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-1">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title / Honorific</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 bg-slate-50 font-medium">
                                    <SelectValue placeholder="Title" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["Prof", "Dr", "Barr", "Engr", "Chief", "Alh", "Haj", "Mal", "Mr", "Mrs", "Ms"].map((t) => (
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
                              <FormLabel>Full Legal Name (Surname, First & Middle)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Abdullah, Baheejah Mahmood" className="h-12 bg-slate-50" {...field} />
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
                            <FormLabel>Official Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="practitioner@example.com" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Official council resolutions and certificates will be sent here.
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
                            <FormLabel>Primary Telephone (Active WhatsApp)</FormLabel>
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
                            <FormLabel>Gender / Identity</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50">
                                  <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Corporate">Corporate Entity</SelectItem>
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
                            <FormLabel>Date of Birth / Est.</FormLabel>
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
                              <Input placeholder="e.g. Bauchi State" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stateOfResidence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State of Professional Practice / Residence</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. FCT Abuja / Bauchi" className="h-12 bg-slate-50" {...field} />
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
                              <FormLabel>Permanent / Official Mailing Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Office or Residential Address" className="h-12 bg-slate-50" {...field} />
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
                        Proceed to Cadre & Practice <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: CADRE & PRACTICE SPECIALIZATION */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-border pb-4">
                      <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" /> Step 2: Membership Cadre & Field of Practice
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select your professional membership tier and primary area of practice within social welfare.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Membership Cadre Applied For</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50 font-bold text-primary">
                                  <SelectValue placeholder="Select Membership Cadre" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Fellow (FISOWCOD)">Fellow (FISOWCOD) - 15+ Years Impactful Experience</SelectItem>
                                <SelectItem value="Full Member (MISOWCOD)">Full Member (MISOWCOD) - 5+ Years Field Experience</SelectItem>
                                <SelectItem value="Associate (AISOWCOD)">Associate (AISOWCOD) - Entry-level & Early Career</SelectItem>
                                <SelectItem value="Graduate Member (GISOWCOD)">Graduate Member (GISOWCOD) - Recent Degree Holders</SelectItem>
                                <SelectItem value="Student Member">Student Member - Undergraduates & Trainees</SelectItem>
                                <SelectItem value="Corporate Member">Corporate Member - Organizations, NGOs & Agencies</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              Council assigns post-nominal designations upon approval.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Specialization / Sector</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50 font-medium">
                                  <SelectValue placeholder="Select Specialization" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-72">
                                <SelectItem value="Community Development & Grassroots Mobilization">Community Development & Grassroots Mobilization</SelectItem>
                                <SelectItem value="Child & Family Welfare">Child & Family Welfare</SelectItem>
                                <SelectItem value="Mental Health & Psychosocial Support (MHPSS)">Mental Health & Psychosocial Support (MHPSS)</SelectItem>
                                <SelectItem value="Clinical & Hospital Social Work">Clinical & Hospital Social Work</SelectItem>
                                <SelectItem value="Non-Profit & NGO Executive Leadership">Non-Profit & NGO Executive Leadership</SelectItem>
                                <SelectItem value="Social Policy, Governance & Advocacy">Social Policy, Governance & Advocacy</SelectItem>
                                <SelectItem value="Criminal Justice, Probation & Rehabilitation">Criminal Justice, Probation & Rehabilitation</SelectItem>
                                <SelectItem value="Youth Development & Vocational Empowerment">Youth Development & Vocational Empowerment</SelectItem>
                                <SelectItem value="Disaster Management & Emergency Relief">Disaster Management & Emergency Relief</SelectItem>
                                <SelectItem value="Corporate Social Responsibility (CSR)">Corporate Social Responsibility (CSR)</SelectItem>
                                <SelectItem value="General Social Welfare Practice">General Social Welfare Practice</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      <FormField
                        control={form.control}
                        name="employmentStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Employment Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50">
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Employed (Full-Time)">Employed (Full-Time)</SelectItem>
                                <SelectItem value="NGO / Civil Society Organization">NGO / Civil Society Organization</SelectItem>
                                <SelectItem value="Public Sector / Civil Service">Public Sector / Civil Service</SelectItem>
                                <SelectItem value="Self-Employed / Independent Consultant">Self-Employed / Consultant</SelectItem>
                                <SelectItem value="Academic / Research Institution">Academic / Research Institution</SelectItem>
                                <SelectItem value="Student / Trainee">Student / Trainee</SelectItem>
                                <SelectItem value="Corporate Organization">Corporate Organization</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employer / Organization Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Ministry of Humanitarian Affairs / Save the Children" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Job Title / Designation</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Senior Social Welfare Officer" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="yearsExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Field Practice in Social Sector</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50">
                                  <SelectValue placeholder="Select Years" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Less than 2 Years">Less than 2 Years (Early Career)</SelectItem>
                                <SelectItem value="3 - 5 Years">3 - 5 Years (Practitioner)</SelectItem>
                                <SelectItem value="6 - 10 Years">6 - 10 Years (Senior Practitioner)</SelectItem>
                                <SelectItem value="11 - 15 Years">11 - 15 Years (Executive Leader)</SelectItem>
                                <SelectItem value="Over 15 Years">Over 15 Years (Distinguished Fellow Cadre)</SelectItem>
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

                {/* STEP 3: ACADEMIC CREDENTIALS */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-border pb-4">
                      <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" /> Step 3: Academic Qualifications & Affiliations
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please document your tertiary credentials, disciplines, and other existing professional body memberships.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="qualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Highest Academic Qualification</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-slate-50 font-medium">
                                  <SelectValue placeholder="Select Qualification" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="National Diploma (ND / OND)">National Diploma (ND / OND)</SelectItem>
                                <SelectItem value="Higher National Diploma (HND)">Higher National Diploma (HND)</SelectItem>
                                <SelectItem value="Bachelor's Degree (BSc / BA / BSW)">Bachelor's Degree (BSc / BA / BSW)</SelectItem>
                                <SelectItem value="Post Graduate Diploma (PGD)">Post Graduate Diploma (PGD)</SelectItem>
                                <SelectItem value="Master's Degree (MSc / MSW / MA)">Master's Degree (MSc / MSW / MA)</SelectItem>
                                <SelectItem value="Doctorate Degree (PhD / DSW)">Doctorate Degree (PhD / DSW)</SelectItem>
                                <SelectItem value="Professional Diploma">Professional Certification / Diploma</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discipline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field / Course of Study</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Social Work, Sociology, Public Administration" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Awarding Higher Institution / University</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Abubakar Tafawa Balewa University, Bauchi" className="h-12 bg-slate-50" {...field} />
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
                            <FormLabel>Year Awarded</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 2018" className="h-12 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="otherMemberships"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Professional Body Memberships (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. NASW, IFSW, NIM, CIPM, TRCN..." className="h-12 bg-slate-50" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            List any other registered professional institutes or councils you belong to.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                        Proceed to Referee & Ethics Pledge <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: SPONSOR / REFEREE & ETHICAL DECLARATION */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-border pb-4">
                      <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" /> Step 4: Professional Referee & Code of Conduct
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Professional institute admission requires one professional referee (senior colleague, supervisor, or current member).
                      </p>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-border/80 space-y-4">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <HeartHandshake className="h-4 w-4 text-primary" /> Sponsor / Professional Referee Details
                      </h4>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="refereeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Referee Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Dr. John Doe, FISOWCOD" className="h-12 bg-white" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="refereeOrganization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Referee Position & Organization</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Director, State Social Welfare Board" className="h-12 bg-white" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="refereePhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Referee Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+234 800 000 0000" className="h-12 bg-white" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="refereeEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Referee Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="referee@organization.org" className="h-12 bg-white" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Ethical Declaration Checkbox */}
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
                                Professional Ethics & Institutional Constitution Pledge
                              </FormLabel>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                I hereby apply to be admitted as a certified member of the Institute of Social Welfare and Community Development (ISOWCOD). If admitted, I solemnly pledge to uphold the Constitution, Code of Professional Conduct, and High Ethical Standards of the Institute. I certify that all declarations and academic records provided herein are true and accurate.
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
                          "Submit Membership Application"
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

