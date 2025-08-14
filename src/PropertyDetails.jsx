import React from 'react';
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Ruler } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const PropertyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const property = {
    id: 1,
    title: "GRA Phase 1 Luxury Villa",
    price: "1,100,000",
    type: "For Sale",
    location: "GRA Phase 1, Lagos",
    description: "Beautiful 5-bedroom luxury villa with modern amenities including swimming pool, gym, and 24/7 security.",
    bedrooms: 5,
    bathrooms: 4,
    area: "4500 sq ft",
    features: ["Swimming Pool", "Gym", "24/7 Security", "Smart Home", "Parking"],
    images: ["/property1.jpg", "/property2.jpg", "/property3.jpg"]
  };

  return (
    <div className="min-h-screen bg-[#181A1B] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#181A1B]/95 backdrop-blur-md shadow-lg p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white hover:text-gray-300">
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12 pt-24">
        {/* Image Gallery */}
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-6">
          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button className="p-2 bg-white/30 backdrop-blur-md rounded-full">
              <Heart size={20} className="text-white" />
            </button>
            <button className="p-2 bg-white/30 backdrop-blur-md rounded-full">
              <Share2 size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Property Info */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
            <span className="text-2xl font-bold">₦{property.price}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300 mb-4">
            <MapPin size={16} />
            <span>{property.location}</span>
          </div>

          {/* Property Features */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Bed size={16} />
              <span>{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath size={16} />
              <span>{property.bathrooms} baths</span>
            </div>
            <div className="flex items-center gap-1">
              <Ruler size={16} />
              <span>{property.area}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Description</h2>
            <p className="text-gray-300">{property.description}</p>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Features</h2>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, index) => (
                <span key={index} className="bg-[#23262b] px-3 py-1 rounded-full text-sm">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Agent */}
        <div className="bg-[#23262b] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Contact Agent</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full bg-[#181A1B] border border-gray-700 rounded-lg px-4 py-3" />
            <input type="email" placeholder="Your Email" className="w-full bg-[#181A1B] border border-gray-700 rounded-lg px-4 py-3" />
            <textarea placeholder="Your Message" rows="4" className="w-full bg-[#181A1B] border border-gray-700 rounded-lg px-4 py-3"></textarea>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
              Send Message
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetails;