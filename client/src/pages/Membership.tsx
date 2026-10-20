import { PageHeader } from "@/components/PageHeader";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Membership() {
  const tiers = [
    {
      name: "Fellow (FISWCDN)",
      desc: "For distinguished professionals with over 15 years of impactful experience.",
      price: "By Assessment",
      popular: false
    },
    {
      name: "Full Member (MISWCDN)",
      desc: "For qualified practitioners with at least 5 years of field experience.",
      price: "₦50,000 / yr",
      popular: true
    },
    {
      name: "Associate (AISWCDN)",
      desc: "Entry-level for graduates and early-career professionals.",
      price: "₦25,000 / yr",
      popular: false
    },
    {
      name: "Student Member",
      desc: "For undergraduates currently studying social work or related courses.",
      price: "₦5,000 / yr",
      popular: false
    },
    {
      name: "Corporate Member",
      desc: "For organizations, NGOs, and agencies aligned with our mission.",
      price: "₦100,000 / yr",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Membership" 
        description="Join a prestigious network of change-makers. Enhance your career and credibility."
      />

      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-serif font-bold text-primary mb-6">Membership Benefits</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left bg-white p-8 rounded-2xl shadow-sm border border-border">
            {[
              "Professional Recognition & Credibility",
              "Access to Continuous Professional Development",
              "Networking with Industry Leaders",
              "Discounted Rates for Conferences",
              "Voting Rights at AGM (Full Members)",
              "Access to Research Publications"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="bg-primary/10 p-1 rounded-full">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`relative bg-white rounded-2xl p-8 border ${
                tier.popular 
                  ? 'border-primary ring-2 ring-primary/10 shadow-xl scale-105 z-10' 
                  : 'border-border shadow-sm hover:shadow-md'
              } flex flex-col`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                  Recommended
                </div>
              )}
              <h3 className="text-xl font-bold text-primary mb-2">{tier.name}</h3>
              <p className="text-muted-foreground text-sm mb-6 flex-grow">{tier.desc}</p>
              <div className="mb-8">
                <span className="text-2xl font-bold text-foreground">{tier.price}</span>
              </div>
              <Link href="/membership-application">
                <Button className={`w-full ${tier.popular ? 'bg-primary' : 'bg-slate-900'} hover:opacity-90`}>
                  Apply Now
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
