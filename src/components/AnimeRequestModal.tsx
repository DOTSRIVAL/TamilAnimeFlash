import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  Loader2, 
  Trophy,
  History,
  TrendingUp,
  Search
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove,
  limit,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { AnimeRequest } from '../types';
import { cn } from '../lib/utils';

export function AnimeRequestModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AnimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, 'requests'),
      where('status', '==', 'pending'),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as AnimeRequest))
        .sort((a, b) => b.votes - a.votes);
      setRequests(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'requests'), {
        userId: user.id,
        userName: user.displayName || user.username || 'User',
        userAvatar: user.avatar,
        title: title.trim(),
        description: description.trim(),
        votes: 1,
        voters: [user.id],
        status: 'pending',
        createdAt: Date.now()
      });
      setTitle('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      console.error("Failed to submit request:", err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (request: AnimeRequest) => {
    if (!user) return;

    const isVoted = request.voters.includes(user.id);
    const requestRef = doc(db, 'requests', request.id);

    try {
      if (isVoted) {
        await updateDoc(requestRef, {
          votes: Math.max(0, request.votes - 1),
          voters: arrayRemove(user.id)
        });
      } else {
        await updateDoc(requestRef, {
          votes: request.votes + 1,
          voters: arrayUnion(user.id)
        });
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-rose-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/20">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">Anime Requests</h2>
                  <p className="text-[10px] text-rose-500/60 font-bold uppercase tracking-widest italic">Vote for your favorites</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* View Selection & Search */}
            <div className="p-4 bg-white/5 border-b border-white/5 flex flex-col sm:flex-row gap-4">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                 <input 
                   type="text"
                   placeholder="Search requests..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-white"
                 />
               </div>
               <button 
                 onClick={() => setShowForm(!showForm)}
                 className={cn(
                   "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                   showForm ? "bg-white/10 text-white" : "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                 )}
               >
                 {showForm ? <X size={14} /> : <Plus size={14} />}
                 {showForm ? 'CANCEL' : 'REQUEST NEW'}
               </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              {showForm ? (
                <motion.form 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Anime Title</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Solo Leveling Season 2"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Extra Details (Optional)</label>
                    <textarea 
                      placeholder="Specify version, quality or specific episode requests..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-white resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <><Send size={16} className="group-hover:translate-x-1 transition-transform" /> SUBMIT REQUEST</>
                    )}
                  </button>
                </motion.form>
              ) : (
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 size={32} className="text-rose-500 animate-spin" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Loading requests...</span>
                    </div>
                  ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((req, idx) => (
                      <div 
                        key={req.id} 
                        className="group flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-all relative overflow-hidden"
                      >
                        {/* Vote Button */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleVote(req)}
                            className={cn(
                              "w-12 h-12 rounded-xl border flex flex-col items-center justify-center transition-all relative overflow-hidden",
                              req.voters.includes(user?.id || '') 
                                ? "bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20" 
                                : "bg-black/40 border-white/10 text-zinc-500 hover:border-rose-500/50 hover:text-white"
                            )}
                          >
                            <ThumbsUp size={16} className={cn(req.voters.includes(user?.id || '') ? "fill-current" : "")} />
                            <span className="text-xs font-black mt-0.5">{req.votes}</span>
                            
                            {/* Visual feedback for voted state */}
                            {req.voters.includes(user?.id || '') && (
                              <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-white/20 rounded-full"
                              />
                            )}
                          </motion.button>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            {idx < 3 && <Trophy size={12} className="text-amber-500" />}
                            <h3 className="font-black text-white truncate text-sm uppercase tracking-tight">{req.title}</h3>
                          </div>
                          {req.description && (
                            <p className="text-xs text-zinc-400 line-clamp-1 mb-2 italic">"{req.description}"</p>
                          )}
                          <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1.5 opacity-60">
                               <div className="w-4 h-4 rounded-full bg-white/10 overflow-hidden">
                                 {req.userAvatar ? <img src={req.userAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Plus size={8} /></div>}
                               </div>
                               <span className="text-[9px] font-bold text-zinc-500 uppercase">{req.userName}</span>
                             </div>
                             <span className="text-zinc-700">•</span>
                             <span className="text-[9px] font-bold text-zinc-500 uppercase italic opacity-60">{new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {idx < 3 && (
                          <div className="absolute top-0 right-0 p-2">
                             <div className="text-[8px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-widest">Trending #{idx + 1}</div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-600">
                        <MessageSquare size={32} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-white uppercase">No requests found</h4>
                        <p className="text-xs text-zinc-500 max-w-[200px]">Be the first to request your favorite anime!</p>
                      </div>
                      <button 
                        onClick={() => setShowForm(true)}
                        className="px-6 py-2 bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-500/20 hover:scale-105 transition-all"
                      >
                        REQUEST NOW
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {!showForm && (
              <div className="p-4 bg-white/5 border-t border-white/5 flex justify-center">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest italic opacity-50 flex items-center gap-2">
                  <TrendingUp size={10} /> Admins prioritize requests with the most votes
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
