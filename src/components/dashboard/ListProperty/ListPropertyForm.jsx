import React from 'react';
import PropertyImageUpload from './PropertyImageUpload';
import PropertyFeatures from './PropertyFeatures';

const inputBase = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] transition-colors';

const ListPropertyForm = ({ onSubmit, submitting, errorMessage, successMessage, brand }) => {
  const [values, setValues] = React.useState({
    title: '',
    locationCity: '',
    locationState: '',
    locationCountry: '',
    price: '',
    propertyType: 'apartment',
    rooms: 1,
    bathrooms: 1,
    description: '',
    amenities: [],
    images: []
  });

  const primary = brand?.primary || '#FF6B35';
  const accent = brand?.accent || '#2C3E50';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleNumberChange = (name, value) => {
    setValues((v) => ({ ...v, [name]: Number(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: values.title,
      location: {
        city: values.locationCity,
        state: values.locationState,
        country: values.locationCountry
      },
      price: Number(values.price),
      propertyType: values.propertyType,
      rooms: Number(values.rooms),
      bathrooms: Number(values.bathrooms),
      amenities: values.amenities,
      description: values.description,
      images: values.images // For real uploads switch to FormData in PropertyImageUpload
    };
    onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#2C3E50] text-sm font-medium mb-2">Property Title *</label>
          <input name="title" value={values.title} onChange={handleChange} className={`${inputBase}`} placeholder="e.g., Cozy 2-Bedroom Apartment" required />
        </div>
        <div>
          <label className="block text-[#2C3E50] text-sm font-medium mb-2">Price / Rent *</label>
          <input name="price" type="number" min="0" value={values.price} onChange={handleChange} className={`${inputBase}`} placeholder="e.g., 250000" required />
        </div>
      </div>

      <div>
        <label className="block text-[#2C3E50] text-sm font-medium mb-2">Location *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="locationCity" value={values.locationCity} onChange={handleChange} className={`${inputBase}`} placeholder="City" required />
          <input name="locationState" value={values.locationState} onChange={handleChange} className={`${inputBase}`} placeholder="State" required />
          <input name="locationCountry" value={values.locationCountry} onChange={handleChange} className={`${inputBase}`} placeholder="Country" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[#2C3E50] text-sm font-medium mb-2">Property Type *</label>
          <select name="propertyType" value={values.propertyType} onChange={handleChange} className={`${inputBase} cursor-pointer`} required>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="hostel">Hostel</option>
          </select>
        </div>
        <div>
          <label className="block text-[#2C3E50] text-sm font-medium mb-2">Rooms *</label>
          <input type="number" min="0" value={values.rooms} onChange={(e) => handleNumberChange('rooms', e.target.value)} className={`${inputBase}`} />
        </div>
        <div>
          <label className="block text-[#2C3E50] text-sm font-medium mb-2">Bathrooms *</label>
          <input type="number" min="0" value={values.bathrooms} onChange={(e) => handleNumberChange('bathrooms', e.target.value)} className={`${inputBase}`} />
        </div>
      </div>

      <PropertyFeatures
        selectedAmenities={values.amenities}
        onChange={(amenities) => setValues((v) => ({ ...v, amenities }))}
        brand={{ accent }}
      />

      <div>
        <label className="block text-[#2C3E50] text-sm font-medium mb-2">Description</label>
        <textarea name="description" rows={5} value={values.description} onChange={handleChange} className={`${inputBase} resize-none`} placeholder="Describe your property, neighborhood, and any special terms." />
      </div>

      <PropertyImageUpload
        images={values.images}
        onChange={(images) => setValues((v) => ({ ...v, images }))}
        brand={{ primary }}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: primary }}
          onMouseOver={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#e85e2f')}
          onMouseOut={(e) => !submitting && (e.currentTarget.style.backgroundColor = primary)}
        >
          {submitting ? 'Submitting…' : 'Publish Listing'}
        </button>
        <button
          type="button"
          className="px-6 py-3 rounded-lg border-2 border-gray-300 text-[#2C3E50] font-semibold hover:border-[#2C3E50] hover:bg-gray-50 transition-all"
          onClick={() => {
            alert('Saved as draft locally. Connect to backend to persist.');
          }}
        >
          Save as Draft
        </button>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">⚠ {errorMessage}</div>
      )}
      {successMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">✓ {successMessage}</div>
      )}
    </form>
  );
};

export default ListPropertyForm;


