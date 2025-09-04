import React from 'react';
import { Plus, Zap, ArrowUpRight, Menu } from 'lucide-react';

export default function MainLanding() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0f0f10] text-white">
      {/* Background gradient and vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_50%_65%,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0.0)_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />

      {/* Top nav */}
      <header className="relative z-10 w-full flex items-center justify-between px-6 md:px-10 py-6">
        <div className="flex items-center gap-3">
          <img src="/Group 129.png" alt="HomeSwift" className="w-7 h-7 md:w-8 md:h-8 rounded-md" />
          <span className="text-[22px] md:text-[26px] font-semibold tracking-tight text-zinc-100">HomeSwift</span>
        </div>
        <button className="text-zinc-300 hover:text-white p-2" aria-label="menu">
          <Menu size={20} />
        </button>
      </header>

      {/* Hero content */}
      <main className="relative z-10 px-6 md:px-10 flex flex-col items-center text-center pt-14 md:pt-20">
        <h1 className="text-[34px] md:text-[56px] font-extrabold tracking-tight leading-[1.15] drop-shadow-[0_1px_0_rgba(255,255,255,0.08)]">
          Rent & Buy a Home
          <span className="mx-3 align-middle inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-md bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-inner"> 
            <span className="text-[18px] md:text-[22px]">🧊</span>
          </span>
          Swiftly
        </h1>
        <p className="mt-4 md:mt-5 text-zinc-300 text-[14px] md:text-[16px]">
          Rent or buy a home under 120 seconds with our AI model
        </p>

        {/* Search bar */}
        <div className="mt-10 md:mt-12 w-full max-w-5xl">
          <div className="relative rounded-[20px] md:rounded-[24px] border border-white/15 bg-white/5 backdrop-blur-xl shadow-[0_10px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <input
              type="text"
              placeholder="Describe the kind of house you are looking for..."
              className="w-full bg-transparent placeholder-zinc-400 text-zinc-100 text-[15px] md:text-[16px] px-5 md:px-6 pr-16 py-6 md:py-7 rounded-[20px] md:rounded-[24px] focus:outline-none"
            />

            {/* Left chips */}
            <div className="absolute left-3 md:left-4 bottom-3 md:bottom-4 flex items-center gap-2">
              <button className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-white/5 text-zinc-200 hover:bg-white/10 transition-colors">
                <Plus size={15} />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[13px] text-zinc-200 hover:bg-white/10 transition-colors">
                <Zap size={14} className="text-yellow-300" />
                <span>Suggestions</span>
              </button>
            </div>

            {/* Right action */}
            <button className="absolute right-3 md:right-4 bottom-3 md:bottom-4 w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-700/70 hover:bg-zinc-600 transition-colors flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.35)]" aria-label="submit">
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom vignette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28vh] md:h-[36vh] bg-[radial-gradient(70%_40%_at_50%_100%,rgba(0,0,0,0.65),rgba(0,0,0,0))]" />
    </div>
  );
}


