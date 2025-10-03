import React from 'react';
import { motion } from 'framer-motion';

export default function BrandedSpinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center p-6">
      <div className="relative">
        {/* Animated background elements */}
        <motion.div 
          className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Main spinner */}
        <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="relative w-20 h-20 mb-6">
            {/* Outer ring */}
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1.5, 
                ease: "linear",
                repeat: Infinity
              }}
            />
            
            {/* Middle ring */}
            <motion.div 
              className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500"
              animate={{ rotate: -360 }}
              transition={{ 
                duration: 2, 
                ease: "linear",
                repeat: Infinity
              }}
            />
            
            {/* Logo */}
            <div className="absolute inset-4 flex items-center justify-center">
              <img 
                src="/images/logo.png" 
                alt="HomeSwift" 
                className="w-8 h-8 rounded-md"
              />
            </div>
          </div>
          
          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold text-white mb-1">HomeSwift</h3>
            <p className="text-sm text-gray-300">{message}</p>
            <motion.div 
              className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ scaleX: 0.2 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              style={{ originX: 0 }}
            />
          </motion.div>
        </div>
        
        {/* Subtle floating elements */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5 backdrop-blur-sm"
            style={{
              width: Math.random() * 40 + 20,
              height: Math.random() * 40 + 20,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [0, 20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.5
            }}
          />
        ))}
      </div>
    </div>
  );
}
