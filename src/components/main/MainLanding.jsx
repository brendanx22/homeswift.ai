import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Home,
  Search as SearchIcon,
  Heart,
  MessageSquare,
  Calculator,
  MapPin,
  Filter,
  Camera,
  Clock,
  Settings,
  ChevronRight,
  ArrowRight,
  Sparkles
} from "lucide-react";
import searchService from "../../services/searchService";
import { useAuth } from "../../contexts/AuthContext";
// Logo is loaded from the public directory

export default function MainLanding() {
  // --- authentication state ---
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut: contextSignOut, isAuthenticated, loading: authLoading } = useAuth();
  
  // Only show search interface on the landing path per domain
  const isChat = typeof window !== 'undefined' && window.location.hostname.startsWith('chat.');
  const isMainLandingPage = isChat ? (location.pathname === '/') : (location.pathname === '/app');
  
  // Handle authentication state and redirects
  useEffect(() => {
    const handleAuthState = async () => {
      if (authLoading) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      const currentHost = window.location.hostname;
      const isChatDomain = currentHost === 'chat.homeswift.co' || currentHost === 'localhost';
      const isMainDomain = currentHost === 'homeswift.co' || currentHost === 'www.homeswift.co';
      const isAuthPage = ['/login', '/signup', '/auth/callback'].includes(location.pathname);

      if (session) {
        // If we have a session and we're on the main domain, redirect to chat subdomain
        if (isMainDomain) {
          const redirectPath = location.pathname === '/app' ? '/' : location.pathname;
          window.location.href = `https://chat.homeswift.co${redirectPath}`;
          return;
        }
        
        // If we're on the login/signup page but already authenticated, redirect to home
        if (isAuthPage) {
          navigate('/', { replace: true });
        }
      } else if (isChatDomain && !isAuthPage) {
        // If no session and not on an auth page, redirect to login on main domain
        const returnTo = encodeURIComponent(window.location.href);
        window.location.href = `https://homeswift.co/login?redirect=${returnTo}`;
      }
    };

    handleAuthState();
  }, [authLoading, isAuthenticated, location.pathname, navigate]);
  
  // If still loading auth state, show loading indicator
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B35] mb-4"></div>
        <p className="text-gray-600">Loading your session...</p>
      </div>
    );
  }

  // Prefill search fields from URL params (supports HeroSection redirect to chat)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    const loc = params.get('location') || '';
    const type = params.get('type') || '';
    if (q) setSearchQuery(q);
    if (loc) setSearchLocation(loc);
    if (type) setPropertyType(type);
  }, [location.search]);

  // If the user lands on chat root with a search param and is already authenticated,
  // automatically route to the results page to complete the flow
  useEffect(() => {
    if (!isChat) return;
    if (location.pathname !== '/') return;
    if (!isAuthenticated) return;
    if (autoRoutedRef.current) return;

    const params = new URLSearchParams(location.search);
    const hasQuery = params.get('search');
    if (hasQuery) {
      autoRoutedRef.current = true;
      navigate(`/properties?${params.toString()}`);
    }
  }, [isChat, isAuthenticated, location.pathname, location.search, navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await contextSignOut();
      // No need to navigate here as it's handled in the AuthContext
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation to login on error
      navigate('/login');
    }
  };

  // --- navigation state ---
  const [activeTab, setActiveTab] = useState("browse");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Motion values for interactive elements
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Navigation items with their respective routes
  const navItems = [
    { id: 'properties', label: 'Browse Homes', icon: <Home className="w-5 h-5" /> },
    { id: 'search', label: 'Property Search', icon: <SearchIcon className="w-5 h-5" /> },
    { id: 'saved', label: 'Saved Properties', icon: <Heart className="w-5 h-5" /> },
    { id: 'neighborhoods', label: 'Neighborhood Guide', icon: <MapPin className="w-5 h-5" /> },
    { id: 'calculator', label: 'Mortgage Calculator', icon: <Calculator className="w-5 h-5" /> },
    { id: 'tours', label: 'Virtual Tours', icon: <Camera className="w-5 h-5" /> },
    { id: 'filters', label: 'Advanced Filters', icon: <Filter className="w-5 h-5" /> },
    { id: 'recent', label: 'Recent Searches', icon: <Clock className="w-5 h-5" /> },
  ];

  // Handle navigation to different sections
  const handleNavigation = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    
    // Handle navigation based on the selected item
    switch(id) {
      case 'search':
        navigate('/properties');
        break;
      case 'properties':
        navigate('/properties');
        break;
      case 'saved':
        navigate(`${isChat ? '' : '/app'}/saved`);
        break;
      case 'neighborhoods':
        navigate(`${isChat ? '' : '/app'}/neighborhoods`);
        break;
      case 'calculator':
        navigate(`${isChat ? '' : '/app'}/calculator`);
        break;
      case 'tours':
        navigate(`${isChat ? '' : '/app'}/tours`);
        break;
      case 'filters':
        navigate(`${isChat ? '' : '/app'}/filters`);
        break;
      case 'recent':
        navigate(`${isChat ? '' : '/app'}/recent`);
        break;
      default:
        // For other items, just update the active tab
        break;
    }
  };

  // --- search state ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const previewDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const autoRoutedRef = useRef(false);
  
  // Load featured and recent properties only on non-chat domains
  useEffect(() => {
    if (isChat) return;
    const loadProperties = async () => {
      try {
        const [featured, recent] = await Promise.all([
          searchService.getFeaturedProperties(6),
          searchService.getRecentProperties(8)
        ]);
        setFeaturedProperties(featured);
        setRecentProperties(recent);
      } catch (error) {
        console.error('Failed to load properties:', error);
      }
    };

    loadProperties();
  }, [isChat]);

  // Handle search submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    
    const query = searchQuery.trim();
    
    if (!query) {
      setSearchError('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // If not authenticated, prompt login and return to chat main landing with the query preserved
      if (!isAuthenticated) {
        const searchParams = new URLSearchParams({ search: query });
        if (searchLocation) searchParams.set('location', searchLocation);
        if (propertyType) searchParams.set('type', propertyType);
        const redirectTarget = `${window.location.origin}/properties?${searchParams.toString()}`;
        navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
        return;
      }

      // Save search history if user is authenticated
      if (user?.id) {
        await searchService.saveSearchHistory(user.id, query, {
          location: searchLocation,
          propertyType: propertyType
        });
      }
      // Navigate to the results page with the query
      const searchParams = new URLSearchParams({ search: query });
      if (searchLocation) searchParams.set('location', searchLocation);
      if (propertyType) searchParams.set('type', propertyType);
      navigate(`/properties?${searchParams.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debounced suggestions
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchError(null);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      setShowSuggestions(true);
      
      // Debounce suggestions loading
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const searchSuggestions = await searchService.getSearchSuggestions(value);
          setSuggestions(searchSuggestions);
        } catch (error) {
          console.error('Failed to load suggestions:', error);
          setSuggestions([]);
        }
      }, 300);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };
  
  // --- responsive sidebar state ---
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Initialize sidebar visibility based on screen size
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    const checkIfDesktop = () => {
      const width = window.innerWidth;
      const desktop = width >= 1024;
      setIsDesktop(desktop);
      
      // Close mobile sidebar when switching to desktop
      if (desktop) {
        setShowMobileSidebar(false);
      }
      
      console.log('Window width:', width, 'Desktop:', desktop);
    };
    
    // Initial check
    checkIfDesktop();
    
    // Handle window resize with debounce
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkIfDesktop, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);
  
  const [compactMode, setCompactMode] = useState(() => {
    // Initialize compact mode from localStorage if it exists
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCompact');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });
  
  const [isSmUp, setIsSmUp] = useState(false);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const isTablet = window.matchMedia("(min-width: 640px)").matches;
      
      setIsSmUp(isTablet);
      
      // Ensure mobile sidebar is closed by default on mobile screens
      if (!isDesktop && localStorage.getItem('sidebarOpen') === null) {
        setShowMobileSidebar(false);
      }
      
      // Update isDesktop state
      setIsDesktop(isDesktop);
    };

    // Set initial state
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Persist compact mode state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCompact', JSON.stringify(compactMode));
    }
  }, [compactMode]);

  // Persist mobile sidebar state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !isDesktop) {
      localStorage.setItem('sidebarMobileOpen', JSON.stringify(showMobileSidebar));
    }
  }, [showMobileSidebar, isDesktop]);

  // Load initial state from localStorage on mount
  useEffect(() => {
    try {
      const savedCompact = localStorage.getItem('sidebarCompact');
      if (savedCompact !== null) setCompactMode(JSON.parse(savedCompact));
      
      // Only load mobile sidebar state if we're on mobile
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        const savedMobileOpen = localStorage.getItem('sidebarMobileOpen');
        if (savedMobileOpen !== null) setShowMobileSidebar(JSON.parse(savedMobileOpen));
      }
    } catch (e) {
      console.error("Failed to load sidebar state:", e);
    }
  }, []);

  // --- preview, uploads, UI state ---
  const [previewURL, setPreviewURL] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // --- chat data ---
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("hs_chat_history_v1");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [activeChat, setActiveChat] = useState(null);
  const [hoveredChat, setHoveredChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


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

  // Clean up old localStorage keys
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Remove old keys if they exist
      localStorage.removeItem("hs_show_side_v1");
      localStorage.removeItem("hs_compact_v1");
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

  // Property search handler
  const handleSearch = () => {
    // Handle property search logic here
    console.log('Searching for:', { location: searchLocation, type: propertyType });
    setShowPlusDropdown(false);
  };

  // Image upload handler
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadedImages((p) => [...p, file]);
    e.target.value = null;
  };
  
  // Cleanup functions
  const handleRemoveFile = (index) => setUploadedFiles((p) => p.filter((_, i) => i !== index));
  const handleRemoveImage = (index) => setUploadedImages((p) => p.filter((_, i) => i !== index));

  // --- preview logic (text/pdf/image/docx) ---
  const handlePreviewItem = (item) => {
    if (item.type === 'image') {
      setPreviewItem({
        ...item,
        url: URL.createObjectURL(item.file)
      });
    } else if (item.type === 'pdf') {
      setPreviewItem({
        ...item,
        url: URL.createObjectURL(item.file)
      });
    } else {
      // For text files, read as text
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewItem({
          ...item,
          fileText: e.target.result
        });
      };
      reader.readAsText(item.file);
    }
  };

  const closePreview = () => setPreviewItem(null);

  // --- suggestions / search ---
  const handleSuggestionClick = () => {
    setShowSuggestions(!showSuggestions);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.value || suggestion.text);
    setShowSuggestions(false);
    // Trigger search with the selected suggestion
    setTimeout(() => {
      handleSearchSubmit({ preventDefault: () => {} });
    }, 100);
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
      document.body.style.backgroundSize = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
    };
  }, []);


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
      {/* Mobile toggle - single oval container */}
      {!isDesktop && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          className="fixed left-4 top-4 z-30 sm:hidden"
        >
          <div className="flex items-center p-1 rounded-full backdrop-blur-sm border border-white/20 bg-transparent">
            <motion.button
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileSidebar(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Open chat"
            >
              <MessageSquare className="text-white" size={18} />
            </motion.button>
            
            <div className="w-px h-5 bg-white/20 mx-1"></div>
            
            <motion.button
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { /* Add your plus button action here */ }}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Add new"
            >
              <Plus className="text-white" size={18} />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Sidebar - Always render on desktop, conditionally on mobile */}
      <AnimatePresence initial={false}>
        {(showMobileSidebar || isDesktop) && (
          <>
            {/* mobile overlay to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              onClick={() => setShowMobileSidebar(false)}
            />

            <motion.aside
              initial={isDesktop ? { x: 0, opacity: 1 } : { x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={isDesktop ? { x: 0, opacity: 1 } : { x: -320, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className={`fixed left-0 top-0 z-50 h-full backdrop-blur-xl flex flex-col border-r border-gray-800/50 ${compactMode ? 'w-16' : 'w-64'}`}
              style={{ 
                background: 'rgba(15, 15, 15, 0.95)',
                boxShadow: '2px 0 10px rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* HomeSwift sidebar header */}
              <div className="p-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-12 mt-8">
                  <div className="flex items-center gap-2">
                    {compactMode ? (
                      <div className="flex justify-center w-full">
                        <img src="/images/logo.png" alt="HomeSwift Logo" className="w-10 h-10 rounded-lg object-cover" />
                      </div>
                    ) : (
                      <>
                        <img src="/images/logo.png" alt="HomeSwift Logo" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-white font-semibold text-lg">HomeSwift</span>
                      </>
                    )}
                  </div>

                  {!compactMode && (
                    <div className="flex items-center gap-1">
                      {!isDesktop ? (
                        <button 
                          onClick={() => setShowMobileSidebar(false)} 
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-gray-300 transition-all duration-200"
                        >
                          <X size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setCompactMode((s) => !s)}
                          className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
                          title={compactMode ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                          {compactMode ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                      )}
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
                  {navItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, delay: idx * 0.05 }}
                      onClick={() => handleNavigation(item.id)}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                        activeTab === item.id 
                          ? 'bg-gray-800/80 text-white' 
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
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
                            if (!isSmUp) setShowMobileSidebar(false); 
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
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              {user?.first_name?.charAt(0) || user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-gray-100 text-sm font-medium truncate">
                              {user?.first_name || user?.user_metadata?.first_name || user?.name?.split(' ')[0] || ''}
                            </span>
                            <span className="text-gray-400 text-xs truncate">
                              {user?.email}
                            </span>
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
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  HomeSwift
                </span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/properties')}
                className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Browse Properties
              </button>
              <button 
                onClick={() => navigate('/neighborhoods')}
                className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Neighborhoods
              </button>
              <button 
                onClick={() => navigate('/calculator')}
                className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Mortgage Calculator
              </button>
              
              {isAuthenticated ? (
                <div className="relative ml-4">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden lg:inline">
                      {user?.first_name || user?.user_metadata?.first_name || 'Account'}
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white/10 backdrop-blur-md border border-white/10 overflow-hidden"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate('/profile');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-white/10 flex items-center"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Your Profile
                          </button>
                          <button
                            onClick={() => {
                              navigate('/saved');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-white/10 flex items-center"
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            Saved Properties
                          </button>
                          <button
                            onClick={() => {
                              navigate('/settings');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-white/10 flex items-center"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </button>
                          <div className="border-t border-white/10 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-white/10 flex items-center"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-4 ml-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 rounded-md text-sm font-medium text-blue-100 hover:text-white transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-md text-sm font-medium text-white transition-colors border border-white/20"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-white/10 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
         

        
        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-blue-900/95 backdrop-blur-md overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <button
                  onClick={() => {
                    navigate('/properties');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/50"
                >
                  Browse Properties
                </button>
                <button
                  onClick={() => {
                    navigate('/neighborhoods');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/50"
                >
                  Neighborhoods
                </button>
                <button
                  onClick={() => {
                    navigate('/calculator');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/50"
                >
                  Mortgage Calculator
                </button>
                
                {isAuthenticated ? (
                  <>
                    <div className="border-t border-blue-700 my-2"></div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/50"
                    >
                      Your Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/saved');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/50"
                    >
                      Saved Properties
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/50"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:text-white hover:bg-blue-800/50"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="pt-4 pb-3 border-t border-blue-700">
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          navigate('/login');
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/50"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => {
                          navigate('/signup');
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Sign up
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
     
      
      {/* Main Content */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pb-24">
          <div className="text-center">
            <motion.h1 
              className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="block">Find Your Dream Home</span>
              <span className="block text-blue-200">With HomeSwift</span>
            </motion.h1>
            
            <motion.p 
              className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Discover the perfect property that matches your lifestyle. Browse thousands of listings, explore neighborhoods, and find your next home with ease.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              className="mt-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                  className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
                  placeholder="Search by city, neighborhood, or ZIP code..."
                />
                <button
                  onClick={handleSearchSubmit}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-100 hover:text-white"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (action.id === 'find') navigate('/properties');
                      else if (action.id === 'mortgage') navigate('/calculator');
                      else if (action.id === 'neighborhood') navigate('/neighborhoods');
                      else if (action.id === 'featured') navigate('/featured');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-white/20 rounded-full text-sm font-medium text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-colors"
                  >
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Featured Properties Preview */}
        <div className="bg-white/5 backdrop-blur-sm border-t border-b border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Featured Properties
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-base text-blue-100 sm:mt-4">
                Explore our handpicked selection of premium properties
              </p>
            </div>
            
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: item * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-blue-400/30 transition-colors"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-blue-900/30">
                    <div className="w-full h-48 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 animate-pulse"></div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-white">Luxury Home in {['Beverly Hills', 'Manhattan', 'Miami'][item-1]}</h3>
                        <p className="mt-1 text-sm text-blue-100">{item + 2} bd | {item + 2.5} ba | {2000 + item * 500} sqft</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-100">
                        ${(1.2 + item * 0.3).toFixed(1)}M
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center text-sm text-blue-200">
                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span>{['Beverly Hills, CA', 'New York, NY', 'Miami, FL'][item-1]}</span>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/properties')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View All Properties
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="py-16 bg-gradient-to-b from-blue-900/30 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                What Our Clients Say
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-base text-blue-100 sm:mt-4">
                Don't just take our word for it. Here's what our clients have to say about their experience.
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Home Buyer',
                  content: 'HomeSwift made finding our dream home so easy! The platform is intuitive and the team was incredibly helpful throughout the entire process.',
                  rating: 5
                },
                {
                  name: 'Michael Chen',
                  role: 'Real Estate Investor',
                  content: 'As an investor, I need to move quickly on properties. HomeSwift\'s real-time alerts and comprehensive listings give me an edge in this competitive market.',
                  rating: 5
                },
                {
                  name: 'Emily Rodriguez',
                  role: 'First-time Buyer',
                  content: 'The mortgage calculator and neighborhood insights were game-changers for us. We found the perfect home in a great area within our budget!',
                  rating: 5
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition-colors"
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-500'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-4 text-blue-100">"{testimonial.content}"</p>
                  <div className="mt-6 flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white">{testimonial.name}</p>
                      <p className="text-sm text-blue-200">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to find your dream home?</span>
              <span className="block text-blue-200">Start your search today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Get Started
                </motion.button>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/contact')}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Contact Us
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </main>
    
      {/* Footer */}
      <footer className="bg-gray-900" aria-labelledby="footer-heading">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/images/logo.png"
                  alt="HomeSwift"
                />
                <span className="ml-2 text-xl font-bold text-white">HomeSwift</span>
              </div>
              <p className="text-gray-300 text-base">
                Making home buying and selling simple, transparent, and enjoyable.
              </p>
              <div className="flex space-x-6">
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((item) => (
                  <a key={item} href="#" className="text-gray-400 hover:text-white">
                    <span className="sr-only">{item}</span>
                    <div className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Buying</h3>
                  <ul className="mt-4 space-y-4">
                    {['Search Homes', 'Home Values', 'Homes for Sale', 'Foreclosures', 'For Sale by Owner'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-base text-gray-400 hover:text-white">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Selling</h3>
                  <ul className="mt-4 space-y-4">
                    {['Sell Your Home', 'Home Value Estimate', 'Find an Agent', 'Pricing', 'Home Improvement'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-base text-gray-400 hover:text-white">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Resources</h3>
                  <ul className="mt-4 space-y-4">
                    {['Blog', 'Guides', 'FAQ', 'Help Center', 'Mortgage Calculator'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-base text-gray-400 hover:text-white">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                  <ul className="mt-4 space-y-4">
                    {['About Us', 'Careers', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-base text-gray-400 hover:text-white">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; {new Date().getFullYear()} HomeSwift. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
                    { label: 'Dashboard', action: () => navigate(isChat ? '/' : '/app') },
                    { label: 'Browse Properties', action: () => (isChat ? (window.location.href = 'https://homeswift.co/properties') : navigate('/properties')) },
                    { label: 'Saved Properties', action: () => navigate(`${isChat ? '' : '/app'}/saved`) },
                    { label: 'Neighborhoods', action: () => navigate(`${isChat ? '' : '/app'}/neighborhoods`) },
                    { label: 'Gallery', action: () => navigate(`${isChat ? '' : '/app'}/gallery`) },
                    { label: 'Mortgage Calculator', action: () => navigate(`${isChat ? '' : '/app'}/calculator`) },
                    { label: 'Profile', action: () => navigate(`${isChat ? '' : '/app'}/profile`) },
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
                    { label: 'Browse Properties', action: () => navigate('/properties') },
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
    
      {/* MAIN area (hero + search) */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 pt-32 sm:pt-24">
          {/* hero text */}
          <div className="text-center mb-8 sm:mb-10 max-w-4xl px-2 sm:px-0">
            <h1 className="flex items-center justify-center flex-wrap text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-5 leading-tight gap-2 sm:gap-3">
              <span>Welcome back{user?.first_name || user?.user_metadata?.first_name ? `, ${user.first_name || user.user_metadata.first_name}` : ''}!</span>
              <span className="inline-flex items-center"><img src="/images/logo.png" alt="logo" className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg object-cover" /></span>
            </h1>
            <p className="text-gray-300 text-md md:text-lg font-light max-w-2xl mx-auto">Find your dream home with HomeSwift's AI-powered search</p>
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
                            ×
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

            <motion.form 
              onSubmit={handleSearchSubmit}
              whileHover={{ scale: 1.005 }} 
              className="relative flex flex-col bg-transparent border border-1 border-[#6c6c6c] rounded-3xl shadow-2xl px-0 py-6 sm:px-4 sm:py-10 min-h-[120px] backdrop-blur-xl" 
              style={{ background: 'rgba(60, 60, 60, 0.15)' }}
            >
              <div className="relative">
                <div className="relative w-full flex items-center">
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={handleSearchChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                    onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search by location, type, or features..." 
                    className={`w-full bg-transparent text-white placeholder-[#737373] outline-none border-none h-14 sm:h-16 ${showPlusDropdown ? 'rounded-t-2xl' : 'rounded-2xl'} px-6 pr-6 pt-2 pb-1 transition-all duration-200`} 
                    style={{ 
                      minWidth: 0, 
                      fontSize: '1.1rem', 
                      lineHeight: '1.2',
                      background: showPlusDropdown ? 'rgba(60, 60, 60, 0.95)' : 'transparent',
                      border: showPlusDropdown ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                      borderBottom: showPlusDropdown ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      boxShadow: showPlusDropdown ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
                    }}
                    autoComplete="off"
                    aria-label="Search properties"
                    disabled={isSearching}
                  />
                  {searchError && (
                    <div className="absolute bottom-0 left-0 right-0 text-red-400 text-xs mt-1">
                      {searchError}
                    </div>
                  )}
                </div>
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showPlusDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 px-6 py-4 rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(60, 60, 60, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(12px)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-white/80 mb-2">Refine Your Search</h3>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-gray-300 text-xs">
                            <MapPin size={14} className="text-blue-400" />
                            <span>Location</span>
                          </div>
                          <input 
                            type="text" 
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            placeholder="Enter location..."
                            className="bg-gray-700/70 text-white text-sm rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-600/50"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-300 text-xs">
                          <Home size={14} className="text-blue-400" />
                          <span>Property Type</span>
                        </div>
                        <select 
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value)}
                          className="bg-gray-700/70 text-white text-sm rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-600/50 appearance-none"
                        >
                          <option value="">Any Type</option>
                          <option value="house">House</option>
                          <option value="apartment">Apartment</option>
                          <option value="condo">Condo</option>
                          <option value="townhouse">Townhouse</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    type="button" 
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700/40 hover:bg-gray-600/50 text-gray-300 border border-gray-500" 
                    tabIndex={-1} 
                    onClick={() => setShowPlusDropdown(!showPlusDropdown)}
                  >
                    <Plus size={12} />
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    type="button" 
                    onClick={handleSuggestionClick} 
                    className="flex items-center gap-1 sm:gap-1 px-1 py-1 sm:px-3 sm:py-1 rounded-full bg-transparent border border-gray-400/50 text-gray-300 font-small hover:bg-gray-700/30 text-xs sm:text-base"
                  >
                    <Sparkles size={18} />
                    <span>Suggestions</span>
                  </motion.button>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  type="submit" 
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white shadow-lg border border-gray-400/50 ${!searchQuery.trim() ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  style={{ background: 'linear-gradient(180deg, #3a3d42 0%, #23262b 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} 
                  disabled={!searchQuery.trim() || isSearching}
                >
                  <ArrowUp size={18} />
                </motion.button>
              </div>
            </motion.form>
            
            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 right-0 mt-2 sm:mt-4 border border-gray-400/50 rounded-2xl shadow-2xl z-20 overflow-hidden" style={{ backgroundImage: 'url("/Rectangle 135.png")', backgroundSize: 'cover', backgroundPosition: 'center', backdropFilter: 'blur(12px)' }}>
                  <div className="p-4" style={{ background: 'transparent' }}>
                    <h3 className="text-white font-semibold mb-3 sm:mb-4 text-lg sm:text-xl">
                      {suggestions.length > 0 ? 'Search Suggestions' : 'Popular Searches'}
                    </h3>
                    <div className="space-y-1">
                      {suggestions.length > 0 ? (
                        suggestions.map((sug, idx) => (
                          <motion.button 
                            key={idx} 
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleSuggestionSelect(sug)} 
                            className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-700/50 px-4 py-2.5 rounded-lg leading-normal transition-all duration-150 flex items-center gap-2"
                            style={{ fontSize: '15px' }}
                          >
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              sug.type === 'location' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                            }`}>
                              {sug.type === 'location' ? '📍' : '🏠'}
                            </span>
                            {sug.text}
                          </motion.button>
                        ))
                      ) : (
                        // Fallback popular searches
                        [
                          'Lagos apartments',
                          'Ikoyi houses',
                          'Victoria Island luxury',
                          'Lekki Phase 1',
                          'Surulere family homes'
                        ].map((sug, idx) => (
                          <motion.button 
                            key={idx} 
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                              setSearchQuery(sug);
                              handleSearchSubmit({ preventDefault: () => {} });
                            }} 
                            className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-700/50 px-4 py-2.5 rounded-lg leading-normal transition-all duration-150"
                            style={{ fontSize: '15px' }}
                          >
                            {sug}
                          </motion.button>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Featured Properties Section (hidden on chat landing) */}
          {!isChat && featuredProperties.length > 0 && (
        <div className="w-full max-w-6xl mt-16 px-6">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Featured Properties
            </h2>
            <p className="text-gray-300">
              Discover our handpicked selection of premium homes
            </p>
          </div>

          {/* Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading Skeletons */}
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 animate-pulse"
                >
                  <div className="h-48 bg-gray-700" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-700 w-1/2 rounded" />
                    <div className="h-4 bg-gray-700 w-3/4 rounded" />
                  </div>
                </div>
              ))}

            {/* Property Cards */}
            {!isLoading &&
              featuredProperties.map((property) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 cursor-pointer group"
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  {/* Image Section */}
                  <div className="relative h-48">
                    {property.property_images && property.property_images.length > 0 ? (
                      <img
                        src={property.property_images[0].url}
                        alt={`Image of ${property.title || "property"}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <Image className="w-12 h-12 text-gray-500" />
                      </div>
                    )}

                    {/* Listing Type Badge */}
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {property.listing_type}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <motion.span
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-white font-semibold text-lg"
                      >
                        View Details
                      </motion.span>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <img
                        className="h-10 w-auto"
                        src="/images/logo.png"
                        alt="HomeSwift"
                      />
                      {property.price && (
                        <span className="text-white font-semibold text-lg">
                          ₦{property.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400 mt-2">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      {property.square_feet && (
                        <span>{property.square_feet} sq ft</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (window.location.hostname.startsWith("chat.")) {
                  window.location.href = "https://homeswift.co/properties";
                } else {
                  navigate("/properties");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              View All Properties
            </motion.button>
          </div>
        </div>
      )}
    </div>
{"}"}
    
          <div className="flex-1 w-full">
            <Outlet />
          </div>
        
        {/* Preview modal */}
        <AnimatePresence>
            {previewItem && (
              <motion.div 
                ref={previewDropdownRef} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              transition={{ duration: 0.18 }} 
              className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-gray-400/50 rounded-2xl shadow-2xl z-50 flex flex-col items-center justify-center backdrop-blur-xl" 
              style={{ 
                background: 'rgba(60, 60, 60, 0.95)', 
                width: '70vw', 
                height: '70vh', 
                maxWidth: '900px', 
                maxHeight: '900px', 
                overflow: 'hidden', 
                boxSizing: 'border-box' 
              }}
            >
              <div className="flex items-center justify-between w-full px-6 pt-4">
                <div className="text-gray-200 font-bold text-lg truncate">{previewItem.file?.name}</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={closePreview} 
                    className="p-1 rounded hover:bg-gray-700/50"
                  >
                    <X size={18} className="text-gray-300" />
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full px-6 py-4 overflow-auto">
                {previewItem.type === 'image' ? (
                  <img 
                    src={previewURL} 
                    alt={previewItem.file.name} 
                    className="max-w-full max-h-[80vh] rounded-lg shadow-lg object-contain" 
                  />
                ) : previewItem.file?.type === 'application/pdf' ? (
                  <object 
                    data={previewURL} 
                    type="application/pdf" 
                    className="w-full h-[60vh] rounded-lg shadow-lg bg-white"
                  >
                    <div className="text-gray-400 text-lg mb-4">PDF preview not available in this browser.</div>
                    <a 
                      href={previewURL} 
                      download={previewItem.file?.name} 
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800"
                    >
                      Download PDF
                    </a>
                  </object>
                ) : previewItem.isDocxType ? (
                  <div className="text-center">
                    <div className="text-gray-400 text-lg mb-4">DOCX preview not supported. You can download the file below.</div>
                    <a 
                      href={previewURL} 
                      download={previewItem.file?.name} 
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800"
                    >
                      Download DOCX
                    </a>
                  </div>
                ) : previewItem.fileText ? (
                  <div 
                    className="w-full h-[60vh] overflow-auto bg-gray-900 text-gray-100 p-4 rounded-lg shadow-lg" 
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {previewItem.fileText}
                  </div>
                ) : (
                  <div className="text-gray-400 text-lg">File preview not available for this type.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
}