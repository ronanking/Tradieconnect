import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import JobPostModal from "@/components/job-post-modal";
import TradieProfileModal from "@/components/tradie-profile-modal";
import { usePostJob } from "@/hooks/usePostJob";
import {
  Search, MapPin, Star, Shield, Clock, CheckCircle,
  Zap, Droplets, Paintbrush2, Hammer, Wind, Leaf,
  ChevronRight, ArrowRight, Home as HomeIcon, Sparkles, Layers,
  Key, Wrench, Bug, Waves, Thermometer, LayoutGrid
} from "lucide-react";

// Scroll reveal hook
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

// Count up hook
function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// Animated stat card
function StatCard({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const { ref, visible } = useReveal();
  const numMatch = value.match(/^(\d+)/);
  const num = numMatch ? parseInt(numMatch[1]) : 0;
  const suffix = value.replace(/^\d+/, "");
  const counted = useCountUp(num, 2000, visible);

  return (
    <div
      ref={ref}
      className="text-center bg-white rounded-xl p-5 shadow-sm transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`
      }}
    >
      <div className="text-3xl font-extrabold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'hsl(217,71%,24%)' }}>
        {num > 0 ? `${counted}${suffix}` : value}
      </div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
    </div>
  );
}

// Reveal wrapper
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease, transform 0.6s ease`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

const CATEGORIES = [
  { name: "Plumbing", icon: Droplets },
  { name: "Electrical", icon: Zap },
  { name: "Painting", icon: Paintbrush2 },
  { name: "Carpentry", icon: Hammer },
  { name: "HVAC", icon: Wind },
  { name: "Roofing", icon: HomeIcon },
  { name: "Landscaping", icon: Leaf },
  { name: "Tiling", icon: LayoutGrid },
  { name: "Cleaning", icon: Sparkles },
  { name: "Flooring", icon: Layers },
  { name: "Locksmith", icon: Key },
  { name: "Handyman", icon: Wrench },
];

const STATS = [
  { value: "12000+", label: "Verified Tradies" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "4.9★", label: "Average Rating" },
  { value: "24hr", label: "Avg Response" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Post Your Job", desc: "Describe what you need done, your location and budget. It's completely free." },
  { step: "02", title: "Get Quotes", desc: "Verified tradies in your area send you quotes within hours." },
  { step: "03", title: "Hire with Confidence", desc: "View profiles, reviews and past work. Hire the best tradie for your job." },
];

const TRUST_POINTS = [
  { icon: Shield, title: "Verified Tradies", desc: "All tradies are background checked, licensed and insured before joining." },
  { icon: Star, title: "Genuine Reviews", desc: "Real reviews from real customers. No fake ratings, ever." },
  { icon: Clock, title: "Fast Response", desc: "Most jobs receive multiple quotes within 24 hours." },
  { icon: CheckCircle, title: "Secure Payments", desc: "Pay only when you're happy with the work. Money-back guarantee." },
];

export default function Home() {
  const { handlePostJob, isJobModalOpen, setIsJobModalOpen } = usePostJob();
  const [isTradieModalOpen, setIsTradieModalOpen] = useState(false);
  const [selectedTradieId, setSelectedTradieId] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const primaryStyle = { background: 'linear-gradient(135deg, hsl(217,71%,24%) 0%, hsl(217,71%,34%) 100%)' };
  const goldStyle = { background: 'linear-gradient(135deg, hsl(38,95%,48%) 0%, hsl(38,90%,42%) 100%)' };

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="hero-bg py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: 'hsla(38,95%,50%,0.15)', color: 'hsl(38,95%,70%)' }}>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Australia's #1 Tradie Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
              Find Trusted<br />
              <span style={{ color: 'hsl(38,95%,55%)' }}>Aussie Tradies</span><br />
              Near You
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-xl leading-relaxed">
              Post a job for free. Get quotes from verified local tradies. Pay only when you're satisfied.
            </p>
            <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mb-8">
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <input type="text" placeholder="What do you need? (e.g. plumber, electrician)"
                  className="flex-1 outline-none text-slate-800 text-sm py-2 bg-transparent placeholder-slate-400"
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <input type="text" placeholder="Suburb or postcode"
                  className="flex-1 outline-none text-slate-800 text-sm py-2 bg-transparent placeholder-slate-400" />
              </div>
              <Link href={`/browse-tradies${searchTerm ? `?q=${searchTerm}` : ''}`}>
                <Button className="text-white font-semibold px-6 py-3 rounded-xl whitespace-nowrap w-full sm:w-auto" style={goldStyle}>
                  Search Tradies
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-200">
              {["Free to post jobs", "No upfront costs", "Quotes within hours"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-amber-400" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-slate-100" style={{ background: 'hsl(220,14%,97%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label }, i) => (
              <StatCard key={label} value={value} label={label} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Browse by Trade</h2>
            <p className="text-slate-500 max-w-xl mx-auto">From emergency plumbing to full home renovations — we've got every trade covered.</p>
          </Reveal>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {CATEGORIES.map(({ name, icon: Icon }, i) => (
              <Reveal key={name} delay={i * 50}>
                <Link href={`/browse-tradies?category=${name}`}>
                  <div className="flex flex-col items-center p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-600 group transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110"
                      style={{ backgroundColor: 'hsla(217,71%,24%,0.08)' }}>
                      <Icon className="h-6 w-6" style={{ color: 'hsl(217,71%,24%)' }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{name}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16" style={{ background: 'hsl(220,14%,97%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>How It Works</h2>
            <p className="text-slate-500">Getting quality trade work done has never been easier.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <Reveal key={step} delay={i * 150}>
                <div className="bg-white rounded-2xl p-8 shadow-sm h-full">
                  <div className="text-6xl font-extrabold mb-4 leading-none" style={{ fontFamily: 'Sora, sans-serif' }}>
                    <span style={{ color: 'hsla(217,71%,24%,0.2)' }}>{step.charAt(0)}</span>
                    <span style={{ color: 'hsl(38,95%,48%)' }}>{step.charAt(1)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center mt-10">
            <Button onClick={handlePostJob} className="text-white font-semibold px-8 py-3 rounded-xl" style={primaryStyle}>
              Post a Job for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Why Australians Trust Us</h2>
            <p className="text-slate-500 max-w-xl mx-auto">We go above and beyond to make sure every job goes smoothly.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_POINTS.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 shadow-sm text-center border border-slate-100 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'hsla(38,95%,50%,0.12)' }}>
                    <Icon className="h-6 w-6" style={{ color: 'hsl(38,85%,40%)' }} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 hero-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Ready to get started?
            </h2>
            <p className="text-blue-100 text-lg mb-8">Join thousands of Australians who use TradieConnect every day.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handlePostJob} className="font-semibold px-8 py-3 rounded-xl text-slate-900" style={goldStyle}>
                Post a Job — It's Free
              </Button>
              <Link href="/join-tradie">
                <Button variant="outline" className="font-semibold px-8 py-3 rounded-xl border-2 border-white text-white bg-transparent hover:bg-white hover:text-slate-900">
                  I'm a Tradie →
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={primaryStyle}>
                  <Hammer className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>TradieConnect</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Australia's most trusted platform connecting homeowners with verified local tradies.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-400">For Customers</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={handlePostJob} className="hover:text-white transition-colors">Post a Job</button></li>
                <li><Link href="/browse-tradies" className="hover:text-white transition-colors">Find Tradies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-400">For Tradies</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/join-tradie" className="hover:text-white transition-colors">Join as Tradie</Link></li>
                <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-400">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} TradieConnect. All rights reserved. Made in Australia 🇦🇺
          </div>
        </div>
      </footer>

      <JobPostModal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} />
      <TradieProfileModal isOpen={isTradieModalOpen} onClose={() => setIsTradieModalOpen(false)} tradieId={selectedTradieId} />
    </div>
  );
}
