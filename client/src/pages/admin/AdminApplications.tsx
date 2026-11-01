import { useState, useEffect } from "react";
import { Check, X, Eye, User, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, Calendar, FileText, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Application {
  id: string | number;
  application_type?: string;
  name: string;
  email?: string;
  phone?: string;
  program: string;
  qualification?: string;
  details?: string | Record<string, any>;
  status: string;
  submitted_at: string;
  admin_notes?: string;
}

export default function AdminApplications() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "Admission" | "Membership">("ALL");
  const [processingId, setProcessingId] = useState<string | number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      const data = await api.get<Application[]>("/applications", { status: "Pending" });
      setApplications(data || []);
    } catch (error: any) {
      console.error("Error fetching applications:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (id: string | number, name: string, action: "Approved" | "Rejected") => {
    try {
      setProcessingId(id);
      await api.patch(`/applications/${id}/status`, { status: action });

      setApplications((prev) => prev.filter((app) => app.id !== id));
      if (selectedApp && selectedApp.id === id) {
        setDetailsOpen(false);
        setSelectedApp(null);
      }
      toast({
        title: `Application ${action}`,
        description: `${name}'s application has been explicitly marked as ${action.toLowerCase()}.`,
        variant: action === "Rejected" ? "destructive" : "default",
      });
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseDetails = (detailsRaw: any): Record<string, any> => {
    if (!detailsRaw) return {};
    if (typeof detailsRaw === "object") return detailsRaw;
    try {
      return JSON.parse(detailsRaw);
    } catch {
      return {};
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterType === "ALL") return true;
    return (app.application_type || "Admission") === filterType;
  });

  const parsedDetails = selectedApp ? parseDetails(selectedApp.details) : {};

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-primary tracking-tight">Applications Review</h2>
          <p className="text-muted-foreground mt-1">
            Review and adjudicate incoming student admissions and professional membership applications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filterType === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("ALL")}
            className={filterType === "ALL" ? "bg-primary text-white" : ""}
          >
            All Pending ({applications.length})
          </Button>
          <Button
            variant={filterType === "Admission" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("Admission")}
            className={filterType === "Admission" ? "bg-primary text-white" : ""}
          >
            Admissions ({applications.filter((a) => (a.application_type || "Admission") === "Admission").length})
          </Button>
          <Button
            variant={filterType === "Membership" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("Membership")}
            className={filterType === "Membership" ? "bg-primary text-white" : ""}
          >
            Memberships ({applications.filter((a) => a.application_type === "Membership").length})
          </Button>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-border/50">
          <CardTitle className="text-lg font-serif">
            {loading ? "Loading Applications..." : `Pending Applications (${filteredApplications.length})`}
          </CardTitle>
          <CardDescription>
            These applications require verification and approval from the ISOWCOD Academic & Accreditation Board.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-xl">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-slate-400" />
              </div>
              <p className="font-bold text-lg text-foreground">You're all caught up!</p>
              <p>No pending applications in this category right now.</p>
              <Button variant="outline" className="mt-4" onClick={fetchApplications}>
                Refresh List
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredApplications.map((app) => {
                const isMembership = app.application_type === "Membership";
                return (
                  <div
                    key={app.id}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isMembership ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-foreground">{app.name}</h3>
                          <Badge variant={isMembership ? "secondary" : "outline"} className="text-xs">
                            {app.application_type || "Admission"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Applying for: <span className="font-semibold text-foreground">{app.program}</span>
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                          {app.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {app.email}
                            </span>
                          )}
                          {app.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {app.phone}
                            </span>
                          )}
                          <span>Submitted: {formatDate(app.submitted_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:ml-auto shrink-0 w-full md:w-auto justify-end mt-4 md:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApp(app);
                          setDetailsOpen(true);
                        }}
                        className="hover:bg-slate-100"
                      >
                        <Eye className="h-4 w-4 mr-2 text-primary" /> View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={processingId === app.id}
                        onClick={() => handleAction(app.id, app.name, "Rejected")}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        disabled={processingId === app.id}
                        onClick={() => handleAction(app.id, app.name, "Approved")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl font-serif text-primary">
                      {selectedApp.name}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      Submitted on {formatDate(selectedApp.submitted_at)}
                    </DialogDescription>
                  </div>
                  <Badge
                    className={`text-sm px-3 py-1 ${
                      selectedApp.application_type === "Membership"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-blue-100 text-blue-800 border-blue-300"
                    }`}
                  >
                    {selectedApp.application_type || "Admission"} Application
                  </Badge>
                </div>
              </DialogHeader>

              {/* Program & Cadre Applied */}
              <div className="bg-slate-50 border rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">
                  {selectedApp.application_type === "Membership" ? "Membership Cadre Applied" : "Program Applied For"}
                </div>
                <div className="text-lg font-bold text-foreground">{selectedApp.program}</div>
                {parsedDetails.specialization && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Specialization: <span className="font-semibold text-foreground">{parsedDetails.specialization}</span>
                  </div>
                )}
                {parsedDetails.study_mode && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Study Mode: <span className="font-semibold text-foreground">{parsedDetails.study_mode}</span>
                    {parsedDetails.campus && <span> • Campus: <span className="font-semibold text-foreground">{parsedDetails.campus}</span></span>}
                  </div>
                )}
              </div>

              {/* Personal Details */}
              <div className="border rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2 border-b pb-2">
                  <User className="w-4 h-4 text-primary" /> Personal Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Title / Gender</span>
                    <span className="font-medium">{parsedDetails.title || "N/A"} • {parsedDetails.gender || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Date of Birth</span>
                    <span className="font-medium">{parsedDetails.dob || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Nationality</span>
                    <span className="font-medium">{parsedDetails.nationality || "Nigerian"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">State of Origin / LGA</span>
                    <span className="font-medium">{parsedDetails.state_of_origin || "N/A"} • {parsedDetails.lga || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Email</span>
                    <span className="font-medium">{selectedApp.email || parsedDetails.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Primary Phone</span>
                    <span className="font-medium">{selectedApp.phone || parsedDetails.phone || "N/A"}</span>
                  </div>
                  {parsedDetails.alt_phone && (
                    <div>
                      <span className="text-xs text-muted-foreground block">Alternate Phone</span>
                      <span className="font-medium">{parsedDetails.alt_phone}</span>
                    </div>
                  )}
                  {(parsedDetails.address || parsedDetails.city) && (
                    <div className="sm:col-span-2">
                      <span className="text-xs text-muted-foreground block">Residential Address</span>
                      <span className="font-medium">
                        {parsedDetails.address || ""} {parsedDetails.city ? `, ${parsedDetails.city}` : ""} {parsedDetails.state ? `, ${parsedDetails.state}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic & Prior Qualifications */}
              <div className="border rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2 border-b pb-2">
                  <GraduationCap className="w-4 h-4 text-primary" /> Academic Qualifications & History
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Highest Qualification</span>
                    <span className="font-medium">{selectedApp.qualification || parsedDetails.qualification || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Previous Institution</span>
                    <span className="font-medium">{parsedDetails.institution || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Year Completed</span>
                    <span className="font-medium">{parsedDetails.graduation_year || "N/A"}</span>
                  </div>
                  {parsedDetails.olevel_exam && (
                    <>
                      <div>
                        <span className="text-xs text-muted-foreground block">O'Level Exam Body</span>
                        <span className="font-medium">{parsedDetails.olevel_exam} ({parsedDetails.olevel_year || "N/A"})</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">O'Level Credits</span>
                        <span className="font-medium">{parsedDetails.olevel_credits || "N/A"}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Membership Professional Background (if membership) */}
              {selectedApp.application_type === "Membership" && (
                <div className="border rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-2 border-b pb-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Professional Background & Referee
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Employment Status</span>
                      <span className="font-medium">{parsedDetails.employment_status || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Current Employer</span>
                      <span className="font-medium">{parsedDetails.current_employer || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Job Title / Role</span>
                      <span className="font-medium">{parsedDetails.job_title || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Years of Experience</span>
                      <span className="font-medium">{parsedDetails.years_of_experience || "N/A"}</span>
                    </div>
                    {parsedDetails.other_memberships && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-muted-foreground block">Other Professional Bodies</span>
                        <span className="font-medium">{parsedDetails.other_memberships}</span>
                      </div>
                    )}
                  </div>

                  {parsedDetails.referee_name && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-xs font-bold text-muted-foreground block mb-2">Professional Referee:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg">
                        <div>
                          <span className="text-xs text-muted-foreground block">Referee Name & Org</span>
                          <span className="font-medium">{parsedDetails.referee_name} • {parsedDetails.referee_org || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Referee Contact</span>
                          <span className="font-medium">{parsedDetails.referee_phone || "N/A"} {parsedDetails.referee_email ? `• ${parsedDetails.referee_email}` : ""}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Next of Kin (if admission) */}
              {parsedDetails.next_of_kin_name && (
                <div className="border rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-2 border-b pb-2">
                    <User className="w-4 h-4 text-primary" /> Next of Kin / Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Name</span>
                      <span className="font-medium">{parsedDetails.next_of_kin_name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Relationship</span>
                      <span className="font-medium">{parsedDetails.next_of_kin_relationship || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Phone</span>
                      <span className="font-medium">{parsedDetails.next_of_kin_phone || "N/A"}</span>
                    </div>
                    {parsedDetails.next_of_kin_address && (
                      <div className="sm:col-span-3">
                        <span className="text-xs text-muted-foreground block">Address</span>
                        <span className="font-medium">{parsedDetails.next_of_kin_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setDetailsOpen(false)} className="w-full sm:w-auto">
                  Close
                </Button>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    disabled={processingId === selectedApp.id}
                    onClick={() => handleAction(selectedApp.id, selectedApp.name, "Rejected")}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-1" /> Reject Application
                  </Button>
                  <Button
                    disabled={processingId === selectedApp.id}
                    onClick={() => handleAction(selectedApp.id, selectedApp.name, "Approved")}
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                  >
                    <Check className="h-4 w-4 mr-1" /> Approve Application
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
