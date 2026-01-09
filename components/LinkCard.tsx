import React, { useState } from 'react';
import { ExternalLink, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { VarLink } from '../types';

interface LinkCardProps {
  link: VarLink;
  onEdit: (link: VarLink) => void;
  onDelete: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({
  link,
  onEdit,
  onDelete
}) => {
  const [customVar, setCustomVar] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const needsVariable = link.url.includes('$');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const openUrl = (variable?: string) => {
    let finalUrl = link.url;
    if (needsVariable) {
      const val = variable ? encodeURIComponent(variable) : '';
      finalUrl = finalUrl.replace(/\$/g, val);
    } else {
      finalUrl = finalUrl.replace(/\$/g, '');
    }

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    window.open(finalUrl, '_blank');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customVar.trim()) {
      openUrl(customVar.trim());
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-200 group relative flex flex-col gap-4 ${isConfirmingDelete ? 'border-rose-200 ring-2 ring-rose-50' : 'border-slate-100 hover:shadow-md'}`}
      {...attributes}
    >
      <div className="flex justify-between items-start gap-2">
        <div
          className="cursor-grab active:cursor-grabbing p-1 -ml-2 text-slate-300 hover:text-slate-500 transition-colors touch-none"
          title="Drag to reorder"
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            onClick={() => openUrl()}
            className="text-lg font-bold text-slate-800 hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-2 truncate"
          >
            {link.name}
            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </h3>
          <p className="text-sm text-slate-400 font-mono truncate w-full mt-1">
            {link.url}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter mr-1">Delete?</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(link.id); }}
                className="p-1.5 text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm"
                title="Confirm Delete"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsConfirmingDelete(false); }}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(link); }}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit Link"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsConfirmingDelete(true); }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Link"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {needsVariable && (
        <div className="space-y-4">
          <form onSubmit={handleCustomSubmit} className="relative">
            <input
              type="text"
              placeholder="Custom variable..."
              value={customVar}
              onChange={(e) => setCustomVar(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </form>

          {link.variables && link.variables.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {link.variables.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => openUrl(v)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full hover:bg-indigo-100 border border-indigo-100 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkCard;
