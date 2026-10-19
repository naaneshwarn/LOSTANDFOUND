import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { contactService } from '../services/contactService';
import { FoundItem, LostItem } from '../types/item';
import { formatDate, formatCurrency } from '../lib/utils';
import { StatusBadge } from '../components/items/StatusBadge';
import { ContactRequestModal } from '../components/messaging/ContactRequestModal';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Tag,
  Share2,
  Clock,
  Layers,
} from 'lucide-react';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { foundItems, lostItems } = useItems();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [item, setItem] = useState<FoundItem | LostItem | null>(null);
  const [itemType, setItemType] = useState<'found' | 'lost'>('found');
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const found = foundItems.find((f) => f.id === id);
    if (found) {
      setItem(found);
      setItemType('found');
      return;
    }
    const lost = lostItems.find((l) => l.id === id);
    if (lost) {
      setItem(lost);
      setItemType('lost');
      return;
    }
  }, [id, foundItems, lostItems]);

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy-900">Item Listing Not Found</h2>
        <p className="text-xs text-slate-500">The requested item record was not found.</p>
        <Link to="/found-items">
          <Button variant="primary" size="sm">
            Browse Discovered Items
          </Button>
        </Link>
      </div>
    );
  }

  const isLost = itemType === 'lost';
  const lostItem = isLost ? (item as LostItem) : null;
  const foundItem = !isLost ? (item as FoundItem) : null;

  const dateStr = isLost ? lostItem!.dateLost : foundItem!.dateFound;
  const locationStr = isLost ? lostItem!.locationLost : foundItem!.locationFound;

  const handleClaimSubmit = async (message: string) => {
    if (!user) {
      showToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in or select a demo persona to request contact.',
      });
      return;
    }

    await contactService.createContactRequest({
      foundItemId: item.id,
      requesterId: user.id,
      recipientId: foundItem?.finderId || 'finder_id',
      requesterName: user.fullName,
      recipientName: foundItem?.finderName,
      itemTitle: item.title,
      initialMessage: message,
    });

    showToast({
      type: 'success',
      title: 'Contact Request Dispatched',
      message: 'The finder has been notified. Check your inquiries tab to follow up.',
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast({
      type: 'info',
      title: 'Link Copied',
      message: 'Listing URL copied to clipboard.',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyLink}
          className="text-xs gap-1.5"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share Listing</span>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Photograph */}
        <div className="md:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={isLost ? 'danger' : 'navy'} className="text-xs backdrop-blur-md">
                {isLost ? 'LOST REPORT' : 'FOUND ITEM'}
              </Badge>
              <StatusBadge status={item.status} type={itemType} />
            </div>

            {isLost && lostItem?.rewardAmount && lostItem.rewardAmount > 0 && (
              <div className="absolute bottom-4 left-4 bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                <span>{formatCurrency(lostItem.rewardAmount)} Reward Offered</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Specifications & Action */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                {item.category}
              </Badge>
              {item.brand && (
                <Badge variant="secondary" className="text-xs uppercase">
                  {item.brand}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight leading-tight">
              {item.title}
            </h1>

            <p className="text-xs text-slate-500 flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{locationStr}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatDate(dateStr)}</span>
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Description & Identified Characteristics
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {item.description}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Color</span>
                <span className="font-semibold text-slate-800">{item.color || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Identifying Marks</span>
                <span className="font-semibold text-slate-800">{item.identifyingMarks || 'None noted'}</span>
              </div>
            </div>
          </div>

          {/* Privacy & Safe Recovery Callout */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>Safe Handover Guarantee</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Direct contact details are shielded. Messages and ownership verification occur through our authenticated platform.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {isLost ? (
              <Link to={`/matches/${item.id}`} className="block">
                <Button size="lg" variant="primary" className="w-full justify-center gap-2 font-bold shadow-md">
                  <Sparkles className="h-5 w-5" />
                  <span>Scan AI Matches Against Discovered Belongings</span>
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                variant="primary"
                onClick={() => setIsContactModalOpen(true)}
                className="w-full justify-center gap-2 font-bold shadow-md"
              >
                <MessageSquare className="h-5 w-5" />
                <span>This is My Item! (Request Contact)</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {isContactModalOpen && foundItem && (
        <ContactRequestModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          foundItem={foundItem}
          onSubmit={handleClaimSubmit}
        />
      )}
    </div>
  );
};
