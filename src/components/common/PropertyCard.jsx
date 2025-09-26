import React from 'react';
import { Heart, Share2, MapPin, Bed, Bath, Ruler } from 'lucide-react';

const PropertyCard = ({ property, onClick }) => {
  const {
    title,
    location,
    price,
    duration,
    type,
    beds,
    baths,
    sqft,
    image,
    featured = false
  } = property;

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative pb-[75%] bg-gray-100 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.src = '/images/placeholder-property.jpg';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {featured && (
            <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              Featured
            </span>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            type === 'For Sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {type}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button 
            className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle save/favorite
            }}
          >
            <Heart className="h-4 w-4" />
          </button>
          <button 
            className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle share
            }}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-1">{title}</h3>
          <p className="text-lg font-bold text-blue-600 whitespace-nowrap ml-2">
            {formatPrice(price)}
            {duration && <span className="text-xs font-normal text-gray-500">/{duration}</span>}
          </p>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        
        <div className="flex justify-between pt-3 border-t border-gray-100 text-sm text-gray-500">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1 text-gray-400" />
            <span>{beds} {beds === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1 text-gray-400" />
            <span>{baths} {baths === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          <div className="flex items-center">
            <Ruler className="h-4 w-4 mr-1 text-gray-400" />
            <span>{sqft} sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
