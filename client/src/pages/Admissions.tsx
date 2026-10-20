import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarDays, AlertCircle } from "lucide-react";

export default function Admissions() {
  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Admissions" 
        description="Start your academic journey with us. View intake periods and requirements."
      />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto grid gap-12">
          
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 flex items-start gap-6">
            <div className="bg-white p-3 rounded-full shadow-sm text-primary shrink-0">
              <CalendarDays className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-2">Next Intake: September 2024</h3>
              <p className="text-muted-foreground mb-4">
                Applications for the 2024/2025 academic session are currently open. Early bird registration ends August 30th.
              </p>
              <Link href="/application">
                <Button>Apply Now</Button>
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-serif font-bold text-primary mb-4">General Requirements</h3>
              <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-4">
                <li>Minimum of 5 credits in O'Level examinations (WAEC/NECO) including English and Mathematics.</li>
                <li>Birth certificate or declaration of age.</li>
                <li>Two recent passport photographs.</li>
                <li>Letter of recommendation (for Executive courses).</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold text-primary mb-4">Admission Process</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: "01", title: "Submit Application", desc: "Fill out the online form or visit our office." },
                  { step: "02", title: "Screening", desc: "Attend a brief interview and verification of documents." },
                  { step: "03", title: "Enrollment", desc: "Receive admission letter and pay tuition fees." }
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50 p-6 rounded-xl border border-border">
                    <span className="text-4xl font-serif font-bold text-primary/20 mb-4 block">{s.step}</span>
                    <h4 className="font-bold mb-2">{s.title}</h4>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-orange-50 text-orange-800 p-4 rounded-lg border border-orange-200">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <p className="text-sm">
              Note: Executive courses have rolling admissions throughout the year. Please contact the admissions office for specific dates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
