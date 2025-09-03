import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Star, Menu, X } from 'lucide-react';

export default function HeroSection() {
  const [searchText, setSearchText] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  const handleSearchInputClick = () => {
    navigate('/login');
  };

  const handleGetStartedClick = () => {
    navigate('/signup');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: 'url("/Hero Section Image.png")',
        backgroundSize: 'cover',
        backgroundColor: '#1a1a1a'
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-transparent to-gray-800/30"></div>
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src="/Group 129.png" alt="HomeSwift Logo" className="w-15 h-15 rounded-lg object-cover" />
          <span className="text-white text-4xl italic tracking-tight">Swiftly</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-white text-lg font-medium border-b-2 border-white pb-1">Home</a>
          <a href="#" className="text-gray-300 text-lg hover:text-white transition-colors">FAQs</a>
          <a href="#" className="text-gray-300 text-lg hover:text-white transition-colors">About Us</a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleGetStartedClick}
            className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded-2xl font-medium hover:bg-gray-100 transition-colors"
          >
            <span>Get Started</span>
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <ArrowRight size={14} className="text-white" />
            </div>
          </button>
          <button
            onClick={handleLoginClick}
            className="bg-transparent border border-gray-400 text-white px-6 py-2 rounded-2xl font-medium hover:bg-white/10 transition-colors"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden text-white p-2"
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gray-400/50 z-20">
          <div className="px-6 py-6 space-y-6">
            <div className="space-y-4">
              <a href="#" className="block text-white text-lg font-medium border-b-2 border-white pb-1 w-fit">Home</a>
              <a href="#" className="block text-gray-300 text-lg hover:text-white transition-colors">FAQs</a>
              <a href="#" className="block text-gray-300 text-lg hover:text-white transition-colors">About Us</a>
            </div>
            <div className="pt-4 space-y-3">
              <button
                onClick={handleGetStartedClick}
                className="w-full flex items-center justify-center space-x-2 bg-white text-black px-6 py-2 rounded-2xl font-medium hover:bg-gray-100 transition-colors"
              >
                <span>Get Started</span>
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <ArrowRight size={14} className="text-white" />
                </div>
              </button>
              <button
                onClick={handleLoginClick}
                className="w-full bg-transparent border border-gray-400 text-white px-6 py-2 rounded-2xl font-medium hover:bg-white/10 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center">
        {/* Feature Tag */}
        <div className="flex items-center space-x-2 bg-gray-800/30 border border-gray-400/50 rounded-[2rem] px-6 py-3 mb-8">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span className="text-gray-300 text-sm font-medium">Smarter, faster, simpler home search</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight max-w-4xl">
          Tell Us What Kind Of<br />
          Home You Want
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-gray-300 mb-16 max-w-2xl leading-relaxed">
          Just type in your dream home, and HomeSwift AI will do the rest, matching you with the best options in seconds.
        </p>

        {/* Search Input */}
        <div className="w-full max-w-4xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onClick={handleSearchInputClick}
                placeholder="Describe your ideal home"
                className="w-full bg-transparent border border-gray-400/50 rounded-[2rem] px-8 py-10 text-white text-lg placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white/5 transition-all cursor-pointer"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
