import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Bed, Bath, Ruler, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = React.useState(false);
  
  const handleCardClick = (e) => {
    // Don't navigate if clicking on favorite button
    if (e.target.closest('button')) return;
    navigate(`/property/${property.id}`);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
    >
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        <img 
          src={property.images?.[0]?.image_url || '/placeholder-property.jpg'} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        <button 
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            size={20} 
            className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'} 
          />
        </button>
        {property.isNew && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
            New
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center text-yellow-500">
            <Star size={14} className="fill-yellow-500" />
            <span className="ml-1 text-sm font-medium text-gray-700">
              {property.rating || '4.8'}
            </span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-500">{property.reviewCount || '12'} reviews</span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {property.title || 'Modern Apartment'}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <MapPin size={14} className="mr-1 text-gray-400" />
          <span className="line-clamp-1">{property.address || '123 Main St, City'}</span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between">
            <div className="flex items-center text-gray-600 text-sm">
              <Bed size={16} className="mr-1 text-gray-400" />
              <span>{property.bedrooms || 2} beds</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Bath size={16} className="mr-1 text-gray-400" />
              <span>{property.bathrooms || 2} baths</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Ruler size={16} className="mr-1 text-gray-400" />
              <span>{property.area ? `${property.area} sqft` : '1,200 sqft'}</span>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <div>
              <span className="text-lg font-bold text-gray-900">
                ${property.price?.toLocaleString() || '1,200'}
              </span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <button 
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                // Handle view details
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
