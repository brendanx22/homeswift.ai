import React from 'react';

export default function BrandedSpinner({ message = 'Loading...' }) {
  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ 
        backgroundImage: 'url("/Rectangle 135.png")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* overlays to darken the hero */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-700/20 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <img 
            src="/images/logo.png" 
            alt="HomeSwift Logo" 
            className="w-7 h-7 rounded-md absolute inset-0 m-auto"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-gray-100 text-sm font-medium">{message}</p>
          <p className="text-gray-400 text-xs">This should only take a moment.</p>
        </div>
      </div>
    </div>
  );
}
