import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  PenTool, 
  Mic, 
  Image, 
  FileText, 
  Clock, 
  Calendar,
  MessageCircle,
  Coins, 
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const [activeItem, setActiveItem] = useState('Ask');
  const [searchText, setSearchText] = useState('');

  const navigationItems = [
    { id: 'Message', icon: MessageCircle, label: 'Message' },
    { id: 'Calender', icon: Calendar, label: 'Calender' },
    { id: 'Files', icon: FileText, label: 'Files' },
    { id: 'Coins', icon: Coins, label: 'Transactions' }
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
  };

  return (
    <motion.div
      className={` border-r border-gray-700/50 flex flex-col h-full transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header with Logo */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <img 
                src="/Group 129.png" 
                alt="HomeSwift Logo" 
                className="w-6 h-6 object-cover" 
              />
              <span className="text-white text-xl font-bold">HomeSwift</span>
            </motion.div>
          )}
          {isCollapsed && (
            <motion.div
              className="flex justify-center w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <img 
                src="/Group 129.png" 
                alt="HomeSwift Logo" 
                className="w-6 h-6 rounded-lg object-cover" 
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <motion.div
          className={`relative ${isCollapsed ? 'flex justify-center' : ''}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!isCollapsed ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent border border-gray-600/50 rounded-xl px-10 py-2 text-white placeholder-white text-sm focus:outline-none focus:border-gray-500 focus:bg-gray-800/70 transition-all"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-xs">
                Ctrl+K
              </div>
            </div>
          ) : (
            <motion.button
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800/50 border border-gray-600/50 text-white hover:text-white hover:bg-gray-800/70 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4 space-y-1">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gray-700/50 text-white border border-gray-600/50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}

      </div>

      
    </motion.div>
  );
}
