import React from 'react';

const defaultAmenities = [
  'Parking',
  'Security',
  'Water Supply',
  'Electricity',
  'Furnished',
  'Air Conditioning',
  'Pet Friendly'
];

const chipBase = 'px-4 py-2 rounded-full border text-sm cursor-pointer select-none transition-all hover:shadow-md';

const PropertyFeatures = ({ selectedAmenities = [], onChange, brand }) => {
  const accent = brand?.accent || '#2C3E50';

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      onChange?.(selectedAmenities.filter((a) => a !== amenity));
    } else {
      onChange?.([...selectedAmenities, amenity]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-[#2C3E50] text-sm font-medium">Amenities</label>
      </div>
      <div className="flex flex-wrap gap-3">
        {defaultAmenities.map((a) => (
          <button
            key={a}
            type="button"
            className={`${chipBase}`}
            style={{
              borderColor: selectedAmenities.includes(a) ? accent : '#e5e7eb',
              color: selectedAmenities.includes(a) ? 'white' : '#111827',
              backgroundColor: selectedAmenities.includes(a) ? accent : 'white'
            }}
            onClick={() => toggleAmenity(a)}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PropertyFeatures;



