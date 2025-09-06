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
  Search,
  User,
  Bell,
  Heart,
  Home,
  Calculator,
  MapPin,
  Camera,
  Filter,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2
} from "lucide-react";
import { searchProperties, getFeaturedProperties } from "../../data/dummyProperties";
import { useAuth } from "../auth/AuthProvider";

export default function MainLanding() {
  // --- authentication state ---
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  // --- property search state ---
  const [searchResults, setSearchResults] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);

  // --- sidebar and layout state ---
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
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

  // --- handle auth states ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user && !loading) {
    navigate('/login');
    return null;
  }


  // Initialize featured properties on component mount
  useEffect(() => {
    setFeaturedProperties(getFeaturedProperties());
  }, []);

  // Handle search functionality
  const handleSearch = (query = searchText) => {
    if (query.trim()) {
      const results = searchProperties(query);
      setSearchResults(results);
      // Navigate to listings page with search results
      navigate('/listings', { state: { searchResults: results, query } });
    }
  };


  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  // --- chat data ---

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
    
    // Use the property search functionality
    handleSearch();
    
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

  // Remove conflicting auth logic - AuthProvider handles this

  // Set body background
  useEffect(() => {
    document.body.style.backgroundImage = 'url("/Rectangle 135.png")';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    
    return () => {
      // Cleanup on unmount
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`${showSuggestions ? 'min-h-[140vh]' : 'min-h-screen'} relative`}
    >
      {/* overlays to darken the hero */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-700/20 via-transparent to-transparent" />

      {/* Left floating open-button (small screens) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSidePanel(true)}
        className="fixed left-4 top-4 z-30 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800/70 text-white border border-gray-600/50 backdrop-blur-sm sm:hidden"
        aria-label="Open chat sidebar"
      >
        <MessageSquare size={20} />
      </motion.button>

      {/* Sidebar (ChatGPT-style) */}
      <AnimatePresence>
        {showSidePanel && (
          <>
            {/* mobile overlay to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              onClick={() => setShowSidePanel(false)}
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className={`fixed left-0 top-0 z-50 h-full backdrop-blur-xl flex flex-col border-r border-gray-800/50 ${compactMode ? 'w-16' : 'w-64'}`}
              style={{ background: 'rgba(15, 15, 15, 0.95)' }}
            >
              {/* HomeSwift sidebar header */}
              <div className="p-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-12 mt-8">
                  <div className="flex items-center gap-2">
                    {compactMode ? (
                      <div className="flex justify-center w-full">
                        <img src="/Group 129.png" alt="HomeSwift Logo" className="w-10 h-10 rounded-lg object-cover" />
                      </div>
                    ) : (
                      <>
                        <img src="/Group 129.png" alt="HomeSwift Logo" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-white font-semibold text-lg">HomeSwift</span>
                      </>
                    )}
                  </div>

                  {!compactMode && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCompactMode((s) => !s)}
                        className="hidden sm:inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
                        title={compactMode ? 'Expand sidebar' : 'Collapse sidebar'}
                      >
                        {compactMode ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                      </button>

                      <button 
                        onClick={() => setShowSidePanel(false)} 
                        className="sm:hidden p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {compactMode && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setCompactMode((s) => !s)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
                      title="Expand sidebar"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* HomeSwift sidebar navigation */}
              <div className="flex-1 overflow-y-auto px-2 pb-2 mt-8 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="space-y-1">
                  {[
                    { icon: Home, label: 'Browse Homes', active: true },
                    { icon: Search, label: 'Property Search' },
                    { icon: Heart, label: 'Saved Properties' },
                    { icon: MapPin, label: 'Neighborhood Guide' },
                    { icon: Calculator, label: 'Mortgage Calculator' },
                    { icon: Camera, label: 'Virtual Tours' },
                    { icon: Filter, label: 'Advanced Filters' },
                    { icon: Clock, label: 'Recent Searches' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, delay: idx * 0.05 }}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                        item.active 
                          ? 'bg-gray-800/80 text-white' 
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      <item.icon size={18} className="flex-shrink-0" />
                      {!compactMode && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                {/* Chat History */}
                {!compactMode && (
                  <div className="mt-6 px-1">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recent</h3>
                    <div className="space-y-1">
                      {chatHistory.slice(0, 5).map((chat) => (
                        <motion.div
                          key={chat.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18 }}
                          onMouseEnter={() => setHoveredChat(chat.id)}
                          onMouseLeave={() => setHoveredChat(null)}
                          onClick={() => { 
                            setActiveChat(chat.id); 
                            if (!isSmUp) setShowSidePanel(false); 
                          }}
                          className={`group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            activeChat === chat.id 
                              ? 'bg-gray-800/80 text-white' 
                              : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{chat.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{chat.date}</p>
                          </div>

                          {(hoveredChat === chat.id || activeChat === chat.id) && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button 
                                onClick={(e) => deleteChat(chat.id, e)}
                                className="p-1 rounded hover:bg-gray-700/50 transition-colors duration-200"
                                title="Delete"
                              >
                                <Trash2 size={12} className="text-gray-500 hover:text-red-400" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* HomeSwift sidebar footer */}
              <div className="p-3 border-t border-gray-800/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  {!compactMode && (
                    <div className="flex items-center gap-2">
                      {user ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {user.user_metadata?.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-300 text-sm">
                              {user.user_metadata?.first_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                            </span>
                            <span className="text-gray-500 text-xs">{user.email}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                            <User size={12} className="text-gray-300" />
                          </div>
                          <span className="text-gray-400 text-sm">Not logged in</span>
                        </>
                      )}
                    </div>
                  )}
                  {user && (
                    <button 
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-red-400 transition-all duration-200"
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <motion.nav className="relative z-10 flex items-center justify-end p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <button className="text-white hover:bg-white/10 p-2 rounded-lg" onClick={() => setShowMenu((s) => !s)} aria-label="open menu">
            <Menu size={28} />
          </button>
        </div>

        <AnimatePresence>
          {showMenu && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -8 }} 
              transition={{ duration: 0.18 }} 
              className="absolute top-16 right-4 sm:right-6 border border-gray-400/50 rounded-2xl shadow-2xl z-50 px-2 py-2 min-w-[260px] backdrop-blur-xl" 
              style={{ background: 'rgba(60, 60, 60, 0.85)' }}
            >
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-2">
                {user ? (
                  // Logged in menu items
                  [
                    { label: 'Dashboard', action: () => navigate('/main') },
                    { label: 'Browse Properties', action: () => navigate('/listings') },
                    { label: 'Saved Properties', action: () => navigate('/saved') },
                    { label: 'Profile', action: () => navigate('/profile') },
                    { label: 'Logout', action: handleLogout, className: 'text-red-400 hover:text-red-300' }
                  ].map((item, idx) => (
                    <motion.button 
                      key={idx} 
                      variants={itemVariants} 
                      whileHover={{ x: 6 }} 
                      onClick={item.action}
                      className={`w-full text-left text-gray-300 hover:text-white hover:bg-gray-700/50 p-3 rounded-lg text-sm cursor-pointer transition-all duration-200 ${item.className || ''}`}
                    >
                      {item.label}
                    </motion.button>
                  ))
                ) : (
                  // Not logged in menu items
                  [
                    { label: 'Home', action: () => navigate('/') },
                    { label: 'Browse Properties', action: () => navigate('/listings') },
                    { label: 'About', action: () => navigate('/about') },
                    { label: 'Contact', action: () => navigate('/contact') },
                    { label: 'Login', action: () => navigate('/login') },
                    { label: 'Sign Up', action: () => navigate('/signup') }
                  ].map((item, idx) => (
                    <motion.button 
                      key={idx} 
                      variants={itemVariants} 
                      whileHover={{ x: 6 }} 
                      onClick={item.action}
                      className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-700/50 p-3 rounded-lg text-sm cursor-pointer transition-all duration-200"
                    >
                      {item.label}
                    </motion.button>
                  ))
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* MAIN area (hero + search) */}
      <div style={{ paddingLeft: isSmUp && showSidePanel ? (compactMode ? '80px' : '320px') : 0 }} className="relative z-10 transition-all duration-300">
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
          {/* hero text */}
          <div className="text-center mb-8 sm:mb-12 max-w-4xl px-2 sm:px-0">
            <h1 className="flex items-center justify-center flex-wrap text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 leading-tight mt-16 sm:mt-40 gap-2 sm:gap-3">
              <span>Rent & Buy a Home</span>
              <span className="inline-flex items-center"><img src="/Group 129.png" alt="logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover" /></span>
              <span>Swiftly</span>
            </h1>
            <p className="text-gray-300 text-base md:text-lg font-light max-w-2xl mx-auto">Rent or buy a home under 120 seconds with our AI model</p>
          </div>

          {/* Search + upload area */}
          <div className="w-full max-w-4xl relative px-0 sm:px-2">
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

            <motion.form onSubmit={handleSearchSubmit} whileHover={{ scale: 1.005 }} className="relative flex flex-col bg-transparent border border-gray-400/50 rounded-2xl shadow-2xl px-0 py-4 sm:px-2 sm:py-6 min-h-[100px] backdrop-blur-xl" style={{ background: 'rgba(60, 60, 60, 0.15)' }}>
              <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Describe the kind of house you are looking for..." className="w-full bg-transparent text-gray-300 placeholder-gray-400 text-sm outline-none border-none h-8 sm:h-10 mb-4 sm:mb-6 rounded-xl sm:rounded-2xl px-2 sm:px-4" style={{ minWidth: 0, fontSize: '0.875rem' }} />

              <div className="flex items-center justify-between absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 w-auto">
                <div className="flex items-center gap-2 sm:gap-3 relative">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-700/40 hover:bg-gray-600/50 text-gray-300 border border-gray-500" tabIndex={-1} onClick={() => setShowPlusDropdown((s) => !s)}>
                    <Plus size={18} />
                  </motion.button>

                  <AnimatePresence>
                    {showPlusDropdown && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.18 }} className="absolute bottom-14 left-0 border border-gray-400/50 rounded-2xl shadow-2xl z-50 px-2 py-1 sm:px-4 sm:py-2 min-w-[220px] w-[220px] h-[90px] sm:h-[120px] backdrop-blur-xl" style={{ background: 'rgba(60, 60, 60, 0.85)' }}>
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

                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={handleSuggestionClick} className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 rounded-full bg-transparent border border-gray-400/50 text-gray-300 font-medium hover:bg-gray-700/30 text-sm sm:text-base">
                    <Sparkles size={18} />
                    <span>Suggestions</span>
                  </motion.button>
                </div>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white shadow-lg border border-gray-400/50 ${!searchText ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ background: 'linear-gradient(180deg, #3a3d42 0%, #23262b 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} disabled={!searchText}>
                  <ArrowUp size={18} />
                </motion.button>
              </div>
            </motion.form>

            {/* Grok-style action buttons under search */}
            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/30 transition-all duration-200"
              >
                <Search size={16} />
                <span className="text-sm font-medium">Find Properties</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/30 transition-all duration-200"
              >
                <Calculator size={16} />
                <span className="text-sm font-medium">Mortgage Calculator</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/30 transition-all duration-200"
              >
                <MapPin size={16} />
                <span className="text-sm font-medium">Neighborhood Guide</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/30 transition-all duration-200"
              >
                <Star size={16} />
                <span className="text-sm font-medium">Featured Listings</span>
              </motion.button>
            </div>
            
            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 right-0 mt-2 sm:mt-4 border border-gray-400/50 rounded-2xl shadow-2xl z-20" style={{ backgroundImage: 'url("/Rectangle 135.png")', backgroundSize: 'cover', backgroundPosition: 'center', backdropFilter: 'blur(12px)' }}>
                  <div className="p-4" style={{ background: 'transparent' }}>
                    <h3 className="text-white font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Popular Searches</h3>
                    <div className="space-y-2">
                      {suggestions.map((sug, idx) => (
                        <button key={idx} onClick={() => { setSearchText(sug); setShowSuggestions(false); }} className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-700/50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">{sug}</button>
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
  );
}