import { Bookmark, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export const PropertyCard = ({ image, location, price, duration, type, onClick }) => {
  return (
    <div className="relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300" onClick={onClick}>
      <div className="aspect-[4/3] relative rounded-3xl overflow-hidden">
        <img
          src={image}
          alt={`Property in ${location}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Button variant="ghost" size="icon" className="w-8 h-8 bg-black/40 hover:bg-black/60 text-white">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute top-3 right-3">
          <div 
            className={`text-white text-xs px-3 py-1.5 rounded-full font-medium ${
              type.toLowerCase() === 'for sale' 
                ? 'bg-green-600/90' 
                : 'bg-blue-600/90'
            }`}
          >
            {type}
          </div>
        </div>
      </div>
      
      <div className="px-1 py-3 space-y-1">
        <div className="flex items-center gap-2 text-white text-xl">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-white">₦{price.toLocaleString()}</span>
          <span className="text-sm text-gray-400">/{duration}</span>
        </div>
      </div>
    </div>
  );
};