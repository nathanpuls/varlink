import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Plus, ExternalLink, Zap, Loader2, Command } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { VarLink, NewVarLink } from './types';
import { linksRef, saveLink, deleteLink, onValue, updateLinkOrder } from './services/firebase';
import SearchBar from './components/SearchBar';
import LinkCard from './components/LinkCard';
import LinkModal from './components/LinkModal';

const App: React.FC = () => {
  const [links, setLinks] = useState<VarLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<VarLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const searchRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K for search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }

      // 'n' for new link when not in an input
      if (e.key.toLowerCase() === 'n' && !isModalOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openNewModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Sync with Firebase
  useEffect(() => {
    const unsubscribe = onValue(linksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setLinks(formatted.sort((a, b) => {
          if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
          return (b.createdAt || 0) - (a.createdAt || 0);
        }));
      } else {
        setLinks([]);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const openNewModal = useCallback(() => {
    setEditingLink(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((link: VarLink) => {
    setEditingLink(link);
    setIsModalOpen(true);
  }, []);

  const handleDelete = async (id: string) => {
    const success = await deleteLink(id);
    if (!success) {
      alert("Failed to delete link.");
    }
  };

  const handleSave = async (linkData: NewVarLink) => {
    await saveLink(linkData, editingLink?.id);
  };

  const filteredLinks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return links.filter(link =>
      link.name.toLowerCase().includes(q) ||
      link.url.toLowerCase().includes(q) ||
      (link.variables && link.variables.some(v => v.toLowerCase().includes(q)))
    );
  }, [links, searchQuery]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((item) => item.id === active.id);
      const newIndex = links.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Optimistic update
        const newLinks = arrayMove(links, oldIndex, newIndex);
        setLinks(newLinks);

        // Update Firebase
        // We update all links that might have changed order to be safe/consistent
        const updates = newLinks.map((link, index) => updateLinkOrder(link.id, index));
        await Promise.all(updates);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[30%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Navigation Bar */}
        <nav className="sticky top-2 z-40 mb-8 px-2 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          {/* Brand */}
          <div className="flex items-center gap-4 group cursor-pointer" onClick={openNewModal}>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-10 h-10 bg-slate-900 rounded-xl shadow-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform relative overflow-hidden">
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
              VARLINK
            </h1>
          </div>

          {/* Search & Actions */}
          <div className="flex-1 flex flex-col md:flex-row items-center gap-3 w-full">
            <div className="flex-1 relative w-full">
              <SearchBar value={searchQuery} onChange={setSearchQuery} ref={searchRef} />
              {!searchQuery && (
                <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-1 my-auto pointer-events-none text-[10px] font-bold text-slate-300">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              )}
            </div>

            <button
              onClick={openNewModal}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition-all active:scale-95 group whitespace-nowrap"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
              <span className="text-xs">New <kbd className="ml-1 opacity-50 font-sans text-[10px]">N</kbd></span>
            </button>
          </div>
        </nav>

        {/* Link Count Header */}
        <div className="flex items-center gap-4 mb-6 px-2">
          <div className="h-px flex-1 bg-slate-100"></div>
          <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] whitespace-nowrap">
            {filteredLinks.length} Active Records
          </h2>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse"></div>
              <Loader2 className="h-12 w-12 text-indigo-600 animate-spin relative" />
            </div>
            <p className="text-slate-400 font-medium tracking-tight">Accessing encrypted database...</p>
          </div>
        ) : filteredLinks.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredLinks.map(l => l.id)}
              strategy={rectSortingStrategy}
              disabled={!!searchQuery}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                {filteredLinks.map((link, idx) => (
                  <div
                    key={link.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <LinkCard
                      link={link}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur rounded-[2.5rem] border border-dashed border-slate-200 animate-in zoom-in-95 duration-500">
            <div className="p-6 bg-white shadow-sm rounded-full mb-6 border border-slate-100">
              <ExternalLink className="h-12 w-12 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Your vault is empty</h3>
            <p className="text-slate-500 mt-2 text-center max-w-xs px-4">Start by adding a dynamic link template with a $ placeholder.</p>
            <button
              onClick={openNewModal}
              className="mt-8 px-8 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-100 transition-all"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Modals */}
        <LinkModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          editingLink={editingLink}
        />


        {/* Footer */}
        <footer className="py-12 flex justify-center items-center">
          <a
            href="https://built.at"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-black tracking-[0.3em] text-slate-300 hover:text-indigo-500 transition-colors uppercase"
          >
            BUILT.AT
          </a>
        </footer>
      </div>
    </div>
  );
};

export default App;