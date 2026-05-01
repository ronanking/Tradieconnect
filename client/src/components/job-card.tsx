import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, Calendar, Eye, AlertTriangle, ChevronRight, ImageOff } from "lucide-react";
import { memo, useState } from "react";

interface JobCardProps {
  job: {
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
  };
  onSubmitQuote: (job: any) => void;
}

const categoryColors: Record<string, string> = {
  Plumbing: "bg-blue-100 text-blue-800",
  Electrical: "bg-yellow-100 text-yellow-800",
  Carpentry: "bg-amber-100 text-amber-800",
  Painting: "bg-pink-100 text-pink-800",
  Roofing: "bg-orange-100 text-orange-800",
  Landscaping: "bg-green-100 text-green-800",
  Tiling: "bg-cyan-100 text-cyan-800",
  HVAC: "bg-sky-100 text-sky-800",
  Renovation: "bg-purple-100 text-purple-800",
  Cleaning: "bg-teal-100 text-teal-800",
  Handyman: "bg-slate-100 text-slate-800",
};

function JobCard({ job, onSubmitQuote }: JobCardProps) {
  const [imgError, setImgError] = useState(false);

  const timeAgo = (() => {
    const now = new Date();
    const posted = new Date(job.createdAt);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just posted";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  })();

  const budget = job.budgetMin && job.budgetMax
    ? `$${Number(job.budgetMin).toLocaleString()} – $${Number(job.budgetMax).toLocaleString()}`
    : job.budgetMin ? `From $${Number(job.budgetMin).toLocaleString()}` : "Budget TBD";

  const isUrgent = ["urgent", "asap", "immediate", "today"].some(k =>
    job.timeline?.toLowerCase().includes(k)
  );

  const statusConfig: Record<string, { label: string; className: string }> = {
    posted: { label: "Open", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    open: { label: "Open", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800 border-blue-200" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-600 border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const status = statusConfig[job.status] ?? { label: job.status, className: "bg-slate-100 text-slate-700" };

  const catColor = categoryColors[job.category] ?? "bg-violet-100 text-violet-800";
  const hasImage = job.images && job.images.length > 0 && !imgError;
  const initials = `${job.customer.firstName[0]}${job.customer.lastName[0]}`.toUpperCase();
  const isOpen = job.status === "open" || job.status === "posted";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        {/* Left accent bar */}
        <div className={`w-full sm:w-1 flex-shrink-0 ${isOpen ? "bg-emerald-400" : "bg-slate-300"} sm:h-auto h-1`} />

        {/* Main content */}
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-5">

            {/* Content */}
            <div className="flex-1 space-y-4">

              {/* Top row: badges + time */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColor}`}>
                    {job.category}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.className}`}>
                    {status.label}
                  </span>
                  {isUrgent && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="h-3 w-3" /> Urgent
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {timeAgo}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight capitalize mb-1">
                  {job.title}
                </h3>
                {job.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                )}
              </div>

              {/* Details row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{job.location}{job.postcode ? `, ${job.postcode}` : ""}</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <DollarSign className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  {budget}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  {job.timeline}
                </span>
              </div>

              {/* Posted by */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-slate-200 text-slate-600 font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-slate-500">
                  Posted by <span className="font-medium text-slate-700">{job.customer.firstName} {job.customer.lastName[0]}.</span>
                </span>
              </div>
            </div>

            {/* Right side: image + actions */}
            <div className="flex sm:flex-col items-center sm:items-end gap-3 lg:min-w-[160px]">
              {/* Image or placeholder */}
              <div className="w-24 h-20 sm:w-36 sm:h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-center">
                {hasImage ? (
                  <img
                    src={job.images![0]}
                    alt={job.title}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-300">
                    <ImageOff className="h-6 w-6" />
                    <span className="text-xs">No photo</span>
                  </div>
                )}
                {job.images && job.images.length > 1 && !imgError && (
                  <div className="absolute top-1 right-1 bg-slate-900/70 text-white text-xs px-1.5 py-0.5 rounded-md">
                    +{job.images.length - 1}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => onSubmitQuote(job)}
                  disabled={!isOpen}
                  className="text-white text-sm font-semibold px-5 py-2 rounded-xl flex items-center gap-1 w-full justify-center hover:opacity-90" style={{background: "linear-gradient(135deg, hsl(217,71%,24%) 0%, hsl(217,71%,34%) 100%)"}}
                >
                  {isOpen ? "Submit Quote" : "View Details"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl w-full"
                >
                  <Eye className="h-3 w-3 mr-1" /> Full Details
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(JobCard);
