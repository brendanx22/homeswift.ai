import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Header } from "../components/Header";
import house1 from "../assets/house1.jpg";
import house2 from "../assets/house2.jpg";
import house3 from "../assets/house3.jpg";
import interior1 from "../assets/interior1.jpg";
import interior2 from "../assets/interior2.jpg";
import interior3 from "../assets/interior3.jpg";

const Gallery = ({ showTours = false }) => {
  const navigate = useNavigate();

  // Sample gallery items - in a real app, these would come from an API
  const galleryItems = [
    { 
      id: 1, 
      image: interior1, 
      hasVideo: true,
      title: 'Luxury Villa Tour',
      location: 'Beverly Hills, CA',
      isTour: true
    },
    { 
      id: 2, 
      image: interior2, 
      hasVideo: false,
      title: 'Modern Living Room',
      location: '',
      isTour: false
    },
    { 
      id: 3, 
      image: interior3, 
      hasVideo: false,
      title: 'Gourmet Kitchen',
      location: '',
      isTour: false
    },
    { 
      id: 4, 
      image: house1, 
      hasVideo: true,
      title: 'Beachfront Property Tour',
      location: 'Malibu, CA',
      isTour: true
    },
    { 
      id: 5, 
      image: house2, 
      hasVideo: true,
      title: 'Mountain Retreat Tour',
      location: 'Aspen, CO',
      isTour: true
    },
    { 
      id: 6, 
      image: house3, 
      hasVideo: false,
      title: 'Master Bedroom',
      location: '',
      isTour: false
    },
  ];

  // Filter items based on showTours prop
  const filteredItems = showTours 
    ? galleryItems.filter(item => item.isTour)
    : galleryItems;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showBack 
        onBack={() => navigate(-1)} 
        title={showTours ? 'Virtual Tours' : 'Gallery'} 
      />
      
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {showTours ? 'Virtual Property Tours' : 'Property Gallery'}
          </h1>
          <p className="text-muted-foreground">
            {showTours 
              ? 'Take a virtual tour of our featured properties' 
              : 'Explore every corner of your future home, all in one place'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
            >
              <div className="relative w-full h-full">
                <img
                  src={item.image}
                  alt={item.title || `Gallery item ${item.id}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {(item.hasVideo || item.isTour) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                      <Play className="w-5 h-5 text-foreground fill-current ml-1" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  {item.location && (
                    <p className="text-xs text-gray-300">{item.location}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;