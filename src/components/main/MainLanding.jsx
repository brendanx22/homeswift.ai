import React from 'react';
import { Plus, Zap, ArrowUpRight, Menu, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MainLanding() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0b0b0c] text-white">
      {/* Vignette + glow */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(55%_40%_at_50%_68%,rgba(255,255,255,.08)_0%,rgba(255,255,255,0)_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Top nav */}
      <motion.header
        className="relative z-10 w-full flex items-center justify-between px-7 md:px-12 pt-7"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-3 select-none">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Home size={16} />
          </div>
          <span className="text-[26px] leading-none font-semibold tracking-tight">HomeSwift</span>
        </div>
        <button className="p-2 text-zinc-300 hover:text-white" aria-label="menu">
          <Menu size={20} />
        </button>
      </motion.header>

      {/* Hero */}
      <main className="relative z-10 px-6 md:px-12 pt-24 md:pt-36 flex flex-col items-center text-center">
        <motion.h1
          className="font-extrabold tracking-tight leading-[1.1] text-[34px] md:text-[56px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          <span>Rent & Buy a Home</span>
          {/* Home icon to match screenshot */}
          <span aria-hidden className="mx-3 inline-flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-md bg-gradient-to-b from-blue-500 to-purple-600 align-[0.1em]">
            <Home size={16} className="md:w-4 md:h-4" />
          </span>
          <span>Swiftly</span>
        </motion.h1>
        <motion.p
          className="mt-3 md:mt-4 text-zinc-300 text-[14px] md:text-[16px] max-w-md md:max-w-lg mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
        >
          Rent or buy a home under 120 seconds with our AI model
        </motion.p>

        {/* Search card */}
        <motion.div
          className="mt-12 md:mt-16 w-full max-w-[980px]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
        >
          <div className="relative rounded-full border ">
            {/* input */}
            <input
              type="text"
              placeholder="Describe the kind of house you are looking for..."
              className="w-full bg-transparent placeholder-zinc-400 text-zinc-100 text-[16px] md:text-[18px] px-6 md:px-8 pr-20 py-6 md:py-8 rounded-2xl focus:outline-none"
            />

            {/* left controls */}
            <div className="absolute left-4 md:left-5 bottom-3.5 md:bottom-4 flex items-center gap-2.5">
              <button className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 transition-colors">
                <Plus size={16} />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 md:px-4 py-1.5 text-[13px] md:text-[14px] text-zinc-200 hover:bg-white/10 transition-colors">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full ">
                  <Zap size={10} className="text-white" />
                </span>
                <span>Suggestions</span>
              </button>
            </div>

            {/* right action */}
            <button
              className="absolute right-4 md:right-5 bottom-3.5 md:bottom-4 w-10 h-10 md:w-11 md:h-11 rounded-full transition-colors flex items-center justify-center"
              aria-label="submit"
            >
              <ArrowUpRight size={18} className="text-white" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* bottom vignette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34vh] [background:radial-gradient(70%_40%_at_50%_100%,rgba(0,0,0,0.7),rgba(0,0,0,0))]" />
    </div>
  );
}