import React, { useState } from 'react';
import { Menu, Plus, Sparkles, ArrowUp, FileUp, ImageUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const [previewItem, setPreviewItem] = useState(null);
  const previewDropdownRef = React.useRef(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!previewItem) return;
    const handleClickOutside = (event) => {
      if (previewDropdownRef.current && !previewDropdownRef.current.contains(event.target)) {
        setPreviewItem(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [previewItem]);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = React.useRef(null);
  const imageInputRef = React.useRef(null);
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [
    "Modern 2-bedroom apartment downtown",
    "Family home with garden and garage",
    "Studio apartment near university",
    "Luxury condo with ocean view",
    "Cozy cottage in quiet neighborhood"
  ];

  const handleFileUploadClick = () => fileInputRef.current?.click();
  const handleImageUploadClick = () => imageInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFiles(prev => [...prev, file]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedImages(prev => [...prev, file]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSuggestionClick = () => setShowSuggestions(!showSuggestions);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) navigate('/listings');
  };

  const handlePreviewItem = (item) => {
    const file = item.file;
    const textExtensions = [".txt", ".md", ".csv", ".log", ".json", ".xml", ".yaml", ".yml"];
    const docxExtensions = [".docx", ".doc"];
    const isTextType = file.type.startsWith('text/') || textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    const isDocxType = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                      docxExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (item.type === 'file' && isTextType) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewItem({ ...item, fileText: e.target.result });
      reader.readAsText(file);
    } else {
      setPreviewItem({ ...item, isDocxType });
    }
  };

  return (
    <div className={`bg-cover bg-center bg-no-repeat relative ${showSuggestions ? 'min-h-[140vh]' : 'min-h-screen'} px-2 sm:px-6`}
      style={{ backgroundImage: 'url("/Rectangle 135.png")', backgroundSize: 'cover' }}>
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-700/20 via-transparent to-transparent"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-black/20 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <img src="/Group 129.png" alt="HomeSwift Logo" className="w-10 h-10 rounded-lg object-cover" />
          <span className="text-white text-3xl sm:text-4xl font-bold tracking-tight">HomeSwift</span>
        </div>
        
        <button className="text-white hover:bg-white/10 p-2 rounded-lg">
          <Menu size={36} onClick={() => setShowMenu(prev => !prev)} />
        </button>
        
        {showMenu && (
          <div className="absolute top-16 right-4 sm:right-24 border border-gray-400/50 rounded-2xl shadow-2xl z-50 px-2 py-1 sm:px-2 sm:py-2 min-w-[300px] w-[300px]" 
               style={{ background: 'rgba(60,60,60,0.15)' }}>
            <div className="p-2">
              <div className="space-y-1 sm:space-y-1">
                {['Home', 'About', 'Contact', 'Login', 'Profile'].map((item) => (
                  <div key={item} className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-700/50 p-1 sm:p-2 rounded-lg text-sm sm:text-base cursor-pointer select-none">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 pt-24 sm:pt-32">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 max-w-4xl px-2 sm:px-0">
          <h1 className="flex items-center justify-center flex-wrap text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight mt-16 sm:mt-40 gap-2 sm:gap-3">
            <span>Rent & Buy a Home</span>
            <span className="inline-flex items-center">
              <img src="/Group 129.png" alt="HomeSwift Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover" />
            </span>
            <span>Swiftly</span>
          </h1>
          
          <p className="text-gray-300 text-xl md:text-3l font-light max-w-2xl mx-auto">
            Rent or buy a home under 120 seconds with our AI model
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full max-w-4xl relative px-0 sm:px-2">
          {(uploadedFiles.length > 0 || uploadedImages.length > 0) && (
            <div className="mb-2">
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center bg-gray-700/30 text-gray-200 px-2 py-1 rounded-lg text-xs">
                      <span className="mr-2 cursor-pointer underline" onClick={() => handlePreviewItem({ type: 'file', file })}>
                        {file.name}
                      </span>
                      <button type="button" className="ml-1 text-red-400 hover:text-red-600 text-xs px-1" 
                              onClick={() => handleRemoveFile(idx)}>
                        <span className="text-lg font-bold">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="flex items-center bg-gray-700/30 text-gray-200 px-2 py-1 rounded-lg text-xs">
                      <img src={URL.createObjectURL(img)} alt={img.name} className="w-8 h-8 object-cover rounded mr-2 cursor-pointer" 
                           onClick={() => handlePreviewItem({ type: 'image', file: img })} />
                      <span className="mr-2 cursor-pointer underline" 
                            onClick={() => handlePreviewItem({ type: 'image', file: img })}>
                        {img.name}
                      </span>
                      <button type="button" className="ml-1 text-red-400 hover:text-red-600 text-xs px-1" 
                              onClick={() => handleRemoveImage(idx)}>
                        <span className="text-lg font-bold">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSearchSubmit}
                className="relative flex flex-col bg-transparent border border-gray-400/50 rounded-2xl shadow-2xl px-0 py-6 sm:px-2 sm:py-10 min-h-[130px]"
                style={{ background: 'rgba(60,60,60,0.15)' }}>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Describe the kind of house you are looking for..."
              className="w-full bg-transparent text-gray-300 placeholder-gray-400 text-sm sm:text-lg outline-none border-none h-10 sm:h-12 mb-6 sm:mb-10 rounded-xl sm:rounded-2xl px-2 sm:px-4"
              style={{ minWidth: 0, fontSize: '0.875rem' }}
            />
            <div className="flex items-center justify-between absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <button type="button"
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-700/40 hover:bg-gray-600/50 text-gray-300 border border-gray-500"
                        tabIndex={-1}
                        onClick={() => setShowPlusDropdown(prev => !prev)}>
                  <Plus size={18} />
                </button>
                {showPlusDropdown && (
                  <div className="absolute bottom-16 left-0 border border-gray-400/50 rounded-2xl shadow-2xl z-50 px-2 py-1 sm:px-4 sm:py-2 min-w-[220px] w-[220px] h-[90px] sm:h-[120px]" 
                       style={{ background: 'rgba(60,60,60,0.85)' }}>
                    <div className="space-y-2">
                      <button type="button" onClick={handleFileUploadClick} 
                              className="w-full flex items-center gap-2 text-left text-gray-300 hover:text-white hover:bg-gray-700/50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
                        <FileUp size={18} />
                        <span>Upload File</span>
                      </button>
                      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                      <button type="button" onClick={handleImageUploadClick} 
                              className="w-full flex items-center gap-2 text-left text-gray-300 hover:text-white hover:bg-gray-700/50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
                        <ImageUp size={18} />
                        <span className="whitespace-nowrap -mt-1">Upload Image</span>
                      </button>
                      <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
                    </div>
                  </div>
                )}
                <button type="button"
                        onClick={handleSuggestionClick}
                        className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 rounded-full bg-transparent border border-gray-400/50 text-gray-300 font-medium hover:bg-gray-700/30 text-sm sm:text-base">
                  <Sparkles size={18} />
                  <span>Suggestions</span>
                </button>
              </div>
              <button type="submit"
                      className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white shadow-lg border border-gray-400/50 ${!searchText ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ background: 'linear-gradient(180deg, #3a3d42 0%, #23262b 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                      disabled={!searchText}>
                <ArrowUp size={18} />
              </button>
            </div>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 sm:mt-4 border border-gray-400/50 rounded-2xl shadow-2xl z-20 px-2 py-2 sm:px-4 sm:py-4" 
                 style={{ background: 'rgba(60,60,60,0.15)' }}>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Popular Searches</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button key={index}
                            onClick={() => {
                              setSearchText(suggestion);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-700/50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Dropdown */}
        {previewItem && (
          <div ref={previewDropdownRef}
               className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-gray-400/50 rounded-2xl shadow-2xl z-50 flex flex-col items-center justify-center"
               style={{
                 background: 'rgba(60,60,60,0.95)',
                 width: '70vw',
                 height: '70vh',
                 maxWidth: '900px',
                 maxHeight: '900px',
                 overflow: 'hidden',
                 boxSizing: 'border-box',
               }}>
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="text-gray-200 font-bold mb-4 text-2xl">{previewItem.file.name}</div>
              {previewItem.type === 'image' ? (
                <img src={URL.createObjectURL(previewItem.file)}
                     alt={previewItem.file.name}
                     className="max-w-full max-h-[60vh] mb-4 rounded-lg shadow-lg"
                     style={{ objectFit: 'contain' }} />
              ) : previewItem.file.type === 'application/pdf' ? (
                <object data={URL.createObjectURL(previewItem.file)}
                        type="application/pdf"
                        className="w-full h-[60vh] mb-4 rounded-lg shadow-lg bg-white">
                  <div className="text-gray-400 text-lg mb-4">PDF preview not available in this browser.</div>
                  <a href={URL.createObjectURL(previewItem.file)}
                     download={previewItem.file.name}
                     className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800">
                    Download PDF
                  </a>
                </object>
              ) : previewItem.isDocxType ? (
                <div>
                  <div className="text-gray-400 text-lg mb-4">DOCX preview not supported. You can download the file below.</div>
                  <a href={URL.createObjectURL(previewItem.file)}
                     download={previewItem.file.name}
                     className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800">
                    Download DOCX
                  </a>
                </div>
              ) : (previewItem.fileText ? (
                <div className="w-full h-[60vh] overflow-auto bg-gray-900 text-gray-100 p-4 rounded-lg shadow-lg mb-4" 
                     style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {previewItem.fileText}
                </div>
              ) : (
                <div className="text-gray-400 text-lg">File preview not available for this type.</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}