import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Hls from 'hls.js';
import { GoogleGenAI } from '@google/genai';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

import {
  Play, 
  Search, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  LayoutGrid,
  Upload, 
  ChevronRight, 
  Star, 
  Calendar,
  Menu,
  X,
  SkipForward,
  SkipBack,
  Shuffle,
  ChevronLeft,
  Plus,
  Eye,
  EyeOff,
  Camera,
  Check,
  CheckCircle,
  PlayCircle,
  Bookmark,
  Lock,
  Settings,
  Instagram,
  Youtube,
  Send,
  MessageSquare,
  Mail,
  Heart,
  Users,
  Bug,
  Subtitles,
  Home,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Clock,
  Library,
  Globe,
  MessageCircle,
  Share2,
  Edit3,
  Video,
  BarChart,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCcw,
  RefreshCw,
  Radio,
  FileText,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  TrendingUp as TrendingIcon,
  Clock3,
  Award,
  Zap,
  Flame,
  Smartphone,
  Monitor,
  Monitor as TVIcon,
  MonitorSmartphone,
  Tablet,
  Download,
  ExternalLink,
  Shield,
  ShieldCheck,
  CreditCard,
  Lock as LockIcon,
  Unlock,
  Bell,
  BellRing,
  HelpCircle,
  Info,
  Layers,
  Moon,
  Sun,
  Palette,
  Compass,
  History,
  Film,
  Tv,
  List,
  Grid,
  Filter,
  SortAsc,
  DownloadCloud,
  Maximize2,
  Maximize,
  Minimize2,
  Minimize,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Copy,
  Check as CheckIcon,
  Crop,
  StretchHorizontal,
  Database,
  Key,
  Link as LinkIcon,
  Folder,
  GripVertical,
  RotateCcw,
  RotateCw,
  Pause,
  Sparkles,
  Image,
  CircleX
} from 'lucide-react';
import { searchAniList } from './services/anilistService';
import { searchTMDB, getTMDBEpisodes, getAniListEpisodes, getTMDBDetails, searchKitsu, getKitsuEpisodes, searchJikan, searchJikanCharacter, getJikanEpisodes, searchDanbooru, searchGoogleImages, searchUnsplash, searchPexels, searchPixabay, setMetadataKeys } from './services/metadataService';
import { searchApiKeysWithAI } from './services/geminiService';
import { cn, formatTimeShort, compressImage } from './lib/utils';
import { WebsiteConfigProvider, useWebsiteConfig, WebsiteConfig, ApiKeyRecord } from './context/WebsiteConfigContext';
import { ContinueWatchingModal } from './components/ContinueWatchingModal';
import { BookmarkModal } from './components/BookmarkModal';
import { WatchHistoryModal } from './components/WatchHistoryModal';
import { BookmarkButton } from './components/BookmarkButton';
import { SettingsModal } from './components/SettingsModal';
import { EditWebsiteModal } from './components/EditWebsiteModal';
import { AvatarsManager } from './components/AvatarsManager';
import { AnimeRequestModal } from './components/AnimeRequestModal';

const AVATAR_COLLECTIONS: Record<string, string[]> = {
  "Bleach": [
    "https://wsrv.nl/?url=i.pinimg.com/736x/82/ac/5c/82ac5c26bdf69a68de629f57ebbf7fc7.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/60/76/89/607689dca3e5272a2f8bdf9b3e18a931.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/ec/d7/20/ecd720eeea62c2fbeaaf1c5ac662e737.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/a4/09/bd/a409bd1bbddb51f0fcd6fd6f890cf282.jpg"
  ],
  "Naruto": [
    "https://wsrv.nl/?url=i.pinimg.com/736x/8f/a0/02/8fa00206103f16bc4cc4edffbfe100c5.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/eb/79/f5/eb79f53e070d64cc7d3ff13ce8286f7b.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/2b/43/66/2b43666d9abdbb99d6c70b8a3e7dbb1f.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/8a/cc/34/8acc3442657d19c011e40ebfb77ae4b4.jpg"
  ],
  "OnePiece": [
    "https://wsrv.nl/?url=i.pinimg.com/736x/21/fe/20/21fe203248386de913e614bc4da07e99.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/e4/21/53/e42153bb5352cbb7a876a3939fc9f12d.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/ec/d6/ac/ecd6ace4d265c0bb6f1e69da5982823a.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/f6/00/c7/f600c7e2ed9e5bdcf9a58434771cff71.jpg"
  ],
  "DemonSlayer": [
    "https://wsrv.nl/?url=i.pinimg.com/736x/b6/2a/52/b62a52dfdb0d8927806f0e4b2d5a3c20.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/77/84/af/7784af2dd861e68ce0b0cf7bc508c903.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/ad/e5/22/ade522616f9f6880ea8f3522ce11a7c5.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/2e/0f/76/2e0f76cd1f9e80ba5cf44e0586e9cd8f.jpg"
  ],
  "SpyXFamily": [
    "https://wsrv.nl/?url=i.pinimg.com/736x/11/48/dd/1148dd2632bcfce4eecded4255776d54.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/3b/b1/d5/3bb1d5c2fcba59a22d56c075f92270bb.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/f8/bf/bd/f8bfbdeba59929837cc6b7190013d789.jpg"
  ],
  "TokyoGhoul": [
    "https://wsrv.nl/?url=i.pinimg.com/736x/43/97/81/4397811cd48bba4cc3e6fc1f71a74d22.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/91/9f/fa/919ffa8c04ec0d8763ecec695bb38891.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/db/2a/0f/db2a0f8bfdfcb762df2dfedda9ab9027.jpg"
  ],
  "DragonBall": [
    "https://wsrv.nl/?url=i.pinimg.com/736x/10/7c/cc/107cccf4fc51ccfbb8da998dbf5a2c27.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/60/ba/bd/60babd41b6196ff34ff833b7e716ed5d.jpg",
    "https://wsrv.nl/?url=i.pinimg.com/736x/a2/6b/6a/a26b6ab78f0b1825b0cb0e3a6bc41151.jpg"
  ]
};
const ANIME_AVATARS = Object.values(AVATAR_COLLECTIONS).flat();
const LANGUAGES = ["Multi", "Sub", "Dub", "Tamil", "English", "Hindi", "Telugu", "Malayalam", "Japanese", "Korean", "Chinese"];
import { User, Anime, Episode, Studio, UserComment, Issue, Category, AnimeRequest } from './types.ts';
import { auth, db } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  limit,
  setDoc,
  deleteDoc,
  addDoc,
  collectionGroup,
  updateDoc,
  increment,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';

// --- Components ---
const FilePreview = ({ url, type, name, onClear }: { url: string, type: 'image' | 'video' | 'audio', name?: string, onClear?: () => void }) => {
  return (
    <div className="relative group bg-black/40 border border-white/10 rounded-2xl overflow-hidden p-2">
      {onClear && (
        <button onClick={onClear} className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-rose-600 rounded-full text-white transition-all">
          <X size={16} />
        </button>
      )}
      {type === 'image' && <img src={url} className="w-full h-auto max-h-64 object-contain rounded-xl" />}
      {type === 'video' && <video src={url} controls className="w-full h-auto max-h-64 rounded-xl" />}
      {type === 'audio' && (
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-zinc-400">
            <Radio size={20} className="text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">{name || 'Audio Transmission'}</span>
          </div>
          <audio src={url} controls className="w-full h-10" />
        </div>
      )}
    </div>
  );
};

const NotificationMediaModal = ({ onClose, attachment }: { onClose: () => void, attachment: { url: string, type: 'image' | 'video' | 'audio', name?: string } }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
       <motion.div 
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9, y: 20 }}
         className="bg-[#16161a] border border-white/10 rounded-[3rem] p-4 max-w-4xl w-full shadow-4xl relative overflow-hidden"
       >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-2 bg-black/60 hover:bg-rose-600 rounded-full text-white transition-all"
          >
            <X size={20} />
          </button>

          <div className="p-4 md:p-8 space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                   {attachment.type === 'image' && <Image size={24} />}
                   {attachment.type === 'video' && <Video size={24} />}
                   {attachment.type === 'audio' && <Radio size={24} />}
                </div>
                <div>
                   <h2 className="text-xl font-black text-white uppercase tracking-tighter line-clamp-1">{attachment.name || 'Secure Asset Notification'}</h2>
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">External Signal Content</p>
                </div>
             </div>

             <div className="bg-black/60 rounded-[2rem] overflow-hidden border border-white/5 shadow-inner">
                {attachment.type === 'image' && <img src={attachment.url} className="w-full h-auto max-h-[70vh] object-contain mx-auto" />}
                {attachment.type === 'video' && <video src={attachment.url} controls autoPlay className="w-full h-auto max-h-[70vh]" />}
                {attachment.type === 'audio' && (
                  <div className="p-12 flex flex-col items-center justify-center gap-8">
                     <motion.div 
                       animate={{ scale: [1, 1.1, 1] }}
                       transition={{ repeat: Infinity, duration: 2 }}
                       className="w-32 h-32 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-500 border-2 border-purple-500/30"
                     >
                        <Radio size={48} />
                     </motion.div>
                     <audio src={attachment.url} controls autoPlay className="w-full max-w-md" />
                  </div>
                )}
             </div>

             <button 
               onClick={onClose}
               className="w-full py-4 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
             >
               Back to Transmission Log
             </button>
          </div>
       </motion.div>
    </div>
  );
};

// --- Notifications Utility ---
const formatDate = (timestamp: number) => {
  const d = new Date(timestamp);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();
};

async function triggerNewEpisodeNotification(animeId: string, episode: Episode) {
  try {
    // 1. Get Anime details
    const animeDoc = await getDoc(doc(db, 'anime', animeId));
    if (!animeDoc.exists()) return;
    const anime = animeDoc.data() as Anime;

    // 2. Find all users who subscribed to this anime (using the new direct subcollection)
    const subscribersSnap = await getDocs(collection(db, 'anime', animeId, 'subscribers'));
    
    if (subscribersSnap.empty) {
      console.log("No subscribers found for", anime.title);
      return;
    }

    const batches: Promise<any>[] = [];
    subscribersSnap.docs.forEach(subDoc => {
      const userId = subDoc.id; // Correct UID
      
      const notifRef = doc(collection(db, 'users', userId, 'notifications'));
      batches.push(setDoc(notifRef, {
        id: notifRef.id,
        userId: userId,
        title: 'New Episode Alert! 🔔',
        message: `Episode ${episode.episodeNumber} of ${anime.title} is now out!`,
        type: 'new_episode',
        animeId: animeId,
        episodeId: episode.id,
        image: anime.thumbnail,
        isRead: false,
        createdAt: Date.now()
      }));
    });

    await Promise.all(batches);
    console.log(`Sent ${batches.length} notifications for ${anime.title} Ep ${episode.episodeNumber}`);
  } catch (err) {
    console.error("Failed to trigger notifications:", err);
  }
}

const ConfirmDeleteButton = ({ onConfirm, className, defaultIcon = <Trash2 size={14} />, isBlock = false, textClass = "text-[9px]", isFast = false }: { onConfirm: () => void, className?: string, defaultIcon?: React.ReactNode, isBlock?: boolean, textClass?: string, isFast?: boolean }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const timeoutRef = useRef<any>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirming || isFast) {
      onConfirm();
      setIsConfirming(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      setIsConfirming(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsConfirming(false);
      }, 5000); // 5 seconds instead of 3
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={cn(
        "transition-all flex items-center justify-center overflow-hidden relative border",
        isConfirming 
          ? "bg-rose-600 font-black uppercase tracking-tighter text-white border-rose-400 shadow-xl shadow-rose-600/20 z-10" 
          : "bg-white/5 hover:bg-rose-600 text-zinc-400 hover:text-white border-white/5",
        textClass,
        className,
        isConfirming && !isBlock ? "!w-32 px-3" : (!isBlock && !className?.includes('w-') ? "w-10" : "")
      )}
    >
      {isConfirming ? (
        <motion.span initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <Check size={12} /> CONFIRM 3s
        </motion.span>
      ) : (
        defaultIcon
      )}
    </button>
  );
};

const DeepWipeButton = ({ onWipe, label }: { onWipe: () => void, label: string }) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  const startCountdown = () => {
    if (countdown !== null) {
      if (countdown === 0) {
        onWipe();
        setCountdown(null);
      }
      return;
    }
    setCountdown(3);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev !== null && prev > 0) return prev - 1;
        clearInterval(timerRef.current);
        return 0;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <button 
      onClick={startCountdown}
      disabled={countdown !== null && countdown > 0}
      className={cn(
        "w-full py-3 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 transition-all border",
        countdown === null 
          ? "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-600 hover:text-white" 
          : countdown > 0 
            ? "bg-amber-600/20 border-amber-500/30 text-amber-500 cursor-not-allowed" 
            : "bg-rose-600 border-rose-400 text-white animate-pulse"
      )}
    >
      {countdown === null ? (
        <><Trash2 size={12} /> {label}</>
      ) : countdown > 0 ? (
        <span className="flex items-center gap-2">
           <Loader2 size={12} className="animate-spin" /> CONFIRMING IN {countdown}s
        </span>
      ) : (
        <span className="flex items-center gap-2">
           <Check size={12} /> TAP AGAIN TO WIPE
        </span>
      )}
    </button>
  );
};

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; role: any; avatar?: string; username?: string; displayName?: string; totalWatchTimeSeconds?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: () => void;
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Real-time sync with the 'users' document
        unsubscribeDoc = onSnapshot(doc(db, 'users', fbUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: fbUser.uid,
              email: fbUser.email || 'Anonymous',
              role: userData.role || 'viewer',
              avatar: userData.avatar,
              username: userData.username,
              displayName: userData.displayName,
              totalWatchTimeSeconds: userData.totalWatchTimeSeconds || 0
            });
          } else {
            // Default to viewer if no doc yet
            setUser({
              id: fbUser.uid,
              email: fbUser.email || 'Anonymous',
              role: 'viewer',
              totalWatchTimeSeconds: 0
            });
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- Components ---

function NewEpisodeBadge({ anime }: { anime: Anime }) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Check if bookmarked
    const unsubBookmark = onSnapshot(doc(db, 'users', user.id, 'bookmarks', anime.id), (snap) => {
      setIsBookmarked(snap.exists());
    });

    // Check for "new" status from notifications
    const q = query(
      collection(db, 'users', user.id, 'notifications'),
      where('animeId', '==', anime.id),
      where('isRead', '==', false),
      where('type', '==', 'new_episode'),
      limit(1)
    );
    const unsubNotif = onSnapshot(q, (snap) => {
      setHasNew(!snap.empty);
    });

    return () => {
      unsubBookmark();
      unsubNotif();
    };
  }, [user, anime.id]);

  if (!isBookmarked || !hasNew) return null;

  return (
    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded-md shadow-lg pointer-events-none uppercase tracking-tighter flex items-center gap-1 animate-pulse"
    >
      <Sparkles size={8} className="fill-current" /> NEW
    </motion.div>
  );
}

function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'anime'), where('status', '==', 'public'));
    const unsubscribe = onSnapshot(q, snap => {
      setAllAnime(snap.docs.map(d => ({id: d.id, ...d.data()} as Anime)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const lower = search.toLowerCase();
      setResults(allAnime.filter(a => a.title.toLowerCase().includes(lower) || a.synopsis?.toLowerCase().includes(lower)));
    } else {
      setResults([]);
    }
  }, [search, allAnime]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSearch(''); // Close desktop dropdown
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlay = async (anime: Anime) => {
    if (navigatingId) return;
    setNavigatingId(anime.id);
    try {
      const q = query(
        collection(db, 'episodes'),
        where('animeId', '==', anime.id),
        where('status', '==', 'public'),
        orderBy('episodeNumber', 'asc'),
        limit(1)
      );
      try {
        const snap = await getDocs(q);
        if (!snap.empty) {
          setSearch('');
          setIsOpen(false);
          navigate(`/episode/${snap.docs[0].id}`);
        } else {
          alert("No episodes available for this anime yet!");
        }
      } catch (e: any) {
        if (e.message?.includes('requires an index') || e.code === 'failed-precondition') {
          const fallbackQ = query(collection(db, 'episodes'), where('animeId', '==', anime.id));
          const snap = await getDocs(fallbackQ);
          const firstPublic = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as any))
            .filter(ep => ep.status === 'public')
            .sort((a, b) => a.episodeNumber - b.episodeNumber)[0];
          
          if (firstPublic) {
            setSearch('');
            setIsOpen(false);
            navigate(`/episode/${firstPublic.id}`);
          } else {
            alert("No episodes available for this anime yet!");
          }
        } else {
          throw e;
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error playing episode.");
    } finally {
      setNavigatingId(null);
    }
  };

  const SearchResultItem = ({ anime }: { anime: Anime; key?: any }) => (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handlePlay(anime);
      }}
      disabled={navigatingId !== null}
      className={cn(
        "w-full flex items-center gap-4 p-3 md:p-4 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-2xl active:scale-95 transition-all text-left group relative overflow-hidden",
        navigatingId === anime.id && "bg-white/5"
      )}
    >
      <img src={anime.thumbnail} alt={typeof anime.title === 'string' ? anime.title : 'Anime Thumbnail'} className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-xl shrink-0 shadow-lg" />
      <div className="flex-1 min-w-0 pr-6">
        <h4 className="text-sm md:text-base font-black text-white truncate mb-1.5 group-hover:text-rose-400 transition-colors">
          {anime.title ? (typeof anime.title === 'object' ? ((anime.title as any).english || (anime.title as any).romaji || 'Untitled') : anime.title) : 'Untitled'}
        </h4>
        <div className="flex flex-wrap items-center gap-2">
           <span className="text-[10px] md:text-xs text-rose-500 font-bold uppercase tracking-[0.2em] bg-rose-500/10 px-2 py-1 rounded-md">{anime.rating} Rating</span>
           <span className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-[0.2em]">{anime.releaseDate?.split('-')[0] || 'Unknown'}</span>
        </div>
      </div>
      {navigatingId === anime.id && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 flex items-center">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}
    </button>
  );

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      {/* Mobile Search Icon */}
      <div className="sm:hidden flex items-center">
        <button 
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          onClick={() => { setIsOpen(!isOpen); if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100); else setSearch(''); }}
        >
          {isOpen ? <X size={20} /> : <Search size={20} />}
        </button>
      </div>

      {/* Desktop & Mobile Search Bar Container */}
      <div className={cn(
        "fixed sm:absolute sm:relative left-4 right-4 sm:left-auto sm:right-0 top-[72px] sm:top-auto mt-0 w-auto sm:w-72 md:w-80 lg:w-96 transition-all",
        isOpen ? "block" : "hidden sm:block"
      )}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-rose-500 transition-colors" size={16} />
          <input 
            ref={inputRef}
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={navigatingId !== null}
            placeholder="Search anime..." 
            className="w-full bg-[#16161a] sm:bg-black/40 border border-white/10 rounded-[1.5rem] pl-12 pr-4 py-3.5 sm:py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/40 transition-all text-white placeholder:text-zinc-500 shadow-inner"
          />
        </div>

        <AnimatePresence>
          {search && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-3 bg-[#111113] border border-white/10 rounded-3xl shadow-4xl overflow-hidden"
            >
               {results.length > 0 ? (
                 <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                   <div className="px-4 pb-2 pt-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                     Search Results ({results.length})
                   </div>
                   {results.map(anime => (
                     <SearchResultItem key={anime.id} anime={anime} />
                   ))}
                 </div>
               ) : (
                 <div className="p-6 text-center text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                   No results found
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Header({ showEditWebsite, setShowEditWebsite }: { showEditWebsite: boolean, setShowEditWebsite: (val: boolean) => void }) {
  const { config } = useWebsiteConfig();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]); // Merged
  const [selectedNotifIds, setSelectedNotifIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showContinueWatching, setShowContinueWatching] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showWatchHistory, setShowWatchHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnimeRequests, setShowAnimeRequests] = useState(false);
  
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaModalAttachment, setMediaModalAttachment] = useState<{ url: string, type: 'image' | 'video' | 'audio', name?: string } | null>(null);

  useEffect(() => {
    const handleOpenCW = () => setShowContinueWatching(true);
    document.addEventListener('open-continue-watching', handleOpenCW);
    return () => {
      document.removeEventListener('open-continue-watching', handleOpenCW);
    };
  }, []);

  useEffect(() => {
    const defaultAvatar = config?.avatarCollections ? Object.values(config.avatarCollections).flat()[0] : ANIME_AVATARS[0];
    if (user) {
      if (user.avatar) {
        setSelectedAvatar(user.avatar);
      } else {
        setSelectedAvatar(defaultAvatar);
      }
      if (user.username) {
        setUsername(user.username);
      } else {
        setUsername(`guest_${user.id.slice(0, 5)}`);
      }
      if (user.displayName) {
        setDisplayName(user.displayName);
      } else {
        setDisplayName('Guest Viewer');
      }
    } else {
      setUsername('');
      setDisplayName('');
      setSelectedAvatar(defaultAvatar);
    }
  }, [user, config]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val === '') {
      setUsername('');
      return;
    }
    if (!val.startsWith('@')) {
      val = '@' + val;
    }
    // Only lowercase letters, numbers, underscores
    val = val.toLowerCase().replace(/[^@a-z0-9_]/g, '');
    setUsername(val);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      if ((user as any).id) {
         await setDoc(doc(db, 'users', (user as any).id), { avatar: selectedAvatar, username, displayName }, { merge: true });
         
         // Retroactively update all comments made by this user
         const q = query(collection(db, 'comments'), where('userId', '==', (user as any).id));
         const snap = await getDocs(q);
         if (!snap.empty) {
           const batches = [];
           let batch = writeBatch(db);
           let count = 0;
           snap.docs.forEach(d => {
               batch.update(d.ref, {
                   userName: displayName || username || user.email?.split('@')[0] || 'User',
                   userAvatar: selectedAvatar
               });
               count++;
               if (count === 500) {
                  batches.push(batch.commit());
                  batch = writeBatch(db);
                  count = 0;
               }
           });
           if (count > 0) batches.push(batch.commit());
           await Promise.all(batches);
         }
      }
      setShowProfileEdit(false);
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      alert('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    if (user) {
      const updateMergedNotifications = (issues: any[] | null, notifs: any[] | null, broadcasts: any[] | null) => {
        setNotifications(prev => {
          const uIssues = issues || prev.filter(p => p.dataType === 'issue');
          const uNotifs = notifs || prev.filter(p => p.dataType === 'notification');
          const uBroadcasts = broadcasts || prev.filter(p => p.dataType === 'broadcast');
          
          const merged = [...uIssues, ...uNotifs, ...uBroadcasts].sort((a, b) => {
            const timeA = a.updatedAt || a.createdAt || 0;
            const timeB = b.updatedAt || b.createdAt || 0;
            return timeB - timeA;
          });
          setHasUnread(merged.some(n => 
            n.dataType === 'issue' ? !n.replySeen : 
            n.dataType === 'notification' ? !n.isRead : 
            !localStorage.getItem(`read_broadcast_${n.id}`)
          ));
          return merged;
        });
      };

      const qIssues = query(collection(db, 'issues'), where('userId', '==', user.id));
      const unsubIssues = onSnapshot(qIssues, (snap) => {
        const issues = snap.docs
          .map(d => ({ id: d.id, ...d.data(), dataType: 'issue' } as any))
          .filter(i => i.adminReply);
        updateMergedNotifications(issues, null, null);
      });

      const qNotifs = query(collection(db, 'users', user.id, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
      const unsubNotifs = onSnapshot(qNotifs, (snap) => {
        const notifs = snap.docs.map(d => ({ id: d.id, ...d.data(), dataType: 'notification' } as any));
        updateMergedNotifications(null, notifs, null);
      });

      const qBroadcasts = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'), limit(20));
      const unsubBroadcasts = onSnapshot(qBroadcasts, (snap) => {
        const broadcasts = snap.docs.map(d => ({ id: d.id, ...d.data(), dataType: 'broadcast' } as any));
        updateMergedNotifications(null, null, broadcasts);
      });

      return () => {
        unsubIssues();
        unsubNotifs();
        unsubBroadcasts();
      };
    }
  }, [user]);

  const markAllSeen = async () => {
    if (!user) return;
    const unreadIssues = notifications.filter(n => n.dataType === 'issue' && !n.replySeen);
    const unreadNotifs = notifications.filter(n => n.dataType === 'notification' && !n.isRead);
    const unreadBroadcasts = notifications.filter(n => n.dataType === 'broadcast' && !localStorage.getItem(`read_broadcast_${n.id}`));

    const batches = [];
    for (const n of unreadIssues) {
      batches.push(updateDoc(doc(db, 'issues', n.id), { replySeen: true }));
    }
    for (const n of unreadNotifs) {
      batches.push(updateDoc(doc(db, 'users', user.id, 'notifications', n.id), { isRead: true }));
    }
    unreadBroadcasts.forEach(n => localStorage.setItem(`read_broadcast_${n.id}`, 'true'));
    
    if (batches.length > 0) await Promise.all(batches);
    setHasUnread(false);
  };

  const deleteSelectedNotifications = async () => {
    if (!user || selectedNotifIds.size === 0) return;
    if (!window.confirm(`Wipe ${selectedNotifIds.size} signals from transmission log?`)) return;
    
    try {
      const batch = writeBatch(db);
      for (const id of selectedNotifIds) {
        const notif = notifications.find(n => n.id === id);
        if (!notif) continue;
        if (notif.dataType === 'issue') {
          batch.delete(doc(db, 'issues', id));
        } else {
          batch.delete(doc(db, 'users', user.id, 'notifications', id));
        }
      }
      await batch.commit();
      setSelectedNotifIds(new Set());
      setIsSelectionMode(false);
    } catch (e) {
      console.error("Batch delete failed", e);
    }
  };

  const toggleSelectAll = () => {
    if (selectedNotifIds.size === notifications.length && notifications.length > 0) {
      setSelectedNotifIds(new Set());
    } else {
      setSelectedNotifIds(new Set(notifications.map(n => n.id)));
    }
  };

  const toggleNotificationSelection = (id: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    const newSelected = new Set(selectedNotifIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      if (newSelected.size === 0) setIsSelectionMode(false);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifIds(newSelected);
  };

  const isStudio = location.pathname.startsWith('/studio');

  return (
    <>
      {!isStudio && (
        <header className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/5 px-2 md:px-4 py-4 shadow-xl">
      <div className="w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-10 overflow-hidden flex-1">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-nowrap shrink-0 min-w-0">
            {config.logoUrl && config.logoUrl.trim() !== '' ? (
              <img src={config.logoUrl} alt={config.name} className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg object-cover group-hover:scale-110 transition-transform shadow-lg shadow-rose-600/20" />
            ) : (
              <div className="w-8 h-8 sm:w-8 sm:h-8 bg-rose-600 rounded-lg flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-lg shadow-rose-600/20 group-hover:scale-110 transition-transform whitespace-nowrap px-2">{config.name[0]?.toUpperCase() || 'A'}</div>
            )}
            <span className="text-sm sm:text-xl font-black tracking-tighter text-white uppercase truncate leading-none">
              {config.name}
            </span>
          </Link>
          
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-400">
            {/* hidden so it's moved to the generic menu */}
          </nav>
        </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/anime" className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group">
              <LayoutGrid size={16} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <span className="hidden sm:block text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-zinc-300 group-hover:text-white transition-colors">All Anime</span>
            </Link>
            <HeaderSearch />
            
            {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <button 
                  onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllSeen(); }}
                  className={cn(
                    "p-2 rounded-full transition-all relative",
                    hasUnread ? "text-rose-500 bg-rose-500/10" : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Bell size={20} />
                  {hasUnread && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-600 rounded-full border-2 border-[#0a0a0b] flex items-center justify-center">
                       <span className="text-[10px] font-black text-white leading-none">
                         {notifications.filter(n => 
                            n.dataType === 'notification' ? !n.isRead : 
                            n.dataType === 'issue' ? !n.replySeen :
                            !localStorage.getItem(`read_broadcast_${n.id}`)
                         ).length}
                       </span>
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 sm:w-96 bg-[#16161a] border border-white/10 rounded-[2rem] shadow-4xl overflow-hidden z-[100]"
                    >
                      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                         {isSelectionMode ? (
                           <div className="flex items-center gap-4 w-full">
                              <button 
                                onClick={toggleSelectAll}
                                className="flex items-center gap-3 text-rose-500 group"
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                  selectedNotifIds.size === notifications.length && notifications.length > 0
                                    ? "bg-rose-600 border-rose-600 text-white" 
                                    : "border-white/20 group-hover:border-rose-500/50"
                                )}>
                                  {selectedNotifIds.size === notifications.length && notifications.length > 0 && <Check size={12} strokeWidth={4} />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Select All</span>
                              </button>
                              <div className="flex-1" />
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-zinc-500 uppercase">{selectedNotifIds.size} Selected</span>
                                <button 
                                  onClick={deleteSelectedNotifications}
                                  className="p-2 bg-rose-600/10 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button 
                                  onClick={() => { setIsSelectionMode(false); setSelectedNotifIds(new Set()); }}
                                  className="p-2 hover:bg-white/10 rounded-xl text-zinc-500"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                           </div>
                         ) : (
                           <>
                             <div>
                               <h3 className="text-xs font-black uppercase tracking-widest text-white">Transmissions</h3>
                               <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                 {notifications.filter(n => 
                                    n.dataType === 'notification' ? !n.isRead : 
                                    n.dataType === 'issue' ? !n.replySeen :
                                    !localStorage.getItem(`read_broadcast_${n.id}`)
                                 ).length} UNREAD SIGNALS
                               </p>
                             </div>
                             <div className="flex items-center gap-2">
                               <button 
                                 onClick={markAllSeen}
                                 className="p-2 hover:bg-white/10 rounded-xl text-rose-500 transition-all"
                                 title="Mark all as read"
                               >
                                 <CheckCircle size={16} />
                               </button>
                               <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-white/10 rounded-xl text-zinc-500"><X size={16} /></button>
                             </div>
                           </>
                         )}
                      </div>
                      <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                         {notifications.length > 0 ? notifications.map(notif => {
                           // Long press simulation
                           let pressTimer: any;
                           const startPress = () => {
                             pressTimer = setTimeout(() => {
                               setIsSelectionMode(true);
                               toggleNotificationSelection(notif.id);
                             }, 600);
                           };
                           const endPress = () => clearTimeout(pressTimer);

                           const isRead = notif.dataType === 'broadcast' ? localStorage.getItem(`read_broadcast_${notif.id}`) :
                                         notif.dataType === 'notification' ? notif.isRead : notif.replySeen;

                           return (
                            <div 
                              key={notif.id} 
                              className={cn(
                                "p-4 rounded-3xl transition-all group relative cursor-pointer border",
                                isSelectionMode && selectedNotifIds.has(notif.id) 
                                  ? "bg-rose-600/5 border-rose-500/20" 
                                  : "border-transparent " + (!isRead ? "bg-white/[0.03] border-white/5" : "opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100")
                              )} 
                              onMouseDown={startPress}
                              onMouseUp={endPress}
                              onMouseLeave={endPress}
                              onTouchStart={startPress}
                              onTouchEnd={endPress}
                              onClick={async (e) => {
                                if (isSelectionMode) {
                                  toggleNotificationSelection(notif.id, e);
                                  return;
                                }
                                
                                // Mark as read
                                try {
                                  if (notif.dataType === 'issue') {
                                    await updateDoc(doc(db, 'issues', notif.id), { replySeen: true });
                                  } else if (notif.dataType === 'notification') {
                                    await updateDoc(doc(db, 'users', user.id, 'notifications', notif.id), { isRead: true });
                                  } else if (notif.dataType === 'broadcast') {
                                    localStorage.setItem(`read_broadcast_${notif.id}`, 'true');
                                    setNotifications([...notifications]);
                                  }
                                } catch (e) {}

                                if (notif.attachmentUrl) {
                                  setMediaModalAttachment({
                                    url: notif.attachmentUrl,
                                    type: notif.attachmentType,
                                    name: notif.attachmentName || notif.title
                                  });
                                  setShowMediaModal(true);
                                } else if (notif.animeId) {
                                  if (notif.episodeId) {
                                    navigate(`/episode/${notif.episodeId}`);
                                  } else {
                                    navigate(`/?animeId=${notif.animeId}`);
                                  }
                                  setShowNotifications(false);
                                }
                              }}
                            >
                                {!isSelectionMode && (
                                  <ConfirmDeleteButton 
                                    onConfirm={async () => {
                                      try {
                                        if (notif.dataType === 'issue') {
                                          await deleteDoc(doc(db, 'issues', notif.id));
                                        } else if (notif.dataType === 'notification') {
                                          await deleteDoc(doc(db, 'users', user.id, 'notifications', notif.id));
                                        } else if (notif.dataType === 'broadcast') {
                                          localStorage.setItem(`read_broadcast_${notif.id}`, 'true');
                                          setNotifications(notifications.filter(nn => nn.id !== notif.id));
                                        }
                                      } catch (e) {
                                        console.error("Failed to delete notification", e);
                                      }
                                    }}
                                    className="absolute top-4 right-4 h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-[#16161a] border-white/10 z-10"
                                    defaultIcon={<Trash2 size={12} />}
                                    isFast={true}
                                  />
                                )}

                                {isSelectionMode && (
                                  <div className="absolute top-4 right-4 z-10">
                                    <div className={cn(
                                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                      selectedNotifIds.has(notif.id) 
                                        ? "bg-rose-600 border-rose-600 text-white" 
                                        : "bg-black/40 border-white/10"
                                    )}>
                                      {selectedNotifIds.has(notif.id) && <Check size={14} strokeWidth={4} />}
                                    </div>
                                  </div>
                                )}
                              <div className="flex items-center gap-4 mb-3 pr-8">
                                 <div className={cn(
                                   "w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg",
                                   notif.dataType === 'broadcast' ? "bg-purple-500/20 text-purple-500" :
                                   notif.dataType === 'notification' ? (notif.type === 'new_episode' ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500") : 
                                   (notif.userName === 'System' ? "bg-rose-500/20 text-rose-500" : "bg-green-500/20 text-green-500")
                                 )}>
                                    {(notif.image || (notif.dataType === 'broadcast' && notif.attachmentUrl && notif.attachmentType === 'image')) ? (
                                      <img src={notif.image || notif.attachmentUrl} className="w-full h-full object-cover" />
                                    ) : (
                                       notif.dataType === 'broadcast' ? <Radio size={20} /> :
                                       notif.dataType === 'notification' ? (notif.type === 'new_episode' ? <Bell size={20} /> : <Info size={20} />) :
                                       (notif.userName === 'System' ? <MessageCircle size={20} /> : <Zap size={20} />)
                                    )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-white uppercase tracking-tight truncate mb-0.5">
                                      {notif.dataType === 'broadcast' ? notif.title : notif.dataType === 'notification' ? notif.title : (notif.userName === 'System' ? 'New Reply' : 'Support Resolved')}
                                    </div>
                                    <div className="text-[9px] font-bold text-zinc-600 uppercase italic tracking-widest">{formatDate(notif.updatedAt || notif.createdAt)}</div>
                                 </div>
                                 {!isRead && (
                                   <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0 shadow-lg shadow-rose-500/50 animate-pulse" />
                                 )}
                              </div>
                              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-2 group-hover:border-white/10 transition-colors text-left">
                                 {notif.dataType === 'issue' && notif.userName !== 'System' && (
                                   <p className="text-[10px] text-zinc-500 italic line-clamp-1 border-b border-white/5 pb-2 mb-2">You: "{notif.message}"</p>
                                 )}
                                 <div className="flex items-start gap-2">
                                    <p className={cn("text-xs font-bold leading-tight flex-1", 
                                      notif.dataType === 'notification' ? "text-zinc-300" :
                                      notif.dataType === 'broadcast' ? "text-zinc-200" :
                                      (notif.userName === 'System' ? "text-rose-400" : "text-green-500 italic")
                                    )}>
                                      {notif.dataType === 'broadcast' ? notif.message : notif.dataType === 'notification' ? notif.message : (notif.userName === 'System' ? notif.adminReply : `Admin: "${notif.adminReply}"`)}
                                    </p>
                                 </div>

                                 {notif.attachmentUrl && (
                                   <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-purple-600/10 border border-purple-500/20 rounded-xl text-[8px] font-black text-purple-400 uppercase tracking-widest group-hover:bg-purple-600 group-hover:text-white transition-all cursor-pointer">
                                      {notif.attachmentType === 'image' && <Image size={12} />}
                                      {notif.attachmentType === 'video' && <Video size={12} />}
                                      {notif.attachmentType === 'audio' && <Radio size={12} />}
                                      SECURE ASSET PREVIEW
                                   </div>
                                 )}
                              </div>
                            </div>
                           );
                         }) : (
                           <div className="py-12 text-center">
                              <Bell size={32} className="mx-auto text-zinc-800 mb-2 opacity-20" />
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">No Incoming Signals</p>
                           </div>
                         )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
              <Link 
                to="/login"
                className="px-4 sm:px-6 py-2 bg-white text-black hover:bg-rose-600 hover:text-white rounded-xl text-[10px] sm:text-sm font-black uppercase tracking-widest transition-all shadow-lg shrink-0"
              >
                Login
              </Link>
            )}
            {user && (
              <button className="p-2 text-zinc-400 hover:text-white transition-colors shrink-0 ml-1 sm:ml-2" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
       </div>

       <AnimatePresence>
         {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-full left-0 right-0 overflow-hidden bg-[#0a0a0b]/95 backdrop-blur-xl pt-4 pb-8 flex flex-col gap-4 text-center border-b border-white/5 shadow-2xl z-40"
          >
            {user && (
              <div className="flex flex-col items-center gap-4 py-6 border-b border-white/5 mx-8">
                {user.avatar ? (
                   <img src={user.avatar} className="w-20 h-20 rounded-full bg-white/10 p-0.5 border-2 border-rose-500/50 object-cover shadow-xl shadow-rose-500/20" alt="Avatar" />
                 ) : (
                   <div className="w-20 h-20 rounded-full bg-rose-600/20 flex items-center justify-center text-rose-500 border-2 border-rose-500/50">
                     <UserIcon size={32} />
                   </div>
                 )}
                 <div className="flex flex-col items-center gap-1">
                   <span className="text-sm font-black text-white uppercase tracking-widest">{user.displayName || 'No Name'}</span>
                   <span className="text-[10px] font-bold text-zinc-400 tracking-widest">{user.username || user.email}</span>
                 </div>
                 
                 {user.totalWatchTimeSeconds !== undefined && (
                   <button 
                     onClick={() => { setIsOpen(false); setShowWatchHistory(true); }}
                     className="w-full mt-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-xl py-2.5 px-4 flex items-center justify-between relative overflow-hidden group shadow-lg cursor-pointer transform active:scale-95"
                   >
                     {/* Decorative subtle pulse */}
                     <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]" />
                      <div className="flex items-center gap-2 relative z-10">
                        <Clock size={12} className="text-zinc-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Total Watch Hours</span>
                      </div>
                      <div className="relative z-10 flex items-center gap-2">
                        <span className="text-[11px] font-black text-amber-500 tracking-wider">
                          {Math.floor(user.totalWatchTimeSeconds / 3600)}<span className="text-[8px] opacity-60 ml-0.5 uppercase">hrs</span>
                        </span>
                        <span className="text-[11px] font-black text-amber-500 tracking-wider">
                          {Math.floor((user.totalWatchTimeSeconds % 3600) / 60)}<span className="text-[8px] opacity-60 ml-0.5 uppercase">mins</span>
                        </span>
                      </div>
                   </button>
                 )}
                 
                 <div className="flex items-center gap-3 mt-4 w-full">
                   <button 
                     onClick={() => { setIsOpen(false); setShowProfileEdit(true); }} 
                     className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] uppercase tracking-widest font-black text-white transition-all active:scale-95 cursor-pointer"
                   >
                     <Edit3 size={14} /> Profile
                   </button>
                   <button 
                     onClick={() => { setIsOpen(false); logout(); }} 
                     className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all active:scale-95 cursor-pointer"
                   >
                     <LogOut size={14} /> Log Out
                   </button>
                 </div>
              </div>
            )}
            
            <div className="flex flex-col mx-6 bg-black/40 border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
              <Link to="/anime" onClick={() => setIsOpen(false)} className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest text-left">
                <LayoutGrid size={16} className="text-indigo-500" /> All Anime
              </Link>
              <button onClick={() => { setIsOpen(false); setShowContinueWatching(true); }} className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest text-left">
                <PlayCircle size={16} className="text-rose-500" /> Continue Watching
              </button>
              <button onClick={() => { setIsOpen(false); setShowBookmarks(true); }} className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest text-left">
                <Bookmark size={16} className="text-amber-500" /> Bookmarks
              </button>
              <button onClick={() => { setIsOpen(false); setShowAnimeRequests(true); }} className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest text-left">
                <TrendingUp size={16} className="text-rose-500" /> Anime Requests
              </button>
              <button onClick={() => { setIsOpen(false); setShowSettings(true); }} className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest text-left">
                <Settings size={16} className="text-zinc-500" /> Settings
              </button>
              
              {user?.email === 'dnbdotsrival@gmail.com' && (
                <>
                  <Link to="/studio" onClick={() => setIsOpen(false)} className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest text-left mt-2">
                    <LayoutDashboard size={16} className="text-purple-500" /> Studio Dashboard
                  </Link>
                </>
              )}
            </div>

            {(config.socials?.instagram || config.socials?.youtube || config.socials?.telegram || config.socials?.discord || config.socials?.gmail) && (
              <div className="px-6 mt-4 pt-6 text-left">
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 px-2">Social Media</div>
              <div className="flex flex-col bg-black/40 border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
                {config.socials?.instagram && (
                  <a href={config.socials.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest">
                    <Instagram size={14} className="text-pink-500" /> Instagram
                  </a>
                )}
                {config.socials?.youtube && (
                  <a href={config.socials.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest">
                    <Youtube size={14} className="text-red-500" /> YouTube
                  </a>
                )}
                {config.socials?.telegram && (
                  <a href={config.socials.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest">
                    <Send size={14} className="text-blue-400" /> Telegram
                  </a>
                )}
                {config.socials?.discord && (
                  <a href={config.socials.discord} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest">
                    <MessageSquare size={14} className="text-indigo-500" /> Discord
                  </a>
                )}
                {config.socials?.gmail && (
                  <a href={`mailto:${config.socials.gmail}`} className="flex items-center gap-3 py-4 px-5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest">
                    <Mail size={14} className="text-emerald-500" /> Gmail
                  </a>
                )}
              </div>
            </div>
            )}

            {!user && (
              <div className="px-5 pb-8 pt-6">
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 hover:text-white font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2">
                  Login
                </Link>
              </div>
            )}
           </motion.div>
         )}
       </AnimatePresence>
        </header>
      )}
      {createPortal(
        <AnimatePresence>
          {showProfileEdit && user && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#16161a] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-4xl max-h-[90vh] flex flex-col"
              >
                <button 
                  onClick={() => { setShowProfileEdit(false); setIsOpen(true); }} 
                  className="absolute top-4 left-4 p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors z-10 flex items-center gap-2 group border border-white/5"
                >
                  <ChevronLeft size={16} />
                  <span className="text-[8px] font-black uppercase tracking-widest pr-1">Back to Menu</span>
                </button>
                
                <div className="shrink-0">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1 text-center mt-2">Edit Profile</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-6 text-center">Update your identity</p>
                </div>
                
                <div className="space-y-5 mb-8 overflow-y-auto custom-scrollbar pr-2 flex-col min-h-0 flex-1">
                  
                  <div className="flex flex-col items-center mt-4">
                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">Choose Avatar</div>
                    <div className="relative w-full">
                      <button 
                        type="button"
                        onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                        className="relative w-24 h-24 mx-auto rounded-full border-2 border-white/10 p-1 bg-white/5 hover:border-rose-500 transition-all flex items-center justify-center group overflow-hidden"
                      >
                        <img src={selectedAvatar} className="w-full h-full rounded-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                           <Camera size={20} className="text-white" />
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {showAvatarPicker && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-6 w-full overflow-hidden"
                          >
                            <div className="bg-[#1e1e24] border border-white/10 p-4 rounded-3xl shadow-4xl w-full">
                              <AvatarSelection selectedAvatar={selectedAvatar} setSelectedAvatar={(url) => { setSelectedAvatar(url); setShowAvatarPicker(false); }} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName} 
                      onChange={e => setDisplayName(e.target.value)} 
                      placeholder="Enter display name" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500/50" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Username</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={handleUsernameChange} 
                      placeholder="@username" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500/50" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="text" 
                      value={user.email} 
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-zinc-500 focus:outline-none cursor-not-allowed" 
                    />
                  </div>

                </div>
                
                <button 
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                  className="w-full py-4 shrink-0 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-600/20 active:scale-95 disabled:opacity-50 flex justify-center"
                >
                  {isUpdatingProfile ? <Loader2 size={16} className="animate-spin" /> : "Save Profile"}
                </button>
              </motion.div>
            </div>
          )}

          {showMediaModal && mediaModalAttachment && (
            <NotificationMediaModal 
              onClose={() => { setShowMediaModal(false); setMediaModalAttachment(null); }} 
              attachment={mediaModalAttachment} 
            />
          )}
        </AnimatePresence>,
        document.body
      )}
      
      <AnimatePresence>
        {showContinueWatching && (
          <ContinueWatchingModal isOpen={showContinueWatching} onClose={(navigated) => { setShowContinueWatching(false); if (navigated !== true) { setTimeout(() => setIsOpen(true), 150); } }} />
        )}
        {showBookmarks && (
          <BookmarkModal isOpen={showBookmarks} onClose={(navigated) => { setShowBookmarks(false); if (navigated !== true) { setTimeout(() => setIsOpen(true), 150); } }} />
        )}
        {showWatchHistory && (
          <WatchHistoryModal isOpen={showWatchHistory} onClose={(navigated) => { setShowWatchHistory(false); if (navigated !== true) { setTimeout(() => setIsOpen(true), 150); } }} />
        )}
        {showSettings && (
          <SettingsModal isOpen={showSettings} onClose={() => { setShowSettings(false); setTimeout(() => setIsOpen(true), 150); }} />
        )}
        {showEditWebsite && (
          <EditWebsiteModal isOpen={showEditWebsite} onClose={() => setShowEditWebsite(false)} />
        )}
        {showAnimeRequests && (
          <AnimeRequestModal isOpen={showAnimeRequests} onClose={() => setShowAnimeRequests(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function AnimeCard({ anime }: { anime: Anime; key?: any }) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      const q = query(
        collection(db, 'episodes'),
        where('animeId', '==', anime.id),
        where('status', '==', 'public'),
        orderBy('episodeNumber', 'asc'),
        limit(1)
      );
      try {
        const snap = await getDocs(q);
        if (!snap.empty) {
          navigate(`/episode/${snap.docs[0].id}`);
        } else {
          alert("No episodes available for this anime yet!");
        }
      } catch (e: any) {
        if (e.message?.includes('requires an index') || e.code === 'failed-precondition') {
          // Fallback: Just fetch all and filter client side
          const fallbackQ = query(collection(db, 'episodes'), where('animeId', '==', anime.id));
          const snap = await getDocs(fallbackQ);
          const firstPublic = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as any))
            .filter(ep => ep.status === 'public')
            .sort((a, b) => a.episodeNumber - b.episodeNumber)[0];
          
          if (firstPublic) {
            navigate(`/episode/${firstPublic.id}`);
          } else {
            alert("No episodes available for this anime yet!");
          }
        } else {
          throw e;
        }
      }
    } catch (err) {
      console.error("Navigation error:", err);
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <div 
      role="button"
      onClick={handlePlay}
      className={cn(
        "group block focus:outline-none cursor-pointer transition-opacity relative",
        isNavigating && "opacity-60"
      )}
    >
      <div className="relative aspect-[3/4.5] sm:aspect-[4/5.5] overflow-hidden rounded-[2rem] bg-zinc-900 shadow-2xl border border-white/5 group-hover:border-rose-500/30 transition-all duration-300">
        <img 
          src={anime.thumbnail} 
          alt={anime.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-100" />
        
        {/* Quality Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
           <div className="flex items-center gap-1.5 font-sans">
              <span className="bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-lg pointer-events-none uppercase tracking-tighter">HD</span>
              <span className="bg-zinc-800/90 text-zinc-300 text-[8px] font-black px-2 py-0.5 rounded-md shadow-lg pointer-events-none uppercase tracking-tighter">{anime.language || 'SUB'}</span>
              
              {/* Smart "NEW" badge for bookmarked anime */}
              <NewEpisodeBadge anime={anime} />
           </div>
        </div>
        
        <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-1.5 text-zinc-300 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-md">
           <Eye size={10} />
           <span className="text-[10px] font-black">{anime.viewCount || 0}</span>
        </div>
        
        <div className="absolute bottom-3 right-3">
           <span className="text-[10px] font-black text-rose-500 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg uppercase tracking-tighter shadow-md pointer-events-none">
             {anime.format === 'movie' ? 'MOVIE' : 'TV SERIES'}
           </span>
        </div>

        {isNavigating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[4px] z-20">
            <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin shadow-rose-500/20 shadow-2xl" />
          </div>
        )}
      </div>

      {/* Bookmark Action - Elevated Z-Index */}
      <div className="absolute top-3 right-3 z-[30] overflow-visible">
        <BookmarkButton animeId={anime.id} />
      </div>
      
      <div className="mt-4 space-y-1 px-1">
        <h3 className="font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-1 text-sm sm:text-base tracking-tight leading-none group-active:scale-95 duration-200">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 pointer-events-none">
           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{new Date(anime.releaseDate).getFullYear() || '2024'}</span>
           <span className="w-1 h-1 rounded-full bg-zinc-800" />
           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{anime.rating || '8.5'} SCORE</span>
        </div>
      </div>
    </div>
  );
}

// --- Pages ---

function AllAnimePage() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isFetchingAnime, setIsFetchingAnime] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    const q = query(collection(db, 'anime'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime));
      list = list.filter(a => a.status === 'public');
      list.sort((a, b) => a.title.localeCompare(b.title));
      setAnimeList(list);
      setIsFetchingAnime(false);
    }, (err) => {
      console.error(err);
      setIsFetchingAnime(false);
    });
    return () => unsubscribe();
  }, []);

  const totalPages = Math.max(1, Math.ceil(animeList.length / itemsPerPage));
  const currentAnime = animeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-white uppercase tracking-tighter mb-8">
          All Anime List
        </h1>

        {isFetchingAnime ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : animeList.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 uppercase tracking-widest font-black text-xs">
            No anime found
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {currentAnime.map(anime => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}

        {/* Pagination */ }
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-16 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 bg-white/5 hover:bg-rose-500 text-white rounded transition-colors disabled:opacity-30 disabled:hover:bg-white/5 font-bold flex justify-center items-center"
            >
              <ChevronLeft size={16} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      "w-10 h-10 rounded font-bold text-sm transition-colors",
                      currentPage === page 
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" 
                        : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                    )}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 3 || 
                page === currentPage + 3
              ) {
                return <span key={page} className="text-zinc-600 text-sm px-2">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 bg-white/5 hover:bg-rose-500 text-white rounded transition-colors disabled:opacity-30 disabled:hover:bg-white/5 font-bold flex justify-center items-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BrowsePage() {
  const { user } = useAuth();
  const { config, isLoading: isConfigLoading } = useWebsiteConfig();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetchingAnime, setIsFetchingAnime] = useState(true);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);

  useEffect(() => {
    // Load continue watching
    if (user) {
      getDocs(collection(db, 'userProgress')).then(snapshot => {
        const matching = snapshot.docs
          .filter(d => d.id.startsWith(user.id + '_'))
          .map(d => d.data());
        
        // Final duplicate check: Only 1 entry per animeId, keep latest
        const latestPerAnime: Record<string, any> = {};
        matching.forEach(prog => {
          if (!latestPerAnime[prog.animeId] || (prog.timestamp > latestPerAnime[prog.animeId].timestamp)) {
            latestPerAnime[prog.animeId] = prog;
          }
        });

        const list = Object.values(latestPerAnime);
        list.sort((a, b) => b.timestamp - a.timestamp);
        setContinueWatching(list);
      });
    } else {
      const stored = localStorage.getItem('aniflow_progress');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const rawList = Object.values(parsed) as any[];
          
          const latestPerAnime: Record<string, any> = {};
          rawList.forEach(prog => {
            if (!latestPerAnime[prog.animeId] || (prog.timestamp > latestPerAnime[prog.animeId].timestamp)) {
              latestPerAnime[prog.animeId] = prog;
            }
          });
          
          const list = Object.values(latestPerAnime);
          list.sort((a, b) => b.timestamp - a.timestamp);
          setContinueWatching(list);
        } catch(e) {}
      }
    }
  }, [user]);

  useEffect(() => {
    // Fetch all anime, but filter for public ones or specific ones in local state
    const q = query(collection(db, 'anime'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime));
      // Sort by updatedAt or createdAt manually to avoid index issues if one is missing
      list.sort((a, b) => {
        const timeA = (a as any).updatedAt || (a as any).createdAt || 0;
        const timeB = (b as any).updatedAt || (b as any).createdAt || 0;
        return typeof timeB === 'number' ? timeB - (timeA as number) : (new Date(timeB).getTime() - new Date(timeA).getTime());
      });
      setAnimeList(list);
      setIsFetchingAnime(false);
    }, (err) => {
      console.error(err);
      setIsFetchingAnime(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setCategories(snap.docs.map(d => ({id: d.id, ...d.data()} as Category)));
      setIsFetchingCategories(false);
    }, (err) => {
      console.error(err);
      setIsFetchingCategories(false);
    });
    return unsub;
  }, []);

  // Auto-swipe functionality
  useEffect(() => {
    if (animeList.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % Math.min(animeList.length, 5));
    }, 6000);
    return () => clearInterval(interval);
  }, [animeList.length]);

  const navigate = useNavigate();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const handleFeaturedPlay = async (animeId: string) => {
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
      } else {
        alert("No episodes available for this anime yet!");
      }
    } catch (err) {
      console.error("Navigation error:", err);
    } finally {
      setNavigatingId(null);
    }
  };

  const filtered = animeList.filter(a => a.status === 'public');

  const featuredAnime = filtered.slice(0, 5);
  const currentFeatured = featuredAnime[featuredIndex];

  const handleSeedFromAniList = async () => {
    setSeeding(true);
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      
      const queryStr = `
        query {
          Page(page: 1, perPage: 12) {
            media(sort: TRENDING_DESC, type: ANIME) {
              id
              title { english romaji }
              description
              coverImage { extraLarge }
              bannerImage
              averageScore
              startDate { year month day }
            }
          }
        }
      `;
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryStr })
      });
      const data = await response.json();
      const animeItems = data.data.Page.media;

      // Try to find if user has an existing studio
      let studioId = 'anilist-studio';
      const { user } = auth as any; // Using a hacky way since useAuth is not here
      // Better: just query studios if user is logged in
      if (auth.currentUser) {
        const q = query(collection(db, 'studios'), where('ownerId', '==', auth.currentUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          studioId = snap.docs[0].id;
        } else {
          // Create new studio if none exists
          await setDoc(doc(db, 'studios', studioId), {
            name: 'Global Anime Syndicate',
            logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=studio',
            ownerId: auth.currentUser?.uid || 'system',
            createdAt: new Date().toISOString()
          });
        }
      }

      for (const item of animeItems) {
        const animeId = `ani-${item.id}`;
        await setDoc(doc(db, 'anime', animeId), {
          title: item.title.english || item.title.romaji,
          japaneseTitle: item.title.romaji,
          thumbnail: item.coverImage.extraLarge,
          bannerImage: item.bannerImage || item.coverImage.extraLarge,
          synopsis: item.description?.replace(/<[^>]*>?/gm, '') || 'No description available.',
          rating: (item.averageScore / 10).toFixed(1),
          releaseDate: `${item.startDate.year}-${String(item.startDate.month).padStart(2, '0')}-${String(item.startDate.day).padStart(2, '0')}`,
          studioId: studioId,
          status: 'public',
          createdAt: new Date().toISOString(),
          updatedAt: Date.now()
        });

        // Generate episodes
        for (let i = 1; i <= 12; i++) {
          await setDoc(doc(db, 'episodes', `ep-${animeId}-${i}`), {
            animeId: animeId,
            season: 1,
            episodeNumber: i,
            title: `Episode ${i}: The Beginning`,
            description: `A stunning episode filled with action and heart. The story evolves as characters face new challenges in episode ${i} of ${item.title.english || item.title.romaji}.`,
            releaseDate: new Date().toISOString(),
            status: 'public',
            sources: [
              { name: 'Server 1 (Embed)', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'iframe' },
              { name: 'Server 2 (Video)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', type: 'hls' },
              { name: 'Server 3 (Direct)', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video' }
            ],
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            thumbnail: item.bannerImage || item.coverImage.extraLarge,
            createdAt: new Date().toISOString()
          });
        }
      }
      alert('Synced 10 Trending titles from AniList!');
    } catch (e) {
      console.error(e);
      alert('Sync failed. Please ensure Anonymous Auth is enabled.');
    }
    setSeeding(false);
  };

  const handleClearData = async () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      // Auto-cancel after 3 seconds if not confirmed
      setTimeout(() => setIsConfirmingClear(false), 3000);
      return;
    }

    try {
      const animeSnap = await getDocs(collection(db, 'anime'));
      const epSnap = await getDocs(collection(db, 'episodes'));
      const deletes = [
        ...animeSnap.docs.map(d => deleteDoc(doc(db, 'anime', d.id))),
        ...epSnap.docs.map(d => deleteDoc(doc(db, 'episodes', d.id)))
      ];
      await Promise.all(deletes);
      setIsConfirmingClear(false);
    } catch (e) {
      console.error(e);
      setIsConfirmingClear(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Cinematic Hero Carousel */}
      {currentFeatured && (
        <section className="relative w-full overflow-hidden bg-[#0a0a0b] h-[65dvh] md:h-[80dvh] lg:h-[85dvh] max-h-[140vw] sm:max-h-[80vw] md:max-h-[55vw] lg:max-h-[45vw] xl:max-h-[40vw] min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeatured.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 z-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/40 sm:via-[#0a0a0b]/60 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent z-10" />
              {/* Bottom fade to prevent "transparent line" glitch */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0b] to-transparent z-10" />
              
              {/* Desktop/Tablet Image */}
              <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                src={currentFeatured.bannerImage || currentFeatured.bannerMobile || currentFeatured.thumbnail} 
                alt={currentFeatured.title}
                className="hidden md:block absolute inset-0 w-full h-full object-cover object-top brightness-[0.7] sm:brightness-[0.8] contrast-[1.1] z-0" 
                referrerPolicy="no-referrer"
              />
              {/* Mobile Image */}
              <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                src={currentFeatured.bannerMobile || currentFeatured.bannerImage || currentFeatured.thumbnail} 
                alt={currentFeatured.title}
                className="md:hidden absolute inset-0 w-full h-full object-cover object-top brightness-[0.7] sm:brightness-[0.8] contrast-[1.1] z-0" 
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 sm:px-16 lg:px-24 max-w-full sm:max-w-5xl space-y-3 sm:space-y-6 pb-20 sm:pb-0 sm:justify-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-center sm:text-left"
                >
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 sm:mb-4">
                    <span className="px-2 py-0.5 bg-rose-600 text-white text-[7px] sm:text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-lg shadow-rose-600/20">Featured</span>
                  </div>
                  
                  <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-4xl font-black text-white leading-[1.2] sm:leading-[1.1] tracking-tighter mb-4 uppercase drop-shadow-2xl line-clamp-2 sm:line-clamp-3 overflow-visible whitespace-normal max-w-4xl max-h-[300px]">
                    {currentFeatured.title}
                  </h1>
                  
                  {/* Optimized Metadata Cards */}
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start mb-6 sm:mb-8 w-full">
                    {/* Desktop/Tablet Cards */}
                    <div className="hidden sm:flex flex-wrap gap-4">
                      <div className="bg-yellow-500/10 backdrop-blur-xl px-5 py-3 border border-yellow-500/20 rounded-2xl flex flex-col items-start gap-1">
                        <div className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest leading-none">Rating</div>
                        <div className="text-sm font-black text-yellow-400 leading-none">{currentFeatured.rating}</div>
                      </div>
                      <div className="bg-blue-500/10 backdrop-blur-xl px-5 py-3 border border-blue-500/20 rounded-2xl flex flex-col items-start gap-1">
                        <div className="text-[10px] text-blue-500/80 font-bold uppercase tracking-widest leading-none">Release</div>
                        <div className="text-sm font-black text-blue-400 leading-none">{new Date(currentFeatured.releaseDate).getFullYear()}</div>
                      </div>
                      <div className="bg-purple-500/10 backdrop-blur-xl px-5 py-3 border border-purple-500/20 rounded-2xl flex flex-col items-start gap-1">
                        <div className="text-[10px] text-purple-500/80 font-bold uppercase tracking-widest leading-none">Format</div>
                        <div className="text-sm font-black text-purple-400 leading-none uppercase">{currentFeatured.format === 'movie' ? 'MOVIE' : 'TV SERIES'}</div>
                      </div>
                      <div className="bg-rose-500/10 backdrop-blur-xl px-5 py-3 border border-rose-500/20 rounded-2xl flex flex-col items-start gap-1">
                        <div className="text-[10px] text-rose-500/80 font-bold uppercase tracking-widest leading-none">Language</div>
                        <div className="text-sm font-black text-rose-400 leading-none uppercase">{currentFeatured.language || 'Multi'}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xl px-5 py-3 border border-white/20 rounded-2xl flex flex-col items-start gap-1">
                        <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-none">Quality</div>
                        <div className="text-sm font-black text-white leading-none">{currentFeatured.quality || 'HD'}</div>
                      </div>
                    </div>
                    
                    {/* Mobile Box Cards Container */}
                    <div className="flex sm:hidden justify-center w-full">
                       <div className="flex items-center justify-center flex-wrap gap-1.5 text-[8.5px] font-black uppercase tracking-widest bg-white/5 border border-white/10 p-1.5 rounded-2xl shadow-2xl">
                         <div className="bg-yellow-500/10 px-2 py-1.5 border border-yellow-500/20 rounded-xl flex items-center gap-1 whitespace-nowrap text-yellow-400">
                           <Star size={9} className="fill-yellow-500 text-yellow-500"/> <span>{currentFeatured.rating}</span>
                         </div>
                         <div className="bg-blue-500/10 px-2.5 py-1.5 border border-blue-500/20 rounded-xl whitespace-nowrap text-blue-400">
                           {new Date(currentFeatured.releaseDate).getFullYear()}
                         </div>
                         <div className="bg-purple-500/10 px-2.5 py-1.5 border border-purple-500/20 rounded-xl whitespace-nowrap text-purple-400">
                           {currentFeatured.format === 'movie' ? 'MOVIE' : 'TV SERIES'}
                         </div>
                         <div className="bg-rose-500/10 px-2.5 py-1.5 border border-rose-500/20 rounded-xl whitespace-nowrap text-rose-400">
                           {currentFeatured.language || 'MULTI'}
                         </div>
                         <div className="bg-white/10 px-2.5 py-1.5 border border-white/20 rounded-xl whitespace-nowrap text-white">
                           {currentFeatured.quality || 'HD'}
                         </div>
                       </div>
                    </div>
                  </div>

                  <p className="hidden sm:block text-zinc-400 text-sm md:text-base font-medium line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed mb-6 drop-shadow-md opacity-80 mt-2">
                    {currentFeatured.synopsis?.replace(/<[^>]*>?/gm, '')}
                  </p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-4">
                    <button 
                      onClick={() => handleFeaturedPlay(currentFeatured.id)}
                      disabled={!!navigatingId}
                      className="px-5 sm:px-10 py-2.5 sm:py-4 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-[8px] sm:text-xs tracking-[0.2em] rounded-lg sm:rounded-2xl transition-all shadow-2xl shadow-rose-600/30 flex items-center justify-center gap-2 sm:gap-3 transform active:scale-95 disabled:opacity-50"
                    >
                      {navigatingId === currentFeatured.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play size={12} fill="white" className="sm:w-[18px] sm:h-[18px]" />
                      )}
                      Watch Now
                    </button>
                    {user ? (
                      <>
                        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-4 rounded-lg sm:rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 shadow-2xl relative overflow-hidden group">
                          <Eye size={16} className="text-zinc-500 sm:w-[20px] sm:h-[20px]" />
                          <span className="font-black text-xs sm:text-sm text-zinc-300 tracking-widest">{currentFeatured.viewCount || 0}</span>
                        </div>
                        <BookmarkButton animeId={currentFeatured.id} up className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-white/5 border-white/10 hover:bg-white/10" />
                      </>
                    ) : (
                      <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-4 rounded-lg sm:rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 shadow-2xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]" />
                         <Eye size={16} className="text-amber-500 sm:w-[20px] sm:h-[20px]" />
                         <span className="font-black text-xs sm:text-sm text-amber-500 tracking-widest">{currentFeatured.viewCount || 0}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Slider Dots refined and moved to avoid overlap */}
              <div className="absolute bottom-6 sm:bottom-12 left-0 right-0 sm:left-auto sm:right-24 z-30 flex justify-center sm:justify-start gap-3">
                {featuredAnime.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFeaturedIndex(i)}
                    className={cn(
                      "h-1.5 transition-all duration-700 rounded-full",
                      featuredIndex === i ? "w-12 bg-rose-600 shadow-lg shadow-rose-600/40" : "w-2 bg-white/10 hover:bg-white/30"
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      )}

      {/* Main Browse Section */}
      <div className="px-4 md:px-8 py-8 md:py-16 max-w-full mx-auto space-y-12 overflow-hidden">
        {categories.map(cat => {
          if (cat.id === 'system_newly_added') {
            return (
              <div key={cat.id} className="mb-12 max-w-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Newly Added</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest whitespace-nowrap">Latest Uploads</span>
                  </div>
                </div>
                <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 custom-scrollbar snap-x items-stretch">
                  {filtered.slice(0, 10).map(anime => (
                    <div key={anime.id} className="w-36 sm:w-44 md:w-48 lg:w-56 shrink-0 snap-start">
                      <AnimeCard anime={anime} />
                    </div>
                  ))}
                  {filtered.length > 10 && (
                    <div onClick={() => {}} className="shrink-0 snap-start flex items-center justify-center w-36 sm:w-44 md:w-48 lg:w-56 bg-[#16161a] border border-white/5 hover:border-rose-500/30 transition-all rounded-[2rem] aspect-[3/4] cursor-pointer group shadow-xl">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 text-zinc-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-xl">
                          <ChevronRight size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">View More</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          if (cat.id === 'system_continue_watching') {
            const validContinueWatching = continueWatching.filter(prog => animeList.some(a => a.id === prog.animeId));
            if (validContinueWatching.length === 0) return null;
            return (
              <div key={cat.id} className="mb-10 max-w-full">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Continue Watching</h3>
                <div className="flex overflow-x-auto gap-4 pb-6 custom-scrollbar snap-x items-stretch">
                  {validContinueWatching.map((prog, idx) => {
                    const percentage = Math.min(100, Math.max(0, (prog.watchedTime / prog.duration) * 100));
                    
                    return (
                      <Link 
                        to={`/episode/${prog.episodeId}`} 
                        key={idx}
                        className="group relative bg-[#16161a] border border-white/5 rounded-[2rem] overflow-hidden hover:border-rose-500/30 transition-all shadow-xl flex flex-col shrink-0 w-48 sm:w-56 snap-start"
                      >
                        <div className="aspect-video relative overflow-hidden shrink-0">
                          <img src={prog.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={prog.animeTitle} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 transform scale-75 group-hover:scale-100 transition-all">
                              <Play size={16} className="ml-1" />
                            </div>
                          </div>
                          <div className="absolute top-3 left-3">
                            <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                              S{prog.season} E{prog.episodeNumber}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                             <div className="h-full bg-rose-600 transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-black text-white line-clamp-1 mb-1">{prog.animeTitle}</h4>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest line-clamp-1">{prog.episodeTitle}</p>
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">{formatTimeShort(prog.watchedTime)} watched</span>
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{formatTimeShort(Math.max(0, prog.duration - prog.watchedTime))} left</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const categoryAnimes = filtered.filter(a => a.categoryId === cat.id);
          if (categoryAnimes.length === 0) return null;
          return (
            <div key={cat.id} className="mb-12 max-w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
                  {cat.name}
                </h3>
              </div>
              <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 custom-scrollbar snap-x items-stretch">
                {categoryAnimes.slice(0, 10).map(anime => (
                  <div key={anime.id} className="w-36 sm:w-44 md:w-48 lg:w-56 shrink-0 snap-start">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
                
                {categoryAnimes.length > 10 && (
                  <div onClick={() => {}} className="shrink-0 snap-start flex items-center justify-center w-36 sm:w-44 md:w-48 lg:w-56 bg-[#16161a] border border-white/5 hover:border-rose-500/30 transition-all rounded-[2rem] aspect-[3/4] cursor-pointer group shadow-xl">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 text-zinc-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-xl">
                        <ChevronRight size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">View More</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {(() => {
          const uncategorized = filtered.filter(a => !a.categoryId);
          if (uncategorized.length === 0) return null;
          return (
            <div className="mb-12 max-w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
                  Other Anime
                </h3>
              </div>
              <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 custom-scrollbar snap-x">
                {uncategorized.map(anime => (
                  <div key={anime.id} className="w-36 sm:w-44 md:w-48 lg:w-56 shrink-0 snap-start">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {isFetchingAnime || isFetchingCategories ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Initializing Content</p>
          </div>
        ) : filtered.length === 0 && (
           <div className="py-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">
              No Anime Found in the Library
           </div>
        )}
      </div>
    </div>
  );
}


const getEpisodeSources = (episode: Episode) => {
  if (episode.sources && episode.sources.length > 0) return episode.sources;
  const legacy: any[] = [];
  if (episode.videoUrl && episode.videoUrl.trim() !== '') legacy.push({ name: 'Server 1', url: episode.videoUrl, type: 'iframe' });
  if (episode.videoUrl2 && episode.videoUrl2.trim() !== '') legacy.push({ name: 'Server 2', url: episode.videoUrl2, type: 'iframe' });
  if (legacy.length === 0) legacy.push({ name: 'Server 1', url: '', type: 'iframe' });
  return legacy;
};

function VideoPlayer({ episode, anime, prevEpisode, nextEpisode, onEnded }: { episode: Episode; anime: Anime; prevEpisode?: Episode; nextEpisode?: Episode; onEnded?: () => void }) {
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [showBugModal, setShowBugModal] = useState(false);
  const [bugMessage, setBugMessage] = useState('');
  const [isSendingBug, setIsSendingBug] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [rotation, setRotation] = useState<number>(0);
  const [showRotationHint, setShowRotationHint] = useState(false);
  const [showAspectHint, setShowAspectHint] = useState(false);
  const aspectHintTimeoutRef = useRef<any>(null);
  const rotationHintTimeoutRef = useRef<any>(null);
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const [initialSeekDone, setInitialSeekDone] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const lastInteractionRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showLockOnly, setShowLockOnly] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMouseMoveRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showControls) handleInteraction();
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullScreen();
          break;
        case 'm':
          e.preventDefault();
          const newMuted = !isMuted;
          setIsMuted(newMuted);
          if (videoRef.current) videoRef.current.muted = newMuted;
          break;
        case 'arrowright':
          skip(10);
          break;
        case 'arrowleft':
          skip(-10);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullScreen, isMuted, showControls]);

  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
      setIsFullScreen(isFs);
      
      if (isFs) {
        const screenObj: any = window.screen;
        const orientation = screenObj.orientation || screenObj.mozOrientation || screenObj.msOrientation;
        if (orientation && orientation.lock) {
          try {
            await orientation.lock('landscape').catch((e: any) => console.log("Orientation lock error:", e));
          } catch (e) {}
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = async () => {
    if (isLocked) return;
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        }
      } catch (err) {
        console.log("Playback interaction handled");
      }
    }
  };

  const skip = (seconds: number) => {
    if (isLocked) return;
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const cycleAspect = () => {
    if (isLocked) return;
    setAspectRatio(prev => {
      if (prev === 'contain') return 'cover';
      if (prev === 'cover') return 'fill';
      return 'contain';
    });
    
    setShowAspectHint(true);
    if (aspectHintTimeoutRef.current) clearTimeout(aspectHintTimeoutRef.current);
    aspectHintTimeoutRef.current = setTimeout(() => setShowAspectHint(false), 2000);
    
    resetControlsTimeout();
  };

  const cycleRotation = () => {
    if (isLocked) return;
    setRotation(prev => (prev + 90) % 360);
    
    setShowRotationHint(true);
    if (rotationHintTimeoutRef.current) clearTimeout(rotationHintTimeoutRef.current);
    rotationHintTimeoutRef.current = setTimeout(() => setShowRotationHint(false), 2000);
    
    resetControlsTimeout();
  };

  const toggleFullScreen = async () => {
    if (!playerContainerRef.current) return;
    try {
      const isCurrentlyFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
      if (!isCurrentlyFs) {
        if (playerContainerRef.current.requestFullscreen) {
          await playerContainerRef.current.requestFullscreen();
        } else if ((playerContainerRef.current as any).webkitRequestFullscreen) {
          await (playerContainerRef.current as any).webkitRequestFullscreen();
        } else if ((playerContainerRef.current as any).mozRequestFullScreen) {
          await (playerContainerRef.current as any).mozRequestFullScreen();
        } else if ((playerContainerRef.current as any).msRequestFullscreen) {
          await (playerContainerRef.current as any).msRequestFullscreen();
        }
        
        // Lock orientation
        const screenObj: any = window.screen;
        const orientation = screenObj.orientation || screenObj.mozOrientation || screenObj.msOrientation;
        if (orientation && orientation.lock) {
          await orientation.lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }

        const screenObj: any = window.screen;
        const orientation = screenObj.orientation || screenObj.mozOrientation || screenObj.msOrientation;
        if (orientation && orientation.unlock) {
          orientation.unlock();
        }
      }
    } catch (err) {
      console.error("Fullscreen toggle error:", err);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    if (videoRef.current) {
      const time = parseFloat(e.target.value);
      videoRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      // Hide controls if playing OR if locked
      if (isPlaying || isLocked) {
        setShowControls(false);
        setShowLockOnly(false);
      }
    }, 3000); 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLocked) {
      if (!showLockOnly) setShowLockOnly(true);
      resetControlsTimeout();
      return;
    }
    
    // Ignore small mouse movements (prevent jitter/touch issues)
    const now = Date.now();
    if (now - lastMouseMoveRef.current < 50) return;
    lastMouseMoveRef.current = now;

    if (!showControls) {
      setShowControls(true);
      lastInteractionRef.current = Date.now();
    }
    resetControlsTimeout();
  };

  const handleInteraction = (e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (e && e.target && (e.target as HTMLElement).closest('button, input, [role="slider"], a')) return;
    if (e) e.stopPropagation();
    if (isLocked) { setShowLockOnly(true); resetControlsTimeout(); return; }
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current); clickTimeoutRef.current = null;
      toggleFullScreen(); setShowControls(true); resetControlsTimeout();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        setShowControls((prev) => {
          const willShow = !prev;
          if (willShow) resetControlsTimeout(); else if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
          return willShow;
        });
      }, 250);
    }
  };

  useEffect(() => {
    setInitialSeekDone(false);
  }, [episode.id, selectedServerIndex]);

  const saveProgress = async (currentTime: number) => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration;
    if (!duration || currentTime < 5) return;

    // Don't save if almost finished
    if (duration - currentTime < 15) {
      localStorage.removeItem(`progress_${episode.id}`);
      return;
    }

    localStorage.setItem(`progress_${episode.id}`, currentTime.toString());

    // Sync with global "Continue Watching" system
    const progress = {
      animeId: anime.id,
      episodeId: episode.id,
      season: episode.season || 1,
      episodeNumber: episode.episodeNumber,
      animeTitle: anime.title,
      episodeTitle: episode.title || `Episode ${episode.episodeNumber}`,
      thumbnail: episode.thumbnail || anime.thumbnail,
      watchedTime: currentTime,
      duration: duration,
      timestamp: Date.now()
    };

    // Update Local Storage
    try {
      const stored = localStorage.getItem('aniflow_progress');
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[anime.id] = progress;
      localStorage.setItem('aniflow_progress', JSON.stringify(parsed));
    } catch(e) {}

    // Update Firebase
    if (user?.id && Math.abs(currentTime - lastSavedTime) > 10) {
      const delta = currentTime - lastSavedTime;
      setLastSavedTime(currentTime);
      const isNaturalPlayback = delta > 0 && delta <= 15;
      
      try {
        const progressUpdate: any = { ...progress };
        if (isNaturalPlayback) {
          progressUpdate.watchTimeSeconds = increment(Math.floor(delta));
        }
        await setDoc(doc(db, 'userProgress', `${user.id}_${anime.id}`), progressUpdate, { merge: true });
        
        if (isNaturalPlayback) {
          await setDoc(doc(db, 'users', user.id), { 
            totalWatchTimeSeconds: increment(Math.floor(delta)) 
          }, { merge: true });
        }
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    }
  };

  const loadProgress = async () => {
    if (initialSeekDone) return;
    setInitialSeekDone(true); // Set early to avoid re-calls

    let savedTime = 0;
    const localData = localStorage.getItem(`progress_${episode.id}`);
    if (localData) savedTime = parseFloat(localData);

    if (user?.id) {
      try {
        const progressId = `${user.id}_${anime.id}`;
        const docSnap = await getDoc(doc(db, 'userProgress', progressId));
        if (docSnap.exists()) {
          const cloudTime = docSnap.data().watchedTime || 0;
          if (cloudTime > savedTime) savedTime = cloudTime;
        }
      } catch (err) {
        console.error('Error loading progress:', err);
      }
    }

    if (savedTime > 5 && videoRef.current) {
      videoRef.current.currentTime = savedTime;
    }
  };

  const getUrl = () => {
    const servers = getEpisodeSources(episode);
    if (servers.length === 0) return '';
    if (selectedServerIndex >= servers.length) return servers[0].url;
    return servers[selectedServerIndex].url;
  };

  const sources = getEpisodeSources(episode);
  const source = sources[selectedServerIndex] || (sources.length > 0 ? sources[0] : { url: '', type: 'iframe' });
  const url = source?.url || '';
  let type: 'iframe' | 'video' | 'hls' = source?.type || 'iframe';
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();

  // Improved detection logic
  if (cleanUrl.endsWith('.m3u8') || url.includes('/playlist.m3u8') || url.includes('.m3u8?')) {
    type = 'hls';
  } else if (
    cleanUrl.endsWith('.mp4') || 
    cleanUrl.endsWith('.mkv') || 
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.avi') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.endsWith('.ogv') ||
    url.toLowerCase().includes('.mp4?') ||
    url.toLowerCase().includes('.mkv?') ||
    url.toLowerCase().includes('.webm?') ||
    url.toLowerCase().includes('/video/mp4') ||
    url.toLowerCase().includes('googleusercontent.com')
  ) {
    type = 'video';
  } else if (
    url.includes('streamable.com/') || 
    url.includes('youtube.com/') || 
    url.includes('youtu.be/') || 
    url.includes('drive.google.com/') || 
    url.includes('embed') || 
    url.includes('ok.ru/videoembed/') || 
    url.includes('dailymotion.com/embed/') || 
    url.includes('vimeo.com/') ||
    url.includes('vidmoly.to/embed') ||
    url.includes('mixdrop.co/e/') ||
    url.includes('dood') ||
    url.includes('voe.sx/e/')
  ) {
    type = 'iframe';
  }

  const getEmbedUrl = (originalUrl: string) => {
    let finalUrl = originalUrl;
    if (originalUrl.includes('youtube.com/watch?v=')) {
      finalUrl = originalUrl.replace('watch?v=', 'embed/');
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'enablejsapi=1';
    } else if (originalUrl.includes('youtu.be/')) {
      const id = originalUrl.split('/').pop()?.split('?')[0];
      finalUrl = `https://www.youtube.com/embed/${id}?enablejsapi=1`;
    } else if (originalUrl.includes('youtube.com/embed/')) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'enablejsapi=1';
    } else if (originalUrl.includes('streamable.com/') && !originalUrl.includes('streamable.com/e/')) {
      const id = originalUrl.split('/').pop()?.split('?')[0];
      finalUrl = `https://streamable.com/e/${id}`;
    }
    return finalUrl;
  };

  useEffect(() => {
    if (type === 'hls' && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          startLevel: -1,
        });

        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => setIsPlaying(false));
          }
        });

        return () => {
          hls.destroy();
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
          }
        };
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = url;
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
    }
    
    // Cleanup for non-hls or native hls
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [url, type]);

  // Attempt to intercept generic frame end messages
  useEffect(() => {
    if (type !== 'iframe') return;
    const handleMessage = (e: MessageEvent) => {
      try {
        let eventData = e.data;
        if (typeof eventData === 'string') {
          // Check for common embed play/end messages
          try { eventData = JSON.parse(eventData); } catch(e) {}
        }
        
        const autoplaySetting = localStorage.getItem('aniflow_autoplay') !== 'false';

        // YouTube API ended state (0)
        if (eventData?.event === 'infoDelivery' && eventData?.info?.playerState === 0) {
           if (autoplaySetting && onEnded) onEnded();
        } else if (
          eventData?.type === 'ended' || 
          eventData?.event === 'ended' || 
          eventData?.message === 'ended' ||
          eventData?.data === 'ended' ||
          eventData?.playState === 0 ||
          (typeof eventData === 'string' && (eventData.includes('ended') || eventData.includes('finish')))
        ) {
          if (autoplaySetting && onEnded) onEnded();
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [type, onEnded]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setProgress(time);
    saveProgress(time);

    // Update buffered state
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(bufferedEnd);
    }
  };

  const renderContent = () => {
    if (!url) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900 gap-4 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
            <EyeOff size={40} className="text-zinc-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Content Not Found</h3>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest max-w-xs mx-auto">This server host does not contain an active transmission signal. Please switch servers.</p>
          </div>
        </div>
      );
    }

    if (type === 'iframe' || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('drive.google.com') || url.includes('embed') || url.includes('streamable.com') || url.includes('mixdrop') || url.includes('dood') || url.includes('vidmoly')) {
      const finalUrl = getEmbedUrl(url);
      
      return (
        <iframe 
          src={finalUrl} 
          className="w-full h-full border-none transition-transform duration-300"
          style={{ transform: `rotate(${rotation}deg)` }}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="no-referrer"
        />
      );
    }

    const isRotated = rotation === 90 || rotation === 270;
    const computedParentStyle = isRotated
      ? (isFullScreen
          ? {
              position: 'absolute' as any,
              top: '50%',
              left: '50%',
              width: '100vh',
              height: '100vw',
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`
            }
          : {
              position: 'absolute' as any,
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${playerContainerRef.current ? Math.min(playerContainerRef.current.clientWidth / playerContainerRef.current.clientHeight, playerContainerRef.current.clientHeight / playerContainerRef.current.clientWidth) : 0.5625})`
            })
      : {
          position: 'absolute' as any,
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          transform: `rotate(${rotation}deg)`
        };

    return (
      <div 
        ref={playerContainerRef} 
        className="relative w-full h-full bg-black group select-none touch-none flex items-center justify-center overflow-hidden z-10 cursor-pointer"
        onPointerMove={(e) => { if (e.pointerType !== 'touch') handleMouseMove(e); }}
        onClick={handleInteraction}
      >
        <div style={computedParentStyle} className="relative transition-all duration-300">
          <video 
            ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
            loadProgress();
          }}
          onLoadStart={() => setIsBuffering(true)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onPlay={() => { 
            setIsPlaying(true); 
            setIsBuffering(false);
            resetControlsTimeout(); 
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={onEnded}
          className={`w-full h-full transition-all duration-300 ${
            aspectRatio === 'contain' ? 'object-contain' : 
            aspectRatio === 'cover' ? 'object-cover' : 'object-fill'
          }`}
          poster={episode.thumbnail || anime.thumbnail}
          key={url}
          autoPlay
          playsInline
          preload="auto"
          crossOrigin="anonymous"
        >
          {type === 'video' && (
            <source 
              src={url} 
              type={
                url.toLowerCase().includes('.mp4') ? 'video/mp4' : 
                url.toLowerCase().includes('.mkv') ? 'video/x-matroska' : 
                url.toLowerCase().includes('.webm') ? 'video/webm' : 
                url.toLowerCase().includes('.mov') ? 'video/quicktime' : 
                undefined
              } 
            />
          )}
        </video>

        {/* Loading Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="w-16 h-16 border-4 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Aspect Ratio Hint */}
        <AnimatePresence>
          {showAspectHint && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
            >
              <div className="bg-black/60 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex flex-col items-center gap-3">
                {aspectRatio === 'contain' ? <Maximize size={48} className="text-rose-500" /> : 
                 aspectRatio === 'cover' ? <Crop size={48} className="text-rose-500" /> : <StretchHorizontal size={48} className="text-rose-500" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  {aspectRatio === 'contain' ? 'Fit to Screen' : 
                   aspectRatio === 'cover' ? 'Fill Screen' : 'Stretch to Fill'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRotationHint && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
            >
              <div className="bg-black/60 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex flex-col items-center gap-3">
                <RotateCw size={48} className="text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  Rotation: {rotation}°
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showControls && !isLocked && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 z-20 flex flex-col justify-between"
            >
              {/* Top Bar */}
              <div className="p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-white text-xs md:text-sm font-black uppercase tracking-widest truncate max-w-xs md:max-w-lg">
                      {anime.title}
                    </h1>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                      S{episode.season || 1} EP{episode.episodeNumber} - {episode.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        cycleAspect();
                        resetControlsTimeout();
                      }} 
                      className="p-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center"
                      title={`View Mode: ${aspectRatio}`}
                    >
                      {aspectRatio === 'contain' ? <Maximize size={20} /> : 
                       aspectRatio === 'cover' ? <Crop size={20} /> : <StretchHorizontal size={20} />}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        cycleRotation();
                      }} 
                      className="p-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center"
                      title={`Rotate: ${rotation}°`}
                    >
                      <RotateCw size={20} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLocked(true);
                        setShowControls(false);
                      }} 
                      className="p-2 text-white hover:bg-white/10 rounded-full transition-colors border border-transparent shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                      title="Lock Player"
                    >
                      <LockIcon size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="p-2 md:p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent space-y-2 md:space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center justify-between text-[8px] md:text-xs font-black text-white/50 uppercase tracking-widest">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="relative group/progress h-1 md:h-2">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={progress}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSeek}
                      className="absolute inset-x-0 -top-2 h-6 opacity-0 z-30 cursor-pointer w-full"
                    />
                    <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
                      {/* Buffered bar */}
                      <div 
                        className="absolute inset-y-0 bg-white/20 transition-all duration-300"
                        style={{ width: `${(buffered / (duration || 1)) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-rose-600 rounded-full relative z-10" 
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-xl" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between gap-2 h-12 md:h-16">
                  {/* Left Controls (Volume) */}
                  <div className="flex-1 flex items-center gap-2 md:gap-3 w-1/4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newMuted = !isMuted;
                        setIsMuted(newMuted);
                        if (videoRef.current) videoRef.current.muted = newMuted;
                        resetControlsTimeout();
                      }}
                      className="text-white hover:text-rose-500 transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX size={20} className="md:w-6 md:h-6" /> : <Volume2 size={20} className="md:w-6 md:h-6" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={isMuted ? 0 : volume}
                      onClick={(e) => {
                        e.stopPropagation();
                        resetControlsTimeout();
                      }}
                      onChange={(e) => {
                        e.stopPropagation();
                        const val = parseFloat(e.target.value);
                        setVolume(val);
                        setIsMuted(val === 0);
                        if (videoRef.current) {
                          videoRef.current.volume = val;
                          videoRef.current.muted = val === 0;
                        }
                        resetControlsTimeout();
                      }}
                      className="w-16 md:w-20 h-1 bg-white/20 rounded-full accent-rose-600 cursor-pointer"
                    />
                  </div>

                  {/* Center Controls */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-4 md:gap-8 w-1/2 z-10">
                    <button onClick={(e) => { e.stopPropagation(); skip(-10); }} className="text-white hover:text-rose-500 transition-colors">
                      <RotateCcw size={20} className="md:w-6 md:h-6" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (prevEpisode) navigate(`/episode/${prevEpisode.id}`);
                        resetControlsTimeout();
                      }}
                      disabled={!prevEpisode}
                      className="text-white hover:text-rose-500 disabled:opacity-20 transition-colors"
                    >
                      <SkipBack size={24} className="md:w-7 md:h-7" fill="currentColor" />
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                        resetControlsTimeout();
                      }} 
                      className="p-3 md:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center justify-center shadow-lg backdrop-blur-sm"
                    >
                      {isPlaying ? <Pause size={28} className="md:w-8 md:h-8" fill="currentColor" /> : <Play size={28} className="md:w-8 md:h-8 translate-x-[2px]" fill="currentColor" />}
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (nextEpisode) navigate(`/episode/${nextEpisode.id}`);
                        else onEnded?.();
                        resetControlsTimeout();
                      }}
                      disabled={!nextEpisode}
                      className="text-white hover:text-rose-500 disabled:opacity-20 transition-colors"
                    >
                      <SkipForward size={24} className="md:w-7 md:h-7" fill="currentColor" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); skip(10); }} className="text-white hover:text-rose-500 transition-colors">
                      <RotateCw size={20} className="md:w-6 md:h-6" />
                    </button>
                  </div>

                  {/* Right Controls */}
                  <div className="flex-1 flex justify-end items-center gap-2 md:gap-4 relative w-1/4">

                    <div className="relative">
                      <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSpeedMenu(!showSpeedMenu);
                        resetControlsTimeout();
                      }}
                      className="text-white hover:text-rose-500 transition-colors flex items-center gap-0.5 md:gap-1"
                    >
                      <Settings size={18} className="md:w-5 md:h-5" />
                      <span className="text-[8px] md:text-[10px] font-black">{playbackSpeed}x</span>
                    </button>
                      
                      <AnimatePresence>
                        {showSpeedMenu && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full right-0 mb-4 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 min-w-[120px] shadow-2xl z-50"
                          >
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                              <button
                                key={speed}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPlaybackSpeed(speed);
                                  if (videoRef.current) videoRef.current.playbackRate = speed;
                                  setShowSpeedMenu(false);
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors",
                                  playbackSpeed === speed ? "bg-rose-600 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                )}
                              >
                                {speed}x
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFullScreen();
                        resetControlsTimeout();
                      }} 
                      className="text-white hover:text-rose-500 transition-colors"
                    >
                      <Maximize2 size={18} className="md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lock Hint Overlay */}
        <AnimatePresence>
          {showLockOnly && isLocked && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-start justify-end p-6 pointer-events-none"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLocked(false);
                  setShowLockOnly(false);
                  setShowControls(true);
                }}
                className="p-4 bg-rose-600 text-white rounded-full shadow-2xl backdrop-blur-md pointer-events-auto active:scale-90 transition-transform flex items-center gap-2"
              >
                <Unlock size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest pr-2">Unlock</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    );
  };

  const handleSendBug = async () => {
    if (!user || !bugMessage.trim()) return;
    setIsSendingBug(true);
    try {
      const issueId = `bug-${Date.now()}`;
      await setDoc(doc(db, 'issues', issueId), {
        id: issueId,
        userId: user.id,
        userName: user.displayName || user.username || user.email,
        userEmail: user.email,
        message: bugMessage,
        status: 'open',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        animeId: anime.id,
        episodeId: episode.id,
        replySeen: false
      });
      alert("Bug reported successfully machi! Admin will check soon.");
      setBugMessage('');
      setShowBugModal(false);
    } catch (e) {
      console.error(e);
      alert("Failed to send bug machi. Try again!");
    } finally {
      setIsSendingBug(false);
    }
  };

  return (
      <div className="bg-[#1a1b1e] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/5">
      <div className="flex flex-col sm:flex-row md:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-white/5">
         <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0 flex-1">
           <h2 className="text-xs sm:text-sm md:text-base font-black text-white uppercase tracking-wider truncate flex-1 min-w-0">
             S{episode.season || 1} EP{episode.episodeNumber} - {episode.title || `Episode ${episode.episodeNumber}`}
           </h2>
           <BookmarkButton animeId={anime.id} showText={true} className="shrink-0" />
         </div>
         <div className="text-[10px] font-black pointer-events-none text-zinc-600 bg-white/5 px-2 py-1 rounded hidden lg:block uppercase tracking-widest truncate max-w-[200px] xl:max-w-xs">{anime.title}</div>
      </div>

      {/* Main Player Display */}
      <div className="aspect-video bg-black relative group">
        {renderContent()}
      </div>

      {/* Control Strip & Server Switcher */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-4 sm:p-6 bg-[#141517] border-b border-white/5">
        <div className="flex items-center justify-center lg:justify-start gap-4">
           {/* Previous Button */}
           <button 
            onClick={() => prevEpisode && navigate(`/episode/${prevEpisode.id}`)}
            disabled={!prevEpisode}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-white/5 bg-white/5 hover:bg-rose-600 transition-all flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-20 shrink-0"
           >
              <ChevronLeft size={20} />
           </button>
           
           <div className="flex flex-col items-center justify-center shrink-0">
              <span className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] block leading-none">{anime.format === 'movie' ? 'Part' : 'Episode'}</span>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-widest">{episode.episodeNumber.toString().padStart(2, '0')}</h2>
           </div>

           {/* Next Button */}
           <button 
            onClick={() => nextEpisode ? navigate(`/episode/${nextEpisode.id}`) : onEnded?.()}
            disabled={!nextEpisode}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center justify-center shadow-lg shadow-rose-600/20 disabled:opacity-20 shrink-0"
           >
              <ChevronRight size={20} />
           </button>
        </div>

        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          {getEpisodeSources(episode).map((srv, idx) => {
            if (!srv.url || srv.url.trim() === '') return null; // Don't show empty servers
            return (
              <button
                key={idx}
                onClick={() => setSelectedServerIndex(idx)}
                className={cn(
                  "px-4 py-3 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                  selectedServerIndex === idx 
                    ? "bg-[#00c853] border-[#00c853] text-white shadow-lg shadow-[#00c853]/20" 
                    : "bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10 hover:text-white"
                )}
              >
                {srv.name || `Server ${idx + 1}`}
              </button>
            )
          })}
          
          <button 
            onClick={() => {
              if (!user) {
                navigate('/login');
                return;
              }
              setShowBugModal(true);
            }}
            className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-3 md:py-2.5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/5 shrink-0"
          >
            <Bug size={16} /> <span className="hidden sm:inline">Report Issue</span>
          </button>
        </div>
      </div>

      {/* Important Text Container */}
      {episode.importantText && (
        <div className="bg-[#141517] overflow-hidden">
           <div className="bg-amber-500/10 border-t border-b border-amber-500/20 px-6 py-4 flex items-center justify-center gap-3">
             <AlertTriangle size={18} className="text-amber-500 shrink-0" />
             <p className="text-amber-500/90 font-bold text-xs max-w-2xl text-center leading-relaxed">
               {episode.importantText}
             </p>
           </div>
        </div>
      )}

      <AnimatePresence>
        {showBugModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#16161a] border border-white/10 rounded-[3rem] p-8 max-w-md w-full shadow-4xl relative"
            >
              <button onClick={() => setShowBugModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white p-2 bg-white/5 rounded-full"><X size={20} /></button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <Bug size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Report Issue</h3>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Found a bug machi? Tell us about it!</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Issue Details</label>
                  <textarea 
                    rows={6}
                    value={bugMessage}
                    onChange={e => setBugMessage(e.target.value)}
                    placeholder="Describe the issue... (e.g. Video not loading on Server 2)"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500/50 transition-all resize-none font-medium"
                  />
                </div>

                <button 
                  onClick={handleSendBug}
                  disabled={isSendingBug || !bugMessage.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-amber-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isSendingBug ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Transmit Signal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CommentItem: React.FC<{ 
  comment: UserComment, 
  onDelete?: (id: string) => void | Promise<void>,
  onReply?: (parentId: string, userName: string) => void,
  replies?: UserComment[]
}> = ({ comment, onDelete, onReply, replies }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    if (hasDisliked) {
      setDislikes(prev => prev - 1);
      setHasDisliked(false);
    }
    const newLikes = hasLiked ? likes - 1 : likes + 1;
    setLikes(newLikes);
    setHasLiked(!hasLiked);
    try {
      await setDoc(doc(db, 'comments', comment.id), { 
        likes: newLikes,
        dislikes: hasDisliked ? dislikes - 1 : dislikes 
      }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    }
    const newDislikes = hasDisliked ? dislikes - 1 : dislikes + 1;
    setDislikes(newDislikes);
    setHasDisliked(!hasDisliked);
    try {
      await setDoc(doc(db, 'comments', comment.id), { 
        dislikes: newDislikes,
        likes: hasLiked ? likes - 1 : likes
      }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 group">
        <img src={comment.userAvatar} className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 object-cover border border-white/5" alt={comment.userName} />
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center gap-2">
             <span className="text-sm font-black text-white uppercase tracking-tighter truncate max-w-[150px] sm:max-w-xs">{comment.userName}</span>
             <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
             {comment.parentId && <span className="bg-rose-600/10 text-rose-500 text-[8px] px-1.5 py-0.5 rounded border border-rose-500/20 font-black uppercase">Reply</span>}
          </div>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed break-words whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                hasLiked ? "text-rose-500" : "text-zinc-600 hover:text-white"
              )}
            >
              <ThumbsUp size={12} fill={hasLiked ? "currentColor" : "none"} /> {likes}
            </button>
            <button 
              onClick={handleDislike}
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                hasDisliked ? "text-rose-500" : "text-zinc-600 hover:text-white"
              )}
            >
              <ThumbsDown size={12} fill={hasDisliked ? "currentColor" : "none"} /> {dislikes}
            </button>
            {onReply && !comment.parentId && (
              <button 
                onClick={() => onReply(comment.id, comment.userName)}
                className="text-zinc-600 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
              >
                <MessageSquare size={12} /> Reply
              </button>
            )}
            {user?.id === comment.userId && onDelete && (
              <ConfirmDeleteButton 
                onConfirm={() => onDelete(comment.id)}
                className="text-zinc-600 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ml-auto sm:opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-0 hover:bg-transparent"
                defaultIcon={<><Trash2 size={12} /> Delete</>}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Replies Indented */}
      {replies && replies.length > 0 && (
        <div className="pl-6 sm:pl-12 border-l border-white/5 space-y-6 mt-4 ml-5">
          {replies.map((reply, idx) => (
            <CommentItem key={reply.id || `reply-${idx}`} comment={reply} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsSection({ animeId, animeTitle }: { animeId: string, animeTitle: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<UserComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);

  // New features state
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('animeId', '==', animeId),
      orderBy('createdAt', sortBy === 'newest' ? 'desc' : 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserComment)));
    }, (error) => {
      if (error.message.includes('requires an index')) {
        const fallbackQ = query(collection(db, 'comments'), where('animeId', '==', animeId));
        onSnapshot(fallbackQ, (snapshot) => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserComment));
          setComments(list.sort((a, b) => sortBy === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
        });
      }
    });
    return () => unsubscribe();
  }, [animeId, sortBy]);

  const handlePost = async (parentId?: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      const id = `comment-${Date.now()}`;
      const commentData: UserComment = {
        id,
        animeId,
        episodeId: 'shared',
        userId: user.id,
        userName: user.displayName || user.username || (user.email ? user.email.split('@')[0] : 'User'),
        userAvatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        content: newComment,
        createdAt: Date.now(),
        likes: 0,
        dislikes: 0
      };
      
      if (parentId) {
        commentData.parentId = parentId;
      }
      
      await setDoc(doc(db, 'comments', id), commentData);
      
      // Feature: Notify user when replied
      if (parentId) {
         const parentComment = comments.find(c => c.id === parentId);
         if (parentComment) {
             await addDoc(collection(db, 'issues'), {
                 userId: parentComment.userId,
                 userEmail: parentComment.userName,
                 userName: 'System',
                 issueType: 'other',
                 message: `Reply on ${animeTitle}`,
                 status: 'resolved',
                 adminReply: `${user.displayName || user.username || user.email?.split('@')[0]} replied: "${newComment}"`,
                 replySeen: false,
                 createdAt: Date.now(),
                 updatedAt: Date.now()
             });
         }
      }

      setNewComment('');
      setReplyTo(null);
      setIsExpanded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Find all replies that have this comment as their parent
      const repliesToDelete = comments.filter(c => c.parentId === id);
      
      const batch = writeBatch(db);
      // Add parent comment to deletion batch
      batch.delete(doc(db, 'comments', id));
      // Add all replies to deletion batch
      repliesToDelete.forEach(reply => {
        batch.delete(doc(db, 'comments', reply.id));
      });
      
      await batch.commit();
    } catch (e: any) {
      console.error(e);
      alert('Failed to delete comment: ' + e.message);
    }
  };

  const handleFocus = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsExpanded(true);
  };

  // Organize comments: Top-level vs Replies
  const topLevelComments = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  return (
    <div className="space-y-8 bg-zinc-900/20 rounded-[2.5rem] p-6 sm:p-10 border border-white/5 shadow-2xl overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex flex-wrap items-center justify-between sm:justify-start w-full gap-4">
           <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
             <div className="w-1.5 h-6 bg-rose-600 rounded-full" />
             COMMENTS <span className="hidden sm:inline px-2 py-0.5 bg-rose-600 rounded text-[10px] text-white">ON</span>
           </h3>
           <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-zinc-600 uppercase tracking-widest">
             <span className="text-zinc-500">{animeTitle}</span>
             <span className="hidden sm:inline">•</span>
             <span className="text-rose-500">{comments.length} COMMENTS</span>
             <span className="hidden sm:inline ml-2 opacity-20 text-white">|</span>
             <div className="flex items-center gap-3 ml-2">
                <button 
                  onClick={() => setSortBy('newest')}
                  className={cn(
                    "hover:text-white transition-colors cursor-pointer",
                    sortBy === 'newest' ? "text-rose-500 font-black" : "text-zinc-600"
                  )}
                >
                  Newest
                </button>
                <button 
                  onClick={() => setSortBy('oldest')}
                  className={cn(
                    "hover:text-white transition-colors cursor-pointer",
                    sortBy === 'oldest' ? "text-rose-500 font-black" : "text-zinc-600"
                  )}
                >
                  Oldest
                </button>
             </div>
           </div>
           
           <button 
             onClick={() => setIsExpanded(!isExpanded)} 
             className="sm:hidden p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors ml-auto shrink-0"
           >
             {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
           </button>
        </div>
        
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <button 
             onClick={() => setIsExpanded(!isExpanded)} 
             className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all shrink-0 border border-white/5"
             title={isExpanded ? "Minimize Container" : "Expand Container"}
          >
             {isExpanded ? 'Minimize' : 'View All'} 
             {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div className="pt-2 relative">
        {replyTo && (
          <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl mb-4 text-[10px] font-black uppercase tracking-widest text-rose-500">
            <span>Replying to {replyTo.name}</span>
            <button onClick={() => setReplyTo(null)} className="hover:text-white p-1"><X size={12} /></button>
          </div>
        )}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center border border-white/10">
             {user ? (
                <img src={(user as any).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-full h-full object-cover" alt="Me" />
             ) : (
                <UserIcon size={18} className="text-zinc-500" />
             )}
          </div>
          <div className="flex-1 space-y-4 min-w-0">
             <textarea
              placeholder={replyTo ? `Write a reply to ${replyTo.name}...` : "Write your comment (Click to Login if guest)..."}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onClick={handleFocus}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-all min-h-[100px] font-medium resize-none break-words"
            />
            {isExpanded && (
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => { setNewComment(''); setReplyTo(null); setIsExpanded(false); }}
                    className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={() => handlePost(replyTo?.id)}
                    disabled={isPosting || !newComment.trim()}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
                   >
                    {isPosting ? 'Posting...' : replyTo ? 'Reply' : 'Send'}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
          <div className="space-y-8 pt-6 border-t border-white/5 mt-6">
            {topLevelComments.slice(0, visibleCount).map((comment, idx) => (
              <CommentItem 
                key={comment.id || `comment-${idx}`} 
                comment={comment} 
                onDelete={handleDelete}
                onReply={(id, name) => {
                  if (!user) { navigate('/login'); return; }
                  setReplyTo({ id, name });
                  setIsExpanded(true);
                  window.scrollTo({ top: document.querySelector('textarea')?.offsetTop ? document.querySelector('textarea')!.offsetTop - 200 : 0, behavior: 'smooth' });
                }}
                replies={replies.filter(r => r.parentId === comment.id).sort((a, b) => a.createdAt - b.createdAt)} 
              />
            ))}

            {topLevelComments.length === 0 && (
              <div className="py-20 text-center opacity-30">
                 <MessageSquare size={48} className="mx-auto mb-4" />
                 <p className="font-bold uppercase tracking-widest text-xs">No comments yet. Be the first to start the conversation!</p>
              </div>
            )}

            {visibleCount < topLevelComments.length && (
              <div className="flex justify-center pt-8 border-t border-white/5">
                <button 
                  onClick={() => setVisibleCount(v => v + 10)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all shadow-xl"
                >
                  Load More Comments
                </button>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

const RelatedAnimeCard = ({ animeId, isMain = false }: { animeId: string; isMain?: boolean; key?: any }) => {
  const [data, setData] = useState<Anime | null>(null);
  const [isExpanded, setIsExpanded] = useState(isMain);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [firstEpisodeId, setFirstEpisodeId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'anime', animeId));
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as Anime);
          const q = query(
            collection(db, 'episodes'),
            where('animeId', '==', animeId),
            limit(20)
          );
          const epSnap = await getDocs(q);
          if (!epSnap.empty) {
            const eps = epSnap.docs.map(d => ({ id: d.id, num: d.data().episodeNumber || 0 }));
            eps.sort((a, b) => a.num - b.num);
            setFirstEpisodeId(eps[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  }, [animeId]);

  if (loading) return (
    <div className={cn(
      "rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse",
      isExpanded ? "w-full h-[300px]" : "w-full h-20"
    )} />
  );
  if (!data) return null;

  const handlePlay = () => {
    if (firstEpisodeId) {
      navigate(`/episode/${firstEpisodeId}`);
    } else {
      alert("No episodes available for this anime yet!");
    }
  };

  return (
    <div className={cn(
      "group relative rounded-xl overflow-hidden transition-all duration-300 border border-white/5 bg-[#0a0a0c] shadow-md",
      isExpanded ? "w-full" : "w-full hover:border-rose-500/20"
    )}>
      {isExpanded ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
          <div className="absolute inset-0">
             <img 
               src={data.bannerImage || data.bannerMobile || data.thumbnail} 
               className="w-full h-full object-cover opacity-20 blur-xl scale-125" 
               onError={(e) => { (e.target as HTMLImageElement).src = data.thumbnail; }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/90 to-transparent" />
          </div>
          
          <div className="relative p-5 sm:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-6 items-center flex-1 min-w-0 w-full">
              <div className="w-24 sm:w-32 shrink-0 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
                 <img src={data.thumbnail} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-3 min-w-0 w-full">
                 <div className="w-full overflow-hidden">
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 text-rose-500 font-black uppercase text-[7px] tracking-[.2em] mb-1">
                      {data.genres?.slice(0, 2).join(' / ')}
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-lg truncate w-full">{data.title}</h1>
                 </div>

                 <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-600 rounded text-[9px] font-black text-white">
                      <Star size={10} fill="currentColor" /> {data.rating}
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                       {data.releaseDate} • {data.format === 'movie' ? 'MOVIE' : 'TV SERIES'} • {data.quality || 'HD'}
                    </div>
                 </div>

                 <p className="text-zinc-500 text-[9px] sm:text-[10px] font-medium leading-relaxed max-w-xl line-clamp-2 italic opacity-70 hidden sm:block">
                   "{data.synopsis}"
                 </p>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-3 shrink-0">
               <button 
                onClick={handlePlay}
                className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 min-w-[120px]"
               >
                 <Play size={12} fill="currentColor" /> Play
               </button>
               <button 
                 onClick={() => setIsExpanded(false)}
                 className="p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center group"
               >
                 <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
               </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="p-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-12 rounded-md overflow-hidden shrink-0 border border-white/5 shadow-md">
              <img src={data.thumbnail} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-white font-black uppercase text-[9px] tracking-tight truncate group-hover:text-rose-500 transition-colors uppercase">
                {typeof data.title === 'object' ? (data.title?.english || data.title?.romaji || 'Untitled') : data.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 opacity-40">
                <Star size={7} className="text-rose-500" fill="currentColor" />
                <span className="text-[8px] font-black text-white">{data.rating}</span>
                <span className="text-zinc-800 text-[8px]">|</span>
                <span className="text-[8px] font-black text-white uppercase">{data.quality || 'HD'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={handlePlay}
              className="w-7 h-7 bg-rose-600/10 text-rose-500 rounded-md flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all active:scale-90"
            >
              <Play size={8} fill="currentColor" />
            </button>
            <button 
              onClick={() => setIsExpanded(true)}
              className="w-7 h-7 bg-white/5 border border-white/5 rounded-md text-zinc-600 hover:text-white transition-all flex items-center justify-center"
            >
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function EpisodePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!id || !episode) return;
    
    const trackView = async () => {
      try {
        if (episode.animeId) {
          let viewerId = user?.id;
          
          if (!viewerId) {
            let uniqueId = localStorage.getItem('aniflow_visitor_id');
            if (!uniqueId) {
              uniqueId = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
              localStorage.setItem('aniflow_visitor_id', uniqueId);
            }
            viewerId = uniqueId;
          }

          const viewerRef = doc(db, 'anime', episode.animeId, 'viewers', viewerId);
          const viewerSnap = await getDoc(viewerRef);
          if (!viewerSnap.exists()) {
            const batch = writeBatch(db);
            batch.set(viewerRef, { viewedAt: serverTimestamp(), type: user ? 'registered' : 'guest' });
            batch.update(doc(db, 'anime', episode.animeId), { viewCount: increment(1) });
            await batch.commit();
          }
        }
      } catch (e) {
        console.error("Tracking error:", e);
      }
    };

    trackView();
  }, [id, user?.id, episode?.id, episode?.animeId]);

  useEffect(() => {
    if (!id) return;
    const unsubscribeEpisode = onSnapshot(doc(db, 'episodes', id), (epSnap) => {
      if (epSnap.exists()) {
        const epData = { id: epSnap.id, ...epSnap.data() } as Episode;
        setEpisode(epData);
        setSelectedSeason(epData.season || 1);
        
        getDoc(doc(db, 'anime', epData.animeId)).then(aniDoc => {
          if (aniDoc.exists()) {
            setAnime({ id: aniDoc.id, ...aniDoc.data() } as Anime);
          }
        });

        const q = query(
          collection(db, 'episodes'), 
          where('animeId', '==', epData.animeId),
          orderBy('episodeNumber', 'asc')
        );
        
        onSnapshot(q, (snap) => {
          const loadedEps = snap.docs.map(d => ({ id: d.id, ...d.data() } as Episode));
          setAllEpisodes(loadedEps.filter(e => e.status === 'public' || !e.status));
        }, (e: any) => {
          if (e.message?.includes('index') || e.code === 'failed-precondition') {
            getDocs(query(collection(db, 'episodes'), where('animeId', '==', epData.animeId))).then(snap => {
              const res = snap.docs.map(d => ({ id: d.id, ...d.data() } as Episode));
              setAllEpisodes(res.filter(e => e.status === 'public' || !e.status).sort((a,b) => a.episodeNumber - b.episodeNumber));
            });
          }
        });
      }
    });
    return () => unsubscribeEpisode();
  }, [id]);

  const [recommendedAnime, setRecommendedAnime] = useState<Anime[]>([]);

  useEffect(() => {
    // Fetch random recommendations
    const fetchRecs = async () => {
      try {
        const q = query(collection(db, 'anime'), limit(15));
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Anime));
        // Shuffle and take 4
        setRecommendedAnime(all.sort(() => 0.5 - Math.random()).slice(0, 4));
      } catch (err) {
        console.error("Recs error:", err);
      }
    };
    fetchRecs();
  }, []);

  if (!episode || !anime) return <div className="p-12 text-center text-white/50 bg-[#0a0a0b] min-h-screen">Loading Reality...</div>;

  const filteredEpisodes = allEpisodes.filter(ep => {
    const matchesSeason = (ep.season || 1) === selectedSeason;
    const matchesQuery = ep.episodeNumber.toString() === searchQuery || ep.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeason && (searchQuery ? matchesQuery : true);
  });

  const seasons = Array.from({ length: anime.seasonsCount || 1 }, (_, i) => i + 1);

  if (episode.status === 'private') {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
            <EyeOff size={40} className="text-rose-500" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Transmission Restricted</h2>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">This encoded signal has been sequestered into the private vault by the Studio. Access protocol denied.</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-rose-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20">Return to Grid</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Dynamic Background Blur */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img 
          src={anime.bannerImage || anime.bannerMobile || anime.thumbnail} 
          className="w-full h-full object-cover blur-[150px] opacity-[0.08]" 
          alt=""
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-6 md:py-12 flex flex-col gap-6 md:gap-12 w-full overflow-hidden">
        {/* Main Header / Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] font-black text-zinc-600 mb-2 uppercase tracking-[0.2em] min-w-0 overflow-hidden w-full">
          <Link to="/" className="hover:text-white transition-colors shrink-0">Home</Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-zinc-200 truncate max-w-[150px] sm:max-w-[300px] md:max-w-md lg:max-w-xl">{anime.title}</span>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-zinc-300 shrink-0 truncate max-w-[100px] sm:max-w-xs">Episode {episode.episodeNumber}</span>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col gap-10 w-full mb-12">
          
          {/* Main Column: Player */}
          <div className="flex flex-col gap-10 min-w-0">
            <VideoPlayer 
              episode={episode} 
              anime={anime} 
              prevEpisode={allEpisodes.find(e => (e.season || 1) === (episode.season || 1) && e.episodeNumber === episode.episodeNumber - 1)}
              nextEpisode={allEpisodes.find(e => (e.season || 1) === (episode.season || 1) && e.episodeNumber === episode.episodeNumber + 1)}
              onEnded={() => {
                const next = allEpisodes.find(e => (e.season || 1) === (episode.season || 1) && e.episodeNumber === episode.episodeNumber + 1);
                if (next) navigate(`/episode/${next.id}`);
                else {
                  // Try next season
                  const nextSeasonEp = allEpisodes.find(e => (e.season || 1) === (episode.season || 1) + 1 && e.episodeNumber === 1);
                  if (nextSeasonEp) navigate(`/episode/${nextSeasonEp.id}`);
                }
              }}
            />

            {/* Episode Selector Box - Moved to Main Column */}
            <div className="bg-[#16161a] border border-white/5 rounded-2xl md:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-white/5">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-rose-600 rounded-full" />
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter shrink-0">Episodes</h3>
                 </div>
                 
                 <div className="relative w-full sm:max-w-xs">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                      <Search size={14} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search Episode #..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold text-white focus:outline-none focus:border-rose-500/50 placeholder:text-zinc-600 transition-colors"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                        <X size={14} />
                      </button>
                    )}
                 </div>
               </div>

               {/* Season Selection Bar */}
               <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {seasons.map(s => {
                    const epCount = allEpisodes.filter(e => (e.season || 1) === s).length;
                    return (
                      <button 
                        key={`season-switch-${s}`}
                        onClick={() => setSelectedSeason(s)}
                        className={cn(
                          "px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border shrink-0",
                          selectedSeason === s 
                            ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/20" 
                            : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10"
                        )}
                      >
                        Season {s} <span className="opacity-50 text-[9px] ml-1.5">({epCount} EPS)</span>
                      </button>
                    );
                  })}
               </div>
               
               <div className="flex flex-wrap gap-2 md:gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredEpisodes.map((ep) => (
                    <Link 
                      key={ep.id}
                      to={`/episode/${ep.id}`}
                      className={cn(
                        "min-w-10 h-10 sm:min-w-12 sm:h-12 px-2 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-black transition-all border shadow-sm shrink-0",
                        ep.id === id 
                          ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30 scale-110 z-10" 
                          : "bg-zinc-800/40 border-white/5 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                      )}
                    >
                      {ep.episodeNumber}
                    </Link>
                  ))}
                  {filteredEpisodes.length === 0 && (
                    <div className="w-full py-10 text-center text-xs font-black text-zinc-600 uppercase tracking-widest">
                       No Episodes Found
                    </div>
                  )}
               </div>
            </div>

            {/* Comments Section integrated directly here */}
            <CommentsSection animeId={anime.id} animeTitle={anime.title} />

            {/* Related Series Section - Portal Bar Container */}
            <div className="mt-12 group/portal">
               <div className="bg-[#0b0b0d] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                  {/* Decorative Bar Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-4 bg-rose-600 rounded-full" />
                        <h2 className="text-base font-black text-white uppercase tracking-tighter flex items-center gap-2">
                           Related Series
                        </h2>
                     </div>
                     <div className="hidden sm:flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[.2em]">Network Active</span>
                     </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4 bg-grid-white/[0.01]">
                     <div className="flex flex-col gap-3">
                        {/* Current Active Series Card */}
                        <RelatedAnimeCard animeId={anime.id!} isMain={true} />
                        
                        {/* Related Links Portal */}
                        {anime.relatedAnimeIds && anime.relatedAnimeIds.length > 0 && (
                          <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                            {anime.relatedAnimeIds.map(rid => (
                              <RelatedAnimeCard key={rid} animeId={rid} />
                            ))}
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Bottom section: Recommendations */}
          <div className="space-y-6 min-w-0 mt-4 w-full overflow-hidden">
             <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-rose-600 rounded-full" />
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Recommend Series</h3>
                </div>
                <button onClick={() => navigate('/anime')} className="text-[10px] font-black text-white/30 uppercase tracking-[.2em] hover:text-rose-500 transition-colors">More</button>
             </div>
             
             <div className="flex overflow-x-auto gap-4 sm:gap-6 px-2 pb-6 snap-x snap-mandatory custom-scrollbar items-stretch">
                {recommendedAnime.map((rec) => (
                  <div key={rec.id} className="w-36 sm:w-44 md:w-48 lg:w-56 shrink-0 snap-start">
                     <AnimeCard anime={rec} />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudioDashboard({ setShowEditWebsite }: { setShowEditWebsite: (val: boolean) => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { config } = useWebsiteConfig();
  const [dashboard, setDashboard] = useState<{ studio: Studio, anime: Anime[] } | null>(null);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  const [showAnimeVisibilityModal, setShowAnimeVisibilityModal] = useState(false);
  const [animeToToggleStatus, setAnimeToToggleStatus] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'settings' | 'issues' | 'requests' | 'studio-edit' | 'api-keys' | 'avatars' | 'admin-messages'>('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // New states for footer edit
  const [footerCopyright, setFooterCopyright] = useState('');
  const [footerProviderText, setFooterProviderText] = useState('');
  const [footerProviderName, setFooterProviderName] = useState('');
  const [isSavingFooter, setIsSavingFooter] = useState(false);
  const [isSyncingSubscribers, setIsSyncingSubscribers] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const [studioError, setStudioError] = useState<string | null>(null);

  useEffect(() => {
    if (studioError) {
      const timer = setTimeout(() => setStudioError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [studioError]);

  const StudioErrorDisplay = () => {
    if (!studioError) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -20, x: '-50%' }}
        className="fixed top-24 left-1/2 z-[9999] px-6 py-4 bg-rose-600/90 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl backdrop-blur-md border border-rose-400/30 flex items-center gap-4 min-w-[320px] max-w-md"
      >
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <CircleX size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-[8px] opacity-60 font-black mb-0.5">Studio System Error</div>
          <div className="leading-tight">{studioError}</div>
        </div>
        <button onClick={() => setStudioError(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all shrink-0">
          <X size={14} />
        </button>
      </motion.div>
    );
  };

  const handleSearchApiKeys = async () => {
    if (!apiKeySearch.trim()) return;
    setIsSearchingApiKeys(true);
    setStudioError(null);
    try {
      const results = await searchApiKeysWithAI(apiKeySearch);
      setFoundApiKeys(results);
    } catch (err: any) {
      setStudioError(`AI Search Failed: ${err.message || 'Unknown'}`);
    } finally {
      setIsSearchingApiKeys(false);
    }
  };

  const handleSaveApiKey = async (provider?: string, key?: string, category?: string) => {
    setIsSavingApiKey(true);
    setStudioError(null);
    try {
      const p = provider || newApiKeyProvider;
      const k = key || newApiKeyValue;
      const c = category || newApiKeyCategory;
      if (!p || !k) throw new Error("Provider and Key are required");

      const existingKey = (config.apiKeys || []).find(keyRec => keyRec.provider.toLowerCase() === p.toLowerCase() && (keyRec.category || 'metadata') === c);
      
      let updatedKeys;
      if (existingKey) {
        updatedKeys = (config.apiKeys || []).map(item => 
          (item.provider.toLowerCase() === p.toLowerCase() && (item.category || 'metadata') === c) ? { ...item, key: k, category: c } : item
        );
      } else {
        const newKey: ApiKeyRecord = {
          id: Math.random().toString(36).substr(2, 9),
          provider: p,
          key: k,
          category: c
        };
        updatedKeys = [...(config.apiKeys || []), newKey];
      }

      await setDoc(doc(db, 'website', 'config'), {
        apiKeys: updatedKeys
      }, { merge: true });

      setNewApiKeyProvider('');
      setNewApiKeyValue('');
    } catch (e: any) {
      setStudioError(`API Save Error: ${e.message || 'Failed'}`);
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const getCombinedApiKeys = () => {
    // Collect from Firebase
    const firebaseKeys = config.apiKeys || [];
    
    // Check for common hardcoded ones in import.meta.env
    const envKeys = [];
    const env = (import.meta as any).env;
    if (env.VITE_TMDB_API_KEY) envKeys.push({ id: 'env-tmdb', provider: 'TMDB', key: env.VITE_TMDB_API_KEY, isEnv: true });
    if (env.VITE_GOOGLE_SEARCH_API_KEY) envKeys.push({ id: 'env-google', provider: 'Google Search', key: env.VITE_GOOGLE_SEARCH_API_KEY, isEnv: true });
    if (env.VITE_UNSPLASH_ACCESS_KEY) envKeys.push({ id: 'env-unsplash', provider: 'Unsplash', key: env.VITE_UNSPLASH_ACCESS_KEY, isEnv: true });
    if (env.VITE_PEXELS_API_KEY) envKeys.push({ id: 'env-pexels', provider: 'Pexels', key: env.VITE_PEXELS_API_KEY, isEnv: true });
    if (env.VITE_PIXABAY_API_KEY) envKeys.push({ id: 'env-pixabay', provider: 'Pixabay', key: env.VITE_PIXABAY_API_KEY, isEnv: true });
    
    // Merge, favoring Firebase overrides if names match closely
    const result = [...firebaseKeys];
    for (const ek of envKeys) {
      if (!result.some(rk => rk.provider.toLowerCase() === ek.provider.toLowerCase() || (ek.provider === 'TMDB' && rk.provider.toLowerCase().includes('tmdb')))) {
        result.push(ek);
      }
    }
    return result;
  };

  const isKeyAdded = (provider: string) => {
    return getCombinedApiKeys().some(k => k.provider.toLowerCase() === provider.toLowerCase() || k.provider.toLowerCase().includes(provider.toLowerCase()));
  };

  const currentApiKeys = getCombinedApiKeys();

  useEffect(() => {
    setMetadataKeys(currentApiKeys);
  }, [config.apiKeys]);

  const handleDeleteApiKey = async (id: string) => {
    setStudioError(null);
    try {
      const updatedKeys = (config.apiKeys || []).filter(k => k.id !== id);
      await setDoc(doc(db, 'website', 'config'), {
        apiKeys: updatedKeys
      }, { merge: true });
    } catch (e: any) {
      setStudioError(`API Delete Error: ${e.message || 'Failed'}`);
    }
  };

  // API Key manager state
  const [apiKeySearch, setApiKeySearch] = useState('');
  const [isSearchingApiKeys, setIsSearchingApiKeys] = useState(false);
  const [foundApiKeys, setFoundApiKeys] = useState<{ provider: string, key: string, description: string }[]>([]);
  const [newApiKeyProvider, setNewApiKeyProvider] = useState('');
  const [newApiKeyValue, setNewApiKeyValue] = useState('');
  const [newApiKeyCategory, setNewApiKeyCategory] = useState<'metadata' | 'images' | 'seasons'>('metadata');

  useEffect(() => {
    setApiKeySearch('');
    setFoundApiKeys([]);
  }, [activeTab]);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [activeKeyCategory, setActiveKeyCategory] = useState<'metadata' | 'images' | 'seasons'>('metadata');

  useEffect(() => {
    setNewApiKeyCategory(activeKeyCategory);
  }, [activeKeyCategory]);

  const API_CATEGORIES = {
    metadata: {
      label: "Anime Metadata Info",
      icon: <Database size={16} />
    },
    images: {
      label: "Image Assets Provider",
      icon: <Image size={16} />
    },
    seasons: {
      label: "Season Fetch Provider",
      icon: <Layers size={16} />
    }
  };

  // New states for real-time analytics
  const [realtimeStats, setRealtimeStats] = useState({
    totalViews: 0,
    totalWatchHours: 0,
    totalUsers: 0,
    activeUsers: 0,
    offlineUsers: 0,
    totalAnime: 0,
    totalEpisodes: 0,
    totalMovies: 0
  });

  // Danger Zone Login State
  const [showDangerZoneLogin, setShowDangerZoneLogin] = useState(false);
  const [isDangerZoneAuthenticated, setIsDangerZoneAuthenticated] = useState(false);
  const [dangerZoneAuthEmail, setDangerZoneAuthEmail] = useState('');
  const [dangerZoneAuthPass, setDangerZoneAuthPass] = useState('');
  const [isWiping, setIsWiping] = useState<string | null>(null);

  const AdminMessagesManager = () => {
    const [msgs, setMsgs] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'image' | 'video' | 'audio' | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
      const q = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snap) => {
        setMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) {
        setFile(selected);
        const url = URL.createObjectURL(selected);
        setPreviewUrl(url);
        if (selected.type.startsWith('image/')) setPreviewType('image');
        else if (selected.type.startsWith('video/')) setPreviewType('video');
        else if (selected.type.startsWith('audio/')) setPreviewType('audio');
      }
    };

    const handleSend = async () => {
      if (!message.trim()) return;
      setIsSending(true);
      try {
        let attachmentUrl = previewUrl || '';
        let attachmentName = file?.name || '';
        let attachmentType = previewType;

        if (file) {
          if (file.type.startsWith('image/')) {
            // High quality compression
            attachmentUrl = await compressImage(file, 1600, 1600, 0.85);
          } else {
             // For others, use DataURL if small, else simulated
             if (file.size < 1024 * 1024) { // 1MB limit for Firestore doc safely
                attachmentUrl = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(file);
                });
             } else {
                alert("File too large (>1MB). Simulated link used for demo.");
                attachmentUrl = "https://example.com/demo-vessel-link";
             }
          }
        }

        const data = {
          title: title || 'System Update',
          message,
          attachmentUrl,
          attachmentName,
          attachmentType,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        if (editingId) {
          await updateDoc(doc(db, 'broadcasts', editingId), data);
          setEditingId(null);
        } else {
          await addDoc(collection(db, 'broadcasts'), data);
        }

        setTitle('');
        setMessage('');
        setFile(null);
        setPreviewUrl(null);
        setPreviewType(null);
      } catch (err) {
        console.error(err);
        alert("Transmission failure.");
      } finally {
        setIsSending(false);
      }
    };

    const handleEdit = (m: any) => {
      setEditingId(m.id);
      setTitle(m.title);
      setMessage(m.message);
      setPreviewUrl(m.attachmentUrl);
      setPreviewType(m.attachmentType);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <div className="space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4">Admin Broadcast</h1>
            <p className="text-zinc-500 font-medium text-sm md:text-lg">Transmit global alerts and messages to all users.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Editor */}
          <div className="bg-[#16161a] border border-white/5 rounded-[3rem] p-8 md:p-10 space-y-8 shadow-4xl sticky top-8">
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Subject Header</label>
                   <input 
                     type="text" 
                     value={title}
                     onChange={e => setTitle(e.target.value)}
                     placeholder="e.g. Server Maintenance, New Release..."
                     className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-purple-500 transition-all font-black uppercase tracking-widest"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Message Body</label>
                   <textarea 
                     value={message}
                     onChange={e => setMessage(e.target.value)}
                     placeholder="Type your transmission here..."
                     rows={6}
                     className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-sm text-white focus:border-purple-500 transition-all font-medium leading-relaxed resize-none"
                   />
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <label className="flex-1 cursor-pointer group">
                      <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,video/*,audio/*" />
                      <div className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-3 text-zinc-500 group-hover:bg-white/10 group-hover:text-white transition-all group-hover:border-purple-500/50">
                         <Upload size={18} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Attach Media Assets</span>
                      </div>
                   </label>
                   {previewUrl && (
                     <button onClick={() => { setPreviewUrl(null); setFile(null); setPreviewType(null); }} className="p-4 bg-rose-600/10 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all">
                        <Trash2 size={18} />
                     </button>
                   )}
                </div>

                {previewUrl && previewType && (
                   <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                     <FilePreview url={previewUrl} type={previewType} name={file?.name} />
                   </motion.div>
                )}
             </div>

             <button 
               onClick={handleSend}
               disabled={isSending || !message.trim()}
               className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {isSending ? <Loader2 size={24} className="animate-spin" /> : editingId ? <><Edit3 size={20} /> Update Broadcast</> : <><Send size={20} /> Initiate Transmission</>}
             </button>
             {editingId && (
               <button onClick={() => { setEditingId(null); setTitle(''); setMessage(''); setPreviewUrl(null); setFile(null); }} className="w-full text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white">Cancel Edit</button>
             )}
          </div>

          {/* History */}
          <div className="space-y-6">
             <div className="flex items-center gap-4 px-4">
                <History size={20} className="text-zinc-500" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Transmission History</h2>
             </div>
             
             <div className="space-y-4">
                {msgs.map(m => (
                  <div key={m.id} className="bg-[#111113] border border-white/5 rounded-3xl p-6 space-y-4 hover:border-purple-500/20 transition-all group">
                     <div className="flex justify-between items-start">
                        <div>
                           <h4 className="text-sm font-black text-white uppercase tracking-widest leading-tight">{m.title}</h4>
                           <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1 block italic">{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleEdit(m)} className="p-2 bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"><Edit3 size={14} /></button>
                           <ConfirmDeleteButton onConfirm={() => deleteDoc(doc(db, 'broadcasts', m.id))} className="h-8 rounded-xl" defaultIcon={<Trash2 size={14} />} />
                        </div>
                     </div>
                     <p className="text-xs text-zinc-400 font-medium leading-relaxed line-clamp-3">{m.message}</p>
                     {m.attachmentUrl && (
                        <div className="flex items-center gap-2 p-2 bg-black/40 rounded-xl border border-white/5 w-fit">
                           {m.attachmentType === 'image' && <Image size={12} className="text-purple-500" />}
                           {m.attachmentType === 'video' && <Video size={12} className="text-purple-500" />}
                           {m.attachmentType === 'audio' && <Radio size={12} className="text-purple-500" />}
                           <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest truncate max-w-40">{m.attachmentName || 'Media File'}</span>
                        </div>
                     )}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSyncSubscribers = async () => {
    setIsSyncingSubscribers(true);
    setSyncProgress(0);
    try {
      // Fetch all bookmarks from all users (one-time migration)
      const bookmarksSnap = await getDocs(collectionGroup(db, 'bookmarks'));
      const total = bookmarksSnap.docs.length;
      
      if (total === 0) {
        setStudioError("No bookmarks found to synchronize.");
        return;
      }

      let count = 0;
      for (const bookmarkDoc of bookmarksSnap.docs) {
        const data = bookmarkDoc.data();
        const animeId = data.animeId;
        const parentPath = bookmarkDoc.ref.parent.path;
        const userId = parentPath.split('/')[1];

        if (animeId && userId) {
          // Create subscriber entry
          await setDoc(doc(db, 'anime', String(animeId), 'subscribers', userId), {
            userId: userId,
            createdAt: Date.now(),
            migrated: true
          }, { merge: true });
        }
        
        count++;
        setSyncProgress(Math.floor((count / total) * 100));
      }

      setStudioError("Synchronization complete! All bookmarked users migrated to notification systems.");
    } catch (err: any) {
      setStudioError(`Sync Failed: ${err.message || 'Unknown'}`);
    } finally {
      setIsSyncingSubscribers(false);
    }
  };

  const handleDeepWipe = async (collectionName: string) => {
    if (!window.confirm(`DANGER: Are you sure you want to WIPE ALL ${collectionName.toUpperCase()}? This cannot be undone.`)) return;
    
    setIsWiping(collectionName);
    try {
      const q = query(collection(db, collectionName));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      let count = 0;
      
      snapshot.docs.forEach((doc) => {
        // Safety guards
        if (collectionName === 'users' && doc.id === user?.id) return;
        if (collectionName === 'website' && doc.id === 'config') return;
        
        batch.delete(doc.ref);
        count++;
      });
      
      await batch.commit();
      alert(`Successfully wiped ${count} records from ${collectionName}.`);
    } catch (err) {
      console.error(err);
      alert('Error wiping data. Check permissions.');
    } finally {
      setIsWiping(null);
    }
  };
  const [isDangerAuthLoading, setIsDangerAuthLoading] = useState(false);

  // Studio Edit state
  const [studioEditName, setStudioEditName] = useState('');
  const [studioEditLogo, setStudioEditLogo] = useState('');
  const [isSavingStudioInfo, setIsSavingStudioInfo] = useState(false);

  useEffect(() => {
    if (dashboard?.studio) {
      setStudioEditName(dashboard.studio.name);
      setStudioEditLogo(dashboard.studio.logoUrl);
    }
  }, [dashboard]);

  useEffect(() => {
    if (config) {
      setFooterCopyright(config.copyrightText || '');
      setFooterProviderText(config.providerText || '');
      setFooterProviderName(config.providerName || '');
    }
  }, [config]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      // Listen to all anime and episodes for aggregate stats
      const unsubAnime = onSnapshot(collection(db, 'anime'), (snap) => {
        const anime = snap.docs.map(d => d.data() as Anime);
        const totalUniqueViews = anime.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
        setRealtimeStats(prev => ({
          ...prev,
          totalAnime: anime.length,
          totalMovies: anime.filter(a => a.format === 'movie').length,
          totalViews: totalUniqueViews
        }));
      });

      const unsubEpisodes = onSnapshot(collection(db, 'episodes'), (snap) => {
        const episodes = snap.docs.map(d => d.data() as Episode);
        setRealtimeStats(prev => ({
          ...prev,
          totalEpisodes: episodes.length
        }));
      });

      const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        const users = snap.docs.map(d => d.data());
        const totalSeconds = users.reduce((acc, curr: any) => acc + (curr.totalWatchTimeSeconds || 0), 0);
        const totalWatchHours = (totalSeconds / 3600).toFixed(1);
        setRealtimeStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: Math.floor(users.length * 0.3) + 1,
          offlineUsers: Math.max(0, users.length - (Math.floor(users.length * 0.3) + 1)),
          totalWatchHours: Number(totalWatchHours)
        }));
      });

      return () => {
        unsubAnime();
        unsubEpisodes();
        unsubUsers();
      };
    }
  }, [activeTab]);

  const handleSaveStudioInfo = async () => {
    if (!dashboard?.studio) return;
    setIsSavingStudioInfo(true);
    try {
      // Update the studio document
      await setDoc(doc(db, 'studios', dashboard.studio.id), {
        name: studioEditName,
        logoUrl: studioEditLogo
      }, { merge: true });

      alert("Studio settings saved successfully machi!");
    } catch (e) {
      console.error(e);
      alert("Error saving studio info.");
    } finally {
      setIsSavingStudioInfo(false);
    }
  };

  const handleSaveFooter = async () => {
    setIsSavingFooter(true);
    try {
      await setDoc(doc(db, 'website', 'config'), {
        copyrightText: footerCopyright,
        providerText: footerProviderText,
        providerName: footerProviderName
      }, { merge: true });
      alert("Footer settings updated successfully machi!");
    } catch (e) {
      console.error(e);
      alert("Error saving footer info.");
    } finally {
      setIsSavingFooter(false);
    }
  };

  const handleDangerZoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDangerAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, dangerZoneAuthEmail, dangerZoneAuthPass);
      setIsDangerZoneAuthenticated(true);
      setShowDangerZoneLogin(false);
      setTimeout(() => {
        setIsDangerZoneAuthenticated(false);
      }, 300000);
    } catch (err) {
      alert("Invalid Admin Credentials.");
    } finally {
      setIsDangerAuthLoading(false);
      setDangerZoneAuthPass('');
    }
  };
  
  // Issues state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [replyText, setReplyText] = useState<{[key: string]: string}>({});
  const [isReplying, setIsReplying] = useState<string | null>(null);

  // Anime Requests state
  const [animeRequests, setAnimeRequests] = useState<AnimeRequest[]>([]);
  const [isProcessingRequest, setIsProcessingRequest] = useState<string | null>(null);
  const [resolutionRequest, setResolutionRequest] = useState<{
    id: string;
    title: string;
    voters: string[];
    type: 'fulfilled' | 'rejected';
  } | null>(null);
  const [resolutionMessage, setResolutionMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'requests') {
      const q = query(collection(db, 'requests'), orderBy('votes', 'desc'), limit(100));
      return onSnapshot(q, (snapshot) => {
        setAnimeRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AnimeRequest)));
      });
    }
  }, [activeTab]);

  const handleResolveRequest = async () => {
    if (!resolutionRequest || !user) return;
    setIsProcessingRequest(resolutionRequest.id);
    
    try {
      // 1. Send notifications to all voters
      const notificationPromises = (resolutionRequest.voters || []).map(async (voterId) => {
        try {
          await addDoc(collection(db, 'users', voterId, 'notifications'), {
            title: `${resolutionRequest.type === 'fulfilled' ? 'Anime Added' : 'Request Update'}: ${resolutionRequest.title}`,
            message: resolutionMessage || (resolutionRequest.type === 'fulfilled' ? 'Your requested anime has been added to our library!' : 'Unfortunately, we cannot fulfill this request at the moment.'),
            type: 'system',
            isRead: false,
            createdAt: Date.now()
          });
        } catch (err) {
          console.error(`Failed to notify voter ${voterId}:`, err);
        }
      });
      
      await Promise.all(notificationPromises);
      
      // 2. Delete the request (User explicitly asked to delete)
      await deleteDoc(doc(db, 'requests', resolutionRequest.id));
      
      // Cleanup
      setResolutionRequest(null);
      setResolutionMessage('');
    } catch (e: any) {
      console.error(e);
      setStudioError(`Resolution Failed: ${e.message || 'Unknown error'}`);
    } finally {
      setIsProcessingRequest(null);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: 'fulfilled' | 'rejected' | 'pending') => {
    setIsProcessingRequest(requestId);
    try {
      await updateDoc(doc(db, 'requests', requestId), { status });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingRequest(null);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'requests', requestId));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    return onSnapshot(q, async (snapshot) => {
      const cats = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      const hasNewlyAdded = cats.some(c => c.id === 'system_newly_added');
      const hasContinueWatching = cats.some(c => c.id === 'system_continue_watching');
      
      if (!hasNewlyAdded || !hasContinueWatching) {
        if (!hasNewlyAdded) {
          await setDoc(doc(db, 'categories', 'system_newly_added'), {
            name: 'Newly Added',
            order: -2,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isSystem: true,
            isLocked: true // default locked
          });
        }
        if (!hasContinueWatching) {
          await setDoc(doc(db, 'categories', 'system_continue_watching'), {
            name: 'Continue Watching',
            order: -1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isSystem: true,
            isLocked: true // default locked
          });
        }
      }
      
      setCategories(cats);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'issues') {
      const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        setIssues(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Issue)));
      });
    }
  }, [activeTab]);

  const handleReplyIssue = async (issueId: string) => {
    const text = replyText[issueId];
    if (!text?.trim()) return;
    setIsReplying(issueId);
    try {
      await setDoc(doc(db, 'issues', issueId), {
        adminReply: text,
        status: 'replied',
        updatedAt: Date.now(),
        replySeen: false
      }, { merge: true });
      setReplyText(prev => ({...prev, [issueId]: ''}));
      alert("Reply sent machi!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsReplying(null);
    }
  };
  
  // Modals state
  const [showAnimeModal, setShowAnimeModal] = useState(false);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [editingSeasonNumber, setEditingSeasonNumber] = useState<{old: number, new: number} | null>(null);
  const holdTimerRef = useRef<any>(null);

  // Selection & Bulk actions
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Metadata Search
  const [metadataSource, setMetadataSource] = useState<'anilist' | 'tmdb' | 'kitsu' | 'jikan' | 'jellyfin'>('anilist');
  const [anilistSearch, setAnilistSearch] = useState('');
  const [anilistResults, setAnilistResults] = useState<any[]>([]);
  const [isSearchingAniList, setIsSearchingAniList] = useState(false);
  const [isRefreshingEpisodes, setIsRefreshingEpisodes] = useState(false);
  const [isSummarizingSynopsis, setIsSummarizingSynopsis] = useState(false);

  // Related Series Management States
  const [relatedSearch, setRelatedSearch] = useState('');
  const [relatedSearchResults, setRelatedSearchResults] = useState<Anime[]>([]);
  const [isSearchingRelated, setIsSearchingRelated] = useState(false);

  // Season Fetching & Episode Management
  const [episodeModalStep, setEpisodeModalStep] = useState<'season-management' | 'episode-form'>('episode-form');
  const [isFetchSeasonModalOpen, setIsFetchSeasonModalOpen] = useState(false);
  const [seasonFetchSource, setSeasonFetchSource] = useState<'anilist' | 'tmdb' | 'kitsu' | 'jikan' | 'jellyfin'>('anilist');
  const [seasonFetchSearch, setSeasonFetchSearch] = useState('');
  const [seasonFetchResults, setSeasonFetchResults] = useState<any[]>([]);
  const [isSearchingSeasonFetch, setIsSearchingSeasonFetch] = useState(false);
  const [fetchingSeasonTargetSeason, setFetchingSeasonTargetSeason] = useState(1);
  const [selectedSeasonFetchResult, setSelectedSeasonFetchResult] = useState<any | null>(null);

  // Asset Search (Images)
  const [assetSearch, setAssetSearch] = useState('');
  const [assetResults, setAssetResults] = useState<any[]>([]);
  const [isSearchingAssets, setIsSearchingAssets] = useState(false);
  const [assetSearchMode, setAssetSearchMode] = useState<'portrait' | 'mobile_landscape' | 'pc_landscape'>('portrait');
  const [assetProvider, setAssetProvider] = useState<'google' | 'anilist' | 'unsplash' | 'danbooru' | 'pexels' | 'pixabay' | 'jikan' | 'tmdb' | ''>('danbooru');

  const handleCloseAnimeModal = () => {
    setShowAnimeModal(false);
    setAnilistSearch('');
    setAnilistResults([]);
    setAssetSearch('');
    setAssetResults([]);
    setRelatedSearch('');
    setRelatedSearchResults([]);
    setEditingAnime(null);
  };

  const handleOpenAnimeModal = (anime: Anime | null) => {
    setAnilistSearch('');
    setAnilistResults([]);
    setAssetSearch('');
    setAssetResults([]);
    setRelatedSearch('');
    setRelatedSearchResults([]);
    
    if (anime) {
      setEditingAnime(anime);
    } else {
      setEditingAnime({ 
        id: `anime-${Date.now()}`, 
        title: '', 
        japaneseTitle: '',
        synopsis: '', 
        thumbnail: '', 
        bannerImage: '', 
        rating: 0, 
        releaseDate: new Date().toISOString(), 
        studioId: dashboard?.studio?.id || '', 
        status: 'public',
        relatedAnimeIds: []
      } as unknown as Anime);
    }
    setShowAnimeModal(true);
  };

  const handleCloseFetchSeasonModal = () => {
    setIsFetchSeasonModalOpen(false);
    setSeasonFetchSearch('');
    setSeasonFetchResults([]);
    setSelectedSeasonFetchResult(null);
  };

  const handleOpenFetchSeasonModal = () => {
    setSeasonFetchSearch('');
    setSeasonFetchResults([]);
    setSelectedSeasonFetchResult(null);
    setIsFetchSeasonModalOpen(true);
  };

  const handleAssetSearch = async (sourceOverride?: string) => {
    if (!assetSearch.trim()) return;
    const sourceToUse = (typeof sourceOverride === 'string' ? sourceOverride : assetProvider);
    if (!sourceToUse) {
      setStudioError("Please select an image provider first");
      return;
    }
    
    setIsSearchingAssets(true);
    setAssetResults([]);
    setStudioError(null);
    try {
      let results: any[] = [];
      const queryStrPortrait = assetSearch + " portrait poster";
      const queryStrMobileLandscape = assetSearch + " 16:9 aspect ratio youtube thumbnail desktop wallpaper";
      const queryStrPcLandscape = assetSearch + " 1700x467 aspect ratio banner ultrawide wallpaper";
      
      let queryStr = queryStrPortrait;
      if (assetSearchMode === 'mobile_landscape') queryStr = queryStrMobileLandscape;
      if (assetSearchMode === 'pc_landscape') queryStr = queryStrPcLandscape;
      
      switch (sourceToUse) {
        case 'google':
          results = await searchGoogleImages(queryStr);
          break;
        case 'anilist':
          const alResults = await searchAniList(assetSearch); // AniList GraphQL limits search terms, keep it as assetSearch
          results = alResults.map((r: any) => ({
            id: `anilist-${r.id}`,
            thumbnail: assetSearchMode === 'portrait' ? r.coverImage?.extraLarge || r.coverImage?.large : r.bannerImage || r.coverImage?.extraLarge,
            large: assetSearchMode === 'portrait' ? r.coverImage?.extraLarge || r.coverImage?.large : r.bannerImage || r.coverImage?.extraLarge,
            source: 'anilist',
            title: typeof r.title === 'object' ? (r.title?.english || r.title?.romaji || 'Untitled') : r.title
          }));
          break;
        case 'jikan':
          const jResults = await searchJikan(assetSearch); // Jikan uses exact titles best
          results = jResults.map((r: any) => ({
            id: r.id,
            thumbnail: assetSearchMode === 'portrait' ? r.coverImage?.large : r.bannerImage || r.coverImage?.large,
            large: assetSearchMode === 'portrait' ? r.coverImage?.large : r.bannerImage || r.coverImage?.large,
            source: 'jikan',
            title: typeof r.title === 'object' ? (r.title?.english || r.title?.romaji || 'Untitled') : r.title
          }));
          break;
        case 'tmdb':
          const tResults = await searchTMDB(assetSearch); // TMDB relies on titles best
          results = tResults.map((r: any) => ({
            id: r.id,
            thumbnail: assetSearchMode === 'portrait' ? r.coverImage?.large : r.bannerImage || r.coverImage?.large,
            large: assetSearchMode === 'portrait' ? r.coverImage?.large : r.bannerImage || r.coverImage?.large,
            source: 'tmdb',
            title: r.title
          }));
          break;
        case 'unsplash':
          results = await searchUnsplash(queryStr);
          break;
        case 'danbooru':
          results = await searchDanbooru(assetSearch + (assetSearchMode === 'portrait' ? " portrait" : assetSearchMode === 'mobile_landscape' ? " 16:9" : " widescreen 1700x467"));
          break;
        case 'pexels':
          results = await searchPexels(queryStr);
          break;
        case 'pixabay':
          results = await searchPixabay(queryStr);
          break;
      }
      setAssetResults(results || []);
    } catch (e: any) {
      setStudioError(`Asset Search Failed: ${e.message || 'Error'}`);
    } finally {
      setIsSearchingAssets(false);
    }
  };

  const [deletingAnimeId, setDeletingAnimeId] = useState<string | null>(null);
  const deleteTimeoutRef = useRef<any>(null);

  const loadDashboard = () => {
    if (!user) return () => {};
    
    const studioQ = query(collection(db, 'studios'), where('ownerId', '==', user.id));
    const unsubscribeStudio = onSnapshot(studioQ, (studioSnap) => {
      if (!studioSnap.empty) {
        const studioIds = studioSnap.docs.map(d => d.id);
        const mainStudio = { id: studioSnap.docs[0].id, ...studioSnap.docs[0].data() } as Studio;
        
        // Fetch anime from ALL studios owned by this user
        const aniQ = query(collection(db, 'anime'), where('studioId', 'in', studioIds));
        const unsubscribeAnime = onSnapshot(aniQ, (aniSnap) => {
          setDashboard({
            studio: mainStudio,
            anime: aniSnap.docs.map(d => ({ id: d.id, ...d.data() } as Anime)).sort((a,b) => (b as any).updatedAt - (a as any).updatedAt)
          });
        });
        return () => unsubscribeAnime();
      } else if (user.email === 'dnbdotsrival@gmail.com') {
        const studioId = `studio-${user.id}`;
        const newStudio: Studio = {
          id: studioId,
          name: 'TamilAnime Admin Studio',
          ownerId: user.id,
          logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${studioId}`,
          createdAt: new Date().toISOString()
        };
        setDoc(doc(db, 'studios', studioId), newStudio);
      }
    });

    return () => unsubscribeStudio();
  };

  const [isConfirmingWipe, setIsConfirmingWipe] = useState(false);

  const wipeAllData = async () => {
    if (!isConfirmingWipe) {
      setIsConfirmingWipe(true);
      setTimeout(() => setIsConfirmingWipe(false), 3000);
      return;
    }
    try {
      const animeSnap = await getDocs(collection(db, 'anime'));
      const epSnap = await getDocs(collection(db, 'episodes'));
      
      for (const d of animeSnap.docs) await deleteDoc(doc(db, 'anime', d.id));
      for (const d of epSnap.docs) await deleteDoc(doc(db, 'episodes', d.id));
      
      alert("Database wiped successfully.");
      setIsConfirmingWipe(false);
    } catch (err) {
      console.error(err);
      alert("Failed to wipe data.");
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.email !== 'dnbdotsrival@gmail.com') {
      navigate('/', { replace: true });
      return;
    }
    const unsub = loadDashboard();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [user]);

  const fetchEpisodesForAnimeRealtime = (animeId: string, callback: (eps: Episode[]) => void) => {
    const q = query(collection(db, 'episodes'), where('animeId', '==', animeId), orderBy('season', 'asc'), orderBy('episodeNumber', 'asc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Episode)));
    }, (e: any) => {
      if (e.message?.includes('index') || e.code === 'failed-precondition') {
        const fallbackQ = query(collection(db, 'episodes'), where('animeId', '==', animeId));
        getDocs(fallbackQ).then(snap => {
          const res = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as Episode))
            .sort((a, b) => {
              const seasonA = a.season || 1;
              const seasonB = b.season || 1;
              if (seasonA !== seasonB) return seasonA - seasonB;
              return a.episodeNumber - b.episodeNumber;
            });
          callback(res);
        });
      }
    });
  };

  useEffect(() => {
    if (selectedAnimeId) {
      const unsub = fetchEpisodesForAnimeRealtime(selectedAnimeId, setEpisodes);
      return () => unsub();
    }
  }, [selectedAnimeId]);

  const handleFetchSeasonSearch = async (sourceOverride?: string) => {
    if (!seasonFetchSearch.trim()) return;
    setIsSearchingSeasonFetch(true);
    setSeasonFetchResults([]);
    setStudioError(null);
    const sourceToUse = (typeof sourceOverride === 'string' ? sourceOverride : seasonFetchSource);
    try {
      if (sourceToUse === 'anilist') {
        const results = await searchAniList(seasonFetchSearch);
        setSeasonFetchResults(results || []);
      } else if (sourceToUse === 'tmdb') {
        const results = await searchTMDB(seasonFetchSearch);
        setSeasonFetchResults(results || []);
      } else if (sourceToUse === 'kitsu') {
        const results = await searchKitsu(seasonFetchSearch);
        setSeasonFetchResults(results || []);
      } else if (sourceToUse === 'jikan') {
        const results = await searchJikan(seasonFetchSearch);
        setSeasonFetchResults(results || []);
      } else if (sourceToUse === 'jellyfin') {
        // Jellyfin search simulation
        setSeasonFetchResults([{ 
          id: 'jellyfin-mock', 
          title: 'Manual Jellyfin Metadata (Enter ID Below)', 
          coverImage: { large: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fab35?q=80&w=300' },
          source: 'jellyfin',
          rawId: seasonFetchSearch
        }]);
      }
    } catch (e: any) {
      setStudioError(`Season Search Failed: ${e.message || 'Error'}`);
      setSeasonFetchResults([]);
    } finally {
      setIsSearchingSeasonFetch(false);
    }
  };

  const executeFetchSeason = async () => {
    if (!selectedSeasonFetchResult || !selectedAnime) return;
    
    setIsSearchingSeasonFetch(true);
    setStudioError(null);
    try {
      let eps: any[] = [];
      if (selectedSeasonFetchResult.source === 'tmdb') {
        const details = await getTMDBDetails(selectedSeasonFetchResult.rawId);
        for (let s = 1; s <= (details.seasonsCount || 1); s++) {
          const sEps = await getTMDBEpisodes(selectedSeasonFetchResult.rawId, s);
          eps = [...eps, ...sEps];
        }
      } else if (selectedSeasonFetchResult.source === 'anilist') {
        eps = await getAniListEpisodes(selectedSeasonFetchResult.id);
      } else if (selectedSeasonFetchResult.source === 'kitsu') {
        eps = await getKitsuEpisodes(selectedSeasonFetchResult.rawId);
      } else if (selectedSeasonFetchResult.source === 'jikan') {
        eps = await getJikanEpisodes(selectedSeasonFetchResult.rawId);
      }

      for (const ep of eps) {
        const eNum = ep.episodeNumber;
        const sNum = fetchingSeasonTargetSeason;
        
        const epId = `ep-${selectedAnime.id}-s${sNum}-e${eNum}`;
        const existing = episodes.find(e => e.episodeNumber === eNum && (e.season || 1) === sNum);
        if (!existing) {
          await setDoc(doc(db, 'episodes', epId), {
            id: epId,
            animeId: selectedAnime.id,
            season: sNum,
            episodeNumber: eNum,
            title: ep.title || `Episode ${eNum}`,
            description: ep.description || '',
            thumbnail: ep.thumbnail || selectedAnime.thumbnail,
            status: 'private',
            views: 0,
            videoUrl: '',
            createdAt: Date.now()
          });
        }
      }

      if (fetchingSeasonTargetSeason > (selectedAnime.seasonsCount || 1)) {
        await setDoc(doc(db, 'anime', selectedAnime.id), { seasonsCount: fetchingSeasonTargetSeason }, { merge: true });
        setDashboard(prev => prev ? { ...prev, anime: prev.anime.map(a => a.id === selectedAnime.id ? { ...a, seasonsCount: fetchingSeasonTargetSeason } : a) } : prev);
      }

      setIsFetchSeasonModalOpen(false);
      setSelectedSeasonFetchResult(null);
      setSeasonFetchSearch('');
      setSeasonFetchResults([]);
    } catch (e: any) {
      setStudioError(`Season Fetch Failed: ${e.message || 'Error'}`);
    } finally {
      setIsSearchingSeasonFetch(false);
    }
  };

  const handleMetadataSearch = async (sourceOverride?: string) => {
    if (!anilistSearch.trim()) return;
    setIsSearchingAniList(true);
    setStudioError(null);
    const sourceToUse = (typeof sourceOverride === 'string' ? sourceOverride : metadataSource);
    try {
      if (sourceToUse === 'anilist') {
        const results = await searchAniList(anilistSearch);
        setAnilistResults(results || []);
      } else if (sourceToUse === 'tmdb') {
        const results = await searchTMDB(anilistSearch);
        setAnilistResults(results || []);
      } else if (sourceToUse === 'kitsu') {
        const results = await searchKitsu(anilistSearch);
        setAnilistResults(results || []);
      } else if (sourceToUse === 'jikan') {
        const results = await searchJikan(anilistSearch);
        setAnilistResults(results || []);
      } else if (sourceToUse === 'jellyfin') {
        setAnilistResults([{
           id: 'jellyfin-manual',
           title: { english: 'Manual Jellyfin Entry', romaji: 'Jellyfin Host Search' },
           coverImage: { large: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fab35?q=80&w=300' },
           source: 'jellyfin',
           rawId: anilistSearch,
           format: 'MANUAL'
        }]);
      }
    } catch (e: any) {
      setStudioError(`Metadata Search Failed: ${e.message || 'Error'}`);
      setAnilistResults([]);
    } finally {
      setIsSearchingAniList(false);
    }
  };

  const handleSearchRelated = async () => {
    if (!relatedSearch.trim()) return;
    setIsSearchingRelated(true);
    setStudioError(null);
    try {
      const q = query(collection(db, 'anime'));
      const snap = await getDocs(q);
      const searchLower = relatedSearch.toLowerCase();
      const results = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Anime))
        .filter(a => {
          if (a.id === editingAnime?.id) return false;
          let titleStr = '';
          if (typeof a.title === 'object') {
            titleStr = (a.title as any)?.english || (a.title as any)?.romaji || '';
          } else {
            titleStr = a.title || '';
          }
          return titleStr.toLowerCase().includes(searchLower);
        })
        .slice(0, 10);
      setRelatedSearchResults(results);
    } catch (err: any) {
      setStudioError(`Related Search Failed: ${err.message || 'Error'}`);
    } finally {
      setIsSearchingRelated(false);
    }
  };

  const handleSelectMetadata = async (media: any) => {
    let seasonsCount = 0;
    let episodesCount = media.episodes || 0;

    if (media.source === 'tmdb') {
      try {
        const details = await getTMDBDetails(media.rawId);
        seasonsCount = details.seasonsCount;
        episodesCount = details.episodesCount;
      } catch (e) {
        console.error("Failed to fetch TMDB details:", e);
      }
    } else if (media.source === 'kitsu' || media.source === 'jikan') {
      seasonsCount = 1;
      episodesCount = media.episodesCount || 0;
    }

    const title = typeof media.title === 'object' ? (media.title?.english || media.title?.romaji || 'Untitled') : (media.title || 'Untitled');

    setEditingAnime({
      id: editingAnime?.id || `anime-${Date.now()}`,
      title: title,
      synopsis: media.description?.replace(/<[^>]*>?/gm, '') || '',
      thumbnail: media.coverImage?.large,
      bannerImage: media.bannerImage || media.coverImage?.large,
      rating: (media.averageScore / 10) || 0,
      releaseDate: media.startDate?.year ? `${media.startDate.year}-01-01` : new Date().toISOString(),
      studioId: dashboard?.studio.id || '',
      anilistId: (media.source === 'tmdb' || media.source === 'kitsu' || media.source === 'jikan') ? null : (media.id || null),
      tmdbId: media.source === 'tmdb' ? (media.rawId || null) : null,
      kitsuId: media.source === 'kitsu' ? (media.rawId || null) : null,
      jikanId: media.source === 'jikan' ? (media.rawId || null) : null,
      seasonsCount: seasonsCount || 1,
      episodesCount: episodesCount,
      quality: 'HD',
      format: (media.format?.toLowerCase() === 'movie' || media.type?.toLowerCase() === 'movie') ? 'movie' : 'tv'
    });
    setAnilistResults([]);
  };

  const handleSummarizeSynopsis = async () => {
    if (!editingAnime?.synopsis) return;
    setIsSummarizingSynopsis(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize the following anime synopsis into 3 to 4 short lines. Make it punchy and engaging. Do not use markdown like bolding or bullet points. Just return the summarized text.\n\nSynopsis:\n${editingAnime.synopsis}`,
      });
      if (response.text) {
         setEditingAnime({ ...editingAnime, synopsis: response.text.trim() });
      }
    } catch (e: any) {
      console.error(e);
      alert('Failed to summarize synopsis: ' + e.message);
    } finally {
      setIsSummarizingSynopsis(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    setStudioError(null);
    try {
      if (editingCategory.id) {
        await updateDoc(doc(db, 'categories', editingCategory.id), {
          name: editingCategory.name,
          order: editingCategory.order || categories.length,
          updatedAt: Date.now()
        });
      } else {
        const newRef = doc(collection(db, 'categories'));
        await setDoc(newRef, {
          id: newRef.id,
          name: editingCategory.name,
          order: categories.length,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      setEditingCategory(null);
    } catch (error: any) {
      setStudioError(`Category Save Failed: ${error.message || 'Error'}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if(!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error(error);
      alert('Error deleting category');
    }
  };

  const saveAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnime) return;
    setStudioError(null);
    
    try {
      const isNew = !dashboard?.anime.find(a => a.id === editingAnime.id);
      
      // Sanitize data for Firestore (remove undefined)
      const sanitizedAnime = { ...editingAnime };
      Object.keys(sanitizedAnime).forEach(key => {
        // @ts-ignore
        if (sanitizedAnime[key] === undefined) sanitizedAnime[key] = null;
      });

      await setDoc(doc(db, 'anime', editingAnime.id), {
        ...sanitizedAnime,
        updatedAt: Date.now()
      });

      // Update local dashboard state immediately
      if (dashboard) {
        if (isNew) {
          setDashboard({
            ...dashboard,
            anime: [sanitizedAnime as any, ...dashboard.anime]
          });
        } else {
          const updatedAnime = dashboard.anime.map(a => 
            a.id === editingAnime.id ? { ...a, ...sanitizedAnime } : a
          );
          setDashboard({ ...dashboard, anime: updatedAnime });
        }
      }
      
      // Auto-fill episodes if it's a new series from a metadata source
      if (isNew && (editingAnime.anilistId || editingAnime.tmdbId || editingAnime.kitsuId || editingAnime.jikanId)) {
        try {
          let fetchedEpisodes: any[] = [];
          if (editingAnime.tmdbId) {
            const details = await getTMDBDetails(editingAnime.tmdbId as number);
            for (let s = 1; s <= (details.seasonsCount || 1); s++) {
              const eps = await getTMDBEpisodes(editingAnime.tmdbId as number, s);
              fetchedEpisodes = [...fetchedEpisodes, ...eps];
            }
          } else if (editingAnime.anilistId) {
            fetchedEpisodes = await getAniListEpisodes(editingAnime.anilistId as number);
          } else if (editingAnime.kitsuId) {
            fetchedEpisodes = await getKitsuEpisodes(editingAnime.kitsuId as string);
          } else if (editingAnime.jikanId) {
            fetchedEpisodes = await getJikanEpisodes(editingAnime.jikanId as number);
          }

          for (const ep of fetchedEpisodes) {
            const sNum = ep.seasonNumber || ep.season || 1;
            const eNum = ep.episodeNumber;
            const epId = `ep-${editingAnime.id}-s${sNum}-e${eNum}`;
            
            await setDoc(doc(db, 'episodes', epId), {
              id: epId,
              animeId: editingAnime.id,
              season: sNum,
              episodeNumber: eNum,
              title: ep.title || `Episode ${eNum}`,
              description: ep.description || '',
              thumbnail: ep.thumbnail || editingAnime.thumbnail,
              status: 'private',
              views: 0,
              videoUrl: '',
              createdAt: Date.now()
            });
          }
        } catch (err: any) {
          setStudioError(`Auto-fill Episodes Failed: ${err.message || 'Error'}`);
        }
      }

      handleCloseAnimeModal();
      loadDashboard();
    } catch (err: any) {
      setStudioError(`Anime Save Error: ${err.message || 'Error'}`);
    }
  };

  const handleDeleteAnimeClick = (id: string) => {
    if (deletingAnimeId === id) {
      deleteAnime(id);
      setDeletingAnimeId(null);
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    } else {
      setDeletingAnimeId(id);
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = setTimeout(() => {
        setDeletingAnimeId(null);
      }, 3000);
    }
  };

  const deleteAnime = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'anime', id));
        
        // Delete episodes
        const q = query(collection(db, 'episodes'), where('animeId', '==', id));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await deleteDoc(doc(db, 'episodes', d.id));
        }
        
        loadDashboard();
        if (selectedAnimeId === id) setSelectedAnimeId(null);
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete anime. Please try again.");
      }
  };

  const fetchEpisodesForAnime = async (animeId: string): Promise<Episode[]> => {
    try {
      const q = query(collection(db, 'episodes'), where('animeId', '==', animeId), orderBy('episodeNumber', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Episode));
    } catch (e: any) {
      if (e.message?.includes('requires an index') || e.code === 'failed-precondition') {
        const qSimple = query(collection(db, 'episodes'), where('animeId', '==', animeId));
        const snap = await getDocs(qSimple);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Episode)).sort((a,b) => {
          const sA = a.season || 1;
          const sB = b.season || 1;
          if (sA !== sB) return sA - sB;
          return a.episodeNumber - b.episodeNumber;
        });
      }
      throw e;
    }
  };

  const saveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEpisode || !selectedAnimeId) return;
    try {
      const oldEpDoc = await getDoc(doc(db, 'episodes', editingEpisode.id));
      const isBecomingPublic = editingEpisode.status === 'public' && (!oldEpDoc.exists() || oldEpDoc.data()?.status !== 'public');

      await setDoc(doc(db, 'episodes', editingEpisode.id), {
        ...editingEpisode,
        animeId: selectedAnimeId
      });
      
      if (isBecomingPublic) {
        triggerNewEpisodeNotification(selectedAnimeId, editingEpisode as Episode);
      }

      setShowEpisodeModal(false);
      setEditingEpisode(null);
      // Reload episodes
      const results = await fetchEpisodesForAnime(selectedAnimeId);
      setEpisodes(results);
    } catch (err) {
      console.error(err);
      alert("Failed to save episode.");
    }
  };

  const saveSeasonNumber = async () => {
    if (!editingSeasonNumber || !selectedAnimeId) return;
    const { old: oldS, new: newS } = editingSeasonNumber;
    if (oldS === newS) {
      setEditingSeasonNumber(null);
      return;
    }
    
    try {
      const batchEps = episodes.filter(e => (e.season || 1) === oldS);
      for (const ep of batchEps) {
        await setDoc(doc(db, 'episodes', ep.id), { season: newS }, { merge: true });
      }
      if (selectedAnime && newS > (selectedAnime.seasonsCount || 1)) {
        await setDoc(doc(db, 'anime', selectedAnime.id), { seasonsCount: newS }, { merge: true });
        setDashboard(prev => prev ? { ...prev, anime: prev.anime.map(a => a.id === selectedAnime.id ? { ...a, seasonsCount: newS } : a) } : prev);
      }
      setSelectedSeason(newS);
      setEditingSeasonNumber(null);
      
      const results = await fetchEpisodesForAnime(selectedAnimeId);
      setEpisodes(results);
    } catch (e) {
      console.error("Failed to update season numbering", e);
      alert("Failed to update season numbering");
    }
  };

  const deleteEpisode = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'episodes', id));
      setEpisodes(prev => prev.filter(ep => ep.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete episode");
    }
  };

  const toggleSelectAll = () => {
    if (selectedEpisodes.length === episodes.length) {
      setSelectedEpisodes([]);
    } else {
      setSelectedEpisodes(episodes.map(e => e.id));
    }
  };

  const toggleEpisodeSelection = (id: string) => {
    setSelectedEpisodes(prev => {
      const newIds = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      if (newIds.length === 0) setIsSelectionMode(false);
      return newIds;
    });
  };

  const bulkUpdateVisibility = async (status: 'public' | 'private') => {
    if (selectedEpisodes.length === 0 || !selectedAnimeId) return;
    for (const id of selectedEpisodes) {
      const ep = episodes.find(e => e.id === id);
      if (ep) {
        const isBecomingPublic = status === 'public' && ep.status !== 'public';
        await setDoc(doc(db, 'episodes', id), { ...ep, status });
        
        if (isBecomingPublic) {
          triggerNewEpisodeNotification(selectedAnimeId, ep);
        }
      }
    }
    // Refresh
    const results = await fetchEpisodesForAnime(selectedAnimeId);
    setEpisodes(results);
    setSelectedEpisodes([]);
    setIsSelectionMode(false);
  };

  const bulkDeleteEpisodes = async () => {
    if (selectedEpisodes.length === 0) return;
    try {
      for (const id of selectedEpisodes) {
        await deleteDoc(doc(db, 'episodes', id));
      }
      setEpisodes(prev => prev.filter(ep => !selectedEpisodes.includes(ep.id)));
      setSelectedEpisodes([]);
      setIsSelectionMode(false);
    } catch (e) {
      console.error(e);
      alert("Failed to delete episodes");
    }
  };

  const syncNewEpisodes = async () => {
    if (!selectedAnime) return;
    setIsSearchingAniList(true);
    try {
      let fetchedEpisodes: any[] = [];
      if (selectedAnime.tmdbId) {
        const details = await getTMDBDetails(selectedAnime.tmdbId as number);
        for (let s = 1; s <= (details.seasonsCount || 1); s++) {
          const eps = await getTMDBEpisodes(selectedAnime.tmdbId as number, s);
          fetchedEpisodes = [...fetchedEpisodes, ...eps];
        }
      } else if (selectedAnime.anilistId) {
        fetchedEpisodes = await getAniListEpisodes(selectedAnime.anilistId as number);
      } else if (selectedAnime.kitsuId) {
        fetchedEpisodes = await getKitsuEpisodes(selectedAnime.kitsuId as string);
      } else if (selectedAnime.jikanId) {
        fetchedEpisodes = await getJikanEpisodes(selectedAnime.jikanId as number);
      }

      for (const ep of fetchedEpisodes) {
        const sNum = ep.seasonNumber || ep.season || 1;
        const eNum = ep.episodeNumber;
        const epId = `ep-${selectedAnime.id}-s${sNum}-e${eNum}`;
        const existing = episodes.find(e => e.episodeNumber === eNum && (e.season || 1) === sNum);
        if (!existing) {
          await setDoc(doc(db, 'episodes', epId), {
            id: epId,
            animeId: selectedAnime.id,
            season: sNum,
            episodeNumber: eNum,
            title: ep.title || `Episode ${eNum}`,
            description: ep.description || '',
            thumbnail: ep.thumbnail || selectedAnime.thumbnail,
            status: 'private',
            views: 0,
            videoUrl: '',
            createdAt: Date.now()
          });
        } else {
          await setDoc(doc(db, 'episodes', existing.id), {
            title: ep.title || existing.title,
            description: ep.description || existing.description,
            thumbnail: ep.thumbnail || existing.thumbnail
          }, { merge: true });
        }
      }
      // Refresh list
      const results = await fetchEpisodesForAnime(selectedAnime.id);
      setEpisodes(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingAniList(false);
    }
  };

  if (!dashboard) return <div className="p-12 text-center text-zinc-500 font-black uppercase text-[10px] tracking-widest">Loading Digital Nexus...</div>;

  const selectedAnime = dashboard.anime.find(a => a.id === selectedAnimeId);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col lg:flex-row">
      <StudioErrorDisplay />
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-6 bg-[#0a0a0b]/80 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 bg-white/5 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-600/10"
            title="Exit Studio"
          >
            <LogOut size={20} />
          </button>

          <div 
            onClick={() => { setSelectedAnimeId(null); setActiveTab('dashboard'); setShowMobileMenu(false); }}
            className="flex items-center gap-3 cursor-pointer"
          >
            {dashboard.studio.logoUrl && dashboard.studio.logoUrl.trim() !== '' ? (
              <img src={dashboard.studio.logoUrl} alt={dashboard.studio.name} className="w-10 h-10 rounded-xl object-cover shadow-2xl shadow-rose-600/20" />
            ) : (
              <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center font-black text-lg italic shadow-2xl shadow-rose-600/20 text-white">
                {dashboard.studio.name[0]}
              </div>
            )}
            <h2 className="font-black text-white truncate text-xs sm:text-sm uppercase tracking-tighter">{dashboard.studio.name}</h2>
          </div>
        </div>

        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 bg-white/5 rounded-xl text-white">
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* YT Studio Style Sidebar */}
      <aside className={cn(
        "w-full lg:w-72 border-r border-white/5 p-8 flex flex-col gap-10 bg-[#0a0a0b]/80 backdrop-blur-3xl lg:sticky lg:top-0 h-auto lg:h-screen fixed inset-0 z-30 transition-transform lg:translate-x-0",
        showMobileMenu ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div 
          onClick={() => { setSelectedAnimeId(null); setActiveTab('dashboard'); setShowMobileMenu(false); }}
          className="hidden lg:flex items-center gap-4 cursor-pointer hover:bg-white/5 p-4 -m-4 rounded-[2rem] transition-all group"
        >
          {dashboard.studio.logoUrl && dashboard.studio.logoUrl.trim() !== '' ? (
            <img src={dashboard.studio.logoUrl} alt={dashboard.studio.name} className="w-12 h-12 rounded-2xl object-cover shadow-2xl shadow-rose-600/20 group-hover:scale-110 transition-transform" />
          ) : (
            <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center font-black text-xl italic shadow-2xl shadow-rose-600/20 text-white group-hover:scale-110 transition-transform">
              {dashboard.studio.name[0]}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-black text-white truncate leading-none mb-1 group-hover:text-rose-500 transition-colors uppercase">{dashboard.studio.name}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Studio Portal</span>
            </div>
          </div>
        </div>
        
        <nav className="flex flex-col bg-black/40 border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden mt-20 lg:mt-0">
          <button 
            onClick={() => { setSelectedAnimeId(null); setActiveTab('dashboard'); setShowMobileMenu(false); }}
            className={cn(
              "flex items-center gap-4 px-6 py-5 font-black uppercase text-[10px] tracking-widest transition-all",
              !selectedAnimeId && activeTab === 'dashboard' ? "bg-rose-600/10 text-rose-500 shadow-inner" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => { setSelectedAnimeId(null); setActiveTab('analytics'); setShowMobileMenu(false); }}
            className={cn(
              "flex items-center gap-4 px-6 py-5 font-black uppercase text-[10px] tracking-widest transition-all",
              !selectedAnimeId && activeTab === 'analytics' ? "bg-rose-600/10 text-rose-500 shadow-inner" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <BarChart size={18} /> Analytics
          </button>
          <button 
            onClick={() => { setSelectedAnimeId(null); setActiveTab('settings'); setShowMobileMenu(false); }}
            className={cn(
              "flex items-center gap-4 px-6 py-5 font-black uppercase text-[10px] tracking-widest transition-all",
              !selectedAnimeId && activeTab === 'settings' ? "bg-rose-600/10 text-rose-500 shadow-inner" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Settings size={18} /> Settings
          </button>
          <button 
            onClick={() => { setSelectedAnimeId(null); setActiveTab('studio-edit'); setShowMobileMenu(false); }}
            className={cn(
              "flex items-center gap-4 px-6 py-5 font-black uppercase text-[10px] tracking-widest transition-all",
              !selectedAnimeId && activeTab === 'studio-edit' ? "bg-indigo-600/10 text-indigo-500 shadow-inner" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Plus size={18} /> Studio Edit
          </button>
          <button 
            onClick={() => { setSelectedAnimeId(null); setActiveTab('api-keys'); setShowMobileMenu(false); }}
            className={cn(
              "flex items-center gap-4 px-6 py-5 font-black uppercase text-[10px] tracking-widest transition-all",
              !selectedAnimeId && activeTab === 'api-keys' ? "bg-amber-600/10 text-amber-500 shadow-inner" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Key size={18} className={activeTab === 'api-keys' ? "text-amber-500" : "text-amber-500"} /> API Keys Manager
          </button>
          <button 
            onClick={() => { setSelectedAnimeId(null); setActiveTab('avatars'); setShowMobileMenu(false); }}
            className={cn(
              "flex items-center gap-4 px-6 py-5 font-black uppercase text-[10px] tracking-widest transition-all",
              !selectedAnimeId && activeTab === 'avatars' ? "bg-cyan-600/10 text-cyan-500 shadow-inner" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <UserIcon size={18} className={activeTab === 'avatars' ? "text-cyan-500" : "text-cyan-500"} /> Avatar Manager
          </button>
          <button 
            onClick={() => { setSelectedAnimeId(null); setActiveTab('issues'); setShowMobileMenu(false); }}
            className={cn(
              "flex items-center gap-4 px-6 py-5 font-black uppercase text-[10px] tracking-widest transition-all",
              !selectedAnimeId && activeTab === 'issues' ? "bg-amber-600/10 text-amber-500 shadow-inner" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Bug size={18} /> User Issues
          </button>
          <button 
            onClick={() => { setSelectedAnimeId(null); setActiveTab('requests'); setShowMobileMenu(false); }}
            className={cn(
              "flex items-center gap-4 px-6 py-5 font-black uppercase text-[10px] tracking-widest transition-all",
              !selectedAnimeId && activeTab === 'requests' ? "bg-rose-600/10 text-rose-500 shadow-inner" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <TrendingUp size={18} /> Anime Requests
          </button>
          <button 
            onClick={() => { setSelectedAnimeId(null); setActiveTab('admin-messages'); setShowMobileMenu(false); }}
            className={cn(
              "flex items-center gap-4 px-6 py-5 font-black uppercase text-[10px] tracking-widest transition-all",
              !selectedAnimeId && activeTab === 'admin-messages' ? "bg-purple-600/10 text-purple-500 shadow-inner" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Send size={18} /> Admin Msg Send
          </button>
          <button 
            onClick={() => { setShowEditWebsite(true); setShowMobileMenu(false); }}
            className="flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-zinc-500 hover:text-white hover:bg-emerald-500/10 hover:text-emerald-500 transition-all border-t border-white/5 mt-4 pt-8 group"
          >
            <Settings size={18} className="text-emerald-500 group-hover:rotate-90 transition-transform" /> Site Configuration
          </button>
        </nav>

        {selectedAnime && (
          <div className="mt-8 p-6 rounded-3xl bg-zinc-900/50 border border-white/10 space-y-6 hidden lg:block">
            <img src={selectedAnime.thumbnail} className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl" />
            <div className="space-y-1">
              <h4 className="text-white font-black uppercase text-xs tracking-tighter line-clamp-1">{selectedAnime.title}</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Selected Series</p>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-white/5 bg-gradient-to-t from-rose-600/5 to-transparent p-4 rounded-b-[2rem]">
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-rose-600/10 hover:bg-rose-600 group transition-all border border-rose-500/20 hover:border-rose-400 shadow-lg hover:shadow-rose-600/20 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-rose-500 group-hover:text-white transition-colors" />
              <span className="font-black uppercase text-[10px] tracking-[.15em] text-white transition-colors">Terminate Studio</span>
            </div>
            <ArrowRight size={14} className="text-rose-500/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl">
        {selectedAnimeId ? (
          <div className="space-y-8 md:space-y-12">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setSelectedAnimeId(null); setSelectedEpisodes([]); setIsSelectionMode(false); }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 hover:bg-white hover:text-black text-zinc-400 transition-all flex items-center justify-center"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2 line-clamp-1">{selectedAnime?.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Manage Episodes ({episodes.length})</p>
                      {selectedAnime?.anilistId && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[7px] font-black text-blue-500 uppercase tracking-widest">
                          AL: {selectedAnime.anilistId}
                        </div>
                      )}
                      <button 
                        onClick={() => handleOpenAnimeModal(selectedAnime as Anime)}
                        className="flex items-center gap-1 px-2 py-0.5 bg-white/5 hover:bg-white hover:text-black rounded text-[7px] font-black uppercase transition-all"
                      >
                        <Edit3 size={8} /> Edit Series
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={async () => {
                        if (selectedAnimeId) {
                          setIsRefreshingEpisodes(true);
                          try {
                            const newEps = await fetchEpisodesForAnime(selectedAnimeId);
                            setEpisodes(newEps);
                          } finally {
                            setIsRefreshingEpisodes(false);
                          }
                        }
                      }}
                      disabled={isRefreshingEpisodes}
                      className="flex-1 sm:flex-none bg-white/5 text-white p-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/5"
                    >
                      <RefreshCw size={14} className={isRefreshingEpisodes ? "animate-spin" : ""} /> 
                      <span className="sm:hidden lg:inline">Refresh Episodes</span>
                    </button>
                    <button 
                      onClick={handleOpenFetchSeasonModal}
                      className="flex-1 sm:flex-none bg-zinc-800 text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 shadow-xl"
                    >
                      <Search size={16} /> <span className="sm:hidden lg:inline">Fetch Season</span>
                    </button>
                    <button 
                      onClick={() => { setEpisodeModalStep('menu'); setEditingEpisode({ id: `ep-${Date.now()}`, animeId: selectedAnimeId || '', title: '', description: '', thumbnail: '', videoUrl: '', videoUrl2: '', episodeNumber: episodes.length + 1, createdAt: Date.now(), views: 0, status: 'public', season: selectedSeason, releaseDate: new Date().toISOString() } as any); setShowEpisodeModal(true); }}
                      className="flex-1 sm:flex-none bg-rose-600 text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-600/20"
                    >
                      <Plus size={16} /> <span className="sm:hidden lg:inline">Anime Episode Upload</span>
                    </button>
                </div>
              </div>

              {/* Selection Header (Mocking YT Studio) */}
                    <AnimatePresence>
                {(isSelectionMode || selectedEpisodes.length > 0) && (
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex flex-col sm:flex-row items-center justify-between p-4 bg-zinc-900 border border-rose-500/30 text-white rounded-2xl shadow-2xl gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <button onClick={() => { setSelectedEpisodes([]); setIsSelectionMode(false); }} className="hover:bg-white/5 p-2 rounded-lg transition-colors text-zinc-500 hover:text-white"><X size={20} /></button>
                      <div className="font-black uppercase text-xs tracking-widest text-rose-500">{selectedEpisodes.length} Selected</div>
                      <button onClick={toggleSelectAll} className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">Select All</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => bulkUpdateVisibility('public')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 hover:bg-green-500 hover:text-white transition-all text-green-500"><Eye size={14} /> Make Public</button>
                      <button onClick={() => bulkUpdateVisibility('private')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-zinc-500/10 px-4 py-2 rounded-xl border border-zinc-500/20 hover:bg-zinc-500 hover:text-white transition-all text-zinc-400"><EyeOff size={14} /> Make Private</button>
                      <ConfirmDeleteButton 
                        onConfirm={bulkDeleteEpisodes} 
                        className="p-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20"
                        defaultIcon={<Trash2 size={18} />}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Season Selection Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
              {Array.from({ length: selectedAnime?.seasonsCount || 1 }, (_, i) => i + 1).map(s => (
                <button
                  key={`season-btn-${s}`}
                  onClick={() => setSelectedSeason(s)}
                  onPointerDown={() => {
                    holdTimerRef.current = setTimeout(() => {
                      setEditingSeasonNumber({ old: s, new: s });
                    }, 600);
                  }}
                  onPointerUp={() => { if (holdTimerRef.current) clearTimeout(holdTimerRef.current); }}
                  onPointerLeave={() => { if (holdTimerRef.current) clearTimeout(holdTimerRef.current); }}
                  className={cn(
                    "px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap border select-none touch-manipulation relative group overflow-hidden flex flex-col items-center",
                    selectedSeason === s 
                      ? "bg-rose-600 text-white border-rose-600 shadow-xl shadow-rose-600/20" 
                      : "bg-white/5 text-zinc-500 border-white/5 hover:text-white hover:bg-white/10"
                  )}
                >
                  <span>{selectedAnime?.format === 'movie' ? 'Part' : 'Season'} {s}</span>
                  {selectedAnime?.seasonNames?.[s] && (
                    <span className="text-[8px] opacity-70 mt-0.5">{selectedAnime.seasonNames[s]}</span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 origin-left scale-x-0 group-active:scale-x-100 transition-transform duration-[600ms] ease-linear" />
                </button>
              ))}
            </div>

            {/* Episodes List (Single Feed) */}
            <div className="bg-[#16161a] border border-white/5 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 md:px-8 md:py-6 w-12 text-center">
                         <button onClick={toggleSelectAll} className="w-5 h-5 rounded border-2 border-white/10 flex mx-auto items-center justify-center hover:border-rose-500/50 transition-colors">
                            {episodes.length > 0 && episodes.every(e => selectedEpisodes.includes(e.id)) && <Check size={12} className="text-rose-500" />}
                         </button>
                      </th>
                      <th className="px-4 py-4 md:px-6 md:py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Episode</th>
                      <th className="px-4 py-4 md:px-6 md:py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Details</th>
                      <th className="px-4 py-4 md:px-6 md:py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Visibility</th>
                      <th className="px-4 py-4 md:px-6 md:py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Views</th>
                      <th className="px-6 py-4 md:px-8 md:py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {episodes.filter(e => (e.season || 1) === selectedSeason).length > 0 ? (
                      episodes
                        .filter(e => (e.season || 1) === selectedSeason)
                        .sort((a,b) => a.episodeNumber - b.episodeNumber)
                        .map((ep, idx) => (
                        <tr 
                          key={`ep-table-row-${ep.id || idx}`} 
                          className={cn(
                            "hover:bg-white/[0.01] transition-colors group cursor-pointer",
                            selectedEpisodes.includes(ep.id) ? "bg-white/5" : ""
                          )}
                          onContextMenu={(e) => { e.preventDefault(); setIsSelectionMode(true); toggleEpisodeSelection(ep.id); }}
                          onClick={() => {
                            if (isSelectionMode) {
                              toggleEpisodeSelection(ep.id);
                            } else {
                              setEpisodeModalStep('episode-form');
                              setEditingEpisode(ep);
                              setShowEpisodeModal(true);
                            }
                          }}
                        >
                          <td className="px-6 py-4 md:px-8 md:py-6 text-center">
                             <button 
                              onClick={(e) => { e.stopPropagation(); setIsSelectionMode(true); toggleEpisodeSelection(ep.id); }} 
                              className={cn(
                                "w-5 h-5 rounded border-2 transition-all flex mx-auto items-center justify-center",
                                selectedEpisodes.includes(ep.id) ? "bg-rose-600 border-rose-600" : "border-white/10 hover:border-rose-500/50"
                              )}
                             >
                               {selectedEpisodes.includes(ep.id) && <Check size={12} className="text-white" />}
                             </button>
                          </td>
                          <td className="px-4 py-4 md:px-6 md:py-6">
                            <div 
                              onClick={async (e) => {
                                e.stopPropagation();
                                const newStatus = ep.status === 'public' ? 'private' : 'public';
                                // Optimistic update
                                setEpisodes(prev => prev.map(p => p.id === ep.id ? { ...p, status: newStatus } : p));
                                await setDoc(doc(db, 'episodes', ep.id), { status: newStatus }, { merge: true });
                              }}
                              className="relative w-24 md:w-32 aspect-video rounded-lg md:rounded-xl overflow-hidden shadow-xl cursor-pointer"
                            >
                              <img src={ep.thumbnail || selectedAnime?.thumbnail} className="w-full h-full object-cover" />
                              {ep.status === 'private' && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                  <EyeOff size={16} className="text-rose-500" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 md:px-6 md:py-6">
                            <div className="font-black text-white uppercase text-xs tracking-tighter mb-1 truncate max-w-[250px]">
                              {ep.season && ep.season > 1 ? `S${ep.season} E${ep.episodeNumber}` : `EP ${ep.episodeNumber}`}: {ep.title}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-medium line-clamp-1 max-w-[200px]">{ep.description || 'No description provided.'}</div>
                            {ep.videoUrl ? (
                              <div className="flex items-center gap-1.5 mt-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Video Stream Ready</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 mt-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">No Source Linked</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 md:px-6 md:py-6">
                             <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                const newStatus = ep.status === 'public' ? 'private' : 'public';
                                await setDoc(doc(db, 'episodes', ep.id), { status: newStatus }, { merge: true });
                              }}
                              className={cn(
                               "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all active:scale-95",
                               ep.status === 'public' ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500 hover:text-white"
                             )}>
                               {ep.status === 'public' ? <Eye size={10} /> : <EyeOff size={10} />}
                               {ep.status}
                             </button>
                          </td>
                          <td className="px-4 py-4 md:px-6 md:py-6">
                            <div className="text-zinc-600 font-bold text-[10px] tabular-nums">{ep.views?.toLocaleString() || 0}</div>
                          </td>
                          <td className="px-6 py-4 md:px-8 md:py-6 text-right">
                            <div className="flex justify-end gap-3 translate-x-0 opacity-100 transition-all">
                               <button 
                                onClick={(e) => { e.stopPropagation(); setEpisodeModalStep('episode-form'); setEditingEpisode(ep); setShowEpisodeModal(true); }} 
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white text-zinc-400 hover:text-black transition-all border border-white/5 shadow-sm active:scale-90"
                                title="Edit Episode"
                               >
                                 <Edit3 size={15} />
                               </button>
                               <ConfirmDeleteButton 
                                onConfirm={() => deleteEpisode(ep.id)} 
                                className="h-10 rounded-xl"
                                defaultIcon={<Trash2 size={15} />}
                               />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-24 text-center">
                          <div className="space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-zinc-600">
                              <Video size={32} />
                            </div>
                            <div>
                              <div className="text-zinc-400 font-black uppercase text-xs tracking-widest">No Episodes found</div>
                              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Fetch from metadata or upload manually.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-8 md:space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div>
                  <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4">Analytics</h1>
                  <p className="text-zinc-500 font-medium text-sm md:text-lg">Detailed performance breakdown of your studio releases.</p>
               </div>
               <div className="w-full md:w-auto px-6 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Tracking Enabled</span>
               </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                { label: 'Total Views', value: realtimeStats.totalViews.toLocaleString(), trend: '+Live', icon: Play },
                { label: 'Total Watch Hours', value: realtimeStats.totalWatchHours.toLocaleString(), trend: 'Live', icon: Clock },
                { label: 'Total Users', value: realtimeStats.totalUsers.toLocaleString(), trend: `Active: ${realtimeStats.activeUsers} | Offline: ${realtimeStats.offlineUsers}`, icon: UserIcon },
                { label: 'Active Content', value: `Series: ${realtimeStats.totalAnime}`, trend: `Eps: ${realtimeStats.totalEpisodes} | Movies: ${realtimeStats.totalMovies}`, icon: Video },
              ].map((stat, i) => (
                <div key={i} className="p-6 md:p-8 bg-[#16161a] border border-white/5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-500">
                      <stat.icon size={20} />
                    </div>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{stat.trend}</span>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-black text-white tracking-widest">{stat.value}</div>
                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="p-6 md:p-10 bg-[#16161a] border border-white/5 rounded-3xl md:rounded-[3rem] space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter">Top Performing Series</h3>
                     <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest">View All</button>
                  </div>
                  <div className="space-y-4">
                     {dashboard.anime
                       .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                       .slice(0, 5)
                       .map((ani, idx) => (
                        <div key={ani.id} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group">
                           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover:text-rose-500 transition-colors">#{idx + 1}</div>
                           <img src={ani.thumbnail} className="w-12 h-12 rounded-lg object-cover" />
                           <div className="flex-1 min-w-0">
                              <div className="text-xs font-black text-white uppercase truncate">{typeof ani.title === 'object' ? (ani.title?.english || ani.title?.romaji || 'Untitled') : ani.title}</div>
                              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{((ani.rating || 0) * 10).toFixed(0)} #tag Top</div>
                           </div>
                           <div className="text-sm font-black text-white">{(ani.rating || 0).toFixed(1)}</div>
                        </div>
                     ))}
                     {dashboard.anime.length === 0 && <div className="py-12 text-center text-zinc-700 text-xs font-bold uppercase italic opacity-50">No data available yet</div>}
                  </div>
               </div>

               <div className="p-6 md:p-10 bg-[#16161a] border border-white/5 rounded-3xl md:rounded-[3rem] h-full min-h-[300px] flex flex-col justify-center text-center space-y-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 flex items-end">
                     {Array.from({ length: 20 }).map((_, i) => (
                       <div key={i} className="flex-1 bg-rose-500 mx-0.5" style={{ height: `${Math.random() * 60 + 20}%` }} />
                     ))}
                  </div>
                  <div className="relative">
                     <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-rose-600/10 flex items-center justify-center text-rose-500 mx-auto animate-pulse">
                       <BarChart size={32} />
                     </div>
                     <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter mt-6">Audience Growth</h3>
                     <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 max-w-[200px] mx-auto">Your audience grew by 15% this week. Keep uploading!</p>
                  </div>
               </div>
            </div>
          </div>
        ) : activeTab === 'studio-edit' ? (
          <div className="space-y-8 md:space-y-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4">Studio Edit</h1>
              <p className="text-zinc-500 font-medium text-sm md:text-lg">Update your studio's identity and visual presence.</p>
            </div>

            <div className="max-w-xl p-6 md:p-10 bg-[#16161a] border border-white/5 rounded-3xl md:rounded-[3rem] space-y-8">
              <div className="flex flex-col items-center gap-6 mb-4">
                <div className="relative">
                  <img src={studioEditLogo} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover ring-4 ring-indigo-600/20 shadow-2xl" />
                </div>
                <div className="text-center">
                  <div className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest mb-1">Current Studio Logo</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Studio Logo URL</label>
                  <input 
                    type="text" 
                    value={studioEditLogo} 
                    onChange={e => setStudioEditLogo(e.target.value)}
                    placeholder="Enter image URL..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-500 transition-all font-bold" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Studio Display Name</label>
                  <input 
                    type="text" 
                    value={studioEditName} 
                    onChange={e => setStudioEditName(e.target.value)}
                    placeholder="Enter studio name..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-500 transition-all font-bold" 
                  />
                </div>
                <div className="pt-4">
                  <button 
                    onClick={handleSaveStudioInfo}
                    disabled={isSavingStudioInfo}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                  >
                    {isSavingStudioInfo ? 'Synchronizing...' : 'Save Studio Config'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'api-keys' ? (
          <div className="space-y-8 md:space-y-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4">API Key Manager</h1>
              <p className="text-zinc-500 font-medium text-sm md:text-lg">Manage your metadata provider API keys with Gemini AI assistance.</p>
            </div>

            <div className="flex overflow-x-auto gap-3 mb-4 pb-4 custom-scrollbar snap-x">
              {(Object.keys(API_CATEGORIES) as Array<keyof typeof API_CATEGORIES>).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveKeyCategory(key)}
                  className={cn(
                    "flex flex-row items-center p-3 md:p-4 rounded-3xl transition-all border gap-3 shrink-0 min-w-max snap-start",
                    activeKeyCategory === key 
                      ? "bg-amber-600/10 border-amber-500/50 text-amber-500 shadow-xl shadow-amber-600/10" 
                      : "bg-[#16161a] border-white/5 text-zinc-500 hover:text-white hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-all",
                    activeKeyCategory === key ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-zinc-400"
                  )}>
                    {API_CATEGORIES[key].icon}
                  </div>
                  <span className="font-black uppercase tracking-widest text-[9px] md:text-[10px]">
                    {API_CATEGORIES[key].label}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div id="manual-api-entry" className="p-6 md:p-10 bg-[#16161a] border border-white/5 rounded-[2rem] md:rounded-[3rem] space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Key size={24} /></div>
                    <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">Register Key</h3>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                    <Zap size={16} />
                    <span className="hidden sm:inline-block text-[8px] font-black uppercase tracking-widest">AI Assisted</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-2">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={apiKeySearch} 
                        onChange={e => setApiKeySearch(e.target.value)} 
                        onKeyPress={e => e.key === 'Enter' && handleSearchApiKeys()}
                        placeholder="Ask Gemini to find a key... (e.g. 'How to get TMDB key')"
                        className="w-full bg-indigo-600/5 border border-indigo-500/20 rounded-xl p-4 pr-12 text-sm text-indigo-100 placeholder:text-indigo-500/50 focus:border-indigo-500 transition-all font-bold" 
                      />
                      {apiKeySearch && (
                        <button 
                          onClick={() => { setApiKeySearch(''); setFoundApiKeys([]); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-indigo-500 hover:text-indigo-300 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={handleSearchApiKeys}
                      disabled={isSearchingApiKeys}
                      className="aspect-square sm:aspect-auto sm:px-6 h-[54px] bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                    >
                      {isSearchingApiKeys ? <Loader2 size={18} className="animate-spin" /> : <><Search size={18} className="sm:mr-2" /><span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-widest">Search</span></>}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {foundApiKeys.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl max-h-[300px] overflow-y-auto custom-scrollbar">
                        {foundApiKeys.map((item, idx) => (
                          <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-2 relative">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <h5 className="font-black text-indigo-400 text-[10px] uppercase tracking-widest">{item.provider}</h5>
                                 <span className="flex items-center gap-1 text-[7px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                   <Check size={8} /> ONLINE
                                 </span>
                               </div>
                               {isKeyAdded(item.provider) && (
                                 <span className="flex items-center gap-1 text-[7px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded uppercase tracking-tighter">
                                   <Check size={9} /> Added
                                 </span>
                               )}
                            </div>
                            <p className="text-[9px] text-zinc-500 font-medium leading-tight">{item.description}</p>
                            <div className="flex gap-2 items-center mt-1">
                              <code className="text-[8px] font-mono text-indigo-400/50 truncate flex-1 block">{item.key || 'No direct key provided'}</code>
                              <button 
                                onClick={() => handleSaveApiKey(item.provider, item.key, activeKeyCategory)}
                                className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[8px] font-black uppercase rounded hover:bg-indigo-500 hover:text-white transition-all shrink-0"
                              >
                                {isKeyAdded(item.provider) ? "Update" : "Add"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Provider Name</label>
                    <input 
                      type="text" 
                      value={newApiKeyProvider} 
                      onChange={e => setNewApiKeyProvider(e.target.value)} 
                      placeholder="e.g. TMDB, AniList, Kitsu"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-amber-500 transition-all font-bold" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">API Key / Token</label>
                    <input 
                      type="text" 
                      value={newApiKeyValue} 
                      onChange={e => setNewApiKeyValue(e.target.value)} 
                      placeholder="Paste your API key here"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-amber-500 transition-all font-bold" 
                    />
                  </div>
                  <button 
                    onClick={() => handleSaveApiKey()}
                    disabled={isSavingApiKey}
                    className="w-full py-4 bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-amber-600/20 active:scale-95 disabled:opacity-50"
                  >
                    {isSavingApiKey ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save API Key"}
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-10 bg-[#16161a] border border-white/5 rounded-[2rem] md:rounded-[3rem] space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Database size={24} /></div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">Currently Registered</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{API_CATEGORIES[activeKeyCategory].label} Providers</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-1 gap-2">
                    {/* Only show configured keys for the active category */}
                    {currentApiKeys.filter(k => (k.category || 'metadata') === activeKeyCategory).map((keyData) => (
                      <div key={keyData.id} className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            {API_CATEGORIES[activeKeyCategory].icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-[10px] font-black text-white uppercase tracking-widest">{keyData.provider}</div>
                              {keyData.isEnv && <span className="text-[7px] font-black bg-blue-500/20 text-blue-500 px-1 rounded uppercase tracking-widest">ENV</span>}
                              <span className="flex items-center gap-1 text-[7px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest">
                                <Check size={8} /> ONLINE
                              </span>
                            </div>
                            <div className="text-[9px] font-mono text-zinc-500 truncate max-w-[150px] mt-0.5 group-hover:text-emerald-500/50 transition-colors">
                              {keyData.key.length > 15 ? `${keyData.key.substring(0, 10)}••••` : keyData.key}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!keyData.isEnv && (
                            <>
                              <button 
                                onClick={() => { 
                                  setNewApiKeyProvider(keyData.provider); 
                                  setNewApiKeyValue(keyData.key); 
                                  setNewApiKeyCategory(activeKeyCategory); 
                                  document.querySelector('#manual-api-entry')?.scrollIntoView({ behavior: 'smooth' }); 
                                }} 
                                className="p-2.5 text-zinc-400 hover:text-indigo-400 bg-white/5 rounded-xl transition-all hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20"
                                title="Edit this key"
                              >
                                <Edit3 size={16} />
                              </button>
                              <ConfirmDeleteButton 
                                onConfirm={() => handleDeleteApiKey(keyData.id)} 
                                className="h-10 w-10 rounded-xl"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {currentApiKeys.filter(k => (k.category || 'metadata') === activeKeyCategory).length === 0 && (
                      <div className="py-12 border border-dashed border-white/5 rounded-[2rem] text-center">
                         <Database size={32} className="mx-auto text-zinc-800 mb-2 opacity-20" />
                         <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">No keys found in this container</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-4 border-t border-white/5 space-y-4">
                     <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Database size={10} /> Container Insights
                     </h4>
                     <p className="text-[9px] text-zinc-600 italic leading-relaxed">
                        Registered keys in this container automatically enable dynamic fetching across the Studio and Watch portals. Delete keys here to disable respective features.
                     </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'avatars' ? (
          <AvatarsManager />
        ) : activeTab === 'settings' ? (
          <div className="space-y-8 md:space-y-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4">Settings</h1>
              <p className="text-zinc-500 font-medium text-sm md:text-lg">Configure your studio profile and security preferences.</p>
            </div>

            <div className="max-w-4xl grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-8">
              <div className="space-y-4 md:space-y-8">
                <div className="p-6 md:p-10 bg-zinc-950 border border-rose-500/20 rounded-3xl md:rounded-[3rem] space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-1">Database Control Center</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Global wiping and reset protocols</p>
                    </div>
                    {isDangerZoneAuthenticated ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Session Active</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowDangerZoneLogin(true)}
                        className="px-6 py-3 bg-rose-600/10 border border-rose-500/20 text-rose-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
                      >
                        <LockIcon size={12} /> Unlock Admin Tools
                      </button>
                    )}
                  </div>

                  {isDangerZoneAuthenticated ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Users */}
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between gap-4">
                        <div className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors">
                           <Users size={18} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Accounts</span>
                        </div>
                        <DeepWipeButton onWipe={() => handleDeepWipe('users')} label="Wipe Users" />
                      </div>
                      {/* Anime */}
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between gap-4">
                        <div className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors">
                           <Library size={18} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Series Index</span>
                        </div>
                        <DeepWipeButton onWipe={() => handleDeepWipe('anime')} label="Wipe Content" />
                      </div>
                      {/* Metadata / Episodes */}
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between gap-4">
                        <div className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors">
                           <Globe size={18} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Provider Cache</span>
                        </div>
                        <DeepWipeButton onWipe={() => handleDeepWipe('episodes')} label="Wipe Episodes" />
                      </div>
                      {/* Interactions */}
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between gap-4">
                        <div className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors">
                           <MessageSquare size={18} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Interactions</span>
                        </div>
                        <DeepWipeButton onWipe={() => handleDeepWipe('comments')} label="Wipe Comments" />
                      </div>

                      {/* RELATIONAL SYNC (NEW) */}
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between gap-4 sm:col-span-2 mt-4 bg-orange-500/5 border-orange-500/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                           <div className="flex items-center gap-3 text-orange-500">
                              <RefreshCcw size={18} className={isSyncingSubscribers ? "animate-spin" : ""} />
                              <div>
                                 <span className="text-[10px] font-black uppercase tracking-widest block">Notification Engine Sync</span>
                                 <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1">Migrate old bookmarks to the new subscriber system</p>
                              </div>
                           </div>
                           <button 
                             onClick={handleSyncSubscribers}
                             disabled={isSyncingSubscribers}
                             className="px-6 py-3 bg-orange-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest pr-4 hover:bg-orange-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                           >
                              {isSyncingSubscribers ? (
                                <><Loader2 size={12} className="animate-spin" /> {syncProgress}%</>
                              ) : (
                                <><Radio size={14} /> Synchronize All Subscribers</>
                              )}
                           </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                       <LockIcon size={24} className="mx-auto text-zinc-800 mb-2" />
                       <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Identify Yourself to Access Deep Tools</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'issues' ? (
          <div className="space-y-8 md:space-y-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4">User Issues</h1>
              <p className="text-zinc-500 font-medium text-sm md:text-lg">Track and resolve reported bugs from {config.name} users.</p>
            </div>

            <div className="grid gap-6">
              {issues.length > 0 ? issues.map(issue => (
                <div key={issue.id} className="bg-[#16161a] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                   <div className={cn(
                     "absolute top-0 left-0 w-1.5 h-full transition-colors",
                     issue.status === 'open' ? "bg-amber-500" : "bg-green-500"
                   )} />
                   <ConfirmDeleteButton 
                     onConfirm={async () => {
                       try {
                         await deleteDoc(doc(db, 'issues', issue.id));
                       } catch (e) {
                         console.error("Failed to delete issue", e);
                       }
                     }}
                     className="absolute top-8 right-8 h-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 border-white/10"
                     defaultIcon={<Trash2 size={16} />}
                   />
                   
                   <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 pr-12">
                      <div className="lg:w-72 space-y-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500">
                               <UserIcon size={24} />
                            </div>
                            <div>
                               <div className="text-sm font-black text-white uppercase tracking-tighter truncate max-w-[180px]">{issue.userName}</div>
                               <div className="text-[10px] font-bold text-zinc-500 truncate max-w-[180px]">{issue.userEmail}</div>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Signal Received</span>
                            <div className="text-[10px] font-bold text-zinc-400">{new Date(issue.createdAt).toLocaleString()}</div>
                         </div>
                         <div className={cn(
                           "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                           issue.status === 'open' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
                         )}>
                           <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", issue.status === 'open' ? "bg-amber-500" : "bg-green-500")} />
                           {issue.status}
                         </div>
                      </div>

                      <div className="flex-1 space-y-8">
                         <div className="space-y-4">
                            <div className="p-6 md:p-10 bg-black/40 rounded-[2rem] border border-white/5 relative">
                               <MessageCircle size={20} className="absolute -top-3 -left-3 text-rose-500" />
                               <p className="text-base md:text-lg text-zinc-300 font-medium leading-relaxed">
                                 {issue.message}
                               </p>
                            </div>

                            {issue.adminReply && (
                              <div className="p-6 md:p-10 bg-green-500/5 rounded-[2rem] border border-green-500/10 relative ml-6 md:ml-12">
                                 <Check size={20} className="absolute -top-3 -left-3 text-green-500" />
                                 <span className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-4 block">Studio Response Node</span>
                                 <p className="text-sm md:text-base text-green-500/80 font-bold leading-relaxed italic">
                                   "{issue.adminReply}"
                                 </p>
                              </div>
                            )}
                         </div>

                         <div className="pt-8 border-t border-white/5">
                            <div className="flex flex-col sm:flex-row gap-4">
                               <input 
                                 type="text" 
                                 placeholder="Initialize reply transmission..."
                                 value={replyText[issue.id] || ''}
                                 onChange={e => setReplyText({...replyText, [issue.id]: e.target.value})}
                                 className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                               />
                               <button 
                                 onClick={() => handleReplyIssue(issue.id)}
                                 disabled={isReplying === issue.id || !replyText[issue.id]?.trim()}
                                 className="px-10 py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-amber-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                               >
                                 {isReplying === issue.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Zap size={16} /> Signal Reply</>}
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )) : (
                <div className="py-32 text-center bg-[#16161a] border border-white/5 rounded-[3rem] shadow-2xl">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-700">
                      <Bug size={40} />
                   </div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">System Calm</h2>
                   <p className="text-zinc-500 font-medium tracking-widest uppercase text-[10px]">No distress signals detected in the current sector.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'requests' ? (
          <div className="space-y-8 md:space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4">Anime Requests</h1>
                <p className="text-zinc-500 font-medium text-sm md:text-lg">Prioritized by user votes. Fulfil the high demand requests first.</p>
              </div>
              <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 px-6 py-4 rounded-2xl">
                 <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Total Active Requests</div>
                 <div className="text-2xl font-black text-white">{animeRequests.length}</div>
              </div>
            </div>

            <div className="grid gap-4">
              {animeRequests.length > 0 ? animeRequests.map((req, idx) => (
                <div key={req.id} className="bg-[#16161a] border border-white/5 rounded-[2rem] p-6 md:p-8 hover:border-rose-500/30 transition-all flex flex-col md:flex-row gap-6 relative group">
                   <div className="flex items-center gap-6 md:w-48 shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-rose-600 flex flex-col items-center justify-center text-white shadow-xl shadow-rose-600/20 border border-rose-400">
                         <span className="text-[10px] font-black leading-none opacity-60">VOTES</span>
                         <span className="text-xl font-black">{req.votes}</span>
                      </div>
                      <div className="min-w-0">
                         <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status</div>
                         <div className={cn(
                           "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                           req.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                           req.status === 'fulfilled' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                           "bg-rose-500/10 text-rose-500 border-rose-500/20"
                         )}>
                           {req.status}
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {idx === 0 && <Sparkles size={16} className="text-amber-500 animate-pulse" />}
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate">{req.title}</h3>
                      </div>
                      <p className="text-sm text-zinc-400 font-medium line-clamp-2 italic mb-4">
                        {req.description || "No extract provided."}
                      </p>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2">
                           <img src={req.userAvatar || ANIME_AVATARS[0]} className="w-5 h-5 rounded-full object-cover" />
                           <span className="text-[10px] font-bold text-zinc-500 uppercase">{req.userName}</span>
                         </div>
                         <span className="text-zinc-800">•</span>
                         <span className="text-[10px] font-bold text-zinc-500 uppercase italic opacity-60">{new Date(req.createdAt).toLocaleString()}</span>
                      </div>
                   </div>

                   <div className="flex flex-row md:flex-col gap-2 justify-center shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
                      <button 
                        onClick={() => setResolutionRequest({ id: req.id, title: req.title, voters: req.voters, type: 'fulfilled' })}
                        disabled={isProcessingRequest === req.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-600/10 hover:bg-green-600 border border-green-500/20 hover:border-green-400 text-green-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                         <CheckCircle size={14} /> FULFIL
                      </button>
                      <button 
                        onClick={() => setResolutionRequest({ id: req.id, title: req.title, voters: req.voters, type: 'rejected' })}
                        disabled={isProcessingRequest === req.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-400 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                         <X size={14} /> REJECT
                      </button>
                      <ConfirmDeleteButton 
                        onConfirm={() => handleDeleteRequest(req.id)}
                        className="h-10 rounded-xl bg-white/5 border-white/5 md:w-full"
                        defaultIcon={<Trash2 size={14} />}
                      />
                   </div>
                </div>
              )) : (
                <div className="py-24 text-center bg-[#16161a] border border-white/5 rounded-[3rem]">
                   <TrendingUp size={40} className="mx-auto text-zinc-800 mb-4 opacity-20" />
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">No Requests</h2>
                   <p className="text-zinc-500 font-medium tracking-widest uppercase text-[10px]">The audience is satisfied... for now.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'admin-messages' ? (
          <AdminMessagesManager />
        ) : (
          /* ANIME LIST VIEW (DEFAULT DASHBOARD) */
          <div className="space-y-8 md:space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4">Studio Content</h1>
                <p className="text-zinc-500 font-medium text-sm md:text-lg">Manage your anime library and metadata.</p>
              </div>
              <button 
                onClick={() => handleOpenAnimeModal(null)}
                className="w-full sm:w-auto bg-white text-black px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 shrink-0"
              >
                <Plus size={20} /> Create Series
              </button>
              <button 
                onClick={() => setShowCategoryModal(true)}
                className="w-full sm:w-auto bg-[#16161a] border border-white/10 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 shrink-0"
              >
                <Folder size={20} /> Create Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {dashboard.anime.map((anime, idx) => (
                <AdminAnimeCard
                  key={`anime-card-${anime.id}-${idx}`}
                  anime={anime}
                  onClick={() => { setSelectedAnimeId(anime.id); setActiveTab('manage-episodes'); }}
                  onToggleStatus={(e: any) => {
                    e.stopPropagation();
                    setAnimeToToggleStatus(anime);
                    setShowAnimeVisibilityModal(true);
                  }}
                  onEdit={(e: any) => { e.stopPropagation(); handleOpenAnimeModal(anime); }}
                  onDelete={() => deleteAnime(anime.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Danger Zone Login Modal */}
      <AnimatePresence>
        {showDangerZoneLogin && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-[#16161a] border border-white/10 rounded-[3rem] p-10 max-w-sm w-full space-y-8 shadow-4xl text-center"
             >
                <div className="w-20 h-20 bg-rose-600/10 rounded-full flex items-center justify-center text-rose-500 mx-auto border-2 border-rose-500 animate-pulse">
                   <LockIcon size={32} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Access Protocol</h2>
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-2">Administrative Clearance Required</p>
                </div>
                
                <form onSubmit={handleDangerZoneLogin} className="space-y-4">
                   <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Admin Email</label>
                      <input 
                        type="email" 
                        required
                        value={dangerZoneAuthEmail}
                        onChange={(e) => setDangerZoneAuthEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-rose-500 transition-all font-black uppercase tracking-widest"
                      />
                   </div>
                   <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Admin Passkey</label>
                      <input 
                        type="password" 
                        required
                        value={dangerZoneAuthPass}
                        onChange={(e) => setDangerZoneAuthPass(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-rose-500 transition-all font-black uppercase tracking-widest"
                      />
                   </div>
                   <div className="pt-4 flex flex-col gap-3">
                      <button 
                        type="submit"
                        disabled={isDangerAuthLoading}
                        className="w-full py-4 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20 disabled:opacity-50"
                      >
                         {isDangerAuthLoading ? 'Authenticating...' : 'Confirm Identity'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowDangerZoneLogin(false)}
                        className="text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-widest"
                      >
                         Abort Mission
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: FETCH NEW SEASON */}
      <AnimatePresence>
        {isFetchSeasonModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex flex-col md:items-center md:justify-center p-0 md:p-8 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full md:max-w-4xl bg-zinc-950 md:border border-white/10 rounded-none md:rounded-[2rem] shadow-2xl flex flex-col h-[100dvh] md:h-[85vh] overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-white/10 bg-zinc-950 shrink-0">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-black text-white">Fetch Season via Providers</h2>
                   <button onClick={handleCloseFetchSeasonModal} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar-hide max-w-[250px] md:max-w-none pb-1 font-black uppercase text-[8px]">
                    {/* Free / Built-in Providers */}
                    {['AniList', 'Kitsu', 'Jikan', 'Jellyfin'].map(provider => (
                      <button 
                        key={provider}
                        onClick={() => {
                          const newSource = provider.toLowerCase() as any;
                          setSeasonFetchSource(newSource);
                          setSeasonFetchResults([]);
                          if (seasonFetchSearch.trim()) {
                            handleFetchSeasonSearch(newSource);
                          }
                        }} 
                        className={cn("px-4 py-2 text-[8px] font-black uppercase transition-all whitespace-nowrap rounded-lg", seasonFetchSource === provider.toLowerCase() ? "bg-rose-600 text-white" : "text-zinc-500 hover:text-white bg-white/5")}
                      >
                        {provider}
                      </button>
                    ))}
                    
                    {/* Premium / API Key Providers */}
                    {currentApiKeys.filter(k => (k.category || 'metadata') === 'seasons').map(k => (
                      <button 
                        key={k.id}
                        onClick={() => {
                          const newSource = k.provider.toLowerCase() as any;
                          setSeasonFetchSource(newSource);
                          setSeasonFetchResults([]);
                          if (seasonFetchSearch.trim()) {
                            handleFetchSeasonSearch(newSource);
                          }
                        }} 
                        className={cn("px-4 py-2 text-[8px] font-black uppercase transition-all whitespace-nowrap rounded-lg", seasonFetchSource === k.provider.toLowerCase() ? "bg-rose-600 text-white" : "text-zinc-500 hover:text-white bg-white/5")}
                      >
                        {k.provider} <span className="text-[6px] text-emerald-500 ml-1">KEY</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder={`Search ${seasonFetchSource}...`}
                      value={seasonFetchSearch}
                      onChange={e => setSeasonFetchSearch(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleFetchSeasonSearch()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 pr-12 text-sm text-white focus:outline-none focus:border-rose-500 transition-all font-bold"
                    />
                    {seasonFetchSearch && (
                      <button 
                        onClick={() => { setSeasonFetchSearch(''); setSeasonFetchResults([]); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => handleFetchSeasonSearch()}
                    disabled={isSearchingSeasonFetch || !seasonFetchSearch.trim()}
                    className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {isSearchingSeasonFetch ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Search"}
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-24">
                  {seasonFetchResults.map((media, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedSeasonFetchResult(media)}
                      className={cn(
                        "group cursor-pointer rounded-xl overflow-hidden relative aspect-[3/4] border-2 transition-all",
                        selectedSeasonFetchResult?.id === media.id ? "border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)] scale-105 z-10" : "border-transparent hover:border-white/20"
                      )}
                    >
                      <img src={media.coverImage.large} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                        <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">{media.format || 'TV'} • {media.startDate?.year || '?'}</div>
                        <h4 className="text-white font-bold text-xs truncate">
                          {typeof media.title === 'object' ? (media.title?.english || media.title?.romaji || 'Untitled') : (media.title || 'Untitled')}
                        </h4>
                        {media.episodesCount && <div className="text-[9px] font-black text-zinc-400 mt-1 uppercase tracking-widest">{media.episodesCount} Episodes</div>}
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedSeasonFetchResult && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-zinc-950 border-t border-white/10 flex flex-col md:flex-row items-center gap-4 md:gap-6 z-20">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <img src={selectedSeasonFetchResult.coverImage.large} className="w-10 h-14 object-cover rounded-lg shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-white font-bold text-sm truncate">
                          {typeof selectedSeasonFetchResult.title === 'object' ? (selectedSeasonFetchResult.title?.english || selectedSeasonFetchResult.title?.romaji || 'Untitled') : (selectedSeasonFetchResult.title || 'Untitled')}
                        </h4>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{selectedSeasonFetchResult.episodesCount || '?'} episodes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                      <div className="flex items-center gap-2">
                         <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Assign to Season</label>
                         <input type="number" min="1" value={fetchingSeasonTargetSeason} onChange={e => setFetchingSeasonTargetSeason(parseInt(e.target.value) || 1)} className="w-16 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm" />
                      </div>
                      <button onClick={executeFetchSeason} disabled={isSearchingSeasonFetch} className="px-6 py-3 bg-rose-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-rose-700 transition-all flex-1 md:flex-none whitespace-nowrap">
                        {isSearchingSeasonFetch ? 'Fetching...' : 'Fetch & Add Episodes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT SEASON NUMBER/NAME */}
      <AnimatePresence>
        {editingSeasonNumber && selectedAnime && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingSeasonNumber(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl z-10"
            >
               <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 text-center">Edit {selectedAnime.format === 'movie' ? 'Movie Part' : 'Season'} Details</h3>
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block text-center">Change Part/Season Number (Currently {editingSeasonNumber.old}):</label>
                 <input 
                   type="number" 
                   min="1"
                   value={editingSeasonNumber.new}
                   onChange={e => setEditingSeasonNumber({...editingSeasonNumber, new: parseInt(e.target.value) || 1})}
                   className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center text-white text-2xl font-black mb-2"
                 />
                 
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block text-center pt-2">Custom Title (e.g. Arc Name):</label>
                 <input 
                   type="text" 
                   defaultValue={selectedAnime.seasonNames?.[editingSeasonNumber.old] || ''}
                   onChange={async (e) => {
                     const newNames = { ...(selectedAnime.seasonNames || {}), [editingSeasonNumber.old]: e.target.value };
                     await setDoc(doc(db, 'anime', selectedAnime.id), { seasonNames: newNames }, { merge: true });
                   }}
                   placeholder="Custom Name..."
                   className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center text-white font-black mb-2"
                 />
                 <div className="pt-2 flex gap-3">
                   <button onClick={() => setEditingSeasonNumber(null)} className="flex-1 py-4 bg-white/5 text-zinc-400 font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-white/10 transition">Done</button>
                   <button onClick={saveSeasonNumber} className="flex-1 py-4 bg-rose-600 text-white font-bold uppercase text-xs tracking-widest rounded-xl shadow-xl shadow-rose-600/20 hover:bg-rose-500 transition">Save Nums</button>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ANIME (ADD/EDIT) */}
      <AnimatePresence>
        {showAnimeModal && editingAnime && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-20 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseAnimeModal} className="fixed inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl bg-[#16161a] rounded-3xl md:rounded-[3rem] border border-white/10 shadow-4xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            >
              <div className="p-6 md:p-10 border-b border-white/5 flex items-center justify-between shrink-0">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Content Studio Portal</h2>
                <button onClick={handleCloseAnimeModal} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-12 custom-scrollbar">
                {/* AniList Integration */}
                <div className="p-6 md:p-8 bg-zinc-900/50 rounded-2xl md:rounded-3xl border border-rose-500/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Smart Metadata Portal</h3>
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar-hide max-w-[200px] md:max-w-none pb-1">
                      {/* Free / Built-in Providers */}
                      {['AniList', 'Kitsu', 'Jikan', 'Jellyfin'].map((provider) => (
                        <button 
                          key={provider}
                          onClick={() => {
                            const newSource = provider.toLowerCase() as any;
                            setMetadataSource(newSource);
                            setAnilistResults([]);
                            if (anilistSearch.trim()) {
                              handleMetadataSearch(newSource);
                            }
                          }}
                          className={cn("px-4 py-2 text-[8px] font-black uppercase transition-all whitespace-nowrap rounded-lg", metadataSource === provider.toLowerCase() ? "bg-rose-600 text-white border-none" : "text-zinc-500 hover:text-white bg-black/40 border border-white/5")}
                        >
                          {provider}
                        </button>
                      ))}
                      
                      {/* Premium / API Key Providers */}
                      {currentApiKeys.filter(k => (k.category || 'metadata') === 'metadata').map((k) => (
                        <button 
                          key={k.id}
                          onClick={() => {
                            const newSource = k.provider.toLowerCase() as any;
                            setMetadataSource(newSource);
                            setAnilistResults([]);
                            if (anilistSearch.trim()) {
                              handleMetadataSearch(newSource);
                            }
                          }}
                          className={cn("px-4 py-2 text-[8px] font-black uppercase transition-all whitespace-nowrap rounded-lg", metadataSource === k.provider.toLowerCase() ? "bg-rose-600 text-white border-none" : "text-zinc-500 hover:text-white bg-black/40 border border-white/5")}
                        >
                          {k.provider} <span className="text-[6px] text-emerald-500 ml-1">KEY</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        placeholder={
                        metadataSource === 'anilist' ? "Search AniList..." : 
                        metadataSource === 'tmdb' ? "Search TMDB..." :
                        metadataSource === 'kitsu' ? "Search Kitsu..." :
                        metadataSource === 'jellyfin' ? "Search Jellyfin Host..." :
                        "Search MyAnimeList..."
                        }
                        value={anilistSearch}
                        onChange={e => setAnilistSearch(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleMetadataSearch()}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 pr-12 text-sm text-white focus:outline-none focus:border-rose-500"
                      />
                      {anilistSearch && (
                        <button 
                          onClick={() => { setAnilistSearch(''); setAnilistResults([]); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => handleMetadataSearch()}
                      disabled={isSearchingAniList}
                      className="px-6 py-4 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 transition-all disabled:opacity-50"
                    >
                      {isSearchingAniList ? 'Syncing...' : 'Search'}
                    </button>
                  </div>

                  {/* Related Series Manager - NEW PORTAL */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                       <LinkIcon size={12} className="text-rose-500" /> Related Series Connection
                    </label>
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-4">
                       <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input 
                              type="text" 
                              value={relatedSearch}
                              onChange={e => setRelatedSearch(e.target.value)}
                              placeholder="Connect other series from database..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-xs text-white focus:border-rose-500 transition-all font-bold"
                            />
                            {relatedSearch && (
                              <button 
                                onClick={() => { setRelatedSearch(''); setRelatedSearchResults([]); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleSearchRelated()}
                            className="px-4 bg-white/5 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                          >
                            {isSearchingRelated ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />} Search
                          </button>
                       </div>

                       {relatedSearchResults.length > 0 && (
                         <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {relatedSearchResults.map(res => (
                              <div key={res.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/10 group">
                                 <div className="flex items-center gap-3">
                                    <img src={res.thumbnail} className="w-8 h-12 rounded object-cover" />
                                    <div className="text-[10px] font-black text-white uppercase truncate max-w-[200px]">{typeof res.title === 'object' ? (res.title?.english || res.title?.romaji || 'Untitled') : res.title}</div>
                                 </div>
                                 <button 
                                   type="button"
                                   onClick={() => {
                                     const current = editingAnime.relatedAnimeIds || [];
                                     if (!current.includes(res.id!)) {
                                       setEditingAnime({ ...editingAnime, relatedAnimeIds: [...current, res.id!] });
                                     }
                                     setRelatedSearch('');
                                     setRelatedSearchResults([]);
                                   }}
                                   className="p-2 bg-rose-600/10 text-rose-500 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                                 >
                                    <Plus size={14} />
                                 </button>
                              </div>
                            ))}
                         </div>
                       )}

                       <div className="flex flex-wrap gap-2 pt-2">
                          {(editingAnime.relatedAnimeIds || []).map(rid => {
                            const relatedAnime = dashboard.anime.find(a => a.id === rid);
                            return (
                              <div key={rid} className="flex items-center gap-2 pl-2 pr-1 py-1 bg-white/5 border border-white/10 rounded-xl">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{relatedAnime?.title || rid}</span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setEditingAnime({ 
                                      ...editingAnime, 
                                      relatedAnimeIds: (editingAnime.relatedAnimeIds || []).filter(id => id !== rid) 
                                    });
                                  }}
                                  className="p-1 hover:text-rose-500 transition-colors"
                                >
                                   <X size={12} />
                                </button>
                              </div>
                            );
                          })}
                          {(editingAnime.relatedAnimeIds || []).length === 0 && (
                            <div className="text-[9px] font-bold text-zinc-700 uppercase italic px-2">No cross-links established.</div>
                          )}
                       </div>
                    </div>
                  </div>

                  {anilistResults && anilistResults.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {anilistResults.map((media, idx) => (
                        <button 
                          key={media.id || `meta-${idx}`}
                          type="button"
                          onClick={() => handleSelectMetadata(media)}
                          className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left"
                        >
                          <img src={media.coverImage?.large} className="w-10 h-14 md:w-12 md:h-16 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-black text-white uppercase truncate">
                              {typeof media.title === 'object' ? (media.title?.english || media.title?.romaji || 'Untitled') : (media.title || 'Untitled')}
                            </div>
                            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                              {media.format || 'Series'} • {media.startDate?.year || 'TBA'}
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-rose-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={saveAnime} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Series Title</label>
                      <input type="text" value={editingAnime.title} onChange={e => setEditingAnime({...editingAnime, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Synopsis</label>
                        <button
                          type="button"
                          onClick={handleSummarizeSynopsis}
                          disabled={!editingAnime.synopsis || isSummarizingSynopsis}
                          className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles size={10} className={isSummarizingSynopsis ? "animate-pulse" : ""} />
                          {isSummarizingSynopsis ? "Rewriting..." : "Rewrite Short"}
                        </button>
                      </div>
                      <textarea rows={6} value={editingAnime.synopsis} onChange={e => setEditingAnime({...editingAnime, synopsis: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none resize-none" />
                    </div>
                  </div>
                  
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Visibility Status</label>
                        <div className="flex bg-black border border-white/10 rounded-xl overflow-hidden">
                          <button 
                            type="button"
                            onClick={() => setEditingAnime({...editingAnime, status: 'public'})}
                            className={cn("flex-1 py-4 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2", editingAnime.status === 'public' ? "bg-green-600 text-white" : "text-zinc-500 hover:text-white")}
                          >
                            <Eye size={14} /> Public
                          </button>
                          <button 
                            type="button"
                            onClick={() => setEditingAnime({...editingAnime, status: 'private'})}
                            className={cn("flex-1 py-4 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2", editingAnime.status === 'private' ? "bg-rose-600 text-white" : "text-zinc-500 hover:text-white")}
                          >
                            <EyeOff size={14} /> Private
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</label>
                          <select 
                            value={editingAnime.categoryId || ''} 
                            onChange={e => setEditingAnime({...editingAnime, categoryId: e.target.value})} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none appearance-none"
                          >
                            <option value="">No Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Format</label>
                          <select 
                            value={editingAnime.format || 'tv'} 
                            onChange={e => setEditingAnime({...editingAnime, format: e.target.value as 'tv' | 'movie'})} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none appearance-none"
                          >
                            <option value="tv">TV Series</option>
                            <option value="movie">Movie</option>
                          </select>
                        </div>
                      </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                            <span>Image Assets Search</span>
                            <div className="flex gap-2">
                              <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 overflow-x-auto">
                                <button 
                                  type="button"
                                  onClick={() => setAssetSearchMode('portrait')}
                                  className={cn("whitespace-nowrap px-3 py-1 text-[8px] font-black uppercase rounded-md transition-all", assetSearchMode === 'portrait' ? "bg-rose-600 text-white" : "text-zinc-500 hover:text-white")}
                                >
                                  Mobile Portrait
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setAssetSearchMode('mobile_landscape')}
                                  className={cn("whitespace-nowrap px-3 py-1 text-[8px] font-black uppercase rounded-md transition-all", assetSearchMode === 'mobile_landscape' ? "bg-rose-600 text-white" : "text-zinc-500 hover:text-white")}
                                >
                                  Mobile Landscape
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setAssetSearchMode('pc_landscape')}
                                  className={cn("whitespace-nowrap px-3 py-1 text-[8px] font-black uppercase rounded-md transition-all", assetSearchMode === 'pc_landscape' ? "bg-rose-600 text-white" : "text-zinc-500 hover:text-white")}
                                >
                                  PC Ultrawide
                                </button>
                              </div>
                              <select 
                                value={assetProvider}
                                onChange={e => {
                                  const newSource = e.target.value as any;
                                  setAssetProvider(newSource);
                                  setAssetResults([]);
                                  if (assetSearch.trim()) {
                                    handleAssetSearch(newSource);
                                  }
                                }}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[8px] font-black uppercase text-zinc-400 focus:outline-none"
                              >
                                <option value="">Select Provider</option>
                                <option value="anilist">AniList</option>
                                <option value="jikan">Jikan (MyAnimeList)</option>
                                <option value="tmdb">TMDB</option>
                                <option value="danbooru">Danbooru</option>
                                {currentApiKeys.filter(k => (k.category || 'metadata') === 'images').map(k => (
                                  <option key={k.id} value={k.provider.toLowerCase()}>{k.provider}</option>
                                ))}
                                {currentApiKeys.some(k => k.provider.toLowerCase() === 'google' && k.isEnv) && <option value="google">Google (System)</option>}
                              </select>
                            </div>
                          </label>
                          <div className="flex gap-2">
                             <div className="relative flex-1">
                               <input 
                                 type="text" 
                                 placeholder={`Search for ${assetSearchMode} images...`} 
                                 value={assetSearch} 
                                 onChange={e => setAssetSearch(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAssetSearch())}
                                 className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-xs text-white focus:outline-none focus:border-rose-500/50" 
                               />
                               {assetSearch && (
                                 <button 
                                   type="button"
                                   onClick={() => { setAssetSearch(''); setAssetResults([]); }}
                                   className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                 >
                                   <X size={14} />
                                 </button>
                               )}
                             </div>
                             <button 
                               type="button" 
                               onClick={() => handleAssetSearch()}
                               className="bg-white/10 hover:bg-rose-600 text-white p-3 rounded-xl transition-all"
                             >
                               {isSearchingAssets ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                             </button>
                          </div>
                        </div>

                        {assetResults.length > 0 && (
                          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <div className={`grid ${assetSearchMode === 'portrait' ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-3`}>
                              {assetResults.map(res => {
                                if (res.isMessage) {
                                  return (
                                    <div key={res.id} className="col-span-full p-4 border border-rose-500/20 bg-rose-500/10 rounded-xl text-xs text-rose-400 text-center flex flex-col items-center gap-2">
                                      <AlertTriangle size={24} className="text-rose-500" />
                                      {res.errorMsg}
                                    </div>
                                  );
                                }
                                const img = res.thumbnail || res.large;
                                if (!img) return null;
                                return (
                                  <button
                                    key={res.id}
                                    type="button"
                                    onClick={() => {
                                      if (assetSearchMode === 'portrait') {
                                        setEditingAnime({...editingAnime!, thumbnail: res.large || res.thumbnail});
                                      } else if (assetSearchMode === 'mobile_landscape') {
                                        setEditingAnime({...editingAnime!, bannerMobile: res.large || res.thumbnail});
                                      } else {
                                        setEditingAnime({...editingAnime!, bannerImage: res.large || res.thumbnail});
                                      }
                                      setAssetResults([]);
                                    }}
                                    className={`relative group rounded-lg overflow-hidden border-2 transition-all ${editingAnime?.thumbnail === img || editingAnime?.bannerImage === img || editingAnime?.bannerMobile === img ? 'border-rose-600' : 'border-transparent hover:border-white/20'}`}
                                  >
                                    <img src={img} style={assetSearchMode === 'pc_landscape' ? { aspectRatio: '1700/467' } : assetSearchMode === 'mobile_landscape' ? { aspectRatio: '16/9' } : {}} className={`w-full ${assetSearchMode === 'portrait' ? 'aspect-[3/4]' : ''} object-cover`} referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <div className="flex flex-col items-center gap-1">
                                        <Plus size={20} className="text-white" />
                                        <span className="text-[8px] font-bold text-white/50 uppercase">{res.source}</span>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Anime Card (3:4 Portrait)</label>
                            <div className="aspect-[3/4] bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative group">
                              {editingAnime.thumbnail ? (
                                <>
                                  <img src={editingAnime.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Card Preview" />
                                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                                    <button 
                                      type="button"
                                      onClick={() => { navigator.clipboard.writeText(editingAnime.thumbnail); alert("URL Copied!"); }}
                                      className="p-2 bg-black/60 text-white rounded-lg hover:bg-rose-600 transition-colors"
                                      title="Copy URL"
                                    >
                                      <LinkIcon size={12} />
                                    </button>
                                    <a 
                                      href={editingAnime.thumbnail} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="p-2 bg-black/60 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                      title="Open Link"
                                    >
                                      <ExternalLink size={12} />
                                    </a>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setEditingAnime({...editingAnime, thumbnail: ''})}
                                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 gap-2">
                                  <Image size={24} />
                                  <span className="text-[10px] font-black uppercase">No Portrait</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input type="text" placeholder="Portrait URL" value={editingAnime.thumbnail} onChange={e => setEditingAnime({...editingAnime, thumbnail: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white focus:outline-none focus:border-rose-500/50" />
                              <label className="bg-white/10 hover:bg-rose-600 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors" title="Upload Image">
                                <Upload size={14} className="text-white" />
                                <input type="file" hidden accept="image/*" onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                      try {
                                          const compressed = await compressImage(file, 1200, 1600, 0.95);
                                          setEditingAnime({...editingAnime, thumbnail: compressed});
                                      } catch (err) {
                                          console.error("Image upload err", err);
                                      }
                                  }
                                }} />
                              </label>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mobile Banner (16:9)</label>
                            <div style={{ aspectRatio: '16/9' }} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative group flex items-center">
                              {editingAnime.bannerMobile ? (
                                <>
                                  <img src={editingAnime.bannerMobile} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Mobile Banner Preview" />
                                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                                    <button 
                                      type="button"
                                      onClick={() => { navigator.clipboard.writeText(editingAnime.bannerMobile!); alert("URL Copied!"); }}
                                      className="p-2 bg-black/60 text-white rounded-lg hover:bg-rose-600 transition-colors"
                                      title="Copy URL"
                                    >
                                      <LinkIcon size={12} />
                                    </button>
                                    <a 
                                      href={editingAnime.bannerMobile} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="p-2 bg-black/60 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                      title="Open Link"
                                    >
                                      <ExternalLink size={12} />
                                    </a>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setEditingAnime({...editingAnime, bannerMobile: ''})}
                                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 gap-2">
                                  <MonitorSmartphone size={24} />
                                  <span className="text-[10px] font-black uppercase">No Mobile Banner</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input type="text" placeholder="16:9 URL" value={editingAnime.bannerMobile || ''} onChange={e => setEditingAnime({...editingAnime, bannerMobile: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white focus:outline-none focus:border-rose-500/50" />
                              <label className="bg-white/10 hover:bg-rose-600 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors" title="Upload Image">
                                <Upload size={14} className="text-white" />
                                <input type="file" hidden accept="image/*" onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                      try {
                                          const compressed = await compressImage(file, 2560, 1440, 0.95);
                                          setEditingAnime({...editingAnime, bannerMobile: compressed});
                                      } catch (err) {
                                          console.error("Image upload err", err);
                                      }
                                  }
                                }} />
                              </label>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">PC Banner (1700x467)</label>
                            <div style={{ aspectRatio: '1700/467' }} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative group flex items-center">
                              {editingAnime.bannerImage ? (
                                <>
                                  <img src={editingAnime.bannerImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Banner Preview" />
                                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                                    <button 
                                      type="button"
                                      onClick={() => { navigator.clipboard.writeText(editingAnime.bannerImage!); alert("URL Copied!"); }}
                                      className="p-2 bg-black/60 text-white rounded-lg hover:bg-rose-600 transition-colors"
                                      title="Copy URL"
                                    >
                                      <LinkIcon size={12} />
                                    </button>
                                    <a 
                                      href={editingAnime.bannerImage} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="p-2 bg-black/60 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                      title="Open Link"
                                    >
                                      <ExternalLink size={12} />
                                    </a>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setEditingAnime({...editingAnime, bannerImage: ''})}
                                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 gap-2">
                                  <Monitor size={24} />
                                  <span className="text-[10px] font-black uppercase text-center">No PC Banner</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input type="text" placeholder="Ultrawide URL" value={editingAnime.bannerImage || ''} onChange={e => setEditingAnime({...editingAnime, bannerImage: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white focus:outline-none focus:border-rose-500/50" />
                              <label className="bg-white/10 hover:bg-rose-600 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors" title="Upload Image">
                                <Upload size={14} className="text-white" />
                                <input type="file" hidden accept="image/*" onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                      try {
                                          const compressed = await compressImage(file, 3400, 934, 0.95);
                                          setEditingAnime({...editingAnime, bannerImage: compressed});
                                      } catch (err) {
                                          console.error("Image upload err", err);
                                      }
                                  }
                                }} />
                              </label>
                            </div>
                          </div>
                        </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-3 text-left">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rating</label>
                          <input type="number" step="0.1" max="10" value={Number.isNaN(editingAnime.rating as number) ? '' : editingAnime.rating} onChange={e => setEditingAnime({...editingAnime, rating: parseFloat(e.target.value || '0')})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none" />
                        </div>
                        <div className="space-y-3 text-left">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Release</label>
                          <input type="date" value={editingAnime.releaseDate.split('T')[0]} onChange={e => setEditingAnime({...editingAnime, releaseDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none" />
                        </div>
                      <div className="space-y-3 text-left">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Quality</label>
                        <select 
                          value={editingAnime.quality || 'HD'} 
                          onChange={e => setEditingAnime({...editingAnime, quality: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none appearance-none"
                        >
                          <option value="4K">4K Ultra HD</option>
                          <option value="FHD">Full HD 1080p</option>
                          <option value="HD">HD 720p</option>
                          <option value="SD">SD 480p</option>
                        </select>
                      </div>
                      <div className="space-y-3 text-left">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Language</label>
                        <input 
                          list="language-list"
                          type="text" 
                          value={editingAnime.language || ''} 
                          onChange={e => setEditingAnime({...editingAnime, language: e.target.value})} 
                          placeholder="Select/Type"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none" 
                        />
                        <datalist id="language-list">
                          {LANGUAGES.map(lang => (
                            <option key={lang} value={lang} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    <AdminAnimeEditStats animeId={editingAnime.id} defaultSeasons={editingAnime.seasonsCount || 1} defaultEpisodesCount={editingAnime.episodesCount || 0} />
                  </div>
                  
                  <div className="md:col-span-2 pt-6 md:pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                    <button type="submit" className="flex-1 bg-rose-600 text-white py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20">
                      Save Series Portal
                    </button>
                    <button type="button" onClick={handleCloseAnimeModal} className="px-12 bg-white/5 text-zinc-400 py-4 md:py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CATEGORY MANAGEMENT */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 md:p-20 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCategoryModal(false)} className="fixed inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-[#0a0a0b] border border-white/10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
              <div className="p-6 md:p-10 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-md z-10 shrink-0">
                <div className="flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">Category Manager</h3>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Simulated Home Page Layout (Drag to Reorder)</p>
                </div>
                <button onClick={() => setShowCategoryModal(false)} className="p-3 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"><X size={20} /></button>
              </div>
                <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-12 mb-10">
                  <form onSubmit={handleSaveCategory} className="flex gap-4 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                    <input 
                      type="text" 
                      value={editingCategory?.name || ''} 
                      onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} 
                      placeholder="Category Name" 
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-rose-500/50" 
                      required 
                    />
                    <button type="submit" className="bg-rose-600 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20">
                      {editingCategory?.id ? 'Update' : 'Create'}
                    </button>
                    {editingCategory?.id && (
                      <button type="button" onClick={() => setEditingCategory(null)} className="px-6 bg-white/5 text-zinc-400 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:text-white transition-all">Cancel</button>
                    )}
                  </form>
                  
                  <div className="space-y-10">
                    <div className="flex items-center justify-between mb-4 px-2">
                       <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Categories Display (Hold & Drag)</h4>
                       <p className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">Unlock to Drag</p>
                    </div>
                    
                    {categories.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                        <p className="text-xs text-zinc-600 tracking-widest uppercase font-black">No categories found machi.</p>
                      </div>
                    ) : (
                      <Reorder.Group 
                        axis="y" 
                        values={categories} 
                        onReorder={async (newOrder) => {
                          setCategories(newOrder);
                          // Sync to DB in background
                          try {
                            for (let i = 0; i < newOrder.length; i++) {
                              if (newOrder[i].order !== i) {
                                await updateDoc(doc(db, 'categories', newOrder[i].id), { order: i });
                              }
                            }
                          } catch(err) {
                            console.error("Order sync fail:", err);
                          }
                        }} 
                        className="space-y-12"
                      >
                        {categories.map((cat) => {
                          const isSystem = cat.isSystem;
                          const isLocked = cat.isLocked !== false; // default true if undefined
                          
                          let displayAnimes: Anime[] = [];
                          if (cat.id === 'system_newly_added') {
                             displayAnimes = dashboard?.anime?.slice(0, 8) || [];
                          } else if (cat.id === 'system_continue_watching') {
                             displayAnimes = []; // Simulated empty for admin view
                          } else {
                             displayAnimes = dashboard?.anime?.filter(a => a.categoryId === cat.id).slice(0, 8) || [];
                          }

                          return (
                            <Reorder.Item 
                              key={cat.id} 
                              value={cat}
                              dragListener={!isLocked}
                              className={`group relative outline-none ${!isLocked ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                            >
                              <div className={`flex items-center justify-between mb-4 px-2 ${cat.id === 'system_newly_added' ? 'bg-rose-600/[0.02] border-rose-500/10' : cat.id === 'system_continue_watching' ? 'bg-white/[0.01] border-white/5 opacity-70 mt-8' : 'bg-white/[0.01] hover:bg-white/[0.03] p-4 -m-4 border-transparent hover:border-white/5'} rounded-3xl transition-all border`}>
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 transition-colors">
                                       {isLocked ? <LockIcon size={16} /> : <GripVertical size={18} className="text-zinc-400 group-hover:text-rose-500" />}
                                    </div>
                                    <h5 className={`text-lg md:text-xl font-black uppercase tracking-tighter ${cat.id === 'system_newly_added' ? 'text-rose-500' : 'text-white'}`}>{cat.name}</h5>
                                    {isSystem && (
                                       <div className="px-4 py-2 bg-white/5 text-[10px] font-black uppercase text-zinc-500 rounded-xl border border-white/5 ml-2 hidden sm:block">System</div>
                                    )}
                                 </div>
                                 <div className={`flex items-center gap-2 ${isLocked ? 'opacity-50 group-hover:opacity-100' : 'opacity-100'} transition-opacity`}>
                                    <button 
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); updateDoc(doc(db, 'categories', cat.id), { isLocked: !isLocked }); }} 
                                      className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl border transition-all flex items-center gap-2 ${isLocked ? 'bg-rose-600/10 text-rose-500 border-rose-500/10 hover:bg-rose-600 hover:text-white' : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'}`}
                                    >
                                      {isLocked ? <LockIcon size={12} /> : <Unlock size={12} />} {isLocked ? 'Unlock' : 'Lock'}
                                    </button>
                                    
                                    {!isSystem && (
                                      <>
                                        <button onClick={() => setEditingCategory(cat)} className="px-4 py-2 bg-white/5 text-[10px] font-black uppercase text-zinc-500 hover:text-white rounded-xl border border-white/5 transition-all">Edit name</button>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="px-4 py-2 bg-rose-600/10 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl border border-rose-500/10 transition-all">Delete</button>
                                      </>
                                    )}
                                 </div>
                              </div>
                              <div className="flex gap-4 overflow-x-auto custom-scrollbar-hide px-2 items-stretch pointer-events-none">
                                 {displayAnimes.map((a) => (
                                   <div key={a.id} className={`w-24 md:w-32 aspect-[3/4] ${cat.id === 'system_newly_added' ? 'bg-zinc-950' : 'bg-zinc-950'} rounded-xl border border-white/5 shrink-0 relative overflow-hidden group/card shadow-2xl`}>
                                      <img src={a.thumbnail} className="w-full h-full object-cover opacity-60" alt={typeof a.title === 'string' ? a.title : 'Thumbnail'} />
                                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent">
                                         <div className="text-[8px] font-black text-white uppercase truncate">{a.title ? (typeof a.title === 'object' ? ((a.title as any).english || (a.title as any).romaji || 'Untitled') : a.title) : 'Untitled'}</div>
                                      </div>
                                   </div>
                                 ))}
                                 
                                 {((cat.id === 'system_newly_added' && dashboard?.anime && dashboard.anime.length > 8) || 
                                  (!isSystem && dashboard?.anime && dashboard.anime.filter(a => a.categoryId === cat.id).length > 8)) && (
                                    <div className="w-24 md:w-32 aspect-[3/4] bg-zinc-900/50 rounded-xl border border-white/5 flex items-center justify-center shrink-0">
                                       <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 flex flex-col items-center gap-2">
                                          <ChevronRight size={16} /> View More
                                       </div>
                                    </div>
                                 )}
                                 
                                 {(!isSystem || cat.id === 'system_continue_watching') && displayAnimes.length === 0 && (
                                   [1,2,3,4].map(i => (
                                     <div key={i} className="w-24 md:w-32 aspect-[3/4] bg-zinc-900/50 rounded-xl border border-white/10 flex items-center justify-center border-dashed shrink-0">
                                        <Plus size={14} className="text-zinc-800" />
                                     </div>
                                   ))
                                 )}
                              </div>
                            </Reorder.Item>
                          );
                        })}
                      </Reorder.Group>
                    )}
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EPISODE (ADD/EDIT) */}
      <AnimatePresence>
        {showEpisodeModal && editingEpisode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-20 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEpisodeModal(false)} className="fixed inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-3xl bg-[#16161a] rounded-3xl md:rounded-[3rem] border border-white/10 shadow-4xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            >
              <div className="p-6 md:p-10 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">{selectedAnime?.title}</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
                    {episodeModalStep === 'menu' ? 'Select Action' : episodeModalStep === 'season-management' ? 'Season Settings' : 'Episode Upload'}
                  </p>
                </div>
                {episodeModalStep !== 'menu' ? (
                  <button onClick={() => setEpisodeModalStep('menu')} className="text-zinc-500 hover:text-white transition-colors w-10 h-10 flex items-center justify-center bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
                ) : (
                  <button onClick={() => setShowEpisodeModal(false)} className="text-zinc-500 hover:text-white transition-colors w-10 h-10 flex items-center justify-center bg-white/5 rounded-full"><X size={20} /></button>
                )}
              </div>
              
              {episodeModalStep === 'menu' ? (
                <div className="p-6 md:p-10 space-y-4 flex-1 overflow-y-auto">
                  <button 
                    onClick={() => setEpisodeModalStep('season-management')}
                    className="w-full relative group bg-[#16161a] border border-white/5 rounded-[2rem] p-8 text-left hover:border-white/20 transition-all overflow-hidden mb-6"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.02] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <Layers size={24} className="text-zinc-400 mb-4" />
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">{selectedAnime?.format === 'movie' ? 'Movie Format Selector' : 'Season Selector'}</h3>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Manage current {selectedAnime?.format === 'movie' ? 'movies' : 'seasons'} and add new ones.</p>
                      </div>
                      <ArrowRight size={24} className="text-zinc-600 group-hover:text-white transition-colors group-hover:translate-x-2" />
                    </div>
                  </button>

                  <button 
                    onClick={() => setEpisodeModalStep('episode-form')}
                    className="w-full relative group bg-rose-600/10 border border-rose-500/20 rounded-[2rem] p-8 text-left hover:border-rose-500/40 hover:bg-rose-600/20 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <Upload size={24} className="text-rose-500 mb-4" />
                        <h3 className="text-xl font-black text-rose-500 uppercase tracking-widest mb-2">{selectedAnime?.format === 'movie' ? 'Movie Upload' : 'Episode Upload'}</h3>
                        <p className="text-xs font-bold text-rose-500/60 uppercase tracking-widest">Upload a new {selectedAnime?.format === 'movie' ? 'movie' : 'episode'} directly here.</p>
                      </div>
                      <ArrowRight size={24} className="text-rose-500 group-hover:translate-x-2 transition-all" />
                    </div>
                  </button>
                </div>
              ) : episodeModalStep === 'season-management' ? (
                <div className="p-6 md:p-10 space-y-6 flex-1 overflow-y-auto">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
                      <div>
                        <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Current {selectedAnime?.format === 'movie' ? 'Movies' : 'Seasons'}</div>
                      </div>
                      <button 
                        onClick={async () => {
                          const newCount = (selectedAnime?.seasonsCount || 1) + 1;
                          await setDoc(doc(db, 'anime', selectedAnime!.id), { seasonsCount: newCount }, { merge: true });
                          setDashboard(prev => prev ? { ...prev, anime: prev.anime.map(a => a.id === selectedAnime!.id ? { ...a, seasonsCount: newCount } : a) } : prev);
                        }}
                        className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all w-full sm:w-auto"
                      >
                        + Add {selectedAnime?.format === 'movie' ? 'Movie Part' : 'Season'}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {Array.from({ length: selectedAnime?.seasonsCount || 1 }, (_, i) => i + 1).map(s => (
                        <div key={`season-list-${s}`} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/40 border border-white/10 rounded-xl p-4 gap-4">
                           <div className="flex-1">
                             <span className="text-white font-black uppercase tracking-widest mr-4">{selectedAnime?.format === 'movie' ? 'Part' : 'Season'} {s}</span>
                             <input 
                               type="text" 
                               defaultValue={selectedAnime?.seasonNames?.[s] || ''}
                               placeholder={`E.g., "Arc Name"`}
                               onChange={async (e) => {
                                 const val = e.target.value;
                                 const newNames = { ...(selectedAnime?.seasonNames || {}), [s]: val };
                                 await setDoc(doc(db, 'anime', selectedAnime!.id), { seasonNames: newNames }, { merge: true });
                               }}
                               className="mt-2 sm:mt-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 w-full sm:w-48"
                             />
                           </div>
                           <ConfirmDeleteButton 
                             onConfirm={async () => {
                               try {
                                 // Update season count
                                 const currentCount = selectedAnime?.seasonsCount || 1;
                                 let newCount = currentCount;
                                 if (s === currentCount && currentCount > 1) {
                                   newCount = currentCount - 1;
                                   await setDoc(doc(db, 'anime', selectedAnime!.id), { seasonsCount: newCount }, { merge: true });
                                   setDashboard(prev => prev ? { ...prev, anime: prev.anime.map(a => a.id === selectedAnime!.id ? { ...a, seasonsCount: newCount } : a) } : prev);
                                 }
                                 // Delete episodes
                                 const batchEps = episodes.filter(e => (e.season || 1) === s);
                                 for (const ep of batchEps) {
                                   await deleteDoc(doc(db, 'episodes', ep.id));
                                 }
                                 setEpisodes(prev => prev.filter(ep => (ep.season || 1) !== s));
                                 if (selectedSeason === s) setSelectedSeason(1);
                               } catch (e) {
                                 console.error(e);
                               }
                             }}
                             className="p-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg transition-all self-start sm:self-auto"
                             defaultIcon={<Trash2 size={16} />}
                           />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={saveEpisode} className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-left">
                  <div className="sm:col-span-4 space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Visibility Status</label>
                    <div className="flex bg-black border border-white/5 rounded-2xl overflow-hidden p-1.5 gap-2">
                       <button 
                        type="button" 
                        onClick={() => setEditingEpisode({...editingEpisode, status: 'public'})}
                        className={cn(
                          "flex-1 py-4.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2.5",
                          editingEpisode.status === 'public' ? "bg-green-600 text-white shadow-lg shadow-green-600/20" : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                        )}
                       >
                         <Eye size={16} /> Public Release
                       </button>
                       <button 
                        type="button" 
                        onClick={() => setEditingEpisode({...editingEpisode, status: 'private'})}
                        className={cn(
                          "flex-1 py-4.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2.5",
                          editingEpisode.status === 'private' ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                        )}
                       >
                         <EyeOff size={16} /> Private Draft
                       </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">{selectedAnime?.format === 'movie' ? 'Movie Part' : 'Season'}</label>
                    <select 
                      value={editingEpisode.season || 1} 
                      onChange={e => setEditingEpisode({...editingEpisode, season: parseInt(e.target.value)})} 
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-rose-500 transition-all font-bold appearance-none cursor-pointer"
                    >
                      {Array.from({length: selectedAnime?.seasonsCount || 1}).map((_, i) => (
                        <option key={i+1} value={i+1}>{selectedAnime?.seasonNames?.[i+1] || (selectedAnime?.format === 'movie' ? `Part ${i+1}` : `Season ${i+1}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Number</label>
                    <input type="number" value={Number.isNaN(editingEpisode.episodeNumber as number) ? '' : editingEpisode.episodeNumber} onChange={e => setEditingEpisode({...editingEpisode, episodeNumber: parseInt(e.target.value || '0')})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-rose-500 transition-all font-bold" />
                  </div>
                  <div className="sm:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Title</label>
                    <input type="text" value={editingEpisode.title} onChange={e => setEditingEpisode({...editingEpisode, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-rose-500 transition-all font-bold" />
                  </div>
                  <div className="sm:col-span-4 space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">Important Text <span className="bg-amber-600 px-1.5 py-0.5 rounded text-[8px] text-white">OPTIONAL</span></label>
                    <input type="text" value={editingEpisode.importantText || ''} onChange={e => setEditingEpisode({...editingEpisode, importantText: e.target.value})} placeholder="E.g., Special Server Notice..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-rose-500 transition-all font-bold" />
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest pl-1">Shown below video player. Leave empty to hide.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Thumbnail Preview</label>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-48 aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-lg shrink-0">
                      <img src={editingEpisode.thumbnail || selectedAnime?.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-3 flex flex-col justify-center text-left">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Thumbnail (URL)</label>
                      <input type="text" value={editingEpisode.thumbnail} onChange={e => setEditingEpisode({...editingEpisode, thumbnail: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-rose-500 transition-all font-medium" placeholder="Leave blank to use series thumbnail" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Video Resources</label>
                  <div className="flex flex-col gap-4">
                    {getEpisodeSources(editingEpisode).map((source, index, arr) => (
                      <div key={index} className="space-y-1.5 p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                        <div className="flex items-center justify-between mb-2">
                           <label className="text-[8px] font-black text-zinc-400 uppercase flex items-center gap-2">
                             <Layers size={10} className="text-rose-500" /> External Source {index + 1}
                           </label>
                           {arr.length > 1 && (
                             <button
                               type="button"
                               onClick={() => {
                                 const newSources = [...arr];
                                 newSources.splice(index, 1);
                                 setEditingEpisode({ ...editingEpisode, sources: newSources, videoUrl: newSources[0]?.url || '', videoUrl2: newSources[1]?.url || '' });
                               }}
                               className="text-zinc-500 hover:text-rose-500 transition-colors bg-white/5 hover:bg-rose-500/10 p-1.5 rounded-lg"
                               title="Remove Server"
                             >
                               <X size={12} />
                             </button>
                           )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="relative">
                            <input
                              type="text"
                              value={source.name}
                              onChange={e => {
                                const newSources = [...arr];
                                newSources[index].name = e.target.value;
                                setEditingEpisode({...editingEpisode, sources: newSources});
                              }}
                              placeholder="Server Name"
                              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-rose-500 transition-all font-medium"
                            />
                          </div>
                          <div className="relative">
                               <select 
                                 value={source.type || 'iframe'}
                                 onChange={e => {
                                   const newSources = [...arr];
                                   newSources[index].type = e.target.value as any;
                                   setEditingEpisode({...editingEpisode, sources: newSources});
                                 }}
                                 className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pr-8 text-xs text-white focus:border-rose-500 transition-all font-medium appearance-none"
                               >
                                 <option value="iframe">Embed / Iframe</option>
                                 <option value="video">Direct Link (MP4/MKV)</option>
                                 <option value="hls">HLS / M3U8</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                            </div>
                          <div className="sm:col-span-2 relative">
                            <input
                              type="text"
                              value={source.url}
                              onChange={e => {
                                const newSources = [...arr];
                                newSources[index].url = e.target.value;
                                
                                // Auto-detect type if not explicitly set or just to be helpful
                                const url = e.target.value.toLowerCase();
                                if (url.includes('.m3u8')) newSources[index].type = 'hls';
                                else if (url.includes('.mp4') || url.includes('.mkv') || url.includes('.webm')) newSources[index].type = 'video';
                                
                                setEditingEpisode({...editingEpisode, sources: newSources, videoUrl: newSources[0]?.url || '', videoUrl2: newSources[1]?.url || ''});
                              }}
                              placeholder="URL (YouTube, M3U8, Iframe)"
                              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pr-10 text-xs text-white focus:border-rose-500 transition-all font-medium"
                            />
                            <Video size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const currentSources = getEpisodeSources(editingEpisode);
                        setEditingEpisode({
                          ...editingEpisode,
                          sources: [...currentSources, { name: `Server ${currentSources.length + 1}`, url: '', type: 'iframe' as any }]
                        });
                      }}
                      className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <Plus size={14} /> Add Another Server
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Description / Notes</label>
                  <textarea rows={4} value={editingEpisode.description} onChange={e => setEditingEpisode({...editingEpisode, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-rose-500 transition-all resize-none font-medium" />
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                  <button type="submit" className="flex-1 bg-rose-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-rose-600/20 active:scale-95 transition-all">Deploy Episode</button>
                  <button type="button" onClick={() => setEpisodeModalStep('menu')} className="px-10 py-4 bg-white/5 text-zinc-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Back</button>
                </div>
              </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ANIME VISIBILITY TOGGLE */}
      <AnimatePresence>
        {showAnimeVisibilityModal && animeToToggleStatus && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAnimeVisibilityModal(false)} className="fixed inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#16161a] rounded-[2.5rem] border border-white/10 shadow-4xl overflow-hidden p-8 text-center"
            >
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl",
                animeToToggleStatus.status === 'public' ? "bg-green-600/10 text-green-500" : "bg-rose-600/10 text-rose-500"
              )}>
                {animeToToggleStatus.status === 'public' ? <Eye size={32} /> : <EyeOff size={32} />}
              </div>
              
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Change Visibility</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8 leading-relaxed px-4">
                You are about to change the visibility for <span className="text-white">"{animeToToggleStatus.title}"</span>. 
                {animeToToggleStatus.status === 'public' ? " Private series are hidden from users." : " Public series are visible on the home page."}
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={async () => {
                    const newStatus = animeToToggleStatus.status === 'public' ? 'private' : 'public';
                    await setDoc(doc(db, 'anime', animeToToggleStatus.id), { status: newStatus, updatedAt: Date.now() }, { merge: true });
                    setShowAnimeVisibilityModal(false);
                    setAnimeToToggleStatus(null);
                  }}
                  className={cn(
                    "w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl active:scale-95",
                    animeToToggleStatus.status === 'public' ? "bg-rose-600 text-white shadow-rose-600/20" : "bg-green-600 text-white shadow-green-600/20"
                  )}
                >
                  Confirm {animeToToggleStatus.status === 'public' ? 'Private' : 'Public'}
                </button>
                <button onClick={() => setShowAnimeVisibilityModal(false)} className="w-full py-4 bg-white/5 text-zinc-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resolution Modal */}
      <AnimatePresence>
        {resolutionRequest && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResolutionRequest(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#16161a] border border-white/10 rounded-[2.5rem] p-8 shadow-4xl"
            >
               <div className="flex items-center gap-4 mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    resolutionRequest.type === 'fulfilled' ? "bg-green-500/20 text-green-500" : "bg-rose-500/20 text-rose-500"
                  )}>
                     {resolutionRequest.type === 'fulfilled' ? <CheckCircle size={24} /> : <X size={24} />}
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                       {resolutionRequest.type === 'fulfilled' ? 'Fulfil' : 'Reject'} Request
                     </h3>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate max-w-[300px]">
                       {resolutionRequest.title}
                     </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1 block mb-2 font-sans">
                       Message for {resolutionRequest.voters?.length || 0} Voters
                     </label>
                     <textarea 
                       autoFocus
                       placeholder={resolutionRequest.type === 'fulfilled' ? "e.g. Series uploaded! Check it out in the library." : "e.g. Sorry, we couldn't find a high-quality source for this series."}
                       value={resolutionMessage}
                       onChange={e => setResolutionMessage(e.target.value)}
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-white min-h-[120px] resize-none"
                     />
                  </div>

                  <div className="flex gap-3">
                     <button 
                       onClick={() => setResolutionRequest(null)}
                       className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                     >
                        Cancel
                     </button>
                     <button 
                       disabled={!resolutionMessage.trim() || isProcessingRequest === resolutionRequest.id}
                       onClick={handleResolveRequest}
                       className={cn(
                         "flex-[2] px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2",
                         resolutionRequest.type === 'fulfilled' 
                           ? "bg-green-600 text-white shadow-green-600/20" 
                           : "bg-rose-600 text-white shadow-rose-600/20"
                       )}
                     >
                        {isProcessingRequest === resolutionRequest.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <Send size={16} /> 
                            SEND & {resolutionRequest.type === 'fulfilled' ? 'FULFIL' : 'REJECT'}
                          </>
                        )}
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AvatarSelection({ selectedAvatar, setSelectedAvatar }: { selectedAvatar: string, setSelectedAvatar: (url: string) => void }) {
  const { config } = useWebsiteConfig();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [avatarProvider, setAvatarProvider] = useState<'google' | 'anilist' | 'danbooru' | 'pexels' | 'pixabay' | 'jikan' | 'tmdb'>('anilist');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      let results: any[] = [];
      const query = searchQuery + " anime character profile avatar icon portrait";
      
      switch (avatarProvider) {
        case 'google':
          const g = await searchGoogleImages(query);
          results = g.map((r: any) => ({ url: r.large || r.thumbnail, source: 'google', isMessage: r.isMessage, errorMsg: r.errorMsg }));
          break;
        case 'anilist':
          const al = await searchAniList(searchQuery);
          results = al.map((r: any) => ({ url: r.coverImage?.extraLarge || r.coverImage?.large, source: 'anilist' }));
          break;
        case 'jikan':
          const jk = await searchJikanCharacter(searchQuery);
          results = jk.map((r: any) => ({ url: r.image, source: 'jikan' }));
          break;
        case 'tmdb':
          const tb = await searchTMDB(searchQuery);
          results = tb.map((r: any) => ({ url: r.coverImage?.large, source: 'tmdb' }));
          break;
        case 'danbooru':
          const d = await searchDanbooru(searchQuery + " portrait");
          results = d.map((r: any) => ({ url: r.large || r.thumbnail, source: 'danbooru' }));
          break;

        case 'pexels':
          const p = await searchPexels(searchQuery + " character portrait");
          results = p.map((r: any) => ({ url: r.large || r.thumbnail, source: 'pexels' }));
          break;
        case 'pixabay':
          const px = await searchPixabay(searchQuery + " anime portrait");
          results = px.map((r: any) => ({ url: r.large || r.thumbnail, source: 'pixabay' }));
          break;
      }
      setSearchResults(results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const collections = config.avatarCollections || AVATAR_COLLECTIONS;
  const categories = Object.keys(collections);
  const animeAvatars = Object.values(collections).flat();
  const currentAvatars = activeCategory ? collections[activeCategory] : animeAvatars;
  
  const avatarsToShow = searchResults.length > 0 
    ? searchResults.map(r => r.url).filter(Boolean)
    : currentAvatars;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <select 
          value={avatarProvider}
          onChange={e => setAvatarProvider(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-rose-500/50 outline-none"
        >
          <option className="bg-[#1e1e24]" value="anilist">AniList</option>
          <option className="bg-[#1e1e24]" value="jikan">MyAnimeList (Jikan)</option>
          <option className="bg-[#1e1e24]" value="tmdb">TMDB</option>
          <option className="bg-[#1e1e24]" value="danbooru">Danbooru</option>
        </select>
        <div className="relative flex-1 group">
          <input 
            type="text" 
            placeholder="Search characters/anime..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500/50"
          />
          {isSearching && (
            <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 z-10">
              <Loader2 size={14} className="animate-spin text-rose-500" />
            </div>
          )}
        </div>
        <button 
          onClick={handleSearch}
          className="bg-white/5 hover:bg-rose-600 text-white p-3 rounded-xl transition-all"
        >
          <Search size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSearchResults([]); setSearchQuery(''); setActiveCategory(null); }}
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
            !activeCategory && searchResults.length === 0
              ? "bg-rose-600 text-white" 
              : "bg-white/5 text-zinc-400 hover:text-white"
          )}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={(e) => { e.preventDefault(); setActiveCategory(cat === activeCategory ? null : cat); setSearchResults([]); }}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
              activeCategory === cat 
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30" 
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            )}
          >
            #{cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[240px] overflow-y-auto custom-scrollbar p-1">
        {searchResults.some(r => r.isMessage) ? (
          <div className="col-span-full p-4 border border-rose-500/20 bg-rose-500/10 rounded-xl text-xs text-rose-400 text-center flex flex-col items-center gap-2">
            <AlertTriangle size={24} className="text-rose-500" />
            {searchResults.find(r => r.isMessage)?.errorMsg}
          </div>
        ) : avatarsToShow.map((url, i) => (
          <button 
            key={url + i} 
            onClick={(e) => { e.preventDefault(); setSelectedAvatar(url); }}
            className={cn(
              "aspect-square rounded-xl border-2 transition-all overflow-hidden",
              selectedAvatar === url ? "border-rose-500 scale-110 shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/20" : "border-transparent hover:border-white/20 hover:scale-105"
            )}
          >
            <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>
    </div>
  );
}

function LoginPage() {
  const { config } = useWebsiteConfig();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(ANIME_AVATARS[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (config?.avatarCollections) {
      const allAvatars = Object.values(config.avatarCollections).flat();
      if (allAvatars.length > 0 && !allAvatars.includes(selectedAvatar) && !allAvatars.includes(ANIME_AVATARS[0])) {
         setSelectedAvatar(allAvatars[0]);
      } else if (allAvatars.length > 0 && selectedAvatar === ANIME_AVATARS[0]) {
         setSelectedAvatar(allAvatars[0]);
      }
    }
  }, [config]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val === '') {
      setUsername('');
      return;
    }
    if (!val.startsWith('@')) {
      val = '@' + val;
    }
    // Only lowercase letters, numbers, underscores
    val = val.toLowerCase().replace(/[^@a-z0-9_]/g, '');
    setUsername(val);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          email,
          username,
          displayName,
          role: email === 'dnbdotsrival@gmail.com' ? 'admin' : 'viewer',
          avatar: selectedAvatar,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate(-1);
    } catch (e: any) {
      console.error(e);
      let msg = e.message;
      if (e.code === 'auth/invalid-credential') msg = "Incorrect password or email doesn't exist. Click 'Register' if you are new!";
      if (e.code === 'auth/operation-not-allowed') msg = "Email/Password sign-in is NOT enabled in your Firebase Console!";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 bg-[#0a0a0b] py-8 md:py-12 relative overflow-y-auto">
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg p-6 sm:p-10 rounded-3xl md:rounded-[2.5rem] bg-[#16161a] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors z-10 flex items-center gap-2 group"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest hidden group-hover:block transition-all">Back</span>
          <X size={20} />
        </button>
        
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-600" />
        
        <div className="text-center mb-6 shrink-0">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tighter uppercase">
            {isRegistering ? `Join ${config.name}` : 'Welcome Back'}
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 font-medium whitespace-pre-line">
            {isRegistering ? 'Create your cinematic studio owner account.' : 'Access your premium anime account.'}
          </p>
        </div>

        <div className="overflow-y-auto custom-scrollbar pr-2 pb-4 pt-2 min-h-0 flex-1">

        {isRegistering && (
           <div className="flex flex-col items-center mb-10">
             <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">Choose Avatar</div>
             <div className="relative w-full">
               <button 
                 type="button"
                 onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                 className="relative w-24 h-24 mx-auto rounded-full border-2 border-white/10 p-1 bg-white/5 hover:border-rose-500 transition-all flex items-center justify-center group overflow-hidden"
               >
                 <img src={selectedAvatar} className="w-full h-full rounded-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Camera size={20} className="text-white" />
                 </div>
               </button>
               
               <AnimatePresence>
                 {showAvatarPicker && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="mt-6 w-full overflow-hidden"
                   >
                     <div className="bg-[#1e1e24] border border-white/10 p-4 rounded-3xl shadow-4xl w-full">
                       <AvatarSelection selectedAvatar={selectedAvatar} setSelectedAvatar={(url) => { setSelectedAvatar(url); setShowAvatarPicker(false); }} />
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {isRegistering && (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Display Name</label>
                <input 
                  type="text" 
                  placeholder="Anime Fan"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-rose-500/50 transition-all font-medium" 
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Username</label>
                <input 
                  type="text" 
                  placeholder="@animefan99"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-rose-500/50 transition-all font-medium" 
                  required
                />
              </div>
            </>
          )}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-rose-500/50 transition-all font-medium" 
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-rose-500/50 transition-all text-xl" 
                minLength={6}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-rose-600/20 transform active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : (isRegistering ? 'Create Account' : 'Authorize Entry')}
          </button>
        </form>
        
        <div className="mt-8 text-center space-y-4">
          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
            className="group"
          >
            <span className="text-zinc-500 text-sm transition-all duration-300">
              {isRegistering ? 'Already have an account? ' : `New to ${config.name}? `}
            </span>
            <span className="text-rose-500 font-bold text-sm hover:underline ml-1">
              {isRegistering ? 'Log In' : 'Register'}
            </span>
          </button>

          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 before:h-px before:flex-1 before:bg-white/5 after:h-px after:flex-1 after:bg-white/5 mx-6">
            OR
          </div>

          <button
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const cred = await signInAnonymously(auth);
                const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
                if (!userDoc.exists()) {
                   await setDoc(doc(db, 'users', cred.user.uid), {
                     email: `guest_${cred.user.uid.slice(0, 5)}@anonymous.user`,
                     username: `guest_${cred.user.uid.slice(0, 5)}`,
                     displayName: 'Guest Viewer',
                     role: 'viewer',
                     avatar: config?.avatarCollections ? Object.values(config.avatarCollections).flat()[0] : ANIME_AVATARS[0],
                     createdAt: new Date().toISOString()
                   });
                }
                navigate(-1);
              } catch(e) {
                 console.error(e);
                 alert('Anonymous Login Failed. Please check if Anonymous sign-in is enabled in Firebase Console.');
              } finally {
                setIsSubmitting(false);
              }
            }}
            type="button"
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all disabled:opacity-50"
            disabled={isSubmitting}
          >
             Continue as Guest
          </button>
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/5 border-dashed">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Note</div>
          <p className="text-[10px] text-zinc-600 leading-tight">
            Ensure Email authentication is enabled in Firebase. Use a real or dummy email to register.
          </p>
        </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- Main App ---

function AppContent() {
  const { config, isLoading: isConfigLoading } = useWebsiteConfig();
  const [showEditWebsite, setShowEditWebsite] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isConfigLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/5 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-white font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Portal</p>
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[8px]">Tamil Anime Flash</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7] font-sans selection:bg-rose-500/30 selection:text-white flex flex-col overflow-x-hidden">
      <Header showEditWebsite={showEditWebsite} setShowEditWebsite={setShowEditWebsite} />
      <main className="flex-1 overflow-x-hidden">
        <Routes location={location}>
          <Route path="/" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
              <BrowsePage />
            </motion.div>
          } />
          <Route path="/anime" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
              <AllAnimePage />
            </motion.div>
          } />
          <Route path="/episode/:id" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
              <EpisodePage />
            </motion.div>
          } />
          <Route path="/studio" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.05 }}>
              <StudioDashboard setShowEditWebsite={setShowEditWebsite} />
            </motion.div>
          } />
              <Route path="/login" element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
                  <LoginPage />
                </motion.div>
              } />
            </Routes>
      </main>
      
      {/* Redesigned Landscape Footer */}
      <footer className="bg-[#0a0a0b] py-4 px-4 border-t border-white/5 flex flex-col items-center">
        <div className="w-full max-w-6xl bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-4 md:p-6 flex flex-col items-center text-center gap-4 shadow-2xl relative overflow-hidden">
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
          
          {/* 1st: Logo and Website Name */}
          <div className="flex items-center gap-3">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.name} className="w-8 h-8 rounded-xl object-cover shadow-2xl" />
            ) : (
              <div className="w-8 h-8 bg-rose-600 rounded-xl flex items-center justify-center font-bold text-white text-sm">{config.name[0]?.toUpperCase() || 'A'}</div>
            )}
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">{config.name}</span>
          </div>

          {/* 2nd: Copyright Text */}
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
            {config.copyrightText ? config.copyrightText.replace('{name}', config.name) : `Copyright © ${config.name}. All Rights Reserved`}
          </p>

          {/* 3rd: Description Text */}
          <p className="text-zinc-500 text-[9px] font-medium leading-relaxed opacity-50 max-w-3xl italic px-4">
            {config.providerText || 'This site does not store any files on its server. All contents are provided by non-affiliated third parties. We index external video links for educational and preview purposes only.'}
          </p>

          {/* 4th: Active Providers & Socials Bar */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full pt-3 border-t border-white/5">
            <div className="inline-flex items-center gap-3 px-5 py-1.5 bg-rose-500/5 border border-rose-500/10 rounded-full shrink-0">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Active Source:</span>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">{config.providerName || config.name}</span>
            </div>
            
            <div className="flex items-center gap-6 py-2 px-8 bg-black/40 border border-white/5 rounded-full shadow-inner">
               {config.socials?.instagram && <a href={config.socials.instagram} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-all"><Instagram size={16} /></a>}
               {config.socials?.youtube && <a href={config.socials.youtube} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-all"><Youtube size={16} /></a>}
               {config.socials?.telegram && <a href={config.socials.telegram} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-all"><Send size={16} /></a>}
               {config.socials?.discord && <a href={config.socials.discord} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-all"><MessageSquare size={16} /></a>}
               {config.socials?.gmail && <a href={`mailto:${config.socials.gmail}`} className="text-zinc-600 hover:text-white transition-all"><Mail size={16} /></a>}
            </div>
          </div>
        </div>

        {/* Global System Status */}
        <div className="max-w-3xl mx-auto w-full mt-10 md:mt-16 flex justify-center pb-8">
          <div className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(99,102,241,0.1)] backdrop-blur-sm">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
             <span className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest">{config.name} DEVELOPED BY {config.developerName || 'DOTSRIVAL'}</span>
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function AdminAnimeCard({ anime, onClick, onToggleStatus, onEdit, onDelete }: any) {
  const [publicCount, setPublicCount] = useState<number>(0);
  const [privateCount, setPrivateCount] = useState<number>(0);

  useEffect(() => {
    const q = query(collection(db, 'episodes'), where('animeId', '==', anime.id));
    const unsubscribe = onSnapshot(q, (snap) => {
      let pub = 0;
      let priv = 0;
      snap.docs.forEach(d => {
        if (d.data().status === 'private') priv++;
        else pub++;
      });
      setPublicCount(pub);
      setPrivateCount(priv);
    }, (err) => {
      console.error(err);
    });
    return () => unsubscribe();
  }, [anime.id]);

  return (
    <div 
      onClick={onClick}
      className="group relative bg-[#16161a] border border-white/5 rounded-3xl md:rounded-[2.5rem] overflow-hidden hover:border-rose-500/30 transition-all shadow-2xl flex flex-col cursor-pointer"
    >
      <div className="aspect-video relative overflow-hidden shrink-0">
        <img src={anime.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-4 left-6">
          <div className={cn(
            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border",
            anime.status === 'public' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", anime.status === 'public' ? "bg-green-500" : "bg-zinc-500")} />
            {anime.status || 'public'}
          </div>
        </div>
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
          <div className="bg-rose-600 px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-widest">LIVE</div>
          <div className="flex gap-2">
            <button 
              onClick={onToggleStatus}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
                anime.status === 'public' ? "bg-green-600 text-white border-green-500/20" : "bg-rose-600/20 text-rose-500 border-rose-500/20 hover:bg-rose-600 hover:text-white"
              )}
              title={anime.status === 'public' ? "Visible to users" : "Hidden from users"}
            >
              {anime.status === 'public' ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button onClick={onEdit} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all"><Edit3 size={14} /></button>
            <ConfirmDeleteButton 
              onConfirm={onDelete} 
              className="h-8 rounded-lg"
              defaultIcon={<Trash2 size={14} />}
              isBlock={false}
            />
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter mb-2 truncate">{typeof anime.title === 'object' ? anime.title.english || anime.title.romaji || 'Untitled' : (anime.title || 'Untitled')}</h3>
          <p className="text-[10px] md:text-xs text-zinc-500 line-clamp-2 leading-relaxed font-medium">{anime.synopsis}</p>
          
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5" title="Seasons">
              <Layers size={10} className="text-rose-500" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{anime.seasonsCount || 1} Seasons</span>
            </div>
            <div className="flex items-center gap-1.5" title="Total Episodes">
              <Video size={10} className="text-rose-500" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{publicCount + privateCount} Episodes</span>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-1.5" title="Public Episodes">
                <Eye size={10} className="text-green-500" />
                <span className="text-[9px] font-black text-green-500/70 uppercase tracking-widest">{publicCount} Pub</span>
              </div>
              <div className="flex items-center gap-1.5" title="Private Episodes">
                <EyeOff size={10} className="text-rose-500" />
                <span className="text-[9px] font-black text-rose-500/70 uppercase tracking-widest">{privateCount} Priv</span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={onClick}
          className="w-full py-4 bg-white/5 hover:bg-rose-600 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white rounded-xl border border-white/5 transition-all text-center flex items-center justify-center gap-2"
        >
          Manage Episodes <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function AdminAnimeEditStats({ animeId, defaultSeasons, defaultEpisodesCount }: { animeId: string, defaultSeasons: number, defaultEpisodesCount?: number }) {
  const [publicCount, setPublicCount] = useState<number>(0);
  const [privateCount, setPrivateCount] = useState<number>(0);
  const [totalDbCount, setTotalDbCount] = useState<number>(0);

  useEffect(() => {
    if (!animeId) return;
    const q = query(collection(db, 'episodes'), where('animeId', '==', animeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      let pub = 0;
      let priv = 0;
      snap.docs.forEach(d => {
        if (d.data().status === 'private') priv++;
        else pub++;
      });
      setPublicCount(pub);
      setPrivateCount(priv);
      setTotalDbCount(pub + priv);
    }, (err) => {
      console.error(err);
    });
    return () => unsubscribe();
  }, [animeId]);

  const totalDisplay = Math.max(totalDbCount, defaultEpisodesCount || 0);

  return (
    <div className="mt-6 flex flex-wrap items-center bg-black/40 border border-white/5 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-white/10 overflow-hidden">
      <div className="flex-1 p-4 min-w-[120px]">
        <div className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">Seasons</div>
        <div className="text-lg font-black text-white">{defaultSeasons || 1}</div>
      </div>
      <div className="flex-1 p-4 min-w-[120px]">
        <div className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">Total Episodes</div>
        <div className="text-lg font-black text-white">{totalDisplay}</div>
      </div>
      <div className="flex-1 p-4 min-w-[120px]">
        <div className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1">Public Episodes</div>
        <div className="text-lg font-black text-white">{publicCount}</div>
      </div>
      <div className="flex-1 p-4 min-w-[120px]">
        <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Private Episodes</div>
        <div className="text-lg font-black text-white">{privateCount}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WebsiteConfigProvider>
        <Router>
          <AppContent />
        </Router>
      </WebsiteConfigProvider>
    </AuthProvider>
  );
}

