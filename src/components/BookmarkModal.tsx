import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { X, Bookmark, CheckCircle, Heart, Play, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, doc, getDoc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { Anime } from '../types';

type BookmarkType = 'watch_later' | 'completed' | 'favorite';

export function BookmarkModal({ isOpen, onClose }: { isOpen: boolean; onClose: (navigated?: boolean) => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BookmarkType>('watch_later');
  const [bookmarks, setBookmarks] = useState<Record<string, { status: BookmarkType, addedAt: number }>>({});
  const [animeDetails, setAnimeDetails] = useState<Record<string, Anime>>({});
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const handlePlay = async (animeId: string) => {
    if (navigatingId) return;
    setNavigatingId(animeId);
    try {
      const q = query(
        collection(db, 'episodes'),
        where('animeId', '==', animeId)
      );
      const snap = await getDocs(q);
      const firstPublic = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(ep => ep.status === 'public')
        .sort((a, b) => a.episodeNumber - b.episodeNumber)[0];

      if (firstPublic) {
        navigate(`/episode/${firstPublic.id}`);
        onClose(true);
      } else {
        // If no episodes, just go to the anime's home page view
        navigate(`/?animeId=${animeId}`);
        onClose(true);
      }
    } catch (e) {
      console.error(e);
      navigate(`/?animeId=${animeId}`);
      onClose(true);
    }
    setNavigatingId(null);
  };

  useEffect(() => {
    if (!user || !isOpen) return;
    
    // Listen to bookmarks collection via onSnapshot
    const unsubscribe = onSnapshot(collection(db, 'users', user.id, 'bookmarks'), async (snap) => {
      const data: Record<string, { status: BookmarkType, addedAt: number }> = {};
      snap.forEach(doc => {
        data[doc.id] = doc.data() as any;
      });
      setBookmarks(data);
      
      // Fetch anime details for newly seen bookmarks
      setLoading(true);
      const newDetails = { ...animeDetails };
      const missingIds = Object.keys(data).filter(id => !newDetails[id]);
      
      if (missingIds.length > 0) {
        await Promise.all(missingIds.map(async (id) => {
          try {
            const docSnap = await getDoc(doc(db, 'anime', id));
            if (docSnap.exists()) {
              newDetails[id] = { id: docSnap.id, ...docSnap.data() } as Anime;
            }
          } catch(e) {}
        }));
        setAnimeDetails(newDetails);
      }
      setLoading(false);
    });
    
    // Listen to progress
    const unsubProgress = onSnapshot(collection(db, 'userProgress'), (snap) => {
      const data: Record<string, any> = {};
      snap.forEach(d => {
        if (d.id.startsWith(user.id + '_')) {
          const p = d.data();
          if (!data[p.animeId] || p.timestamp > data[p.animeId].timestamp) {
            data[p.animeId] = p;
          }
        }
      });
      setUserProgress(data);
    });

    return () => {
      unsubscribe();
      unsubProgress();
    };
  }, [user, isOpen]);

  // Filter bookmarked anime by current tab
  const tabAnimeIds = (Object.entries(bookmarks) as [string, { status: BookmarkType, addedAt: number }][])
    .filter(([_, b]) => b.status === activeTab)
    .sort((a, b) => b[1].addedAt - a[1].addedAt)
    .map(([id]) => id);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onClose()} className="fixed inset-0 bg-black/90 backdrop-blur-xl" />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] w-full max-w-5xl max-h-[85vh] shadow-4xl relative flex flex-col z-10 overflow-hidden"
      >
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
               <Bookmark size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">My Bookmarks</h2>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Manage your anime lists</p>
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

        <div className="flex flex-col sm:flex-row gap-3 p-6 sm:px-8 shrink-0 bg-black/20 border-b border-white/5">
           <button 
             onClick={() => setActiveTab('watch_later')}
             className={cn("flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all", 
               activeTab === 'watch_later' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white")}
           >
             <Bookmark size={16} /> Watch Later
           </button>
           <button 
             onClick={() => setActiveTab('completed')}
             className={cn("flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all", 
               activeTab === 'completed' ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white")}
           >
             <CheckCircle size={16} /> Series Completed
           </button>
           <button 
             onClick={() => setActiveTab('favorite')}
             className={cn("flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all", 
               activeTab === 'favorite' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white")}
           >
             <Heart size={16} className={cn(activeTab === 'favorite' && "fill-current")} /> Favorites
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar relative">
          {loading && tabAnimeIds.length === 0 ? (
            <div className="absolute inset-0 flex justify-center items-center"><div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-amber-500 animate-spin" /></div>
          ) : tabAnimeIds.length === 0 ? (
            <div className="text-center py-20">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                 {activeTab === 'watch_later' && <Bookmark size={32} />}
                 {activeTab === 'completed' && <CheckCircle size={32} />}
                 {activeTab === 'favorite' && <Heart size={32} />}
               </div>
               <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">No items found</h3>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                 Your {activeTab.replace('_', ' ')} list is empty.
               </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 pb-4">
              {tabAnimeIds.map(id => {
                const anime = animeDetails[id];
                if (!anime) return null;
                const progress = userProgress[id];
                const percentage = progress ? Math.min(100, (progress.watchedTime / progress.duration) * 100) : 0;
                
                return (
                  <button 
                    key={id} 
                    onClick={() => {
                      if (progress) {
                        navigate(`/episode/${progress.episodeId}`);
                        onClose(true);
                      } else {
                        handlePlay(anime.id);
                      }
                    }}
                    className="group flex flex-col bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer relative shadow-lg transform active:scale-95 text-left w-full"
                  >
                    <div className="relative w-full aspect-video bg-black/50 overflow-hidden shrink-0">
                      <img 
                        src={anime.bannerImage || anime.thumbnail} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                        alt={anime.title} 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {navigatingId === anime.id ? (
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-2xl scale-0 group-hover:scale-100 transition-all duration-300">
                            <Play size={20} fill="currentColor" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1 flex-col z-10">
                        {anime.rating && <span className="bg-amber-500/90 backdrop-blur-md text-black px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase shadow-lg">{(anime.rating / 10).toFixed(1)}</span>}
                        {progress && (
                           <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase shadow-lg">
                             E{progress.episodeNumber}
                           </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {progress && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-2 sm:p-3 flex flex-col justify-between">
                      <h4 className="font-bold text-zinc-200 text-xs sm:text-sm line-clamp-2 md:line-clamp-1 group-hover:text-amber-500 transition-colors tracking-wide leading-snug">
                        {anime.title}
                      </h4>
                      {progress && (
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 truncate">
                          Resuming at {Math.floor(progress.watchedTime / 60)}m
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
