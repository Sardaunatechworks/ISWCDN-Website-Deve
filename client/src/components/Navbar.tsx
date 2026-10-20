import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/courses", label: "Programs" },
  { href: "/membership", label: "Membership" },
  { href: "/partners", label: "Partners" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-md border-b border-border/50 py-2"
          : "bg-background py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="shrink-0 group-hover:scale-105 transition-transform duration-300">
                <img src="/logo.png" alt="ISWCDN Logo" className="h-10 md:h-12 w-auto object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-extrabold text-xl md:text-2xl text-primary leading-none tracking-tight">
                  ISWCDN
                </span>
                <span className="text-[10px] md:text-[11px] text-muted-foreground font-bold uppercase tracking-[0.15em] hidden sm:block mt-1">
                  Institute of Social Welfare
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-2">
            <div className="flex items-center space-x-1 mr-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer relative group ${
                      location === link.href
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-primary hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                    {location === link.href && (
                      <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full" />
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="h-8 w-[1px] bg-border/60 mx-2" />

            <Link href="/application">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/10 px-6 font-bold tracking-wide"
              >
                Join Institute
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl transition-all duration-300 origin-top ${
          isOpen
            ? "opacity-100 scale-y-100"
            : "opacity-0 scale-y-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto p-6 flex flex-col space-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between p-4 rounded-xl text-base font-bold transition-all ${
                  location === link.href
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                }`}
              >
                {link.label}
                {location === link.href && (
                  <ChevronDown className="h-4 w-4 rotate-270" />
                )}
              </div>
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-border">
            <Link href="/application">
              <Button
                className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-bold shadow-xl shadow-primary/20"
                onClick={() => setIsOpen(false)}
              >
                Apply for Membership
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
