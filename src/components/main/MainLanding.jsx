import React from 'react';
import { Plus, Zap, ArrowUpRight, Menu } from 'lucide-react';

export default function MainLanding() {
  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black text-white"
    >
      {/* Top nav */}
      <header className="w-full flex items-center justify-between px-6 md:px-10 py-6">
        <div className="flex items-center gap-3">
          <img src="/Group 129.png" alt="HomeSwift" className="w-8 h-8 rounded-xl" />
          <span className="text-xl md:text-2xl font-semibold tracking-tight">HomeSwift</span>
        </div>
        <button className="text-zinc-300 hover:text-white p-2" aria-label="menu">
          <Menu size={22} />
        </button>
      </header>

      {/* Hero content */}
      <main className="px-6 md:px-10 flex flex-col items-center text-center pt-10 md:pt-16">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Rent & Buy a Home <span className="align-middle inline-flex items-center justify-center mx-2 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-zinc-300/20">🧊</span> Swiftly
        </h1>
        <p className="mt-4 md:mt-6 text-zinc-300 text-base md:text-lg">
          Rent or buy a home under 120 seconds with our AI model
        </p>

        {/* Search bar */}
        <div className="mt-10 md:mt-14 w-full max-w-4xl">
          <div className="relative rounded-[28px] border border-zinc-700/70 bg-zinc-800/40 backdrop-blur-sm shadow-[0_0_120px_rgba(255,255,255,0.06)]">
            <input
              type="text"
              placeholder="Describe the kind of house you are looking for..."
              className="w-full bg-transparent placeholder-zinc-400 text-zinc-100 text-base md:text-lg px-6 md:px-8 pr-16 py-5 md:py-6 rounded-[28px] focus:outline-none"
            />

            {/* Left chips */}
            <div className="absolute left-3 md:left-4 bottom-3 md:bottom-4 flex items-center gap-2">
              <button className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-zinc-600/60 text-zinc-200 hover:bg-white/10 transition-colors">
                <Plus size={16} />
              </button>
              <button className="hidden sm:inline-flex items-center gap-2 rounded-full border border-zinc-600/60 px-3.5 py-1.5 text-sm text-zinc-200 hover:bg-white/10 transition-colors">
                <Zap size={16} className="text-yellow-300" />
                <span>Suggestions</span>
              </button>
            </div>

            {/* Right action */}
            <button className="absolute right-3 md:right-4 bottom-3 md:bottom-4 w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-700/70 hover:bg-zinc-600 transition-colors flex items-center justify-center" aria-label="submit">
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black via-black/20 to-transparent" />
    </div>
  );
}


