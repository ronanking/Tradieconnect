import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Clock, Briefcase, Calendar, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface TradieProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradieId: number;
}

interface TradieProfile {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    location: string;
    profileImage?: string;
  };
  tradeName: string;
  rating: string;
  totalReviews: number;
  totalJobs: number;
  yearsExperience?: number;
  responseTime?: string;
  bio?: string;
  servicesOffered?: string[];
}

interface WorkPhoto {
  id: number;
  imageUrl: string;
  description?: string;
  jobCategory?: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  customer: {
    firstName: string;
  };
}

export default function TradieProfileModal({ isOpen, onClose, tradieId }: TradieProfileModalProps) {
  const { data: tradie, isLoading: tradieLoading } = useQuery<TradieProfile>({
    queryKey: ["/api/tradies", tradieId],
    enabled: isOpen && tradieId > 0,
  });

  const { data: workPhotos = [] } = useQuery<WorkPhoto[]>({
    queryKey: ["/api/tradies", tradieId, "photos"],
    enabled: isOpen && tradieId > 0,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/tradies", tradieId, "reviews"],
    enabled: isOpen && tradieId > 0,
  });

  if (tradieLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!tradie) return null;

  const fullName = `${tradie?.user.firstName} ${tradie?.user.lastName}`;
  const profileImage = tradie?.user.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <img
                src={profileImage}
                alt={`${fullName} profile photo`}
                className="w-20 h-20 rounded-full object-cover mr-6"
              />
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
                <p className="text-slate-600 mb-2">{tradie?.tradeName}</p>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(parseFloat(tradie?.rating)) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-slate-600">{tradie?.rating} ({tradie?.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{tradie?.user.location}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-6 mb-6 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900">{tradie?.totalJobs}</div>
              <div className="text-sm text-slate-600">Jobs Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{tradie?.yearsExperience || 0}</div>
              <div className="text-sm text-slate-600">Years Experience</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{tradie?.responseTime || "N/A"}</div>
              <div className="text-sm text-slate-600">Avg Response</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <Button className="flex-1 bg-primary text-white hover:bg-primary/90">
              Send Message
            </Button>
            <Button variant="outline" className="flex-1">
              Request Quote
            </Button>
          </div>

          <Separator className="mb-6" />

          {/* About Section */}
          {tradie?.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">About</h3>
              <p className="text-slate-600">{tradie?.bio}</p>
            </div>
          )}

          {/* Services Section */}
          {tradie?.servicesOffered && tradie?.servicesOffered.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Services</h3>
              <div className="flex flex-wrap gap-2">
                {tradie?.servicesOffered.map((service, index) => (
                  <Badge key={index} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Work Portfolio */}
          {((Array.isArray(workPhotos) ? workPhotos : []).length) > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Work Portfolio</h3>
              <div className="grid grid-cols-3 gap-3">
                {(Array.isArray(workPhotos) ? workPhotos : []).map((photo) => (
                  <div key={photo.id} className="aspect-square">
                    <img
                      src={photo.imageUrl}
                      alt={photo.description || "Work sample"}
                      className="w-full h-full object-cover rounded-lg hover:opacity-90 cursor-pointer transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {((Array.isArray(reviews) ? reviews : []).length) > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {(Array.isArray(reviews) ? reviews : []).slice(0, 3).map((review) => (
                  <div key={review.id} className="border-l-4 border-primary pl-4">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <span className="font-medium text-slate-900">{review.customer.firstName}</span>
                      <span className="text-slate-600 text-sm ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-slate-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
