import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  GraduationCap,
  Users,
  HandHeart,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { api } from "@/lib/api";

export default function Home() {
  const [yearsImpact, setYearsImpact] = useState("10+");

  useEffect(() => {
    async function fetchImpact() {
      try {
        const data = await api.get<any>('/settings');
        if (data?.years_impact) setYearsImpact(data.years_impact);
      } catch {
        // Fallback default
      }
    }
    fetchImpact();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-50 pt-20 pb-32 overflow-hidden">
        {/* Abstract Pattern Background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #008751 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-primary bg-primary/10 rounded-full uppercase animate-in fade-in zoom-in duration-500">
            Institute of Social Welfare and Community Development of Nigeria
          </span>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-primary mb-8 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Advancing Social Welfare <br className="hidden md:block" />&
            Inclusive Development
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            ISWCDN is the premier institute dedicated to professionalizing
            social work and community development in Nigeria through education,
            policy, and practice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/application">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Apply for Membership
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-lg border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary"
              >
                View Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Intro Stats/About */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              {/* Logo representing community discussion */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/5"></div>
                <img
                  src="logo.png"
                  alt="ISWCDN Logo"
                  className="w-3/4 h-auto object-contain transform hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-xl shadow-xl border border-border hidden md:block">
                <p className="text-4xl font-serif font-bold text-primary mb-1">
                  {yearsImpact}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Years of Impact
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">
                Building a Resilient Society Through Professional Excellence
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The Institute serves as a beacon for social reform, offering
                world-class training and certification to professionals
                dedicated to the welfare of Nigerian communities.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Professional Certification & Licensing",
                  "Community Development Projects",
                  "Policy Advocacy & Research",
                  "International Collaborations",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center space-x-3 text-foreground font-medium"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about">
                <Button
                  variant="ghost"
                  className="p-0 text-primary font-semibold text-lg group"
                >
                  Learn more about us{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Our Core Pillars
            </h2>
            <p className="text-muted-foreground text-lg">
              We operate on a foundation of integrity and professional
              excellence to drive sustainable change.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={GraduationCap}
              title="Professional Training"
              description="Comprehensive diploma and certificate programs designed to equip social workers with modern skills."
            />
            <FeatureCard
              icon={Users}
              title="Community Engagement"
              description="Direct interventions and projects that uplift vulnerable populations across the country."
            />
            <FeatureCard
              icon={HandHeart}
              title="Social Advocacy"
              description="Championing policies that promote equity, justice, and social protection for all citizens."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-10">
            Join a network of dedicated professionals committed to transforming
            lives and building stronger communities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/membership">
              <Button
                size="lg"
                variant="secondary"
                className="text-primary font-bold h-12 px-8"
              >
                Explore Membership
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10 h-12 px-8"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
