import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Wrench, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    confirmPassword: "", phone: "", location: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: "Error", description: data.message || "Something went wrong.", variant: "destructive" });
        return;
      }
      // Set auth data directly - do NOT invalidate as it causes flicker
      queryClient.setQueryData(["/api/auth/me"], data);
      toast({ title: mode === "login" ? "Welcome back!" : "Account created!", description: "Redirecting to your dashboard..." });
      const role = data.role || data.userType || "customer";
      if (role === "admin") {
        setLocation("/admin");
      } else if (role === "tradie") {
        setLocation("/tradie-dashboard");
      } else {
        setLocation("/customer-dashboard");
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const primaryStyle = { background: 'linear-gradient(135deg, hsl(217,71%,24%) 0%, hsl(217,71%,34%) 100%)' };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={primaryStyle}>
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900" style={{fontFamily: 'Sora, sans-serif'}}>
              Tradie<span style={{color: 'hsl(38,95%,42%)'}}>Connect</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{fontFamily: 'Sora, sans-serif'}}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-slate-500 text-sm">
            {mode === "login" ? "Sign in to post jobs and manage quotes" : "Join thousands of Australians using TradieConnect"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Smith" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                placeholder="john@example.com" />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="0400 000 000" />
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location (Suburb)</label>
                <input name="location" value={form.location} onChange={handleChange} required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Brisbane, QLD" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 pr-10"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="••••••••" />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 rounded-xl mt-2" style={primaryStyle}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="font-semibold hover:underline" style={{color: 'hsl(217,71%,24%)'}}>
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setMode("login")} className="font-semibold hover:underline" style={{color: 'hsl(217,71%,24%)'}}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
