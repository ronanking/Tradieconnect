import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Users, Briefcase, DollarSign, Wrench, LogOut, LayoutDashboard, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation as useWouter } from "wouter";
import JobPostModal from "@/components/job-post-modal";

export default function Navigation() {
  const [location] = useLocation();
  const [, setLocation] = useWouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePostJob = () => {
    if (!isLoggedIn) {
      setLocation("/auth");
    } else {
      setIsJobModalOpen(true);
    }
  };

  const dashboardHref = user?.role === "tradie" ? "/tradie-dashboard" : "/customer-dashboard";

  const navLinks = [
    { href: "/browse-tradies", label: "Find Tradies", icon: Users },
    { href: "/jobs",           label: "Browse Jobs",  icon: Briefcase },
    { href: "/pricing",        label: "Pricing",      icon: DollarSign },
  ];

  const primaryStyle = { background: "linear-gradient(135deg, hsl(217,71%,24%) 0%, hsl(217,71%,34%) 100%)" };
  const activeStyle  = { backgroundColor: "hsla(217,71%,24%,0.08)", color: "hsl(217,71%,24%)" };
  const initials     = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "?";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mr-2.5" style={primaryStyle}>
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>Tradie</span>
                <span className="text-lg font-bold" style={{ fontFamily: "Sora, sans-serif", color: "hsl(38,95%,42%)" }}>Connect</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}>
                <span className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer block"
                  style={location === href ? activeStyle : { color: "#475569" }}>
                  {label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button onClick={handlePostJob} className="text-white font-semibold px-5 text-sm" style={primaryStyle}>
                  Post a Job
                </Button>

                {/* Profile avatar dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={primaryStyle}>
                      {initials}
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role ?? "customer"} account</p>
                      </div>

                      {/* Dashboard link */}
                      <Link href={dashboardHref} onClick={() => setIsProfileOpen(false)}>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 font-medium text-left">
                          <LayoutDashboard className="h-4 w-4 text-slate-400" />
                          My Dashboard
                        </button>
                      </Link>

                      <Link href="/messages" onClick={() => setIsProfileOpen(false)}>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 font-medium text-left">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          Messages
                        </button>
                      </Link>

                      <Link href={dashboardHref} onClick={() => setIsProfileOpen(false)}>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 font-medium text-left">
                          <User className="h-4 w-4 text-slate-400" />
                          Profile & Settings
                        </button>
                      </Link>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={async () => { await logout(); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 font-medium text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/join-tradie">
                  <Button variant="outline" className="text-sm font-medium border-slate-300 text-slate-700 hover:border-primary hover:text-primary">
                    Join as Tradie
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" className="text-sm font-medium border-slate-300 text-slate-700">
                    Sign In
                  </Button>
                </Link>
                <Button onClick={handlePostJob} className="text-sm font-semibold text-white px-5" style={primaryStyle}>
                  Post a Job
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium cursor-pointer"
                  style={location === href ? activeStyle : { color: "#374151" }}>
                  <Icon className="h-4 w-4" />{label}
                </span>
              </Link>
            ))}
            <div className="pt-3 pb-1 flex flex-col gap-2 border-t border-slate-100 mt-2">
              {isLoggedIn ? (
                <>
                  {/* Profile info on mobile */}
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={primaryStyle}>
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-slate-400 capitalize">{user?.role ?? "customer"}</p>
                    </div>
                  </div>
                  <Link href={dashboardHref} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-medium flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> My Dashboard
                    </Button>
                  </Link>
                  <Button onClick={() => { handlePostJob(); setIsMobileMenuOpen(false); }} className="w-full text-white font-semibold" style={primaryStyle}>
                    Post a Job
                  </Button>
                  <Button variant="outline" onClick={async () => { await logout(); setIsMobileMenuOpen(false); }} className="w-full font-medium text-red-600 border-red-200">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => { handlePostJob(); setIsMobileMenuOpen(false); }} className="w-full text-white font-semibold" style={primaryStyle}>
                    Post a Job
                  </Button>
                  <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-medium">Sign In</Button>
                  </Link>
                  <Link href="/join-tradie" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-medium">Join as Tradie</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <JobPostModal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} />
    </header>
  );
}
