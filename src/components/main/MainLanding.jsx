import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Plus,
  Sparkles,
  ArrowUp,
  FileUp,
  ImageUp,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  X,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  MoreHorizontal,
} from "lucide-react";
import Sidebar from "./Sidebar";

export default function App() {
  // --- authentication state ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- sidebar and layout state ---
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSmUp, setIsSmUp] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 640px)").matches : true
  );

  // --- preview, uploads, UI state ---
  const [previewItem, setPreviewItem] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const previewDropdownRef = useRef(null);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [showPlusDropdown, setShowPlusDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- chat data ---
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("hs_chat_history_v1");
      return raw ? JSON.parse(raw) : [
        { id: 1, title: "Modern Downtown Apartment", date: "2 hours ago" },
        { id: 2, title: "Family Home with Garden", date: "1 day ago" },
        { id: 3, title: "Luxury Ocean View Condo", date: "3 days ago" },
        { id: 4, title: "Cozy Studio Near Campus", date: "1 week ago" },
        { id: 5, title: "Waterfront Property Search", date: "2 weeks ago" },
        { id: 6, title: "Pet-friendly Apartments", date: "3 weeks ago" },
      ];
    } catch (e) {
      return [];
    }
  });
  const [activeChat, setActiveChat] = useState(null);
  const [hoveredChat, setHoveredChat] = useState(null);

  const suggestions = [
    "Modern 2-bedroom apartment downtown",
    "Family home with garden and garage",
    "Studio apartment near university",
    "Luxury condo with ocean view",
    "Cozy cottage in quiet neighborhood",
  ];

  // --- responsive listener ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 640px)");
    const handler = (e) => setIsSmUp(e.matches);
    try {
      mq.addEventListener("change", handler);
    } catch (e) {
      mq.addListener(handler);
    }
    return () => {
      try {
        mq.removeEventListener("change", handler);
      } catch (e) {
        mq.removeListener(handler);
      }
    };
  }, []);

  // -- persist some state to localStorage --
  useEffect(() => {
    localStorage.setItem("hs_chat_history_v1", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem("hs_compact_v1", JSON.stringify(compactMode));
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem("hs_show_side_v1", JSON.stringify(showSidePanel));
  }, [showSidePanel]);

  useEffect(() => {
    // hydrate compactMode + showSidePanel from storage on mount
    try {
      const c = localStorage.getItem("hs_compact_v1");
      if (c) setCompactMode(JSON.parse(c));
      const s = localStorage.getItem("hs_show_side_v1");
      if (s) setShowSidePanel(JSON.parse(s));
    } catch (e) {
      // noop
    }
  }, []);

  // --- click outside for preview ---
  useEffect(() => {
    if (!previewItem) return;
    const handleClickOutside = (event) => {
      if (previewDropdownRef.current && !previewDropdownRef.current.contains(event.target)) {
        setPreviewItem(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [previewItem]);

  // --- manage object URL for preview (images, pdfs, docx download) ---
  useEffect(() => {
    if (!previewItem || !previewItem.file) {
      setPreviewURL(null);
      return;
    }

    // if we already have fileText (text preview), no objectURL needed
    if (previewItem.fileText) return;

    const url = URL.createObjectURL(previewItem.file);
    setPreviewURL(url);
    return () => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
      setPreviewURL(null);
    };
  }, [previewItem]);

  // --- uploads ---
  const handleFileUploadClick = () => fileInputRef.current?.click();
  const handleImageUploadClick = () => imageInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFiles((p) => [...p, file]);
    e.target.value = null;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadedImages((p) => [...p, file]);
    e.target.value = null;
  };

  const handleRemoveFile = (index) => setUploadedFiles((p) => p.filter((_, i) => i !== index));
  const handleRemoveImage = (index) => setUploadedImages((p) => p.filter((_, i) => i !== index));

  // --- preview logic (text/pdf/image/docx) ---
  const handlePreviewItem = (item) => {
    const file = item.file;
    const textExtensions = [".txt", ".md", ".csv", ".log", ".json", ".xml", ".yaml", ".yml"];
    const docxExtensions = [".docx", ".doc"];
    const isTextType = file.type.startsWith("text/") || textExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    const isDocxType = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || docxExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (item.type === "file" && isTextType) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewItem({ ...item, fileText: e.target.result });
      reader.readAsText(file);
    } else {
      setPreviewItem({ ...item, isDocxType });
    }
  };

  const closePreview = () => setPreviewItem(null);

  // --- suggestions / search ---
  const handleSuggestionClick = () => setShowSuggestions((s) => !s);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchText.trim()) return;
    const newChat = {
      id: Date.now(),
      title: searchText.length > 40 ? searchText.substring(0, 40) + "..." : searchText,
      date: "Just now",
    };
    setChatHistory((p) => [newChat, ...p]);
    setActiveChat(newChat.id);
    setSearchText("");
    setShowPlusDropdown(false);
    setShowSuggestions(false);
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    setChatHistory((p) => p.filter((c) => c.id !== id));
    if (activeChat === id) setActiveChat(null);
  };

  // --- animation variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.45 } } };

  // --- dynamic layout calc ---
  const sidebarWidthPx = compactMode ? 80 : (isSmUp ? 320 : 0);

  return (
    <div className="min-h-screen flex bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/Rectangle 135.png")', backgroundSize: 'cover' }}>
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 relative"
      >
        {/* overlays to darken the hero */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-700/20 via-transparent to-transparent" />


        {/* MAIN area (hero + search) */}
        <div className="relative z-10 transition-all duration-300 md:mt-20">
        <div className="flex flex-col items-center justify-center px-6">
          {/* hero text */}
          <div className="text-center mb-8 sm:mb-12 max-w-4xl px-2 sm:px-0">
            <h1 className="flex items-center justify-center flex-wrap text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight mt-16 sm:mt-40 gap-2 sm:gap-3">
              <span>Rent & Buy a Home</span>
              <span className="inline-flex items-center"><img src="/Group 129.png" alt="logo" className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg object-cover" /></span>
              <span className="italic">Swiftly</span>
            </h1>
            <p className="text-gray-300 text-md md:text-lg font-light max-w-2xl mx-auto">Rent or buy a home under 120 seconds with our AI model</p>
          </div>

          {/* Search + upload area */}
          <div className="w-full max-w-3xl relative px-0 sm:px-2">
            <AnimatePresence>
              {(uploadedFiles.length > 0 || uploadedImages.length > 0) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="mb-2">
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {uploadedFiles.map((file, idx) => (
                        <motion.div key={idx} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, delay: idx * 0.05 }} className="flex items-center bg-gray-700/30 text-gray-200 px-2 py-1 rounded-lg text-xs">
                          <span className="mr-2 cursor-pointer underline" onClick={() => handlePreviewItem({ type: 'file', file })}>{file.name}</span>
                          <motion.button whileHover={{ scale: 1.1 }} type="button" className="ml-1 text-red-400 hover:text-red-600 text-xs px-1" onClick={() => handleRemoveFile(idx)}>
                            <span className="text-lg font-bold">×</span>
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {uploadedImages.map((img, idx) => (
                        <motion.div key={idx} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, delay: idx * 0.05 }} className="flex items-center bg-gray-700/30 text-gray-200 px-2 py-1 rounded-lg text-xs">
                          <img src={URL.createObjectURL(img)} alt={img.name} className="w-8 h-8 object-cover rounded mr-2 cursor-pointer" onClick={() => handlePreviewItem({ type: 'image', file: img })} />
                          <span className="mr-2 cursor-pointer underline" onClick={() => handlePreviewItem({ type: 'image', file: img })}>{img.name}</span>
                          <motion.button whileHover={{ scale: 1.1 }} type="button" className="ml-1 text-red-400 hover:text-red-600 text-xs px-1" onClick={() => handleRemoveImage(idx)}>
                            <span className="text-lg font-bold">×</span>
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form onSubmit={handleSearchSubmit} whileHover={{ scale: 1.005 }} className="relative flex flex-col bg-transparent border border-1 border-[#6c6c6c] rounded-3xl shadow-2xl px-0 py-5 sm:px-2 sm:py-8 min-h-[100px] backdrop-blur-xl" style={{ background: 'rgba(60, 60, 60, 0.15)' }}>
              <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Describe the kind of house you are looking for..." className="w-full bg-transparent text-white placeholder-[#737373] text-sm sm:text-lg outline-none border-none h-10 sm:h-10 mb-6 sm:mb-10 rounded-xl sm:rounded-2xl px-2 sm:px-4"/>

              <div className="flex items-center justify-between absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 w-auto">
                <div className="flex items-center gap-2 sm:gap-3 relative">
                  <button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-transparent hover:bg-gray-700/50 text-gray-300 border border-gray-500" tabIndex={-1} onClick={() => setShowPlusDropdown((s) => !s)}>
                    <Plus size={18} />
                  </button>

                  <AnimatePresence>
                    {showPlusDropdown && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.18 }} className="absolute bottom-14 left-0 border border-gray-400/50 rounded-2xl shadow-2xl z-50 px-2 py-1 sm:px-4 sm:py-2 min-w-[220px] w-[220px] h-[90px] sm:h-[120px] backdrop-blur-xl">
                        <div className="space-y-2">
                          <button onClick={() => { handleFileUploadClick(); setShowPlusDropdown(false); }} className="w-full flex items-center gap-2 text-left text-gray-300 hover:text-white hover:bg-gray-700/50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
                            <FileUp size={18} />
                            <span>Upload File</span>
                          </button>
                          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

                          <button onClick={() => { handleImageUploadClick(); setShowPlusDropdown(false); }} className="w-full flex items-center gap-2 text-left text-gray-300 hover:text-white hover:bg-gray-700/50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
                            <ImageUp size={18} />
                            <span className="whitespace-nowrap -mt-1">Upload Image</span>
                          </button>
                          <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button type="button" onClick={handleSuggestionClick} className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 rounded-full bg-transparent border border-[#E0E0EF4D] text-white font-medium hover:bg-gray-700/20 text-sm sm:text-sm">
                    <Sparkles size={16} />
                    <span>Suggestions</span>
                  </button>
                </div>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white border border-gray-400/50 ${!searchText ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ background: 'linear-gradient(180deg, #3a3d42 0%, #23262b 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} disabled={!searchText}>
                  <ArrowUp size={18} />
                </motion.button>
              </div>
            </motion.form>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 right-0 mt-2 sm:mt-4 border border-gray-400/50 rounded-2xl shadow-2xl z-20 px-2 py-2 sm:px-4 sm:py-4 backdrop-blur-xl" style={{ background: 'rgba(60, 60, 60, 0.15)' }}>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Popular Searches</h3>
                    <div className="space-y-2">
                      {suggestions.map((sug, idx) => (
                        <button key={idx} onClick={() => { setSearchText(sug); setShowSuggestions(false); }} className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-700/50 p-2 sm:p-2 rounded-lg text-sm sm:text-base">{sug}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* preview modal */}
        <AnimatePresence>
          {previewItem && (
            <motion.div ref={previewDropdownRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }} className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-gray-400/50 rounded-2xl shadow-2xl z-50 flex flex-col items-center justify-center backdrop-blur-xl" style={{ background: 'rgba(60, 60, 60, 0.95)', width: '70vw', height: '70vh', maxWidth: '900px', maxHeight: '900px', overflow: 'hidden', boxSizing: 'border-box' }}>
              <div className="flex items-center justify-between w-full px-6 pt-4">
                <div className="text-gray-200 font-bold text-lg truncate">{previewItem.file?.name}</div>
                <div className="flex items-center gap-2">
                  <button onClick={closePreview} className="p-1 rounded hover:bg-gray-700/50"><X size={18} className="text-gray-300" /></button>
                </div>
              </div>

              <div className="flex-1 w-full px-6 py-4 overflow-auto flex items-start justify-center">
                {previewItem.type === 'image' ? (
                  <img src={previewURL} alt={previewItem.file.name} className="max-w-full max-h-[60vh] rounded-lg shadow-lg object-contain" />
                ) : previewItem.file?.type === 'application/pdf' ? (
                  <object data={previewURL} type="application/pdf" className="w-full h-[60vh] rounded-lg shadow-lg bg-white">
                    <div className="text-gray-400 text-lg mb-4">PDF preview not available in this browser.</div>
                    <a href={previewURL} download={previewItem.file?.name} className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800">Download PDF</a>
                  </object>
                ) : previewItem.isDocxType ? (
                  <div className="text-center">
                    <div className="text-gray-400 text-lg mb-4">DOCX preview not supported. You can download the file below.</div>
                    <a href={previewURL} download={previewItem.file?.name} className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800">Download DOCX</a>
                  </div>
                ) : previewItem.fileText ? (
                  <div className="w-full h-[60vh] overflow-auto bg-gray-900 text-gray-100 p-4 rounded-lg shadow-lg" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{previewItem.fileText}</div>
                ) : (
                  <div className="text-gray-400 text-lg">File preview not available for this type.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}