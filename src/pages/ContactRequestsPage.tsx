import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/contactService';
import { ContactRequest } from '../types/auth';
import { formatDate } from '../lib/utils';
import { MessageSquare, ArrowRight, Shield, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const ContactRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadRequests = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const list = await contactService.getContactRequests(user.id);
      setRequests(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-blue-100 text-brand-700">
            <MessageSquare className="h-4 w-4" />
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Safe Inquiries
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Recovery Contact Inquiries
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Secure, authenticated conversations between finders and owners.
        </p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
            <MessageSquare className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-navy-900">No contact requests yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you submit a claim on a found item or someone inquires about an item you reported, inquiries appear here.
            </p>
            <Link to="/found-items">
              <Button size="sm" variant="outline" className="text-xs">
                Browse Found Items
              </Button>
            </Link>
          </div>
        ) : (
          requests.map((req) => {
            const isRequester = user?.id === req.requesterId;
            return (
              <div
                key={req.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-navy-900 truncate">
                      {req.itemTitle || 'Item In-App Recovery'}
                    </span>
                    <Badge
                      variant={
                        req.status === 'accepted'
                          ? 'success'
                          : req.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                      className="text-[10px]"
                    >
                      {req.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                    "{req.message}"
                  </p>

                  <p className="text-[11px] text-slate-400">
                    {isRequester ? `To Finder: ${req.recipientName || 'Good Samaritan'}` : `From Claimant: ${req.requesterName || 'Student'}`} • {formatDate(req.createdAt)}
                  </p>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <Link to={`/messages/${req.id}`} className="block">
                    <Button size="sm" variant="primary" className="w-full sm:w-auto gap-1 text-xs font-semibold">
                      <span>Open Conversation</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
