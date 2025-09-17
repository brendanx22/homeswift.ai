import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MapPin, User, Bed, Bath, Square, Shield, Lightbulb, Droplets, Building, X, Car, Zap, Home, Heart, Share2, MessageSquare, Phone, Calendar, Map, ArrowRight, Star } from "lucide-react";
import { Header } from "../components/Header";
import { PropertyImageCarousel } from "../components/PropertyImageCarousel";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { useToast } from "../components/ui/use-toast";
import { Skeleton } from "../components/ui/skeleton";
import { supabase } from "../lib/supabase";
import house1 from "../assets/house1.jpg";
import house2 from "../assets/house2.jpg";
import house3 from "../assets/house3.jpg";
import interior1 from "../assets/interior1.jpg";
import interior2 from "../assets/interior2.jpg";
import interior3 from "../assets/interior3.jpg";

const PropertyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [features, setFeatures] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        
        // Get Supabase client
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }
        
        // Fetch property data from Supabase
        const { data: propertyData, error } = await supabase
          .from('properties')
          .select(`
            *,
            agent:profiles!properties_agent_id_fkey (
              id,
              full_name,
              email,
              phone,
              avatar_url,
              rating
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!propertyData) throw new Error('Property not found');
        
        // Format property data to match frontend expectations
        const formattedProperty = {
          ...propertyData,
          title: propertyData.title || `${propertyData.bedrooms} Bedroom ${propertyData.property_type || 'Property'}`,
          address: propertyData.address || `${propertyData.city ? propertyData.city + ', ' : ''}${propertyData.state || ''}`,
          price: parseFloat(propertyData.price) || 0,
          period: propertyData.rental_period?.toLowerCase() || 'month',
          status: propertyData.status || 'For Rent',
          beds: propertyData.bedrooms || 0,
          baths: propertyData.bathrooms || 0,
          area: propertyData.area || 0,
          type: propertyData.property_type || 'Residential',
          description: propertyData.description || 'No description available',
          images: Array.isArray(propertyData.images) ? propertyData.images : [propertyData.images].filter(Boolean),
          features: propertyData.features || [
            { label: 'Air Conditioning', active: propertyData.has_air_conditioning, icon: 'snowflake' },
            { label: 'Heating', active: propertyData.has_heating, icon: 'thermometer' },
            { label: 'Parking', active: propertyData.has_parking, icon: 'car' },
            { label: 'Furnished', active: propertyData.is_furnished, icon: 'couch' },
            { label: 'Pets Allowed', active: propertyData.pets_allowed, icon: 'paw' },
            { label: 'Laundry', active: propertyData.has_laundry, icon: 'tshirt' },
            { label: 'WiFi', active: propertyData.has_wifi, icon: 'wifi' },
            { label: 'Swimming Pool', active: propertyData.has_pool, icon: 'water' },
          ],
          agent: propertyData.agent ? {
            id: propertyData.agent.id,
            name: propertyData.agent.full_name || 'Property Agent',
            email: propertyData.agent.email || '',
            phone: propertyData.agent.phone || '',
            image: propertyData.agent.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg',
            rating: propertyData.agent.rating || 4.8
          } : {
            id: '1',
            name: 'Property Agent',
            email: '',
            phone: '',
            image: 'https://randomuser.me/api/portraits/lego/1.jpg',
            rating: 4.8
          }
        };

        setProperty(formattedProperty);
        setFeatures(formattedProperty.features);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load property details',
          variant: 'destructive',
        });
        // Redirect to properties list if property not found
        if (error.message.includes('not found')) {
          setTimeout(() => navigate('/app/properties'), 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate, toast]);

  const handleSaveProperty = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to save properties');
      }

      if (isSaved) {
        // Remove from saved properties
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('property_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Property removed from saved properties',
        });
      } else {
        // Add to saved properties
        const { error } = await supabase
          .from('saved_properties')
          .upsert({
            property_id: id,
            user_id: user.id,
            saved_at: new Date().toISOString()
          });

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Property saved successfully',
        });
      }
      
      // Toggle saved state
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update saved properties',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title || 'Property Listing',
          text: `Check out this ${property.type || 'property'} in ${property.location || 'a great location'}`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied to clipboard',
          description: 'Share this link with others',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      if (error.name !== 'AbortError') {
        toast({
          title: 'Error',
          description: 'Failed to share property',
          variant: 'destructive',
        });
      }
    }
  };

  const handleContactAgent = () => {
    // In a real app, this would open a chat or call the agent
    if (property?.agent?.phone) {
      window.location.href = `tel:${property.agent.phone}`;
    }
  };

  if (isLoading || !property) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header showBack onBack={() => window.history.back()} title="Loading..." />
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-xl" />
              
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-1/4" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 bg-gray-800 rounded-xl space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle view all images
  const handleViewAllImages = () => {
    navigate(`/app/properties/${id}/gallery`, {
      state: { 
        images: property.images || [],
        propertyId: property.id,
        propertyTitle: property.title
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        showBack 
        onBack={() => window.history.back()} 
        title="Property Details"
      />
      
      <div className="pb-24 max-w-6xl mx-auto">
        {/* Property Images */}
        <div className="relative">
          <PropertyImageCarousel 
            images={property.images}
            onViewAll={handleViewAllImages}
            className="rounded-b-2xl overflow-hidden shadow-xl"
          />
          <div className="absolute bottom-4 right-4">
            <Button 
              onClick={handleViewAllImages}
              variant="outline" 
              className="bg-black/70 text-white border-gray-600 hover:bg-black/80 hover:text-white backdrop-blur-sm"
            >
              View All {property.images.length} Photos
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 md:px-8 pt-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="flex-1">
              {/* Property Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-gray-300 mb-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{property.address}</span>
                  </div>
                  
                  {/* Price and Status */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-2xl font-bold text-white">
                      ₦{property.price.toLocaleString()}
                      <span className="text-gray-400 text-lg font-normal">/{property.period}</span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.status === 'For Sale' 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-full bg-gray-800 text-white hover:bg-gray-700" 
                    onClick={handleSaveProperty}
                  >
                    <Heart className={`h-6 w-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-full bg-gray-800 text-white hover:bg-gray-700"
                    onClick={handleShare}
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                  <Button 
                    onClick={handleContactAgent}
                    className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-medium"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Agent
                  </Button>
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-300 mb-1">
                    <Bed className="h-5 w-5 text-primary" />
                    <span className="font-medium">Bedrooms</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{property.beds}</span>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-300 mb-1">
                    <Bath className="h-5 w-5 text-blue-400" />
                    <span className="font-medium">Bathrooms</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{property.baths}</span>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-300 mb-1">
                    <Square className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Area</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{property.area} sq.ft</span>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-300 mb-1">
                    <Building className="h-5 w-5 text-yellow-400" />
                    <span className="font-medium">Type</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{property.type}</span>
                </div>
              </div>

              {/* Property Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">About this property</h2>
                <p className="text-gray-300 leading-relaxed">{property.description}</p>
              </div>

              {/* Agent Section */}
              <div className="bg-gray-800/50 p-6 rounded-xl mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img 
                      src={property.agent.image} 
                      alt={property.agent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{property.agent.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span>Agent</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1">{property.agent.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-white hover:bg-gray-700"
                    onClick={() => window.location.href = `tel:${property.agent.phone}`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-white hover:bg-gray-700"
                    onClick={() => window.location.href = `mailto:${property.agent.email}`}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>

              {/* Features & Amenities */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        feature.active ? 'bg-green-500/10' : 'bg-gray-800/50'
                      }`}>
                        <feature.icon className={`h-5 w-5 ${
                          feature.active ? 'text-green-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <span className={`${feature.active ? 'text-white' : 'text-gray-400'}`}>
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Payment Card */}
            <div className="w-full lg:w-96">
              <div className="sticky top-6">
                <Card className="p-6 bg-gray-800 border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-6">Schedule a Viewing</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Select Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Select Time
                      </label>
                      <select className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>9:00 AM - 10:00 AM</option>
                        <option>10:00 AM - 11:00 AM</option>
                        <option>2:00 PM - 3:00 PM</option>
                        <option>4:00 PM - 5:00 PM</option>
                      </select>
                    </div>

                    <Button 
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium mt-4"
                      onClick={() => setShowModal(true)}
                    >
                      Schedule Viewing
                    </Button>

                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Pricing Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Rent ({property.period}ly)</span>
                          <span className="text-white">₦{property.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Agency Fee (10%)</span>
                          <span className="text-white">₦{(property.price * 0.1).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-700 mt-2">
                          <span className="text-white">Total</span>
                          <span className="text-white">₦{(property.price * 1.1).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Safe & Secure</h4>
                      <p className="text-xs text-gray-400">Your information is protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type="success"
        title="Viewing Scheduled!"
        message="Your viewing has been scheduled successfully. The property agent will contact you shortly to confirm the details."
        confirmText="Done"
        onConfirm={() => {
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default PropertyDetails;