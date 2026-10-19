import React from 'react';
import { ItemCategory } from '../../types/item';
import { ITEM_CATEGORIES } from '../../lib/constants';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export interface FilterState {
  searchQuery: string;
  category: ItemCategory | '';
  status: string;
}

export interface ItemFiltersProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  statusOptions: Array<{ value: string; label: string }>;
}

export const ItemFilters: React.FC<ItemFiltersProps> = ({
  filters,
  onChange,
  onReset,
  statusOptions,
}) => {
  const isFiltered = Boolean(filters.searchQuery || filters.category || filters.status);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-7 relative">
          <Input
            placeholder="Search by keywords, brand, color, or location..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            className="pl-9 h-11"
          />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="sm:col-span-2 flex items-center">
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="w-full text-xs text-slate-500 hover:text-rose-600 gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear Filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => onChange({ category: '' })}
            className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-colors ${
              filters.category === ''
                ? 'bg-navy-900 text-white font-semibold shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {ITEM_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ category: cat })}
              className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-colors ${
                filters.category === cat
                  ? 'bg-brand-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
