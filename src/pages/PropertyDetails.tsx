import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, User, Bed, Bath, Square, Shield, Lightbulb, Droplets, Building, X, Car, Zap, Home } from "lucide-react";
import { Header } from "@/components/Header";
import { PropertyImageCarousel } from "@/components/PropertyImageCarousel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import house1 from "@/assets/house1.jpg";
import house2 from "@/assets/house2.jpg";
import house3 from "@/assets/house3.jpg";
import interior1 from "@/assets/interior1.jpg";
import interior2 from "@/assets/interior2.jpg";
import interior3 from "@/assets/interior3.jpg";

const PropertyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);

  const propertyImages = [house1, house2, house3, interior1, interior2, interior3];

  const features = [
    { icon: Building, label: "Fenced Compound", active: true },
    { icon: X, label: "Not Furnished", active: false },
    { icon: Car, label: "Near Main Road", active: true },
    { icon: Home, label: "Balcony", active: true },
    { icon: Shield, label: "24/7 Security", active: true },
    { icon: Lightbulb, label: "Pre-paid Light, 12-18hrs/day", active: true },
    { icon: Droplets, label: "Good Water Supply", active: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showBack 
        onBack={() => navigate("/")} 
        title="Property Details" 
      />
      
      <div className="px-6 pb-6 space-y-6">
        {/* Image Carousel */}
        <PropertyImageCarousel 
          images={propertyImages}
          onViewAll={() => navigate("/gallery")}
        />

        {/* Property Info */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            3 - Bedroom Flat at<br />GRA Phase 1
          </h1>
          
          <div className="flex items-center gap-1 text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span>No. 15 Okpanam road, Asaba</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>3</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>2</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>20,000 sq.ft</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-info rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-foreground">Iputa James</span>
            <div className="w-4 h-4 bg-info rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        </div>

        {/* Payment Card */}
        <Card className="p-4 bg-card border-border">
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground">DURATION:</span>
              <div className="text-sm text-foreground">Yearly</div>
            </div>
            
            <div>
              <span className="text-xs text-muted-foreground">PAYMENT BREAKDOWN:</span>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Rent:</span>
                <span className="text-sm text-foreground">₦ 950,000/year</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-2">
              <span className="text-xs text-muted-foreground">TOTAL:</span>
              <div className="text-lg font-bold text-foreground">₦ 950,000</div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              💡 Note: That the agency fee is only 10% of the House rent.
            </div>
            
            <div className="text-xs text-muted-foreground">
              ⚪ I have read and agreed to the Terms of Service
            </div>
          </div>
        </Card>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Description:</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This lovely 3-bedroom apartment (Not furnished) is located in a serene environment 
            with easy access to shops, schools, and transport. Parking space available.
          </p>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">FEATURES:</h3>
          <div className="grid grid-cols-1 gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${
                  feature.active 
                    ? "bg-success text-white" 
                    : "bg-muted text-muted-foreground border border-border"
                }`}>
                  {feature.active ? "✓" : <feature.icon className="h-2.5 w-2.5" />}
                </div>
                <span className="text-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">LOCATION:</h3>
          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">Map View</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowModal(true)}
          >
            Book Space
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-accent"
            onClick={() => navigate("/inquiry")}
          >
            Book Tour
          </Button>
        </div>
      </div>

      <ConfirmationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        type="warning"
        title="Almost Done!"
        message="You're about to request this space for rent. Once submitted, the property owner will reach out to you to finalize payment and lease terms."
        onConfirm={() => {
          setShowModal(false);
          navigate("/inquiry");
        }}
        onCancel={() => setShowModal(false)}
        confirmText="Continue"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PropertyDetails;