import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Users, Briefcase } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const customerPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for homeowners getting started",
      features: [
        "Post up to 2 jobs per month",
        "Browse all tradie profiles",
        "Basic messaging with tradies",
        "View quotes and reviews",
        "Mobile app access",
        "Email support"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Premium",
      price: "$19",
      period: "per month",
      description: "For homeowners with regular projects",
      features: [
        "Unlimited job posts",
        "Priority listing (shown first)",
        "Advanced messaging & file sharing",
        "Project management dashboard",
        "Quote comparison tools",
        "Direct phone support",
        "Background check verification",
        "Job completion guarantee"
      ],
      buttonText: "Start 14-Day Free Trial",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Business",
      price: "$79",
      period: "per month",
      description: "For property managers and businesses",
      features: [
        "Everything in Premium",
        "Multi-property management",
        "Team collaboration tools",
        "Custom reporting & analytics",
        "Dedicated account manager",
        "Bulk job posting",
        "Priority emergency services",
        "Invoice management system"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  const tradiePlans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "For new tradies building their reputation",
      features: [
        "Basic profile listing",
        "Submit up to 5 quotes per month",
        "View available jobs",
        "Basic messaging",
        "Customer reviews",
        "Mobile app access"
      ],
      buttonText: "Join Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Professional",
      price: "$39",
      period: "per month",
      description: "For established tradies growing their business",
      features: [
        "Featured profile listing",
        "Unlimited quote submissions",
        "Advanced portfolio showcase",
        "Priority job notifications",
        "Business analytics dashboard",
        "Customer communication tools",
        "Verified tradie badge",
        "Lead generation tools"
      ],
      buttonText: "Upgrade Now",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "$149",
      period: "per month",
      description: "For large trade businesses and teams",
      features: [
        "Everything in Professional",
        "Team member management",
        "Custom branding options",
        "Advanced scheduling tools",
        "CRM integration",
        "Bulk quote management",
        "Priority customer support",
        "Custom reporting suite"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Start free and upgrade as you grow.
            No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Customer Plans */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              For Homeowners & Property Managers
            </h2>
            <p className="text-lg text-gray-600">
              Find trusted tradies and manage your projects with confidence
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {customerPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary border-2 shadow-lg scale-105' : 'border-gray-200'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={plan.buttonText === "Contact Sales" ? "/contact" : "/customer-signup"}>
                    <Button 
                      variant={plan.buttonVariant} 
                      className="w-full"
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Tradie Plans */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              For Tradies & Service Providers
            </h2>
            <p className="text-lg text-gray-600">
              Grow your business and connect with more customers
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {tradiePlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary border-2 shadow-lg scale-105' : 'border-gray-200'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    <Zap className="h-4 w-4 mr-1" />
                    Recommended
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={plan.buttonText === "Contact Sales" ? "/contact" : "/join-tradie"}>
                    <Button 
                      variant={plan.buttonVariant} 
                      className="w-full"
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>



        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 mb-4">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.</p>
              
              <h3 className="font-semibold text-lg mb-2">Is there a setup fee?</h3>
              <p className="text-gray-600 mb-4">No setup fees ever. What you see is what you pay - no hidden costs or surprise charges.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 mb-4">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
              
              <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 mb-4">Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied customers and tradies today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/customer-signup">
              <Button size="lg" className="px-8">
                <Users className="h-5 w-5 mr-2" />
                Join as Customer
              </Button>
            </Link>
            <Link href="/join-tradie">
              <Button size="lg" variant="outline" className="px-8">
                <Briefcase className="h-5 w-5 mr-2" />
                Join as Tradie
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}