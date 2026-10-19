import React, { useState } from 'react';
import { useItems } from '../context/ItemsContext';
import { ItemCategory } from '../types/item';
import { ItemCard } from '../components/items/ItemCard';
import { ItemFilters, FilterState } from '../components/items/ItemFilters';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { FileText, Search, PlusCircle } from 'lucide-react';

export const LostItemsPage: React.FC = () => {
  const { lostItems } = useItems();

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: '',
    status: '',
  });

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({ searchQuery: '', category: '', status: '' });
  };

  const filteredItems = lostItems.filter((item) => {
    if (filters.category && item.category !== filters.category) {
      return false;
    }
    if (filters.status && item.status !== filters.status) {
      return false;
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.locationLost.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.color && item.color.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const statusOptions = [
    { value: 'open', label: 'Open Search' },
    { value: 'match_found', label: 'Match Identified' },
    { value: 'contact_requested', label: 'Contact Requested' },
    { value: 'resolved', label: 'Recovered' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-rose-100 text-rose-800">
              <FileText className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lost Inquiries
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Active Lost Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Belongings reported lost by campus community members. Found one? Submit a found report or match with your photo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/report-lost">
            <Button variant="danger" size="sm" className="font-semibold gap-1.5 shadow-sm">
              <Search className="h-4 w-4" />
              <span>Report Lost Item</span>
            </Button>
          </Link>
          <Link to="/report-found">
            <Button variant="primary" size="sm" className="font-semibold gap-1.5 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              <span>Report Found Item</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <ItemFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        statusOptions={statusOptions}
      />

      {/* Grid of Lost Reports */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center space-y-4">
          <Search className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-navy-900">No lost reports match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your filters or search keywords to view all lost items.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} type="lost" />
          ))}
        </div>
      )}
    </div>
  );
};
