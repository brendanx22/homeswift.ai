import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Plus, 
  Home, 
  Building, 
  Users, 
  Calendar, 
  BarChart3, 
  MapPin, 
  User, 
  Settings, 
  LogOut, 
  Phone, 
  MessageSquare, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  Bed,
  Bath,
  Square,
  ChevronLeft,
  ChevronRight,
  Upload,
  FolderOpen,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../contexts/DashboardContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [compactMode, setCompactMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { properties, loading, stats, removeProperty, getRecentProperties } = useDashboard();

  // Dynamic stats data based on actual properties
  const statsData = [
    { title: 'TOTAL LISTINGS', value: stats.totalListings.toString(), trend: '+0% today', trendColor: 'text-green-400', icon: Building },
    { title: 'TOTAL VIEWS', value: stats.totalViews.toLocaleString(), trend: '+0% today', trendColor: 'text-green-400', icon: Eye },
    { title: 'ACTIVE RENTALS', value: stats.activeRentals.toString(), status: '0 Pending', statusColor: 'text-yellow-400', icon: Home },
    { title: 'PROPERTIES SOLD', value: stats.propertiesSold.toString(), trend: '+0% today', trendColor: 'text-green-400', icon: Building },
    { title: 'ACTIVE LEADS', value: stats.activeLeads.toString(), status: '0 new leads today', statusColor: 'text-green-400', icon: Users },
    { title: 'INQUIRIES', value: stats.inquiries.toString(), trend: '+0% today', trendColor: 'text-green-400', icon: MessageSquare }
  ];

  const recentLeads = [
    {
      id: 1,
      name: 'Divine Edike',
      email: 'eikedivine7@gmail.com',
      time: '52mins ago',
      message: 'I\'m interested in scheduling a viewing this weekend. Please check out my inquiry and get back to me. I would...',
      phone: '+234 813 3010 989',
      avatar: 'DE'
    },
    {
      id: 2,
      name: 'Nwanze Brendan',
      email: 'nwanzebrendan@gmail.com',
      time: '52mins ago',
      message: 'Is the monthly rent including utilities or it is a different pay entirely. And also, are pets allowed?',
      phone: '+234 901 234 567',
      avatar: 'NB'
    }
  ];

  // Get recent properties from context
  const recentListings = getRecentProperties();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'leads', label: 'Leads', icon: Users, badge: '3' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'locate', label: 'Locate', icon: MapPin }
  ];

  const handleNavigation = (id) => {
    setActiveTab(id);
    if (id === 'properties') {
      navigate('/list-property');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-[#2C3E50]';
      case 'pending': return 'bg-[#2C3E50]';
      default: return 'bg-[#2C3E50]';
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await removeProperty(propertyId);
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
  };

  const formatPropertyAddress = (property) => {
    if (property.location) {
      return `${property.location.city}, ${property.location.state}`;
    }
    return 'Address not specified';
  };

  const formatListedDate = (createdAt) => {
    if (!createdAt) return 'Recently listed';
    
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Listed 1 day ago';
    if (diffDays < 7) return `Listed ${diffDays} days ago`;
    if (diffDays < 14) return 'Listed 1 week ago';
    if (diffDays < 30) return `Listed ${Math.ceil(diffDays / 7)} weeks ago`;
    return `Listed ${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#2C3E50]" /> : <Menu className="w-6 h-6 text-[#2C3E50]" />}
            </button>
            
            <h1 className="text-xl font-bold text-[#FF6B35]">HomeSwift</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
              />
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">Uti Favour</div>
                <div className="text-gray-500">Agent ID: #32781</div>
              </div>
            </div>
            
            {/* Add Property Button */}
            <button
              onClick={() => navigate('/list-property')}
              className="text-white px-4 py-2 rounded-full font-semibold flex items-center space-x-2 transition-colors"
              style={{ backgroundColor: '#FF6B35' }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e85e2f')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FF6B35')}
            >
              <Plus className="w-4 h-4" />
              <span>Add New Property</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-[72px]">
        {/* Fixed Sidebar - Desktop */}
        <aside className={`hidden lg:block fixed left-0 top-[72px] bottom-0 bg-white border-r border-gray-200 transition-all duration-300 ${compactMode ? 'w-16' : 'w-64'} overflow-y-auto`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">

              <button
                onClick={() => setCompactMode(!compactMode)}
                className="p-1 rounded hover:bg-gray-600 transition-colors text-[#fff]"
              >
                {compactMode ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#fff]'
                        : 'text-[#2C3E50] hover:bg-gray-600 '
                    } ${compactMode ? 'justify-center px-2' : ''}`}
                    style={isActive ? { backgroundColor: '#FF6B35' } : {}}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!compactMode && (
                      <>
                        <span>{item.label}</span>
                        {item.badge && (  
                          <span className="text-[#2C3E50] text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#FF6B35' }}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </motion.button>
                );
              })}
            </nav>

            <div className="border-t border-gray-600 mt-6 pt-6">
              <nav className="space-y-2">
                <motion.button
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#2C3E50] hover:bg-gray-600 transition-all duration-200 ${
                    compactMode ? 'justify-center px-2' : ''
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  {!compactMode && <span>Profile</span>}
                </motion.button>
                <motion.button
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#2C3E50] hover:bg-gray-600 transition-all duration-200 ${
                    compactMode ? 'justify-center px-2' : ''
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  {!compactMode && <span>Settings</span>}
                </motion.button>
                <motion.button
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#2C3E50] hover:bg-gray-600 transition-all duration-200 ${
                    compactMode ? 'justify-center px-2' : ''
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  {!compactMode && <span>Log out</span>}
                </motion.button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <aside className="fixed left-0 top-[72px] bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          handleNavigation(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-[#fff]'
                            : 'text-[#2C3E50] hover:bg-gray-100'
                        }`}
                        style={isActive ? { backgroundColor: '#FF6B35' } : {}}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[#2C3E50] text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#FF6B35' }}>
                            {item.badge}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </nav>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <nav className="space-y-2">
                    <motion.button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#2C3E50] hover:bg-gray-100 transition-all duration-200" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span>Profile</span>
                    </motion.button>
                    <motion.button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#2C3E50] hover:bg-gray-100 transition-all duration-200" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Settings className="w-4 h-4 flex-shrink-0" />
                      <span>Settings</span>
                    </motion.button>
                    <motion.button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#2C3E50] hover:bg-gray-100 transition-all duration-200" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span>Log out</span>
                    </motion.button>
                  </nav>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content - Scrollable */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all duration-300 ${
          compactMode ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#2C3E50] mb-2">Welcome Back, Favour!</h2>
            <p className="text-gray-600">Here's what happening with your properties today!</p>
          </div>

          {/* Main Dashboard Grid: Stats Grid and Recent Leads side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Stats Grid Section - Left Column */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {statsData.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-transparent border border-[#2C3E50] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {stat.title}
                        </h3>
                        {/* <Icon className="w-5 h-5 text-[#2C3E50]" /> */}
                      </div>
                      <div className="text-5xl font-bold text-[#2C3E50] mb-2">{stat.value}</div>
                      {stat.trend && (
                        <div className={`text-xs ${stat.trendColor}`}>
                          ↑ {stat.trend}
                        </div>
                      )}
                      {stat.status && (
                        <div className={`text-xs ${stat.statusColor}`}>
                          {stat.status}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Recent Leads & Inquiries Section - Right Column */}
            <div className="border-2 border-[#2C3E50] rounded-2xl p-4 sm:p-6 shadow-lg bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <h3 className="text-lg sm:text-2xl font-bold text-[#2C3E50]">Recent Leads & Inquiries</h3>
                  <span className="text-white text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#FF6B35' }}>0 New</span>
                </div>
                <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center space-x-1">
                  <span className="hidden sm:inline">View all</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Container for Leads */}
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {recentLeads.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-xl p-8 text-center flex-1 flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-[#2C3E50] mb-1">No New Leads Just Yet</h4>
                        <p className="text-gray-600 text-sm max-w-xs">
                          Keep your listings active and engaging. Interested renters or buyers will show up here.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  recentLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-transparent border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                          {lead.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[#2C3E50] text-sm">{lead.name}</h4>
                              <p className="text-gray-500 text-xs truncate">{lead.email}</p>
                            </div>
                            <span className="text-gray-400 text-xs ml-2 flex-shrink-0">{lead.time}</span>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                            <p className="text-sm font-medium text-[#2C3E50] mb-2">Inquiry</p>
                            <p className="text-gray-600 text-sm leading-relaxed">{lead.message}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 text-[#2C3E50] text-sm">
                              <Phone className="w-4 h-4" />
                              <span>{lead.phone}</span>
                            </div>
                            <button className="px-3 py-1.5 hover:bg-green-700 text-[#2C3E50] font-semibold text-xs rounded-lg transition-colors">
                              Call
                            </button>
                            <button className="px-3 py-1.5  text-[#2C3E50] font-semibold text-xs rounded-lg transition-colors">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* My Recent Listings */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#2C3E50] mb-2">
                My Listings {recentListings.length > 0 && `(${recentListings.length})`}
              </h3>
              <p className="text-gray-600">
                {recentListings.length > 0 
                  ? 'Recent Listings are houses that have been uploaded for a week'
                  : 'All your property listings will appear here. Begin by uploading details and images of your house or apartment.'
                }
              </p>
            </div>

            {recentListings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-xl p-12 text-center"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#2C3E50] mb-2">Start by uploading a file</h4>
                    <p className="text-gray-600 max-w-md">
                      All your property listings will appear here. Begin by uploading details and images of your house or apartment.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/list-property')}
                    className="mt-4 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    style={{ backgroundColor: '#FF6B35' }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e85e2f')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FF6B35')}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Your First Property</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="relative h-48">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Building className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(listing.status)}`}>
                          {listing.status || 'Active'}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 bg-[#FF6B35] text-white px-2 py-1 rounded text-xs font-medium">
                        {listing.propertyType || 'Property'}
                      </div>
                      <div className="absolute bottom-4 right-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                        {listing.views || 0} Views
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-bold text-[#2C3E50] mb-2">{listing.title}</h4>
                      <p className="text-gray-600 text-sm mb-4">{formatPropertyAddress(listing)}</p>
                      
                      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Bed className="w-4 h-4" />
                          <span>{listing.rooms || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Bath className="w-4 h-4" />
                          <span>{listing.bathrooms || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-lg font-bold text-[#FF6B35]">
                            ₦{listing.price?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatListedDate(listing.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-1 px-3 py-2 border border-[#FF6B35] rounded-lg text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                          <span className="text-sm">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteProperty(listing.id)}
                          className="flex items-center space-x-1 px-3 py-2 border border-red-500 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
