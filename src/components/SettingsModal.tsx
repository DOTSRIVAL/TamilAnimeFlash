import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { X, Settings, PlayCircle, Subtitles, Monitor, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [autoplay, setAutoplay] = useState(true);
  const [defaultQuality, setDefaultQuality] = useState('auto');
  const [themeMode, setThemeMode] = useState('cinematic');

  useEffect(() => {
    if (isOpen) {
      setAutoplay(localStorage.getItem('aniflow_autoplay') !== 'false');
      setDefaultQuality(localStorage.getItem('aniflow_quality') || 'auto');
      setThemeMode(localStorage.getItem('aniflow_theme') || 'cinematic');
    }
  }, [isOpen]);

  const saveSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
    if (key === 'aniflow_autoplay') setAutoplay(value === 'true');
    if (key === 'aniflow_quality') setDefaultQuality(value);
    if (key === 'aniflow_theme') {
      setThemeMode(value);
      if (value === 'amoled') {
        document.documentElement.classList.add('theme-amoled');
      } else {
        document.documentElement.classList.remove('theme-amoled');
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-xl" />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] w-full max-w-md shadow-4xl relative flex flex-col z-10 overflow-hidden"
      >
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-500/10 flex items-center justify-center text-zinc-400 border border-zinc-500/20">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">Settings</h2>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Playback & Preferences</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 group transition-all"
          >
            <div className="p-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl flex items-center gap-2 border border-white/5">
              <ChevronLeft size={16} />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest group-hover:block transition-all hidden pr-1">Back</span>
            </div>
            <div className="sm:hidden p-3 bg-white/5 text-zinc-400 rounded-xl pointer-events-none">
              <X size={20} />
            </div>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
               <Subtitles size={14} className="text-emerald-500" /> UI Theme Mode
            </label>
            <div className="flex gap-3">
              <button 
                onClick={() => saveSetting('aniflow_theme', 'cinematic')} 
                className={cn("flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all", themeMode === 'cinematic' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white/5 text-zinc-500 hover:bg-white/10")}
              >
                Cinematic (Dark)
              </button>
              <button 
                onClick={() => saveSetting('aniflow_theme', 'amoled')} 
                className={cn("flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all", themeMode === 'amoled' ? "bg-black border border-white/20 text-white" : "bg-white/5 text-zinc-500 hover:bg-white/10")}
              >
                AMOLED (Pitch Black)
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>,
    document.body
  );
}
