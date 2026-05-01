import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import {
  Users, DollarSign, Star, Shield, Clock, Zap,
  CheckCircle, ArrowRight, ArrowLeft, Wrench,
  FileText, MapPin, Phone, Mail, Building, Award
} from "lucide-react";
import { TRADE_CATEGORIES, AUSTRALIAN_STATES } from "@/lib/constants";

const primaryStyle = { background: "linear-gradient(135deg, hsl(217,71%,24%) 0%, hsl(217,71%,34%) 100%)" };
const goldColor = "hsl(38,95%,42%)";
// ── Animation helpers ──────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const { ref, visible } = useInView(0.3);
  const isNumber = /^[\d,]+/.test(value);
  const numericPart = parseInt(value.replace(/[^0-9]/g, "")) || 0;
  const suffix = value.replace(/^[\d,]+/, "");
  const counted = useCountUp(numericPart, 1600, visible && isNumber);
  const display = isNumber ? counted.toLocaleString() + suffix : value;
  return (
    <div ref={ref} className={`bg-white/10 rounded-2xl p-3 border border-white/20 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <p className="text-2xl font-bold">{display}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function HoverCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`transition-all duration-300 cursor-default ${hovered ? "scale-[1.03] shadow-lg -translate-y-1" : "scale-100 shadow-none"} ${className}`}
    >
      {children}
    </div>
  );
}



const benefits = [
  { icon: Users,      title: "Thousands of Customers",  desc: "Connect with homeowners actively looking for your trade"         },
  { icon: DollarSign, title: "No Commission Fees",       desc: "Keep 100% of what you earn — just a flat monthly subscription"   },
  { icon: Star,       title: "Build Your Reputation",    desc: "Showcase your work with photos and collect verified reviews"      },
  { icon: Shield,     title: "Secure Payments",          desc: "Get paid safely and on time through our secure system"            },
  { icon: Clock,      title: "Work Your Own Hours",      desc: "Choose which jobs to quote on and work completely on your terms"  },
  { icon: Zap,        title: "Instant Job Alerts",       desc: "Get notified the moment a job matching your skills goes live"     },
];

const steps = [
  { number: 1, title: "Personal Info",     icon: Users    },
  { number: 2, title: "Business Details",  icon: Building },
  { number: 3, title: "Qualifications",    icon: Award    },
  { number: 4, title: "Services",          icon: Wrench   },
  { number: 5, title: "Your Profile",      icon: FileText },
];

const stats = [
  { value: "12,000+", label: "Active Tradies" },
  { value: "85,000+", label: "Jobs Posted"    },
  { value: "4.8★",    label: "Avg Rating"     },
  { value: "24hrs",   label: "Avg Quote Time" },
];

export default function JoinTradie() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const [abnStatus, setAbnStatus] = useState<{valid?: boolean; entityName?: string; error?: string; loading?: boolean} | null>(null);
  const [qbccStatus, setQbccStatus] = useState<{valid?: boolean; name?: string; licenseClass?: string; error?: string; loading?: boolean} | null>(null);

  const verifyABN = async (abn: string) => {
    const clean = abn.replace(/\s/g, "");
    if (clean.length !== 11) return;
    setAbnStatus({ loading: true });
    try {
      const res = await fetch(`/api/verify/abn/${clean}`);
      const data = await res.json();
      setAbnStatus(data);
    } catch {
      setAbnStatus({ valid: false, error: "Could not verify at this time" });
    }
  };

  const verifyLicence = async (license: string) => {
    if (license.length < 3) return;
    setQbccStatus({ loading: true });
    try {
      const state = formData.location || "QLD";
      const res = await fetch(`/api/verify/licence/${encodeURIComponent(license)}?state=${encodeURIComponent(state)}`);
      const data = await res.json();
      setQbccStatus(data);
    } catch {
      setQbccStatus({ valid: false, error: "Could not verify at this time" });
    }
  };
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", location: "", postcode: "",
    tradeName: "", abn: "", categories: [] as string[], yearsExperience: "",
    license: "", insurance: "", qualifications: "",
    servicesOffered: [] as string[], hourlyRate: "", serviceAreas: [] as string[],
    bio: "", whyChooseMe: "", password: "", confirmPassword: ""
  });

  const set = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const toggleArray = (field: string, value: string, checked: boolean) =>
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev as any)[field], value]
        : (prev as any)[field].filter((v: string) => v !== value)
    }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={primaryStyle}>
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-500 mb-6">We'll review your details and get back to you within 24 hours. Get ready to start receiving jobs!</p>
          <Link href="/">
            <Button className="text-white w-full font-semibold" style={primaryStyle}>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name *">
              <Input value={formData.firstName} onChange={e => set("firstName", e.target.value)} placeholder="John" />
            </Field>
            <Field label="Last Name *">
              <Input value={formData.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Smith" />
            </Field>
          </div>
          <Field label="Email Address *" icon={<Mail className="h-4 w-4 text-slate-400" />}>
            <Input type="email" value={formData.email} onChange={e => set("email", e.target.value)} placeholder="john@example.com" />
          </Field>
          <Field label="Phone Number *" icon={<Phone className="h-4 w-4 text-slate-400" />}>
            <Input type="tel" value={formData.phone} onChange={e => set("phone", e.target.value)} placeholder="0400 000 000" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="State *" icon={<MapPin className="h-4 w-4 text-slate-400" />}>
              <Select onValueChange={v => set("location", v)}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>{AUSTRALIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Postcode *">
              <Input value={formData.postcode} onChange={e => set("postcode", e.target.value)} placeholder="2000" />
            </Field>
          </div>
        </div>
      );

      case 2: return (
        <div className="space-y-5">
          <Field label="Business / Trade Name *" icon={<Building className="h-4 w-4 text-slate-400" />}>
            <Input value={formData.tradeName} onChange={e => set("tradeName", e.target.value)} placeholder="Smith Plumbing Co." />
          </Field>
          <div>
            <Field label="ABN" hint="We'll verify this with the Australian Business Register">
              <div className="flex gap-2">
                <Input 
                  value={formData.abn} 
                  onChange={e => { set("abn", e.target.value); setAbnStatus(null); }} 
                  placeholder="12 345 678 901" 
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => verifyABN(formData.abn)}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-xl whitespace-nowrap"
                  style={{background: "linear-gradient(135deg, hsl(217,71%,24%) 0%, hsl(217,71%,34%) 100%)"}}
                >
                  Verify
                </button>
              </div>
            </Field>
            {abnStatus?.loading && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">⏳ Checking ABR register...</p>}
            {abnStatus && !abnStatus.loading && abnStatus.valid && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
                <span className="text-emerald-600 text-sm">✅</span>
                <div>
                  <p className="text-xs font-semibold text-emerald-800">{abnStatus.entityName}</p>
                  <p className="text-xs text-emerald-600">{abnStatus.entityType} — ABN Active</p>
                </div>
              </div>
            )}
            {abnStatus && !abnStatus.loading && !abnStatus.valid && (
              <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <span className="text-red-500 text-sm">❌</span>
                <p className="text-xs text-red-700">{abnStatus.error}</p>
              </div>
            )}
          </div>
          <Field label="Years of Experience *">
            <Select onValueChange={v => set("yearsExperience", v)}>
              <SelectTrigger><SelectValue placeholder="How long have you been trading?" /></SelectTrigger>
              <SelectContent>
                {["1-2 years","3-5 years","6-10 years","11-15 years","16-20 years","20+ years"].map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Trade Categories * <span className="text-slate-400 font-normal">(select all that apply)</span></p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TRADE_CATEGORIES.map(cat => (
                <label key={cat.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-sm ${
                  formData.categories.includes(cat.name)
                    ? "border-blue-900 bg-blue-50 text-blue-900 font-medium"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}>
                  <Checkbox
                    checked={formData.categories.includes(cat.name)}
                    onCheckedChange={c => toggleArray("categories", cat.name, !!c)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      );

      case 3: return (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">Customers trust tradies with verified licenses and insurance. Complete this section to stand out.</p>
          </div>
          <div>
            <Field label="Licence Number" hint={formData.location === "QLD" || !formData.location ? "QBCC number — verified against the QLD register" : `Licence number — we'll check the ${formData.location} register`}>
              <div className="flex gap-2">
                <Input 
                  value={formData.license} 
                  onChange={e => { set("license", e.target.value); setQbccStatus(null); }} 
                  placeholder="e.g. 1234567" 
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => verifyLicence(formData.license)}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-xl whitespace-nowrap"
                  style={{background: "linear-gradient(135deg, hsl(217,71%,24%) 0%, hsl(217,71%,34%) 100%)"}}
                >
                  Verify
                </button>
              </div>
            </Field>
            {qbccStatus?.loading && <p className="text-xs text-slate-400 mt-1">⏳ Checking QBCC register...</p>}
            {qbccStatus && !qbccStatus.loading && qbccStatus.valid && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
                <span className="text-emerald-600 text-sm">✅</span>
                <div>
                  <p className="text-xs font-semibold text-emerald-800">{qbccStatus.name}</p>
                  <p className="text-xs text-emerald-600">{qbccStatus.licenceClass} — {qbccStatus.status}</p>
                  {qbccStatus.expiryDate && <p className="text-xs text-emerald-600">Expires: {qbccStatus.expiryDate}</p>}
                  {qbccStatus.source && <p className="text-xs text-emerald-500">Source: {qbccStatus.source}</p>}
                </div>
              </div>
            )}
            {qbccStatus && !qbccStatus.loading && !qbccStatus.valid && (
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-600 text-sm">⚠️</span>
                  <p className="text-xs text-amber-800 font-medium">{qbccStatus.error}</p>
                </div>
                {qbccStatus.checkUrl && (
                  <a href={qbccStatus.checkUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline">
                    Verify manually on {qbccStatus.source || "government website"} →
                  </a>
                )}
              </div>
            )}
          </div>
          <Field label="Public Liability Insurance *" hint="Minimum $2M coverage required">
            <Input value={formData.insurance} onChange={e => set("insurance", e.target.value)} placeholder="e.g. QBE Policy #123456 — $10M coverage" />
          </Field>
          <Field label="Qualifications & Certifications">
            <Textarea
              value={formData.qualifications}
              onChange={e => set("qualifications", e.target.value)}
              placeholder="e.g. Certificate III in Plumbing, White Card, Asbestos Awareness..."
              className="min-h-[110px] resize-none"
            />
          </Field>
        </div>
      );

      case 4: return (
        <div className="space-y-5">
          <Field label="Hourly Rate Range *">
            <Select onValueChange={v => set("hourlyRate", v)}>
              <SelectTrigger><SelectValue placeholder="Select your rate" /></SelectTrigger>
              <SelectContent>
                {["$40–60/hr","$60–80/hr","$80–100/hr","$100–120/hr","$120–150/hr","$150+/hr"].map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Service Areas * <span className="text-slate-400 font-normal">(select all that apply)</span></p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {["Inner City","Eastern Suburbs","Western Suburbs","Northern Beaches","South Sydney","CBD","Hills District","Sutherland Shire","North Shore","Parramatta"].map(area => (
                <label key={area} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-sm ${
                  formData.serviceAreas.includes(area)
                    ? "border-blue-900 bg-blue-50 text-blue-900 font-medium"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}>
                  <Checkbox
                    checked={formData.serviceAreas.includes(area)}
                    onCheckedChange={c => toggleArray("serviceAreas", area, !!c)}
                  />
                  {area}
                </label>
              ))}
            </div>
          </div>
        </div>
      );

      case 5: return (
        <div className="space-y-5">
          <Field label="Create Password *" hint="Minimum 6 characters">
            <Input type="password" value={formData.password} onChange={e => set("password", e.target.value)} placeholder="Create a password" />
          </Field>
          <Field label="Confirm Password *">
            <Input type="password" value={formData.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Confirm your password" />
          </Field>
          <Field label="About You *" hint="Tell customers about your background and approach">
            <Textarea
              value={formData.bio}
              onChange={e => set("bio", e.target.value)}
              placeholder="I'm a licensed plumber with 12 years experience specialising in residential renovations and emergency repairs. I pride myself on quality workmanship and always turning up on time..."
              className="min-h-[130px] resize-none"
            />
          </Field>
          <Field label="Why Should Customers Choose You?" hint="What makes you stand out from other tradies?">
            <Textarea
              value={formData.whyChooseMe}
              onChange={e => set("whyChooseMe", e.target.value)}
              placeholder="e.g. Same-day service, 5-year workmanship guarantee, fully stocked van, 500+ 5-star reviews..."
              className="min-h-[110px] resize-none"
            />
          </Field>
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <p className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> What happens next?
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              {["We'll review your application within 24 hours","Upload photos of your work after approval","Complete profile verification to get a verified badge","Start receiving job notifications immediately"].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="text-white py-16 px-4 relative overflow-hidden" style={primaryStyle}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 right-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-white blur-2xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-sm font-medium mb-6 border border-white/20">
            <Zap className="h-4 w-4" style={{ color: goldColor }} />
            Australia's Fastest Growing Tradie Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Grow Your Trade Business<br />
            <span style={{ color: goldColor }}>Without the Hassle</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of tradies already winning more jobs, getting paid faster, and building 5-star reputations on TradieConnect.
          </p>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map(({ value, label }) => (
              <AnimatedStat key={label} value={value} label={label} />
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white py-14 px-4 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Why Tradies Love TradieConnect</h2>
          <p className="text-slate-500 text-center mb-10">Everything you need to run a successful trade business</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 100}>
                <HoverCard className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={primaryStyle}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">{title}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </HoverCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Your Tradie Profile</h2>
            <p className="text-slate-500">Takes less than 5 minutes — free to join</p>
          </div>
          </FadeIn>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8 px-2">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep > step.number
                      ? "bg-emerald-500 text-white"
                      : currentStep === step.number
                      ? "text-white shadow-lg"
                      : "bg-slate-200 text-slate-500"
                  }`} style={currentStep === step.number ? primaryStyle : {}}>
                    {currentStep > step.number ? <CheckCircle className="h-5 w-5" /> : step.number}
                  </div>
                  <p className={`text-xs mt-1.5 font-medium hidden sm:block ${currentStep === step.number ? "text-slate-900" : "text-slate-400"}`}>
                    {step.title}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 mb-4 rounded-full transition-all ${currentStep > step.number ? "bg-emerald-400" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100" style={primaryStyle}>
              <p className="text-white font-semibold">Step {currentStep} of 5 — {steps[currentStep - 1].title}</p>
              <div className="mt-2 h-1 bg-white/20 rounded-full">
                <div className="h-1 bg-white rounded-full transition-all" style={{ width: `${(currentStep / 5) * 100}%` }} />
              </div>
            </div>

            <div className="p-6 md:p-8">
              {renderStep()}
            </div>

            <div className="px-6 md:px-8 pb-6 flex justify-between items-center border-t border-slate-100 pt-5">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(s => s - 1)}
                disabled={currentStep === 1}
                className="flex items-center gap-2 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              <span className="text-xs text-slate-400">{currentStep} of 5</span>

              {currentStep < 5 ? (
                <Button
                  onClick={() => setCurrentStep(s => s + 1)}
                  className="text-white font-semibold flex items-center gap-2 rounded-xl px-6"
                  style={primaryStyle}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    if (formData.password !== formData.confirmPassword) {
                      setError("Passwords do not match"); return;
                    }
                    if (formData.password.length < 6) {
                      setError("Password must be at least 6 characters"); return;
                    }
                    setSubmitting(true); setError("");
                    try {
                      const res = await fetch("/api/tradie/apply", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify(formData)
                      });
                      const data = await res.json();
                      if (!res.ok) { setError(data.message || "Submission failed"); setSubmitting(false); return; }
                      setSubmitted(true);
                      setTimeout(() => setLocation("/tradie-dashboard"), 2000);
                    } catch {
                      setError("Something went wrong. Please try again.");
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="text-white font-semibold flex items-center gap-2 rounded-xl px-6"
                  style={primaryStyle}
                >
                  {submitting ? "Submitting..." : "Create My Account"} <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            By submitting you agree to our{" "}
            <Link href="/terms-of-service"><span className="underline cursor-pointer">Terms of Service</span></Link>
            {" "}and{" "}
            <Link href="/privacy-policy"><span className="underline cursor-pointer">Privacy Policy</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, icon, children }: { label: string; hint?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
