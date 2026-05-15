import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Play, LayoutGrid } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Anime } from '../types';

export function WatchHistoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: (navigated?: boolean) => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        // We'll fetch all progress then filter by id (temporary until all records have userId)
        const progressSnap = await getDocs(collection(db, 'userProgress'));
        const userProgress = progressSnap.docs
          .filter(d => d.id.startsWith(user.id + '_'))
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => (p as any).watchTimeSeconds > 0)
          .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

        // Get anime details for each
        const historyData = await Promise.all(
          userProgress.map(async (prog: any) => {
            const animeSnap = await getDoc(doc(db, 'anime', prog.animeId));
            if (animeSnap.exists()) {
              return {
                ...prog,
                anime: { id: animeSnap.id, ...animeSnap.data() } as Anime
              };
            }
            return null;
          })
        );
        
        setHistory(historyData.filter(Boolean));
      } catch (e) {
        console.error("Error fetching watch history:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose()}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[85vh] bg-[#0a0a0b] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
              <Clock size={16} className="sm:w-[20px] sm:h-[20px]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
                {user?.displayName || user?.username || 'Your'} Watch History
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                Total Watch Time Analysis
              </p>
            </div>
          </div>
          <button
            onClick={() => onClose()}
            className="p-2 sm:p-2.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={18} className="sm:w-[22px] sm:h-[22px]" />
          </button>
        </div>

        {/* Total Time View Header */}
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 border-b border-white/5 bg-gradient-to-b from-rose-500/5 to-transparent">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Total Time Spent</span>
            <div className="text-4xl sm:text-5xl font-black text-rose-500 tracking-tighter flex items-end gap-2">
                {Math.floor((user?.totalWatchTimeSeconds || 0) / 3600)}
                <span className="text-sm sm:text-base text-rose-500/50 mb-1 sm:mb-2 mr-2">HRS</span>
                {Math.floor(((user?.totalWatchTimeSeconds || 0) % 3600) / 60)}
                <span className="text-sm sm:text-base text-rose-500/50 mb-1 sm:mb-2">MINS</span>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-48 sm:h-64 px-4 space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-600 mb-2">
                <Clock size={24} className="sm:w-[32px] sm:h-[32px]" />
              </div>
              <div className="max-w-[260px] sm:max-w-none">
                <p className="text-sm sm:text-base font-black uppercase tracking-widest text-zinc-400">No Watch History</p>
                <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1 md:mt-2 px-4 leading-relaxed">Start watching some anime to see your detailed watch time analysis here.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 pb-4">
              {history.map((record, index) => {
                const anime = record.anime;
                const hrs = Math.floor((record.watchTimeSeconds || 0) / 3600);
                const mins = Math.floor(((record.watchTimeSeconds || 0) % 3600) / 60);
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (!navigatingId) {
                        setNavigatingId(anime.id);
                        navigate(`/episode/${record.episodeId || anime.id}`);
                        onClose(true);
                      }
                    }}
                    className={cn(
                      "group flex flex-col bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer relative shadow-lg transform active:scale-95",
                      navigatingId === anime.id ? "opacity-50 pointer-events-none" : ""
                    )}
                  >
                    <div className="relative w-full aspect-video bg-black/50 overflow-hidden shrink-0">
                      <img
                        src={anime.bannerImage || anime.thumbnail}
                        alt={anime.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {navigatingId === anime.id ? (
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Play size={32} fill="white" className="drop-shadow-2xl" />
                        )}
                      </div>
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-rose-600/90 backdrop-blur-md text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                         EP {record.episodeNumber || '?'}
                      </div>
                      
                      {/* Background Progress relative to image */}
                      <div 
                          className="absolute bottom-0 left-0 h-1 bg-rose-500 transition-all duration-500 ease-out z-10" 
                          style={{ width: `${record.progress || 0}%` }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-0" />
                    </div>

                    <div className="flex-1 p-2 sm:p-3 flex flex-col justify-between">
                       <h3 className="font-bold text-zinc-200 text-xs sm:text-sm line-clamp-2 md:line-clamp-1 group-hover:text-rose-400 transition-colors tracking-wide leading-snug mb-2">
                        {anime.title}
                       </h3>
                       
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
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
