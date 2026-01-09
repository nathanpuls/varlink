import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ value, onChange }, ref) => {
  return (
    <div className="relative group w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <input
        ref={ref}
        type="text"
        placeholder="Filter your links..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 placeholder-slate-400 text-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-rose-500 text-slate-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;