import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TradieCard from "@/components/tradie-card";
import TradieProfileModal from "@/components/tradie-profile-modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { TRADE_CATEGORIES } from "@/lib/constants";

import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Shield, 
  Award,
  ChevronDown,
  SlidersHorizontal,
  Grid3X3,
  List,
  Bookmark,
  Heart,
  Share2,
  MessageCircle,
  Phone,
  Briefcase,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Filter as FilterIcon
} from "lucide-react";

interface Tradie {
  id: number;
  tradeName: string;
  rating: string;
  totalReviews: number;
  user: {
    firstName: string;
    lastName: string;
    location: string;
    profileImage?: string;
  };
}

export default function BrowseTradies() {
  // Get category from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTradieId, setSelectedTradieId] = useState(0);
  const [isTradieModalOpen, setIsTradieModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [savedTradies, setSavedTradies] = useState<number[]>([]);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [instantQuote, setInstantQuote] = useState(false);
  const [priceFilter, setPriceFilter] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);

  const { data: tradies = [], isLoading } = useQuery<Tradie[]>({
    queryKey: ["/api/tradies", selectedCategory],
    queryFn: ({ queryKey }) => {
      const [url, category] = queryKey;
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      params.set("limit", "20");
      return fetch(`${url}?${params}`).then(res => res.json());
    },
  });

  const handleViewProfile = (tradieId: number) => {
    setSelectedTradieId(tradieId);
    setIsTradieModalOpen(true);
  };

  const filteredTradies = (Array.isArray(tradies) ? tradies : []).filter(tradie => {
    // Location filter
    if (searchLocation && !tradie?.user.location.toLowerCase().includes(searchLocation.toLowerCase())) {
      return false;
    }
    
    // Search term filter (searches in name and trade name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = `${tradie?.user.firstName} ${tradie?.user.lastName}`.toLowerCase().includes(searchLower);
      const matchesTradeName = tradie?.tradeName.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesTradeName) return false;
    }
    
    // Rating filter
    if (minRating > 0 && parseFloat(tradie?.rating) < minRating) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return parseFloat(b.rating) - parseFloat(a.rating);
      case 'reviews':
        return b.totalReviews - a.totalReviews;
      case 'name':
        return a.tradeName.localeCompare(b.tradeName);
      case 'location':
        return a.user.location.localeCompare(b.user.location);
      default:
        return 0;
    }
  });

  const services = [
    'Plumbing repairs', 'New installations', 'Emergency service', 'Maintenance',
    'Electrical wiring', 'Lighting', 'Safety inspections', 'Solar panels',
    'Interior painting', 'Exterior painting', 'Wallpaper', 'Decorating',
    'Furniture assembly', 'Custom builds', 'Repairs', 'Renovations'
  ];

  const handleSaveTradie = (tradieId: number) => {
    setSavedTradies(prev => 
      prev.includes(tradieId) 
        ? prev.filter(id => id !== tradieId)
        : [...prev, tradieId]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {selectedCategory ? `${selectedCategory} Tradies` : 'Find Tradies'}
          </h1>
          <p className="text-slate-600 mb-6">
            {selectedCategory 
              ? `Browse skilled ${selectedCategory.toLowerCase()} professionals in your area`
              : 'Browse verified tradies in your area and view their work portfolios'
            }
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl font-bold text-primary mb-1">{filteredTradies.length}</div>
              <div className="text-sm text-slate-600">Available Tradies</div>
              <TrendingUp className="h-4 w-4 text-green-500 mx-auto mt-1" />
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl font-bold text-primary mb-1">4.8</div>
              <div className="text-sm text-slate-600">Average Rating</div>
              <Star className="h-4 w-4 text-yellow-400 mx-auto mt-1" />
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl font-bold text-primary mb-1">2.5k+</div>
              <div className="text-sm text-slate-600">Jobs Completed</div>
              <Briefcase className="h-4 w-4 text-blue-500 mx-auto mt-1" />
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl font-bold text-primary mb-1">24hr</div>
              <div className="text-sm text-slate-600">Avg Response</div>
              <Clock className="h-4 w-4 text-orange-500 mx-auto mt-1" />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button 
              variant={emergencyOnly ? "default" : "outline"} 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setEmergencyOnly(!emergencyOnly)}
            >
              <Calendar className="h-4 w-4" />
              Emergency Service
            </Button>
            <Button 
              variant={instantQuote ? "default" : "outline"} 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setInstantQuote(!instantQuote)}
            >
              <CheckCircle className="h-4 w-4" />
              Instant Quotes
            </Button>
            <Button 
              variant={isVerified ? "default" : "outline"} 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setIsVerified(!isVerified)}
            >
              <Shield className="h-4 w-4" />
              Verified Only
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setSearchLocation("Near me")}
            >
              <MapPin className="h-4 w-4" />
              Near Me
            </Button>
          </div>
        </div>

        {/* Search and Main Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Tradies</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <Select onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)} value={selectedCategory || "all"}>
                <SelectTrigger>
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
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Suburb or postcode"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
              <Select onValueChange={setSortBy} value={sortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Toggle and View Options */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Advanced Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              {(selectedCategory || searchLocation || searchTerm || minRating > 0 || emergencyOnly || instantQuote || isVerified) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("");
                    setSearchLocation("");
                    setSearchTerm("");
                    setMinRating(0);
                    setSelectedServices([]);
                    setIsVerified(false);
                    setEmergencyOnly(false);
                    setInstantQuote(false);
                    setPriceFilter('');
                    setExperienceYears(0);
                  }}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-600">View:</div>
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Rating & Reviews</label>
                <div className="space-y-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`rating-${rating}`}
                        checked={minRating === rating}
                        onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
                      />
                      <label htmlFor={`rating-${rating}`} className="text-sm flex items-center cursor-pointer">
                        {rating === 0 ? 'Any Rating' : (
                          <>
                            {rating}+ <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />
                          </>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Min Experience</label>
                  <Select onValueChange={(value) => setExperienceYears(parseInt(value))} value={experienceYears.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any experience</SelectItem>
                      <SelectItem value="1">1+ years</SelectItem>
                      <SelectItem value="3">3+ years</SelectItem>
                      <SelectItem value="5">5+ years</SelectItem>
                      <SelectItem value="10">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Services Offered</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {services.slice(0, 8).map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox 
                        id={service}
                        checked={selectedServices.includes(service)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedServices([...selectedServices, service]);
                          } else {
                            setSelectedServices(selectedServices.filter(s => s !== service));
                          }
                        }}
                      />
                      <label htmlFor={service} className="text-sm cursor-pointer">{service}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Price & Budget</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Price Range</label>
                    <Select onValueChange={setPriceFilter} value={priceFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any budget</SelectItem>
                        <SelectItem value="budget">Budget friendly ($0-$100)</SelectItem>
                        <SelectItem value="mid">Mid-range ($100-$500)</SelectItem>
                        <SelectItem value="premium">Premium ($500+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="instant-quote"
                      checked={instantQuote}
                      onCheckedChange={setInstantQuote}
                    />
                    <label htmlFor="instant-quote" className="text-sm cursor-pointer flex items-center">
                      <Clock className="h-4 w-4 text-blue-500 mr-1" />
                      Instant quotes available
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Special Features</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="verified"
                      checked={isVerified}
                      onCheckedChange={setIsVerified}
                    />
                    <label htmlFor="verified" className="text-sm cursor-pointer flex items-center">
                      <Shield className="h-4 w-4 text-green-500 mr-1" />
                      Verified tradies only
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="emergency"
                      checked={emergencyOnly}
                      onCheckedChange={setEmergencyOnly}
                    />
                    <label htmlFor="emergency" className="text-sm cursor-pointer flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                      Emergency service available
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                    <Select onValueChange={(value) => setAvailability(value === "any" ? "" : value)} value={availability || "any"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any time</SelectItem>
                        <SelectItem value="today">Available today</SelectItem>
                        <SelectItem value="week">This week</SelectItem>
                        <SelectItem value="month">This month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-slate-900 font-medium">
              {filteredTradies.length} tradie{filteredTradies.length !== 1 ? 's' : ''} found
            </p>
            {(selectedCategory || searchLocation || searchTerm) && (
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("")} className="ml-1 hover:text-slate-900">×</button>
                  </Badge>
                )}
                {searchLocation && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {searchLocation}
                    <button onClick={() => setSearchLocation("")} className="ml-1 hover:text-slate-900">×</button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    {searchTerm}
                    <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-slate-900">×</button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tradies Display */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className={viewMode === 'grid' ? "bg-white rounded-xl p-6 animate-pulse" : "bg-white rounded-lg p-4 animate-pulse"}>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-full mr-4"></div>
                  <div>
                    <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-32"></div>
                  </div>
                </div>
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="aspect-square bg-slate-200 rounded-lg"></div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                  <div className="h-8 bg-slate-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTradies.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTradies.map((tradie) => (
                <TradieCard
                  key={tradie?.id}
                  tradie={tradie}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTradies.map((tradie) => (
                <div key={tradie?.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="relative">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex-shrink-0"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{tradie?.tradeName}</h3>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveTradie(tradie?.id)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Heart className={`h-4 w-4 ${savedTradies.includes(tradie?.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            <div className="flex items-center text-sm text-slate-600">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                              {tradie?.rating} ({tradie?.totalReviews})
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-600 mb-2">{tradie?.user.firstName} {tradie?.user.lastName}</p>
                        <div className="flex items-center text-sm text-slate-500 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {tradie?.user.location}
                          <span className="mx-2">•</span>
                          <Users className="h-4 w-4 mr-1" />
                          5+ years experience
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Available this week
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Instant quotes
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Emergency service
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          Specializes in residential plumbing, bathroom renovations, and emergency repairs. 
                          Licensed and insured with 24/7 availability.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-slate-600">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-600">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-600">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        onClick={() => handleViewProfile(tradie?.id)}
                        className="bg-primary text-white hover:bg-primary/90 w-full"
                      >
                        View Profile
                      </Button>
                      <Button variant="outline" className="w-full">
                        Get Instant Quote
                      </Button>
                      <div className="text-xs text-slate-500 text-center">
                        Typically responds in 2 hours
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No tradies found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your search filters or location</p>
            <Button onClick={() => {
              setSelectedCategory("");
              setSearchLocation("");
              setSearchTerm("");
              setMinRating(0);
              setEmergencyOnly(false);
              setInstantQuote(false);
              setIsVerified(false);
            }}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Saved Tradies Section */}
        {savedTradies.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Saved Tradies ({savedTradies.length})
                </h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSavedTradies([])}>
                Clear All
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedTradies.slice(0, 3).map((tradieId) => {
                const tradie = (Array.isArray(tradies) ? tradies : []).find(t => t.id === tradieId);
                if (!tradie) return null;
                return (
                  <div key={tradieId} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{tradie?.tradeName}</h4>
                        <div className="flex items-center text-sm text-slate-600">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {tradie?.rating}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveTradie(tradieId)}
                        className="text-red-500"
                      >
                        <Heart className="h-4 w-4 fill-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {savedTradies.length > 3 && (
              <div className="text-center mt-4">
                <Button variant="outline" size="sm">
                  View All Saved ({savedTradies.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Load More / Pagination */}
        {filteredTradies.length > 0 && (
          <div className="text-center mt-12 mb-8">
            <Button variant="outline" className="px-8">
              Load More Tradies
            </Button>
            <p className="text-sm text-slate-500 mt-2">
              Showing {filteredTradies.length} of 150+ tradies
            </p>
          </div>
        )}

        {/* Comparison Tool */}
        {savedTradies.length >= 2 && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Compare Saved Tradies
                </h3>
              </div>
              <Button className="bg-orange-500 text-white hover:bg-orange-600">
                Compare Selected ({savedTradies.length})
              </Button>
            </div>
            <p className="text-sm text-slate-600">
              Compare ratings, prices, availability, and services to make the best choice for your project.
            </p>
          </div>
        )}

        {/* Trending Tradies */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-8 border border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-900">Trending This Week</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">Plumbing</div>
              <div className="text-sm text-slate-600">Most requested service</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">Emergency Calls</div>
              <div className="text-sm text-slate-600">45% increase this week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">Same Day</div>
              <div className="text-sm text-slate-600">Average booking time</div>
            </div>
          </div>
        </div>

        {/* Recently Viewed Tradies */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Recently Viewed</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-slate-50 rounded-lg p-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full mb-2"></div>
                <div className="text-sm font-medium text-slate-900">Steve's Plumbing</div>
                <div className="text-xs text-slate-500">Viewed 2 hours ago</div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-sm">
                <Shield className="h-4 w-4" />
                Verified Professionals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-700 mb-3">
                Background checked, licensed, and insured tradies for your peace of mind.
              </p>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 text-xs">
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800 text-sm">
                <DollarSign className="h-4 w-4" />
                Instant Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-700 mb-3">
                Get quotes in minutes, not days. Compare prices and book the best tradie.
              </p>
              <Button variant="outline" size="sm" className="border-green-300 text-green-700 text-xs">
                Get Quote
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800 text-sm">
                <MessageCircle className="h-4 w-4" />
                24/7 Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-purple-700 mb-3">
                Our support team is available around the clock to assist you.
              </p>
              <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 text-xs">
                Contact Support
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-rose-800 text-sm">
                <Award className="h-4 w-4" />
                Quality Guarantee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-rose-700 mb-3">
                100% satisfaction guarantee on all completed work through our platform.
              </p>
              <Button variant="outline" size="sm" className="border-rose-300 text-rose-700 text-xs">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-8 mt-12 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
          <p className="text-slate-300 mb-4">
            Get weekly updates on new tradies in your area and exclusive offers.
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <Input placeholder="Enter your email" className="bg-white" />
            <Button className="bg-primary text-white hover:bg-primary/90">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      <TradieProfileModal 
        isOpen={isTradieModalOpen} 
        onClose={() => setIsTradieModalOpen(false)} 
        tradieId={selectedTradieId}
      />
    </div>
  );
}
