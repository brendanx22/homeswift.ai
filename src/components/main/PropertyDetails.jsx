import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  MapPin, 
  User, 
  Bed, 
  Bath, 
  Ruler, 
  Shield, 
  Wifi, 
  Droplets, 
  Home, 
  Car,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  ArrowLeft,
  X,
  Check
} from 'lucide-react';
import Header from '../layout/Header';
import Button from '../common/Button';
import Modal from '../common/Modal';
import house1 from '../../assets/images/house1.jpg';
import house2 from '../../assets/images/house2.jpg';
import house3 from '../../assets/images/house3.jpg';

const PropertyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in a real app, this would be fetched from an API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock property data
        const mockProperty = {
          id: id || '1',
          title: 'Modern Apartment in GRA',
          location: 'GRA Phase 1, Asaba',
          price: 1100000,
          duration: 'year',
          type: 'For Rent',
          beds: 3,
          baths: 2,
          sqft: 1800,
          description: 'Beautiful modern apartment with stunning views. Recently renovated with high-end finishes and appliances. Spacious living areas and large windows for natural light.',
          agent: {
            name: 'John Doe',
            phone: '+1234567890',
            email: 'john@homeswift.com',
            verified: true
          },
          amenities: [
            'Swimming Pool',
            'Gym',
            '24/7 Security',
            'Parking Space',
            'Garden',
            'Water Supply',
            'Power Backup'
          ],
          images: [house1, house2, house3]
        };
        
        setProperty(mockProperty);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
        <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        showBack 
        onBack={() => navigate(-1)}
        title="Property Details"
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Main Image */}
        <div className="mb-6 rounded-xl overflow-hidden bg-gray-200 h-64 md:h-80 lg:h-96">
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Property Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.location}</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.beds} Beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.baths} Baths</span>
            </div>
            <div className="flex items-center">
              <Ruler className="h-4 w-4 mr-1" />
              <span>{property.sqft} sq.ft</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-xl font-bold text-gray-900">
                ₦{property.price.toLocaleString()}
                {property.duration && `/${property.duration}`}
              </p>
            </div>
            <Button 
              onClick={() => setShowModal(true)}
              className="px-6 py-3"
            >
              Contact Agent
            </Button>
          </div>
        </div>
        
        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="text-gray-600 leading-relaxed">
            {property.description}
          </p>
        </div>
        
        {/* Amenities */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Agent Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Contact Agent</h2>
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium text-lg mr-4">
              {property.agent.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{property.agent.name}</p>
              <p className="text-sm text-gray-500">Real Estate Agent</p>
            </div>
            {property.agent.verified && (
              <div className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => window.location.href = `tel:${property.agent.phone}`}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Agent
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => window.location.href = `mailto:${property.agent.email}`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message Agent
            </Button>
          </div>
        </div>
      </div>
      
      {/* Contact Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Contact Agent"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input 
              type="tel" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="I'm interested in this property..."
              defaultValue=""
            ></textarea>
          </div>
          <Button className="w-full">
            Send Message
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PropertyDetails;