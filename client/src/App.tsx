import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import { ErrorBoundary } from "@/components/error-boundary";

const BrowseTradies    = lazy(() => import("@/pages/browse-tradies"));
const Jobs             = lazy(() => import("@/pages/jobs"));
const Messages         = lazy(() => import("@/pages/messages"));
const TradieProfile    = lazy(() => import("@/pages/tradie-profile"));
const HelpCenter       = lazy(() => import("@/pages/help-center"));
const Contact          = lazy(() => import("@/pages/contact"));
const SafetyTips       = lazy(() => import("@/pages/safety-tips"));
const Pricing          = lazy(() => import("@/pages/pricing"));
const JoinTradie       = lazy(() => import("@/pages/join-tradie"));
const CustomerDashboard= lazy(() => import("@/pages/customer-dashboard"));
const TradieDashboard  = lazy(() => import("@/pages/tradie-dashboard"));
const Contracts        = lazy(() => import("@/pages/contracts"));
const Invoices         = lazy(() => import("@/pages/invoices"));
const CustomerInvoices = lazy(() => import("@/pages/customer-invoices"));
const BankingSetup     = lazy(() => import("@/pages/banking-setup"));
const PaymentCheckout  = lazy(() => import("@/pages/payment-checkout"));
const PaymentSchedule  = lazy(() => import("@/pages/payment-schedule"));
const AdminDashboard   = lazy(() => import("@/pages/admin-dashboard"));
const CustomerSignup   = lazy(() => import("@/pages/customer-signup"));
const Auth             = lazy(() => import("@/pages/auth"));
const TermsOfService   = lazy(() => import("@/pages/terms-of-service"));
const PrivacyPolicy    = lazy(() => import("@/pages/privacy-policy"));
const NotFound         = lazy(() => import("@/pages/not-found"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

function Wrap({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <ErrorBoundary pageName={name}>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse-tradies"><Wrap name="Find Tradies"><BrowseTradies /></Wrap></Route>
      <Route path="/jobs"><Wrap name="Jobs"><Jobs /></Wrap></Route>
      <Route path="/messages"><Wrap name="Messages"><Messages /></Wrap></Route>
      <Route path="/tradie/:id"><Wrap name="Tradie Profile"><TradieProfile /></Wrap></Route>
      <Route path="/help-center"><Wrap name="Help Center"><HelpCenter /></Wrap></Route>
      <Route path="/contact"><Wrap name="Contact"><Contact /></Wrap></Route>
      <Route path="/safety-tips"><Wrap name="Safety Tips"><SafetyTips /></Wrap></Route>
      <Route path="/pricing"><Wrap name="Pricing"><Pricing /></Wrap></Route>
      <Route path="/join-tradie"><Wrap name="Join as Tradie"><JoinTradie /></Wrap></Route>
      <Route path="/customer-dashboard"><Wrap name="Dashboard"><CustomerDashboard /></Wrap></Route>
      <Route path="/tradie-dashboard"><Wrap name="Tradie Dashboard"><TradieDashboard /></Wrap></Route>
      <Route path="/contracts"><Wrap name="Contracts"><Contracts /></Wrap></Route>
      <Route path="/invoices"><Wrap name="Invoices"><Invoices /></Wrap></Route>
      <Route path="/customer-invoices"><Wrap name="Invoices"><CustomerInvoices /></Wrap></Route>
      <Route path="/banking-setup"><Wrap name="Banking Setup"><BankingSetup /></Wrap></Route>
      <Route path="/payment/:quoteId"><Wrap name="Payment"><PaymentCheckout /></Wrap></Route>
      <Route path="/payment-schedule"><Wrap name="Payment Schedule"><PaymentSchedule /></Wrap></Route>
      <Route path="/admin"><Wrap name="Admin"><AdminDashboard /></Wrap></Route>
      <Route path="/customer-signup"><Wrap name="Sign Up"><CustomerSignup /></Wrap></Route>
      <Route path="/auth"><Wrap name="Sign In"><Auth /></Wrap></Route>
      <Route path="/terms-of-service"><Wrap name="Terms of Service"><TermsOfService /></Wrap></Route>
      <Route path="/privacy-policy"><Wrap name="Privacy Policy"><PrivacyPolicy /></Wrap></Route>
      <Route><Wrap name="Page"><NotFound /></Wrap></Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary pageName="app">
          <Navigation />
          <Toaster />
          <Router />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
