import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, Loader2, Save, X, Sparkles, Check, Edit2, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useWebsiteConfig } from '../context/WebsiteConfigContext';
import { cn } from '../lib/utils';

export function AvatarsManager() {
  const { config } = useWebsiteConfig();
  const [avatars, setAvatars] = useState<Record<string, string[]>>(config.avatarCollections || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isAddingContainer, setIsAddingContainer] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [confirmDeleteCollection, setConfirmDeleteCollection] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<{collection: string, index: number | null, url: string} | null>(null);
  
  // AI Search state
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<{name: string, url: string}[]>([]);
  const [selectedCollectionForAi, setSelectedCollectionForAi] = useState<string>('');
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'website', 'config'), {
        avatarCollections: avatars
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to save avatars configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCollection = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = newCollectionName.trim();
    if (!trimmedName) return;
    
    if (Object.prototype.hasOwnProperty.call(avatars, trimmedName)) {
      alert("Container already exists!");
      return;
    }
    
    setAvatars(prev => ({ ...prev, [trimmedName]: [] }));
    setNewCollectionName('');
    setIsAddingContainer(false);
  };

  const handleDeleteCollection = (name: string) => {
    if (confirmDeleteCollection !== name) {
      setConfirmDeleteCollection(name);
      setTimeout(() => setConfirmDeleteCollection(null), 3000);
      return;
    }
    setAvatars(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setConfirmDeleteCollection(null);
  };

  const handleAddUrl = (collection: string) => {
    setEditingImage({ collection, index: null, url: '' });
  };

  const saveEditingImage = () => {
    if (!editingImage || !editingImage.url.trim()) return;
    setAvatars(prev => {
      const nextColl = [...prev[editingImage.collection]];
      if (editingImage.index === null) {
        nextColl.push(editingImage.url);
      } else {
        nextColl[editingImage.index] = editingImage.url;
      }
      return { ...prev, [editingImage.collection]: nextColl };
    });
    setEditingImage(null);
  };

  const handleDeleteUrl = (e: React.MouseEvent, collection: string, index: number) => {
    e.stopPropagation();
    setAvatars(prev => ({
      ...prev,
      [collection]: prev[collection].filter((_, i) => i !== index)
    }));
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSearchQuery.trim()) return;
    setIsAiSearching(true);
    setAiResults([]);
    try {
      // 1. First try to search as an Anime Name to fetch characters from that specific anime
      const animeQuery = `
      query ($search: String) {
        Media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
          characters(perPage: 24, sort: ROLE) {
            nodes {
              name { full }
              image { large }
            }
          }
        }
      }`;
      const animeRes = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: animeQuery, variables: { search: aiSearchQuery } })
      });
      const animeData = await animeRes.json();
      let results: any[] = [];
      
      if (animeData?.data?.Media?.characters?.nodes?.length > 0) {
        results = animeData.data.Media.characters.nodes
          .filter((c: any) => c.image?.large && !c.image.large.includes('default.jpg'))
          .map((c: any) => ({ name: c.name.full, url: c.image.large }));
      }
      
      // 2. If nothing found or want to combine, search as Character Name directly
      if (results.length < 10) {
        const charQuery = `
        query ($search: String) {
          Page(perPage: 24) {
            characters(search: $search) {
              name { full }
              image { large }
            }
          }
        }`;
        const charRes = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: charQuery, variables: { search: aiSearchQuery } })
        });
        const charData = await charRes.json();
        if (charData?.data?.Page?.characters) {
          const charResults = charData.data.Page.characters
            .filter((c: any) => c.image?.large && !c.image.large.includes('default.jpg'))
            .map((c: any) => ({ name: c.name.full, url: c.image.large }));
            
          // Merge unique by URL
          const existingUrls = new Set(results.map(r => r.url));
          for (const cr of charResults) {
            if (!existingUrls.has(cr.url)) {
              results.push(cr);
              existingUrls.add(cr.url);
            }
          }
        }
      }
      
      if (results.length > 0) {
        setAiResults(results);
      } else {
        alert("No avatars found for this query.");
      }
    } catch (e) {
      console.error(e);
      alert('Search failed. Please try again.');
    } finally {
      setIsAiSearching(false);
    }
  };

  const addAiResultToCollection = (url: string) => {
    if (!selectedCollectionForAi) {
      alert('Please select a container/collection to add this avatar to.');
      return;
    }
    setAvatars(prev => ({
      ...prev,
      [selectedCollectionForAi]: [...(prev[selectedCollectionForAi] || []), url]
    }));
    alert('Avatar added to ' + selectedCollectionForAi);
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl max-h-screen pb-20 custom-scrollbar">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">Avatar Management</h2>
           <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Manage Anime Character Avatars for User Profiles</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs px-6 py-3 rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saveSuccess ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-[#1e1e24] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-rose-500" />
          Avatar Search Tools
        </h3>
        <form onSubmit={handleAiSearch} className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={aiSearchQuery}
              onChange={e => setAiSearchQuery(e.target.value)}
              placeholder="Search Anime Name or Character (e.g., 'Naruto', 'Luffy')"
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-rose-500/50"
            />
          </div>
          <button type="submit" disabled={isAiSearching} className="bg-white/5 hover:bg-white/10 text-white px-6 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all disabled:opacity-50">
            {isAiSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>
        </form>

        {aiResults.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-4 mb-4">
               <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Add selected to:</label>
               <select 
                 value={selectedCollectionForAi} 
                 onChange={e => setSelectedCollectionForAi(e.target.value)}
                 className="bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500/50"
               >
                 <option value="">-- Select Container --</option>
                 {Object.keys(avatars).map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {aiResults.map((res, i) => (
                <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/50">
                  <img src={res.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => addAiResultToCollection(res.url)} className="bg-rose-600 text-white p-2 rounded-full hover:scale-110 transition-transform">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-bold text-white truncate px-1">{res.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#1e1e24] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Containers</h3>
          <button type="button" onClick={() => setIsAddingContainer(true)} className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all">
            <Plus size={14} /> Add Container
          </button>
        </div>

        <div className="space-y-8">
          {(Object.entries(avatars) as [string, string[]][]).map(([category, urls]) => (
            <div key={category} className="bg-black/20 border border-white/5 rounded-xl p-4">
               <div className="flex items-center justify-between mb-4">
                 <h4 className="text-lg font-black text-rose-500 tracking-tighter">{category}</h4>
                 <div className="flex gap-2">
                   <button onClick={() => handleAddUrl(category)} className="p-2 bg-white/5 hover:bg-white/10 text-cyan-500 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4" title="Add Image URL">
                     <Plus size={16} /> Add Image
                   </button>
                   <button onClick={() => handleDeleteCollection(category)} className={cn("p-2 rounded-lg transition-colors", confirmDeleteCollection === category ? "bg-rose-600 text-white" : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500")} title="Delete Container">
                     {confirmDeleteCollection === category ? <Check size={16} /> : <Trash2 size={16} />}
                   </button>
                 </div>
               </div>
               
               {urls.length === 0 ? (
                 <p className="text-xs text-zinc-500 italic">No avatars in this container. Add URLs or use AI Search.</p>
               ) : (
                 <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                   {urls.map((url, i) => (
                     <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/50 cursor-pointer" onClick={() => setEditingImage({ collection: category, index: i, url })}>
                       <img src={url} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <Edit2 size={16} className="text-white drop-shadow-md" />
                       </div>
                       <button 
                         onClick={(e) => handleDeleteUrl(e, category, i)}
                         className="absolute top-1 right-1 bg-black/60 text-white p-1.5 rounded-md hover:bg-rose-600 transition-colors z-10 md:opacity-0 md:group-hover:opacity-100"
                       >
                         <X size={14} />
                       </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          ))}
          {Object.keys(avatars).length === 0 && (
            <div className="text-center py-10">
              <p className="text-zinc-500 text-sm font-bold">No containers yet.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddingContainer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#1e1e24] p-6 rounded-3xl w-full max-w-sm border border-white/10 shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                Add Container
              </h3>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="New Anime Name (e.g. 'Death Note')" 
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateCollection(e as any);
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setIsAddingContainer(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 font-black uppercase text-xs tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleCreateCollection()}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-cyan-600/20 transition-all"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {editingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#1e1e24] p-6 rounded-3xl w-full max-w-sm border border-white/10 shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                {editingImage.index === null ? 'Add Image' : 'Edit Image'}
              </h3>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Paste image URL here" 
                  value={editingImage.url}
                  onChange={e => setEditingImage(prev => prev ? ({ ...prev, url: e.target.value }) : null)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEditingImage();
                  }}
                />
                
                {editingImage.url && (
                  <div className="aspect-square w-full rounded-2xl border border-white/10 overflow-hidden bg-black/30 flex items-center justify-center relative group">
                    <img src={editingImage.url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                       <button 
                         type="button"
                         onClick={() => { navigator.clipboard.writeText(editingImage.url); alert("URL Copied!"); }}
                         className="p-2 bg-black/60 text-white rounded-lg hover:bg-rose-600 transition-colors"
                         title="Copy URL"
                       >
                         <LinkIcon size={14} />
                       </button>
                       <a 
                         href={editingImage.url} 
                         target="_blank" 
                         rel="noreferrer" 
                         className="p-2 bg-black/60 text-white rounded-lg hover:bg-blue-600 transition-colors"
                         title="Open Link"
                       >
                         <ExternalLink size={14} />
                       </a>
                    </div>
                    <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest absolute -z-10">Invalid URL</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingImage(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 font-black uppercase text-xs tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveEditingImage}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-cyan-600/20 transition-all"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
