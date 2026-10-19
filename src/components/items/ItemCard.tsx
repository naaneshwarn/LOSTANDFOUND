import React from 'react';
import { Link } from 'react-router-dom';
import { LostItem, FoundItem } from '../../types/item';
import { formatDate, formatCurrency } from '../../lib/utils';
import { MapPin, Calendar, Tag, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface ItemCardProps {
  item: LostItem | FoundItem;
  type: 'lost' | 'found';
  onContactClick?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, type, onContactClick }) => {
  const isLost = type === 'lost';
  const lostItem = isLost ? (item as LostItem) : null;
  const foundItem = !isLost ? (item as FoundItem) : null;

  const dateStr = isLost ? lostItem!.dateLost : foundItem!.dateFound;
  const locationStr = isLost ? lostItem!.locationLost : foundItem!.locationFound;

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col h-full">
      {/* Photograph Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <Badge variant="navy" className="shadow-md text-[11px] font-semibold backdrop-blur-md bg-slate-900/80">
            {item.category}
          </Badge>
          <StatusBadge status={item.status} type={type} />
        </div>

        {/* Reward Pill (for lost items) */}
        {isLost && lostItem?.rewardAmount && lostItem.rewardAmount > 0 && (
          <div className="absolute bottom-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>{formatCurrency(lostItem.rewardAmount)} Reward</span>
          </div>
        )}

        {/* Found Verification Badge */}
        {!isLost && foundItem?.isApproved && (
          <div className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span>Verified Listing</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-bold text-base text-navy-900 leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
              {item.title}
            </h3>
            {item.brand && (
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                {item.brand}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
            {item.description}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{locationStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{isLost ? `Lost on ${formatDate(dateStr)}` : `Found on ${formatDate(dateStr)}`}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
          {isLost ? (
            <Link to={`/matches/${item.id}`} className="w-full">
              <Button size="sm" variant="primary" className="w-full justify-center gap-1.5 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Match Results</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <Link to={`/items/${item.id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full justify-center text-xs">
                  Details
                </Button>
              </Link>
              {onContactClick && item.status === 'available' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={onContactClick}
                  className="flex-1 justify-center text-xs font-semibold"
                >
                  Claim Item
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
