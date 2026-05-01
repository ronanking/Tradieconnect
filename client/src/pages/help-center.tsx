import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, FileText, Shield, DollarSign, Users } from "lucide-react";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Topics", icon: FileText },
    { id: "getting-started", name: "Getting Started", icon: Users },
    { id: "payments", name: "Payments", icon: DollarSign },
    { id: "safety", name: "Safety & Security", icon: Shield },
    { id: "support", name: "Support", icon: MessageCircle },
  ];

  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I post my first job?",
      answer: "Click the 'Post a Job' button from the homepage, fill in your project details, set your budget, and publish. You'll start receiving quotes from qualified tradies within hours.",
    },
    {
      id: 2,
      category: "getting-started",
      question: "How do I find tradies in my area?",
      answer: "Use the 'Browse Tradies' section to filter by location, trade category, and ratings. You can also post a job and let local tradies come to you.",
    },
    {
      id: 3,
      category: "payments",
      question: "How does payment work?",
      answer: "We use secure payment processing through Stripe. You can pay by card once you've accepted a quote. Payments are held securely until work is completed to your satisfaction.",
    },
    {
      id: 4,
      category: "payments",
      question: "When do I pay the tradie?",
      answer: "Payment is released to the tradie once you mark the job as complete. For larger projects, you can set up milestone payments.",
    },
    {
      id: 5,
      category: "safety",
      question: "How are tradies verified?",
      answer: "All tradies must provide valid licenses, insurance certificates, and undergo background checks. We also verify their identity and work history.",
    },
    {
      id: 6,
      category: "safety",
      question: "What if I'm not satisfied with the work?",
      answer: "Contact our support team immediately. We offer dispute resolution services and have a satisfaction guarantee for all jobs on our platform.",
    },
    {
      id: 7,
      category: "support",
      question: "How do I contact customer support?",
      answer: "You can reach our support team through the contact form below, email us at support@tradieconnect.com, or call 1300 TRADIE (1300 872 343).",
    },
    {
      id: 8,
      category: "support",
      question: "What are your operating hours?",
      answer: "Our support team is available Monday to Friday, 8 AM to 6 PM AEST. Emergency support is available 24/7 for urgent issues.",
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Help Center</h1>
            <p className="text-xl text-slate-600 mb-8">Get help with TradieConnect</p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedCategory === "all" ? "Frequently Asked Questions" : 
                   categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <Badge variant="secondary">
                  {filteredFaqs.length} article{filteredFaqs.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <Card key={faq.id}>
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900">
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-lg">No articles found matching your search.</p>
                  <p className="text-slate-400 mt-2">Try adjusting your search terms or browsing different categories.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Still need help?</CardTitle>
              <p className="text-center text-slate-600">Contact our support team and we'll get back to you within 24 hours.</p>
            </CardHeader>
            <CardContent className="max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <Input placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <Input placeholder="Enter your last name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input type="email" placeholder="Enter your email address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <Input placeholder="Brief description of your issue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <Textarea 
                    placeholder="Please describe your issue in detail..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button className="w-full bg-primary text-white hover:bg-primary/90">
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}