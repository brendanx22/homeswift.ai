import React from 'react';

const dropBase = 'flex items-center justify-center border-2 border-dashed rounded-xl p-8 transition-colors hover:border-[#FF6B35]';

const PropertyImageUpload = ({ images, onChange, brand }) => {
  const inputRef = React.useRef(null);
  const primary = brand?.primary || '#FF6B35';

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const previews = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    onChange?.([...(images || []), ...previews]);
  };

  return (
    <div>
      <label className="block text-[#2C3E50] text-sm font-medium mb-3">Property Images</label>
      <div
        className={`${dropBase}`}
        style={{ borderColor: '#e5e7eb', background: '#f9fafb' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <div className="text-center">
          <div className="text-gray-600 mb-3">Drag and drop property images here or</div>
          <button type="button" className="px-5 py-2.5 rounded-lg text-white font-semibold transition-all hover:shadow-md" style={{ backgroundColor: primary }} onClick={() => inputRef.current?.click()}>
            Select Images
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          <p className="text-xs text-gray-500 mt-3">Supported: JPG, PNG, WEBP (Max 5MB each)</p>
        </div>
      </div>

      {images && images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-5">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={img.url || img} alt={`property-${idx}`} className="w-full h-32 object-cover rounded-xl border-2 border-gray-200" />
              <button
                type="button"
                className="absolute top-2 right-2 text-xs bg-red-500 text-white rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium hover:bg-red-600"
                onClick={() => onChange?.(images.filter((_, i) => i !== idx))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyImageUpload;



