import { Bookmark, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export const PropertyCard = ({ image, location, price, duration, type, onClick }) => {
  return (
    <Card 
      className="relative overflow-hidden rounded-3xl cursor-pointer hover:scale-105 transition-transform duration-300"
      onClick={onClick}
    >
      <div className="aspect-[4/3] relative">
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
          <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-medium">
            {type}
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="h-3 w-3" />
          <span>{location}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-foreground">₦ {price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">/{duration}</span>
        </div>
      </div>
    </Card>
  );
};