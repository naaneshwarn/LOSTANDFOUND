import React from 'react';
import { LostItemStatus, FoundItemStatus } from '../../types/item';
import { Badge } from '../ui/Badge';
import { Clock, CheckCircle2, Search, MessageSquare, Archive, ShieldCheck } from 'lucide-react';

export const StatusBadge: React.FC<{
  status: LostItemStatus | FoundItemStatus | string;
  type?: 'lost' | 'found';
}> = ({ status }) => {
  switch (status) {
    case 'open':
      return (
        <Badge variant="warning" className="gap-1">
          <Search className="h-3 w-3 text-amber-600" />
          <span>Searching</span>
        </Badge>
      );
    case 'match_found':
      return (
        <Badge variant="purple" className="gap-1 animate-pulse-subtle">
          <Search className="h-3 w-3 text-purple-600" />
          <span>Match Identified</span>
        </Badge>
      );
    case 'contact_requested':
      return (
        <Badge variant="default" className="gap-1">
          <MessageSquare className="h-3 w-3 text-brand-600" />
          <span>Contact Requested</span>
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          <span>Recovered</span>
        </Badge>
      );
    case 'closed':
      return (
        <Badge variant="secondary" className="gap-1">
          <Archive className="h-3 w-3 text-slate-500" />
          <span>Closed</span>
        </Badge>
      );
    case 'available':
      return (
        <Badge variant="success" className="gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>Available to Claim</span>
        </Badge>
      );
    case 'claimed':
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3 text-amber-600" />
          <span>Claim Pending</span>
        </Badge>
      );
    case 'handed_over':
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3 text-slate-500" />
          <span>Handed Over</span>
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
