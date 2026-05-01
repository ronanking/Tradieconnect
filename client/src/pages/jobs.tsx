import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import JobCard from "@/components/job-card";
import JobPostModal from "@/components/job-post-modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TRADE_CATEGORIES } from "@/lib/constants";
import { Search, Filter, Plus, MapPin, Calendar, DollarSign, Clock, Star, Eye, MessageSquare, AlertTriangle, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  postcode: string;
  budgetMin?: string;
  budgetMax?: string;
  timeline: string;
  images?: string[];
  createdAt: string;
  status: string;
  acceptedBy?: number;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

// Quote Form Component
function QuoteForm({ 
  onSubmit, 
  isSubmitting 
}: { 
  onSubmit: (data: { price: string; timeline: string; message: string }) => void;
  isSubmitting: boolean;
}) {
  const [price, setPrice] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !timeline || !message) return;
    
    onSubmit({ price, timeline, message });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="price">Your Quote Price *</Label>
        <div className="relative mt-1">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="price"
            type="number"
            placeholder="Enter your quote amount"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="timeline">Completion Timeline *</Label>
        <Select onValueChange={setTimeline} value={timeline}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select completion timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-2 days">1-2 days</SelectItem>
            <SelectItem value="3-5 days">3-5 days</SelectItem>
            <SelectItem value="1 week">1 week</SelectItem>
            <SelectItem value="2 weeks">2 weeks</SelectItem>
            <SelectItem value="3-4 weeks">3-4 weeks</SelectItem>
            <SelectItem value="1-2 months">1-2 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="message">Message to Customer *</Label>
        <Textarea
          id="message"
          placeholder="Introduce yourself, explain your approach, and why you're the right tradie for this job..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 min-h-[120px]"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          Tip: Mention your experience, qualifications, and what makes your service unique
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting || !price || !timeline || !message}>
          {isSubmitting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Submitting Quote...
            </>
          ) : (
            'Submit Quote'
          )}
        </Button>
      </div>
    </form>
  );
}

export default function Jobs() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobType, setJobType] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    queryFn: ({ queryKey }) => 
      fetch(`${queryKey[0]}?limit=50`)
        .then(res => res.json()),
  });

  // Submit quote mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (quoteData: {
      jobId: number;
      price: string;
      timeline: string;
      message: string;
    }) => {
      const response = await apiRequest("POST", `/api/jobs/${quoteData.jobId}/quotes`, {
        tradieId: 1, // Mock tradie ID - would come from auth
        price: quoteData.price,
        timeline: quoteData.timeline,
        message: quoteData.message,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Submitted",
        description: "Your quote has been submitted successfully!",
      });
      setIsQuoteModalOpen(false);
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitQuote = (job: Job) => {
    setSelectedJob(job);
    setIsQuoteModalOpen(true);
  };

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job => {
    let matches = true;
    
    // Tab filtering
    if (activeTab === "open") {
      matches = matches && job.status === "open";
    } else if (activeTab === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matches = matches && new Date(job.createdAt) >= sevenDaysAgo;
    }
    
    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      matches = matches && job.category === selectedCategory;
    }
    
    // Location filter
    if (searchLocation) {
      matches = matches && (
        job.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
        job.postcode.includes(searchLocation)
      );
    }
    
    // Budget filter
    if (budgetRange && budgetRange !== "any-budget") {
      const [min, max] = budgetRange.split('-').map(Number);
      const jobMin = job.budgetMin ? parseInt(job.budgetMin) : 0;
      const jobMax = job.budgetMax ? parseInt(job.budgetMax) : 999999;
      
      if (max) {
        matches = matches && jobMin <= max && jobMax >= min;
      } else {
        matches = matches && jobMax >= min;
      }
    }
    
    // Timeline filter
    if (timelineFilter) {
      matches = matches && job.timeline.toLowerCase().includes(timelineFilter.toLowerCase());
    }
    
    // Advanced filters
    if (dateFilter) {
      const jobDate = new Date(job.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case "today":
          matches = matches && jobDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          matches = matches && jobDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          matches = matches && jobDate >= monthAgo;
          break;
        case "3months":
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          matches = matches && jobDate >= threeMonthsAgo;
          break;
      }
    }
    
    if (experienceLevel) {
      // Match experience level requirements in job description
      const desc = job.description.toLowerCase();
      switch (experienceLevel) {
        case "entry":
          matches = matches && (desc.includes("entry") || desc.includes("beginner") || desc.includes("basic"));
          break;
        case "intermediate":
          matches = matches && (desc.includes("intermediate") || desc.includes("experienced") || desc.includes("skilled"));
          break;
        case "expert":
          matches = matches && (desc.includes("expert") || desc.includes("professional") || desc.includes("specialist"));
          break;
      }
    }
    
    if (jobType) {
      const title = job.title.toLowerCase();
      const desc = job.description.toLowerCase();
      matches = matches && (title.includes(jobType) || desc.includes(jobType));
    }
    
    return matches;
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "budget-high":
        const bMax = parseInt(b.budgetMax || "0");
        const aMax = parseInt(a.budgetMax || "0");
        return bMax - aMax;
      case "budget-low":
        const aMin = parseInt(a.budgetMin || "999999");
        const bMin = parseInt(b.budgetMin || "999999");
        return aMin - bMin;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Jobs</h1>
            <p className="text-slate-600">Find jobs in your area and submit competitive quotes</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsJobModalOpen(true)}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </Button>
          </div>
        </div>

        {/* Job Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="all">All Jobs ({((Array.isArray(jobs) ? jobs : []).length)})</TabsTrigger>
            <TabsTrigger value="open">Open ({(Array.isArray(jobs) ? jobs : []).filter(j => j.status === "open").length})</TabsTrigger>
            <TabsTrigger value="recent">Recent (7 days)</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Main Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search jobs by title, description, or location..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-12 h-12 text-base border-slate-200 focus:border-primary"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="lg:w-48">
                <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                  <SelectTrigger className="h-12 border-slate-200 focus:border-primary">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {TRADE_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="lg:w-48">
                <Select onValueChange={setSortBy} value={sortBy}>
                  <SelectTrigger className="h-12 border-slate-200 focus:border-primary">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="budget-high">Highest Budget</SelectItem>
                    <SelectItem value="budget-low">Lowest Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>



        {/* Expanded More Filters Panel */}
        {showMoreFilters && (
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Advanced Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowMoreFilters(false)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Hide Filters
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Posted Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2">Date Posted</Label>
                  <Select onValueChange={setDateFilter} value={dateFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                      <SelectItem value="3months">Last 3 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2">Experience Level</Label>
                  <Select onValueChange={setExperienceLevel} value={experienceLevel}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any level</SelectItem>
                      <SelectItem value="entry">Entry level</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="expert">Expert required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Type Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2">Job Type</Label>
                  <Select onValueChange={setJobType} value={jobType}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="renovation">Renovation</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Distance Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2">Distance</Label>
                  <Select>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Any distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any distance</SelectItem>
                      <SelectItem value="5km">Within 5km</SelectItem>
                      <SelectItem value="10km">Within 10km</SelectItem>
                      <SelectItem value="25km">Within 25km</SelectItem>
                      <SelectItem value="50km">Within 50km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filter Actions */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="text-sm text-slate-500">
                  {(dateFilter || experienceLevel || jobType) && (
                    <span>Advanced filters applied</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setDateFilter("");
                      setExperienceLevel("");
                      setJobType("");
                    }}
                  >
                    Clear Advanced Filters
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowMoreFilters(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Filters and Results */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <div className="flex flex-col gap-4">
            {/* Quick Filter Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Quick Filter Tags */}
                <Button 
                  variant={timelineFilter === "urgent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimelineFilter(timelineFilter === "urgent" ? "" : "urgent")}
                  className={timelineFilter === "urgent" 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "border-red-200 text-red-700 hover:bg-red-50"
                  }
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Urgent
                </Button>
                <Button 
                  variant={timelineFilter === "asap" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimelineFilter(timelineFilter === "asap" ? "" : "asap")}
                  className={timelineFilter === "asap" 
                    ? "bg-orange-600 hover:bg-orange-700 text-white" 
                    : "border-orange-200 text-orange-700 hover:bg-orange-50"
                  }
                >
                  <Zap className="h-3 w-3 mr-1" />
                  ASAP
                </Button>
                
                {/* Budget Filter */}
                <Select onValueChange={setBudgetRange} value={budgetRange}>
                  <SelectTrigger className="w-40 h-8 text-sm">
                    <DollarSign className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any-budget">Any budget</SelectItem>
                    <SelectItem value="0-500">$0 - $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                    <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                    <SelectItem value="5000">$5,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">View:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  More Filters
                </Button>
              </div>
            </div>

            {/* Results Summary Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                </h2>
                {(selectedCategory !== "all" || searchLocation || budgetRange !== "any-budget" || timelineFilter || dateFilter || experienceLevel || jobType) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedCategory !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedCategory}
                      </Badge>
                    )}
                    {searchLocation && (
                      <Badge variant="secondary" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {searchLocation}
                      </Badge>
                    )}
                    {budgetRange !== "any-budget" && (
                      <Badge variant="secondary" className="text-xs">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {budgetRange === "5000" ? "$5,000+" : `$${budgetRange.replace('-', ' - ')}`}
                      </Badge>
                    )}
                    {timelineFilter && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {timelineFilter.toUpperCase()}
                      </Badge>
                    )}
                    {dateFilter && (
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {dateFilter === "today" ? "Today" : 
                         dateFilter === "week" ? "This week" :
                         dateFilter === "month" ? "This month" : "Last 3 months"}
                      </Badge>
                    )}
                    {experienceLevel && (
                      <Badge variant="secondary" className="text-xs">
                        {experienceLevel === "entry" ? "Entry level" :
                         experienceLevel === "intermediate" ? "Intermediate" : "Expert"}
                      </Badge>
                    )}
                    {jobType && (
                      <Badge variant="secondary" className="text-xs">
                        {jobType.charAt(0).toUpperCase() + jobType.slice(1)}
                      </Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedCategory("all");
                        setSearchLocation("");
                        setBudgetRange("any-budget");
                        setTimelineFilter("");
                        setDateFilter("");
                        setExperienceLevel("");
                        setJobType("");
                      }}
                      className="text-slate-500 hover:text-slate-700 text-xs"
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-slate-500">
                Showing {Math.min(filteredJobs.length, 20)} of {filteredJobs.length} results
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, index) => (
              <Card key={index} className="animate-pulse border-l-4 border-l-slate-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-5 bg-slate-200 rounded w-16"></div>
                          <div className="h-5 bg-slate-200 rounded w-12"></div>
                        </div>
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                      </div>
                      <div>
                        <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                    </div>
                    <div className="flex flex-col items-end gap-4 lg:min-w-[200px]">
                      <div className="w-32 h-24 bg-slate-200 rounded-lg"></div>
                      <div className="space-y-2 w-full">
                        <div className="h-10 bg-slate-200 rounded w-full"></div>
                        <div className="h-8 bg-slate-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSubmitQuote={() => handleSubmitQuote(job)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">No jobs found</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                We couldn't find any jobs matching your current filters. Try expanding your search criteria or checking back later for new opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchLocation("");
                    setBudgetRange("any-budget");
                    setTimelineFilter("");
                  }}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
                <Button onClick={() => setIsJobModalOpen(true)}>
                  Post a New Job
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <JobPostModal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} />

      {/* Quote Submission Modal */}
      {selectedJob && (
        <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Submit Quote for "{selectedJob.title}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Job Summary */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">{selectedJob.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedJob.location}, {selectedJob.postcode}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {selectedJob.budgetMin && selectedJob.budgetMax 
                      ? `$${selectedJob.budgetMin} - $${selectedJob.budgetMax}`
                      : 'Budget TBD'
                    }
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {selectedJob.timeline}
                  </div>
                </div>
              </div>

              {/* Quote Form */}
              <QuoteForm 
                onSubmit={(quoteData) => {
                  submitQuoteMutation.mutate({
                    jobId: selectedJob.id,
                    ...quoteData
                  });
                }}
                isSubmitting={submitQuoteMutation.isPending}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
