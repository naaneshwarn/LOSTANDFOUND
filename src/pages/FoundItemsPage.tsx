import React, { useState } from 'react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { contactService } from '../services/contactService';
import { FoundItem, ItemCategory } from '../types/item';
import { ItemCard } from '../components/items/ItemCard';
import { ItemFilters, FilterState } from '../components/items/ItemFilters';
import { ContactRequestModal } from '../components/messaging/ContactRequestModal';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Compass, PlusCircle, Search } from 'lucide-react';

export const FoundItemsPage: React.FC = () => {
  const { foundItems, isLoading } = useItems();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: '',
    status: '',
  });

  const [selectedFoundItem, setSelectedFoundItem] = useState<FoundItem | null>(null);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({ searchQuery: '', category: '', status: '' });
  };

  const handleClaimContact = async (message: string) => {
    if (!selectedFoundItem || !user) {
      showToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in or select a demo persona to submit a claim request.',
      });
      return;
    }

    await contactService.createContactRequest({
      foundItemId: selectedFoundItem.id,
      requesterId: user.id,
      recipientId: selectedFoundItem.finderId,
      requesterName: user.fullName,
      recipientName: selectedFoundItem.finderName,
      itemTitle: selectedFoundItem.title,
      initialMessage: message,
    });

    showToast({
      type: 'success',
      title: 'Claim Request Submitted',
      message: 'Your inquiry has been relayed to the finder securely.',
    });
  };

  // Filter items
  const filteredItems = foundItems.filter((item) => {
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
        item.locationFound.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.color && item.color.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const statusOptions = [
    { value: 'available', label: 'Available to Claim' },
    { value: 'claimed', label: 'Claim In Progress' },
    { value: 'handed_over', label: 'Handed Over' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <Compass className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Campus Repository
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Browse Discovered Items
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search or filter items recovered across campus. Found your belonging? Submit a claim to connect with the finder.
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
              <span>I Found an Item</span>
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

      {/* Grid of Items */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center space-y-4">
          <Search className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-navy-900">No found items match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your category filter, clearing your search query, or report a lost item to get automated notifications.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              type="found"
              onContactClick={() => setSelectedFoundItem(item)}
            />
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {selectedFoundItem && (
        <ContactRequestModal
          isOpen={Boolean(selectedFoundItem)}
          onClose={() => setSelectedFoundItem(null)}
          foundItem={selectedFoundItem}
          onSubmit={handleClaimContact}
        />
      )}
    </div>
  );
};
