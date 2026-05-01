import { Button } from "@/components/ui/button";
import { Star, MapPin, Shield, CheckCircle } from "lucide-react";
import { memo } from "react";

interface TradieCardProps {
  tradie: {
    id: number;
    tradeName: string;
    rating: string;
    totalReviews: number;
    user: { firstName: string; lastName: string; location: string; profileImage?: string };
  };
  workPhotos?: string[];
  onViewProfile: (tradieId: number) => void;
}

const WORK_PHOTOS = [
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=200&h=200",
  "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=200&h=200",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=200&h=200",
];

function TradieCard({ tradie, workPhotos = [], onViewProfile }: TradieCardProps) {
  const fullName = `${tradie?.user.firstName} ${tradie?.user.lastName}`;
  const profileImage = tradie?.user.profileImage ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150";
  const displayPhotos = workPhotos.length > 0 ? workPhotos : WORK_PHOTOS;
  const rating = parseFloat(tradie?.rating);
  const primaryStyle = { background: 'linear-gradient(135deg, hsl(217,71%,24%) 0%, hsl(217,71%,34%) 100%)' };

  return (
    <div className="tradie-card bg-white rounded-2xl overflow-hidden cursor-pointer" onClick={() => onViewProfile(tradie?.id)}>
      {/* Work photos strip */}
      <div className="grid grid-cols-3 h-32">
        {displayPhotos.slice(0, 3).map((photo, i) => (
          <img key={i} src={photo} alt={`Work sample ${i + 1}`} className="w-full h-full object-cover" />
        ))}
      </div>

      <div className="p-5">
        {/* Profile row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-shrink-0">
            <img src={profileImage} alt={fullName} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow" />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" title="Online" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm truncate" style={{fontFamily: 'Sora, sans-serif'}}>{fullName}</h3>
            <p className="text-xs text-slate-500 truncate">{tradie?.tradeName}</p>
          </div>
          <div className="ml-auto flex-shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{backgroundColor: 'hsla(217,71%,24%,0.08)', color: 'hsl(217,71%,24%)'}}>
              <Shield className="h-3 w-3" /> Verified
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-800">{tradie?.rating}</span>
          <span className="text-xs text-slate-400">({tradie?.totalReviews} reviews)</span>
        </div>

        {/* Location + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-24">{tradie?.user.location}</span>
          </div>
          <Button
            size="sm"
            className="text-white text-xs font-semibold px-4 rounded-lg"
            style={primaryStyle}
            onClick={(e) => { e.stopPropagation(); onViewProfile(tradie?.id); }}
          >
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(TradieCard);
