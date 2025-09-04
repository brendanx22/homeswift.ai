import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowRight, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroSection() {
  const [searchText, setSearchText] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/login');
  };



  const handleGetStartedClick = () => {
    navigate('/login');
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
      <motion.header
        className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src="/Group 129.png" alt="HomeSwift Logo" className="w-6 h-6 rounded-lg object-cover" />
          <span className="text-white text-2xl tracking-tight">Home<span className="italic">Swift</span></span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-white text-md font-medium border-b-2 border-white pb-1">Home</a>
          <a href="#" className="text-gray-300 text-md hover:text-white transition-colors">FAQs</a>
          <a href="#" className="text-gray-300 text-md hover:text-white transition-colors">About Us</a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleGetStartedClick}
            className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            <span>Get Started</span>
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <ArrowRight size={14} className="text-white" />
            </div>
          </button>
          <button
            onClick={handleLoginClick}
            className="bg-transparent border border-gray-400 text-white px-6 py-2 rounded-full font-medium hover:bg-white/10 transition-colors"
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
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="md:hidden absolute top-20 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gray-400/50 z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
          <div className="px-6 py-6 space-y-6">
            <div className="space-y-4">
              <a href="#" className="block text-white text-lg font-medium border-b-2 border-white pb-1 w-fit">Home</a>
              <a href="#" className="block text-gray-300 text-lg hover:text-white transition-colors">FAQs</a>
              <a href="#" className="block text-gray-300 text-lg hover:text-white transition-colors">About Us</a>
            </div>
            <div className="pt-4 space-y-3">
              <button
                onClick={handleGetStartedClick}
                className="w-full flex items-center justify-center space-x-2 bg-white text-black px-4 py-2 rounded-2xl font-medium hover:bg-gray-100 transition-colors"
              >
                <span>Get Started</span>
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <ArrowRight size={10} className="text-white" />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-180px)] px-6 text-center">
        {/* Feature Tag */}
        <motion.div
          className="flex items-center space-x-2 bg-[#262626] rounded-[2rem] px-6 py-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
                     <Sparkles className="w-4 h-4 text-white" />
          <span className="text-gray-300 text-sm font-medium">Smarter, faster, simpler home search</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          className="text-3xl md:text-4xl lg:text-5xl text-white mb-4 leading-tight max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
        >
          Tell Us What Kind Of<br />
          Home You Want
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          className="text-sm md:text-sm text-gray-300 mb-16 max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
        >
        Describe your dream home—cozy apartment, family house, or modern duplex. HomeSwift AI understands and instantly connects you with the best options.
        </motion.p>

        {/* Search Input */}
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.7 }}
        >
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
                             <input
                 type="text"
                 value={searchText}
                 onChange={(e) => setSearchText(e.target.value)}
                 placeholder="Describe your ideal home"
                 className="w-full bg-transparent border border-[#262626] rounded-full px-6 py-6 text-white text-md placeholder-[#404040] focus:outline-none focus:border-gray-300 focus:bg-white/5 transition-all"
               />
                             <button
                 type="submit"
                 onClick={() => navigate('/login')}
                 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black bg-white  px-3 py-3 rounded-full"
               >
                 <ArrowUp size={20}/>
               </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}