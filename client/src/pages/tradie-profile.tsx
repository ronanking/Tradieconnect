import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Briefcase, Calendar, Phone, Mail } from "lucide-react";

interface TradieProfile {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location: string;
    profileImage?: string;
  };
  tradeName: string;
  license?: string;
  insurance?: string;
  yearsExperience?: number;
  rating: string;
  totalReviews: number;
  totalJobs: number;
  responseTime?: string;
  bio?: string;
  servicesOffered?: string[];
  hourlyRate?: string;
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

export default function TradieProfile() {
  const { id } = useParams<{ id: string }>();
  const tradieId = parseInt(id || "0");

  const { data: tradie, isLoading: tradieLoading } = useQuery<TradieProfile>({
    queryKey: ["/api/tradies", tradieId],
    enabled: tradieId > 0,
  });

  const { data: workPhotos = [] } = useQuery<WorkPhoto[]>({
    queryKey: ["/api/tradies", tradieId, "photos"],
    enabled: tradieId > 0,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/tradies", tradieId, "reviews"],
    enabled: tradieId > 0,
  });

  if (tradieLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!tradie) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Tradie Not Found</h1>
          <p className="text-slate-600">The tradie profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const fullName = `${tradie?.user.firstName} ${tradie?.user.lastName}`;
  const profileImage = tradie?.user.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row">
            <div className="flex items-center mb-6 lg:mb-0">
              <img
                src={profileImage}
                alt={`${fullName} profile photo`}
                className="w-32 h-32 rounded-full object-cover mr-8"
              />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{fullName}</h1>
                <p className="text-xl text-slate-600 mb-3">{tradie?.tradeName}</p>
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(parseFloat(tradie?.rating)) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-slate-600 font-medium">{tradie?.rating} ({tradie?.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center text-slate-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{tradie?.user.location}</span>
                </div>
                {tradie?.hourlyRate && (
                  <div className="text-lg font-semibold text-primary">
                    ${tradie?.hourlyRate}/hour
                  </div>
                )}
              </div>
            </div>

            <div className="lg:ml-auto">
              <div className="grid grid-cols-3 gap-6 text-center mb-6">
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

              <div className="flex flex-col gap-3">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Tradie
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {tradie?.bio && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">About</h2>
                <p className="text-slate-600 leading-relaxed">{tradie?.bio}</p>
              </div>
            )}

            {/* Work Portfolio */}
            {((Array.isArray(workPhotos) ? workPhotos : []).length) > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Work Portfolio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

            {/* Reviews */}
            {((Array.isArray(reviews) ? reviews : []).length) > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Reviews</h2>
                <div className="space-y-6">
                  {(Array.isArray(reviews) ? reviews : []).map((review) => (
                    <div key={review.id}>
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400 mr-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                        <span className="font-medium text-slate-900">{review.customer.firstName}</span>
                        <span className="text-slate-600 text-sm ml-auto">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-slate-600 leading-relaxed">{review.comment}</p>
                      )}
                      {reviews.indexOf(review) < ((Array.isArray(reviews) ? reviews : []).length) - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Services */}
            {tradie?.servicesOffered && tradie?.servicesOffered.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {tradie?.servicesOffered.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Credentials */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Credentials</h3>
              <div className="space-y-3">
                {tradie?.license && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">License: {tradie?.license}</span>
                  </div>
                )}
                {tradie?.insurance && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">Insurance: {tradie?.insurance}</span>
                  </div>
                )}
                {tradie?.yearsExperience && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">{tradie?.yearsExperience} years experience</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Get in Touch</h3>
              <div className="space-y-3">
                {tradie?.user.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">{tradie?.user.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="text-sm text-slate-600">{tradie?.user.email}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="text-sm text-slate-600">{tradie?.user.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
