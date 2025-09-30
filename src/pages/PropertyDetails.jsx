import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  MapPin, 
  Users, 
  Bath, 
  Square,
  Menu,
  Eye,
  Shield,
  Lightbulb,
  Droplets,
  Home,
  X,
  Building,
  Map
} from 'lucide-react';

const PropertyDetails = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(1);
  const [showAllImages, setShowAllImages] = useState(false);

  const images = [
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const features = [
    { icon: Building, label: 'Fenced Compound', active: true },
    { icon: X, label: 'Not Furnished', active: false },
    { icon: Map, label: 'Near Main Road', active: true },
    { icon: Home, label: 'Balcony', active: true },
    { icon: Shield, label: '24/7 Security', active: true },
    { icon: Lightbulb, label: 'Pre-paid Light, 12-18hrs/day', active: true },
    { icon: Droplets, label: 'Good Water Supply', active: true }
  ];

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      {/* Header */}
    

      {/* Navigation Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-gray-300 transition-colors" />
          <span className="text-sm text-gray-400">Go back</span>
        </div>
        <h1 className="text-lg font-medium">Property Details</h1>
        <Menu className="w-6 h-6" />
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Image Gallery */}
        <div className="relative">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt="Property"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Image Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-orange-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* View All Button */}
          <button
            onClick={() => setShowAllImages(true)}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View all</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div>
              <h2 className="text-3xl font-semibold mb-2">3 - Bedroom Flat at GRA Phase 1</h2>
              <div className="flex items-center text-[#FAFAFA] mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                <span className='text-xl font-medium'>No. 15 Okpanam road, Asaba</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-1" />
                  <span>3</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-5 h-5 mr-1" />
                  <span>2</span>
                </div>
                
              </div>

              {/* Agent Info */}
              <div className="flex items-center mt-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-medium">IJ</span>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Iputa James</span>
                    <div className="w-4 h-4 bg-blue-500 rounded-full ml-2 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description:</h3>
              <p className="text-gray-400 leading-relaxed">
                This lovely 3-bedroom apartment (Not furnished) is located in a serene environment 
                with easy access to shops, schools, and transport. Parking space available.
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">FEATURES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-3 rounded-full border transition-colors 
                  bg-tranparent border-[#525252] text-white
                    }`}
                  >
                    <feature.icon className="w-5 h-5 mr-3" />
                    <span className="text-lg">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#222222] rounded-2xl p-6 sticky top-4">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">DURATION:</div>
                  <div className="text-white">Yearly</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-2">PAYMENT BREAKDOWN</div>
                  <div className="flex justify-between items-center">
                    <span>Rent:</span>
                    <span className="flex items-center">
                      ₦ 950,000 <span className="text-gray-400 text-sm ml-1">/year</span>
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400 mb-2">TOTAL:</div>
                  <div className="text-2xl font-bold">₦ 950,000</div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 border border-gray-500 rounded-sm mt-0.5"></div>
                    <div className="text-sm text-gray-400">
                      <strong>Note:</strong> That the agency fee is only 10% of the House rent.
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 border border-gray-500 rounded-sm mt-0.5"></div>
                    <div className="text-sm text-gray-400">
                      I have read and agreed to the <span className="text-white underline">Terms of Service</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-6">
                  <button className="w-full bg-white text-gray-900 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                    Book Space
                  </button>
                  <button className="w-full border border-gray-600 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                    Book Tour
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        <div>
          <h3 className="text-lg font-semibold mb-4">LOCATION</h3>
          <div className="h-64 bg-gray-800 rounded-2xl overflow-hidden relative">
            {/* Replace the placeholder image with an actual map using an iframe from OpenStreetMap */}
            <iframe
              title="Property Location Map"
              width="100%"
              height="100%"
              className="w-full h-full object-cover rounded-2xl"
              style={{ border: 0, minHeight: '16rem' }}
              loading="lazy"
              allowFullScreen
              src={`https://www.openstreetmap.org/export/embed.html?bbox=3.3792,6.5244,3.3892,6.5344&layer=mapnik&marker=6.5294,3.3842`}
            ></iframe>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
            <div className="absolute top-4 right-4">
             
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <a
              href="https://www.openstreetmap.org/?mlat=6.5294&mlon=3.3842#map=17/6.5294/3.3842"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on OpenStreetMap
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;