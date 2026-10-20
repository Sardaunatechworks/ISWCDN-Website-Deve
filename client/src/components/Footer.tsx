import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Linkedin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const XIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <title>X</title>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

interface FooterSettings {
  phone1: string;
  phone2: string;
  email: string;
  location: string;
  address: string;
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFooterData();
  }, []);

  async function fetchFooterData() {
    try {
      const data = await api.get<FooterSettings>('/settings');
      if (data) setSettings(data);
    } catch {
      console.error("Footer data fetch failed");
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/newsletter/subscribe', { email });

      toast({
        title: "Subscribed successfully!",
        description: "Thank you for joining our newsletter.",
      });
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to subscribe.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="ISWCDN Logo" className="h-8 w-auto object-contain" />
              <h3 className="font-serif text-xl font-bold text-primary">
                ISWCDN
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Advancing social welfare and inclusive community development
              across Nigeria through education, policy advocacy, and
              professional training.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about"><span className="hover:text-primary cursor-pointer">About Us</span></Link></li>
              <li><Link href="/courses"><span className="hover:text-primary cursor-pointer">Our Courses</span></Link></li>
              <li><Link href="/membership"><span className="hover:text-primary cursor-pointer">Membership</span></Link></li>
              <li><Link href="/contact"><span className="hover:text-primary cursor-pointer">Contact Us</span></Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>Headquarters: {settings?.location || "Bauchi, Nigeria"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div className="flex flex-col">
                  <span>{settings?.phone1 || "+234 803 627 4417"}</span>
                  <span>{settings?.phone2 || "+234 803 624 9795"}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href={`mailto:${settings?.email || 'isowcode@gmail.com'}`} className="hover:underline text-xs truncate max-w-[180px]">
                  {settings?.email || 'isowcode@gmail.com'}
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">
              Join Our Newsletter
            </h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to get the latest updates on courses and community welfare.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-border"
                disabled={submitting}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-medium tracking-wide" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Institute of Social Welfare and
            Community Development of Nigeria. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="https://facebook.com/iswcdn" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></a>
            <a href="https://x.com/iswcdn" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><XIcon className="h-5 w-5" /></a>
            <a href="https://linkedin.com/company/iswcdn" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
