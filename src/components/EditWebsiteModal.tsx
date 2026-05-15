import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { X, Edit3, Image as ImageIcon, Link as LinkIcon, Save, Youtube, Instagram, Send, MessageSquare, Mail, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useWebsiteConfig, ApiKeyRecord } from '../context/WebsiteConfigContext';

export function EditWebsiteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { config } = useWebsiteConfig();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [copyrightText, setCopyrightText] = useState('');
  const [providerText, setProviderText] = useState('');
  const [providerName, setProviderName] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [socials, setSocials] = useState({
    instagram: '',
    youtube: '',
    telegram: '',
    discord: '',
    gmail: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(config.name || '');
      setLogoUrl(config.logoUrl || '');
      setCopyrightText(config.copyrightText || '');
      setProviderText(config.providerText || '');
      setProviderName(config.providerName || '');
      setDeveloperName(config.developerName || '');
      setSocials({
        instagram: config.socials?.instagram || '',
        youtube: config.socials?.youtube || '',
        telegram: config.socials?.telegram || '',
        discord: config.socials?.discord || '',
        gmail: config.socials?.gmail || ''
      });
    }
  }, [isOpen, config]);

  const handleSave = async () => {
    if (!user || user.email !== 'dnbdotsrival@gmail.com') return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'website', 'config'), {
        name,
        logoUrl,
        copyrightText,
        providerText,
        providerName,
        developerName,
        socials
      }, { merge: true });
      onClose();
    } catch (e: any) {
      console.error('Firestore Error:', e);
      if (e.code === 'permission-denied') {
        alert('Access Denied: You do not have permission to edit this website.');
      } else {
        alert(`Failed to save website config: ${e.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/95 backdrop-blur-xl" />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] shadow-4xl relative flex flex-col z-10 overflow-hidden"
      >
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Edit3 size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">Edit Website</h2>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Global Configuration</p>
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

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <ImageIcon size={16} className="text-emerald-500" /> Branding
            </h3>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Website Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. ANIFLOW" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500 transition-all font-bold" />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Website Logo URL</label>
              <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500 transition-all font-bold" />
              {logoUrl && <img src={logoUrl} alt="Logo Preview" className="w-16 h-16 rounded-xl object-cover border border-white/10 ml-1 mt-2" />}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <MessageSquare size={16} className="text-rose-500" /> Footer & Copyright
            </h3>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Copyright Text</label>
              <textarea 
                rows={2}
                value={copyrightText} 
                onChange={e => setCopyrightText(e.target.value)} 
                placeholder="e.g. Copyright © {name}. All Rights Reserved"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-rose-500 transition-all font-bold resize-none" 
              />
              <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest pl-1 italic">Tip: Use {"{name}"} for dynamic website name.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Provider Name (Box)</label>
                <input type="text" value={providerName} onChange={e => setProviderName(e.target.value)} placeholder="Provider" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-rose-500 transition-all font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Developer Name</label>
                <input type="text" value={developerName} onChange={e => setDeveloperName(e.target.value)} placeholder="DOTSRIVAL" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-rose-500 transition-all font-bold" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Provider Tagline</label>
              <input type="text" value={providerText} onChange={e => setProviderText(e.target.value)} placeholder="Provided by..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-rose-500 transition-all font-bold" />
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <LinkIcon size={16} className="text-blue-500" /> Social Links
            </h3>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2"><Instagram size={12} /> Instagram URL</label>
              <input type="text" value={socials.instagram} onChange={e => setSocials({...socials, instagram: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500 transition-all font-bold" />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2"><Youtube size={12} /> YouTube URL</label>
              <input type="text" value={socials.youtube} onChange={e => setSocials({...socials, youtube: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500 transition-all font-bold" />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2"><Send size={12} /> Telegram URL</label>
              <input type="text" value={socials.telegram} onChange={e => setSocials({...socials, telegram: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500 transition-all font-bold" />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2"><MessageSquare size={12} /> Discord URL</label>
              <input type="text" value={socials.discord} onChange={e => setSocials({...socials, discord: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500 transition-all font-bold" />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2"><Mail size={12} /> Gmail Address</label>
              <input type="text" value={socials.gmail} onChange={e => setSocials({...socials, gmail: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500 transition-all font-bold" />
            </div>
          </div>

        </div>
        
        <div className="p-6 sm:p-8 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-md border-t border-white/5">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-4 rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
             {isSaving ? <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <Save size={16} />}
             Save Configuration
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
