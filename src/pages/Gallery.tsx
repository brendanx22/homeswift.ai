import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Header } from "@/components/Header";
import house1 from "@/assets/house1.jpg";
import house2 from "@/assets/house2.jpg";
import house3 from "@/assets/house3.jpg";
import interior1 from "@/assets/interior1.jpg";
import interior2 from "@/assets/interior2.jpg";
import interior3 from "@/assets/interior3.jpg";

const Gallery = () => {
  const navigate = useNavigate();

  const galleryItems = [
    { id: 1, image: interior1, hasVideo: true },
    { id: 2, image: interior1, hasVideo: false },
    { id: 3, image: interior2, hasVideo: false },
    { id: 4, image: interior3, hasVideo: true },
    { id: 5, image: house3, hasVideo: false },
    { id: 6, image: house1, hasVideo: false },
    { id: 7, image: interior1, hasVideo: false },
    { id: 8, image: house3, hasVideo: false },
    { id: 9, image: house1, hasVideo: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showBack 
        onBack={() => navigate("/property/1")} 
        title="Gallery" 
      />
      
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gallery</h1>
          <p className="text-muted-foreground">
            Explore every corner of your future home, all in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
            >
              <img
                src={item.image}
                alt={`Gallery item ${item.id}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {item.hasVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="h-5 w-5 text-black ml-1" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;