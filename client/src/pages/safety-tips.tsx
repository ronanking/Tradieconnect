import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  FileText, 
  DollarSign, 
  Phone, 
  Camera,
  Lock,
  Eye
} from "lucide-react";

export default function SafetyTips() {
  const safetyTips = [
    {
      category: "Before Hiring",
      icon: Users,
      color: "bg-blue-500",
      tips: [
        {
          title: "Verify Licenses and Insurance",
          description: "Always check that tradies have valid licenses for their trade and current public liability insurance. Ask to see certificates.",
          priority: "critical"
        },
        {
          title: "Check Reviews and Ratings",
          description: "Read previous customer reviews and check their overall rating. Look for consistent positive feedback and professional responses to any issues.",
          priority: "high"
        },
        {
          title: "Get Multiple Quotes",
          description: "Compare at least 3 quotes to understand fair pricing. Be wary of quotes that are significantly higher or lower than others.",
          priority: "medium"
        },
        {
          title: "Verify Identity",
          description: "Ensure the tradie's profile shows verified identity. All our tradies undergo background checks and ID verification.",
          priority: "high"
        }
      ]
    },
    {
      category: "Communication",
      icon: Phone,
      color: "bg-green-500",
      tips: [
        {
          title: "Keep Communication on Platform",
          description: "Use TradieConnect's messaging system for all communication. This provides a record and additional protection.",
          priority: "high"
        },
        {
          title: "Get Everything in Writing",
          description: "Ensure all agreements, changes, and promises are documented in writing through our platform.",
          priority: "critical"
        },
        {
          title: "Be Clear About Expectations",
          description: "Clearly communicate your requirements, timeline, and quality expectations before work begins.",
          priority: "medium"
        },
        {
          title: "Regular Updates",
          description: "Request regular progress updates, especially for longer projects. Use our photo sharing feature to track progress.",
          priority: "medium"
        }
      ]
    },
    {
      category: "Payment Protection",
      icon: DollarSign,
      color: "bg-purple-500",
      tips: [
        {
          title: "Use Platform Payments",
          description: "Always pay through TradieConnect's secure payment system. Never pay cash or transfer money directly.",
          priority: "critical"
        },
        {
          title: "Milestone Payments",
          description: "For large projects, set up milestone payments. Only release payment when each stage is completed satisfactorily.",
          priority: "high"
        },
        {
          title: "No Upfront Payment",
          description: "Legitimate tradies don't require large upfront payments. Be suspicious of requests for significant money before work starts.",
          priority: "critical"
        },
        {
          title: "Keep Payment Records",
          description: "All payments through our platform are automatically recorded. Keep these records for warranty and tax purposes.",
          priority: "medium"
        }
      ]
    },
    {
      category: "During the Job",
      icon: Eye,
      color: "bg-orange-500",
      tips: [
        {
          title: "Monitor Progress",
          description: "Regularly check the work progress and quality. Address any concerns immediately with the tradie.",
          priority: "high"
        },
        {
          title: "Document Everything",
          description: "Take photos of work in progress and completed stages. Use our photo upload feature to create a record.",
          priority: "high"
        },
        {
          title: "Home Security",
          description: "Ensure valuable items are secured. Be present during work hours when possible, especially for indoor projects.",
          priority: "medium"
        },
        {
          title: "Safety Compliance",
          description: "Ensure the tradie follows safety protocols, especially for electrical, plumbing, or structural work.",
          priority: "critical"
        }
      ]
    },
    {
      category: "After Completion",
      icon: CheckCircle,
      color: "bg-emerald-500",
      tips: [
        {
          title: "Thorough Inspection",
          description: "Inspect all work carefully before marking the job as complete. Test everything and check for defects.",
          priority: "critical"
        },
        {
          title: "Get Warranty Information",
          description: "Ensure you receive warranty information for all work and materials. Keep these documents safe.",
          priority: "high"
        },
        {
          title: "Leave Honest Reviews",
          description: "Leave detailed, honest reviews to help other customers. Include photos of the completed work if possible.",
          priority: "medium"
        },
        {
          title: "Keep Documentation",
          description: "Store all project documentation, photos, warranties, and payment records for future reference.",
          priority: "medium"
        }
      ]
    }
  ];

  const warningSignsData = [
    {
      title: "Door-to-Door Solicitation",
      description: "Be very cautious of tradies who knock on your door offering services, especially after storms or claiming to have leftover materials.",
      severity: "high"
    },
    {
      title: "Pressure for Immediate Decision",
      description: "Legitimate tradies don't pressure you to sign contracts or make payments immediately. Take time to consider all options.",
      severity: "high"
    },
    {
      title: "Cash-Only Payments",
      description: "Professional tradies accept various payment methods. Be wary of those who only accept cash or request unusual payment methods.",
      severity: "critical"
    },
    {
      title: "No Fixed Address",
      description: "Ensure the tradie has a legitimate business address and contact details. P.O. boxes alone are not sufficient.",
      severity: "medium"
    },
    {
      title: "Unusually Low Quotes",
      description: "If a quote is significantly lower than others, investigate why. It could indicate poor quality materials or shortcuts.",
      severity: "medium"
    },
    {
      title: "No Written Contract",
      description: "Always insist on a written contract that details scope, timeline, materials, and costs. Verbal agreements are risky.",
      severity: "critical"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-l-red-500";
      case "high": return "border-l-orange-500";
      case "medium": return "border-l-yellow-500";
      default: return "border-l-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Safety Tips</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Your safety and security are our top priorities. Follow these guidelines to ensure 
              a safe and successful experience with tradies on our platform.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Safety Guidelines */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Safety Guidelines</h2>
          <div className="space-y-12">
            {safetyTips.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <div key={categoryIndex}>
                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{category.category}</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {category.tips.map((tip, tipIndex) => (
                      <Card key={tipIndex} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{tip.title}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${getPriorityColor(tip.priority)}`}
                            >
                              {tip.priority}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-600">{tip.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning Signs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Red Flags to Watch For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warningSignsData.map((warning, index) => (
              <Alert key={index} className={`border-l-4 ${getSeverityColor(warning.severity)}`}>
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">{warning.title}</h4>
                  <AlertDescription className="text-slate-600">
                    {warning.description}
                  </AlertDescription>
                </div>
              </Alert>
            ))}
          </div>
        </div>

        {/* Platform Protection Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">How TradieConnect Protects You</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Verification Process</h3>
                <p className="text-sm text-slate-600">All tradies undergo ID verification, license checks, and background screening.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Secure Payments</h3>
                <p className="text-sm text-slate-600">Payments are held securely and only released when you're satisfied with the work.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Documentation</h3>
                <p className="text-sm text-slate-600">All communications and agreements are recorded on our platform for your protection.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">24/7 Support</h3>
                <p className="text-sm text-slate-600">Our support team is available around the clock to help resolve any issues.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Contact */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-xl text-red-800 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Emergency or Safety Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              If you feel unsafe or encounter suspicious behavior, stop work immediately and contact us.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Emergency Hotline</h4>
                <p className="text-red-700">1300 HELP ME (1300 435 763)</p>
                <p className="text-sm text-red-600">Available 24/7</p>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Report Safety Issues</h4>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  Report Issue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}