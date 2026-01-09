import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash, Sparkles, Loader2, Link2, Type as TypeIcon } from 'lucide-react';
import { NewVarLink, VarLink } from '../types';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: NewVarLink) => void;
  editingLink: VarLink | null;
}

const LinkModal: React.FC<LinkModalProps> = ({ isOpen, onClose, onSave, editingLink }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [variableInput, setVariableInput] = useState('');
  const [variables, setVariables] = useState<string[]>([]);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingLink) {
      setName(editingLink.name);
      setUrl(editingLink.url);
      setVariables(editingLink.variables || []);
    } else if (isOpen) {
      reset();
    }
  }, [editingLink, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const reset = () => {
    setName('');
    setUrl('');
    setVariables([]);
    setVariableInput('');
  };

  if (!isOpen) return null;

  const handleAddVariable = () => {
    const trimmed = variableInput.trim();
    if (trimmed && !variables.includes(trimmed)) {
      setVariables([...variables, trimmed]);
      setVariableInput('');
    }
  };

  const removeVariable = (v: string) => {
    setVariables(variables.filter(item => item !== v));
  };



  const handleSave = () => {
    if (!name || !url) {
      alert('Missing Title or Target URL');
      return;
    }
    onSave({ name, url, variables });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {editingLink ? 'Edit Varlink' : 'New Varlink'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Target URL */}
          <div className="space-y-3 group">
            <div className="flex items-center gap-2 px-1">
              <Link2 className="h-4 w-4 text-indigo-500" />
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Target URL</label>
            </div>
            <div className="relative">
              <input
                ref={firstInputRef}
                type="text"
                placeholder="https://example.com/search?q=$"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-mono text-sm group-focus-within:bg-white"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 font-black text-xl pointer-events-none opacity-20">
                $
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium px-2 leading-relaxed">
              Replace dynamic parts of your URL with a <span className="bg-indigo-50 text-indigo-600 px-1 rounded font-bold">$</span> character.
            </p>
          </div>

          {/* Link Title */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <TypeIcon className="h-4 w-4 text-slate-400" />
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Title</label>
            </div>
            <input
              type="text"
              placeholder="e.g. Production Logs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold"
            />
          </div>

          {/* Variables Builder */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Quick Variables</label>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter a default value..."
                value={variableInput}
                onChange={(e) => setVariableInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddVariable()}
                className="flex-1 px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all"
              />
              <button
                onClick={handleAddVariable}
                className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 p-5 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem] min-h-[100px] content-start">
              {variables.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center opacity-30 mt-4">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-400 border-dashed mb-2"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">No Presets</span>
                </div>
              )}
              {variables.map((v, i) => (
                <div
                  key={i}
                  className="group/tag flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-2xl text-xs font-bold border border-slate-200 shadow-sm animate-in zoom-in-90 duration-200"
                >
                  {v}
                  <button
                    onClick={() => removeVariable(v)}
                    className="p-1 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
          >
            {editingLink ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;