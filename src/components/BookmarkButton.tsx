import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Bookmark, CheckCircle, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { Anime } from '../types';

export function BookmarkButton({ animeId, className, up, showText = false }: { animeId: string, className?: string, up?: boolean, showText?: boolean }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'watch_later' | 'completed' | 'favorite' | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Use onSnapshot for real-time sync across all components
    const unsub = onSnapshot(doc(db, 'users', user.id, 'bookmarks', String(animeId)), (snap) => {
      if (snap.exists()) {
        setStatus(snap.data().status);
      } else {
        setStatus(null);
      }
    });

    return () => unsub();
  }, [user, animeId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = async (newStatus: 'watch_later' | 'completed' | 'favorite') => {
    if (!user) return;
    
    if (status === newStatus) {
      // Remove bookmark
      await deleteDoc(doc(db, 'users', user.id, 'bookmarks', String(animeId)));
      // Also remove from anime subscribers list for notifications
      try {
        await deleteDoc(doc(db, 'anime', String(animeId), 'subscribers', user.id));
      } catch (e) {}
    } else {
      // Add or update
      await setDoc(doc(db, 'users', user.id, 'bookmarks', String(animeId)), {
        animeId: String(animeId),
        status: newStatus,
        addedAt: Date.now()
      });
      // Also add to anime subscribers list for notifications
      try {
        await setDoc(doc(db, 'anime', String(animeId), 'subscribers', user.id), {
          userId: user.id,
          email: user.email,
          createdAt: Date.now()
        });
      } catch (e) {}
    }
    setIsOpen(false);
  };

  const getIcon = () => {
    switch (status) {
      case 'watch_later': return <Bookmark size={16} fill="currentColor" />;
      case 'completed': return <CheckCircle size={16} fill="currentColor" />;
      case 'favorite': return <Heart size={16} fill="currentColor" />;
      default: return <Bookmark size={16} />; // Replacing Plus with Bookmark
    }
  };

  const getText = () => {
    switch (status) {
      case 'watch_later': return 'Watch Later';
      case 'completed': return 'Completed';
      case 'favorite': return 'Favorite';
      default: return 'Add to List';
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
        className={cn(
          "flex items-center justify-center transition-all bg-black/40 backdrop-blur-md border",
          showText ? "px-3 py-2 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest" : "w-8 h-8 rounded-full",
          status === 'watch_later' ? "text-amber-500 border-amber-500/50 shadow-lg shadow-amber-500/20" :
          status === 'completed' ? "text-green-500 border-green-500/50 shadow-lg shadow-green-500/20" :
          status === 'favorite' ? "text-rose-500 border-rose-500/50 shadow-lg shadow-rose-500/20" :
          "text-zinc-400 border-white/10 hover:text-white hover:bg-white/10 hover:border-white/20",
          className
        )}
      >
        {getIcon()}
        {showText && <span>{getText()}</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: up ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: up ? -10 : 10 }}
            className={cn(
              "absolute right-0 sm:-left-4 sm:right-auto mt-2 min-w-[180px] w-max bg-[#16161a]/95 backdrop-blur-3xl border border-white/10 rounded-[1.25rem] shadow-4xl overflow-hidden z-[100] flex flex-col p-1.5 sm:origin-top-left origin-top-right",
              up ? "bottom-full mb-2 mt-0 sm:origin-bottom-left origin-bottom-right" : "top-full"
            )}
          >
            <div className="px-3 py-2 border-b border-white/5 mb-1 bg-white/[0.02]">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] whitespace-nowrap">Select Action</span>
            </div>
            <button 
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdate('watch_later'); }}
               className={cn("flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-left whitespace-nowrap", status === 'watch_later' ? "bg-amber-500/10 text-amber-500" : "hover:bg-white/5 text-zinc-400 hover:text-white")}
            >
               <Bookmark size={12} className={cn(status === 'watch_later' ? "fill-current shrink-0" : "shrink-0")} /> Watch Later
            </button>
            <button 
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdate('completed'); }}
               className={cn("flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-left whitespace-nowrap", status === 'completed' ? "bg-green-500/10 text-green-500" : "hover:bg-white/5 text-zinc-400 hover:text-white")}
            >
               <CheckCircle size={12} className={cn(status === 'completed' ? "fill-current shrink-0" : "shrink-0")} /> Complete Series
            </button>
            <button 
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdate('favorite'); }}
               className={cn("flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-left whitespace-nowrap", status === 'favorite' ? "bg-rose-500/10 text-rose-500" : "hover:bg-white/5 text-zinc-400 hover:text-white")}
            >
               <Heart size={12} className={cn(status === 'favorite' ? "fill-current shrink-0" : "shrink-0")} /> Favorite
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
