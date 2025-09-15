import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PropertyCard } from "@/components/PropertyCard";
import house1 from "@/assets/house1.jpg";
import house2 from "@/assets/house2.jpg";
import house3 from "@/assets/house3.jpg";
import house4 from "@/assets/house4.jpg";

const properties = [
  {
    id: "1",
    image: house1,
    location: "GRA Phase 1",
    price: 1100000,
    duration: "year",
    type: "For Rent" as const,
  },
  {
    id: "2",
    image: house2,
    location: "GRA Phase 1",
    price: 1100000,
    duration: "year",
    type: "For Sale" as const,
  },
  {
    id: "3",
    image: house3,
    location: "GRA Phase 1",
    price: 1100000,
    duration: "year",
    type: "For Rent" as const,
  },
  {
    id: "4",
    image: house4,
    location: "GRA Phase 1",
    price: 1100000,
    duration: "year",
    type: "For Sale" as const,
  },
];

const HouseListings = () => {
  const navigate = useNavigate();

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">House Listings</h1>
          <p className="text-muted-foreground">
            Here are the houses that matches your prompt. ⭐
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...properties, ...properties].map((property, index) => (
            <PropertyCard
              key={`${property.id}-${index}`}
              {...property}
              onClick={() => handlePropertyClick(property.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HouseListings;