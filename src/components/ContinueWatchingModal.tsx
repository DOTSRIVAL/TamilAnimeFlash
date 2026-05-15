import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { X, Play, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn, formatTimeShort } from '../lib/utils';
import { Anime } from '../types';

export function ContinueWatchingModal({ isOpen, onClose }: { isOpen: boolean; onClose: (navigated?: boolean) => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadProgress = async () => {
        let matching: any[] = [];
        if (user) {
          const snapshot = await getDocs(collection(db, 'userProgress'));
          matching = snapshot.docs
            .filter(d => d.id.startsWith(user.id + '_'))
            .map(d => d.data());
        } else {
          const stored = localStorage.getItem('aniflow_progress');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              matching = Object.values(parsed) as any[];
            } catch(e) {}
          }
        }
        
        // Filter against existing anime and fetch details
        const animeSnapshot = await getDocs(collection(db, 'anime'));
        const activeAnimeMap = new Map();
        animeSnapshot.docs.forEach(d => activeAnimeMap.set(d.id, d.data()));
        
        // Final duplicate check: Only 1 entry per animeId, keep latest
        const latestPerAnime: Record<string, any> = {};
        matching.forEach(prog => {
          if (activeAnimeMap.has(prog.animeId)) {
            if (!latestPerAnime[prog.animeId] || (prog.timestamp > latestPerAnime[prog.animeId].timestamp)) {
              latestPerAnime[prog.animeId] = prog;
            }
          }
        });
        
        let matchingList = Object.values(latestPerAnime);
        matchingList.sort((a, b) => b.timestamp - a.timestamp);
        
        // Attach anime to records
        matchingList = matchingList.map(prog => ({
          ...prog,
          anime: activeAnimeMap.get(prog.animeId)
        }));
        
        setContinueWatching(matchingList);
      };
      
      loadProgress();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onClose()} className="fixed inset-0 bg-black/90 backdrop-blur-xl" />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] shadow-4xl relative flex flex-col z-10 overflow-hidden"
      >
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">Continue Watching</h2>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Pick up where you left off</p>
            </div>
          </div>
          <button 
            onClick={() => onClose()} 
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {continueWatching.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-600">
                <Play size={40} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">No active streams</h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                Episodes you start watching will appear here so you can easily resume them later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 pb-4">
              {continueWatching.map((prog, idx) => {
                const percentage = Math.min(100, Math.max(0, (prog.watchedTime / prog.duration) * 100));
                const anime = prog.anime;
                const hrs = Math.floor((prog.watchedTime || 0) / 3600);
                const mins = Math.floor(((prog.watchedTime || 0) % 3600) / 60);
                
                return (
                  <div 
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!navigatingId) {
                        setNavigatingId(prog.episodeId);
                        navigate(`/episode/${prog.episodeId}`);
                        onClose(true);
                      }
                    }}
                    className={cn(
                      "group flex flex-col bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer relative shadow-lg transform active:scale-95",
                      navigatingId === prog.episodeId ? "opacity-50 pointer-events-none" : ""
                    )}
                  >
                    <div className="relative w-full aspect-video bg-black/50 overflow-hidden shrink-0">
                      <img 
                        src={anime?.bannerImage || prog.thumbnail} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        alt={prog.animeTitle} 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {navigatingId === prog.episodeId ? (
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Play size={32} fill="white" className="drop-shadow-2xl" />
                        )}
                      </div>
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-rose-600/90 backdrop-blur-md text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                        S{prog.season} E{prog.episodeNumber}
                      </div>
                      
                      {/* Background Progress relative to image */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-0" />
                      <div className="absolute bottom-0 left-0 h-1 bg-rose-500 transition-all duration-500 ease-out z-10" style={{ width: `${percentage}%` }} />
                    </div>
                    
                    <div className="flex-1 p-2 sm:p-3 flex flex-col justify-between">
                      <h4 className="font-bold text-zinc-200 text-xs sm:text-sm line-clamp-2 md:line-clamp-1 group-hover:text-rose-400 transition-colors tracking-wide leading-snug mb-2">
                        {prog.animeTitle}
                      </h4>
                      
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest line-clamp-1">{prog.episodeTitle}</p>
                        
                        <div className="flex items-center">
                          <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg relative overflow-hidden group/time w-full">
                              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover/time:animate-[shimmer_2s_infinite]" />
                              <Clock size={12} className="text-amber-500 shrink-0" />
                              <span className="text-[10px] sm:text-xs font-black text-amber-500 tracking-wider truncate">
                                {hrs > 0 && <>{hrs} <span className="text-[8px] sm:text-[9px] text-amber-500/60 uppercase">h </span></>}
                                {mins} <span className="text-[8px] sm:text-[9px] text-amber-500/60 uppercase">m</span>
                              </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

