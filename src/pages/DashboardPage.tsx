import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';
import { contactService } from '../services/contactService';
import { ContactRequest } from '../types/auth';
import { ItemCard } from '../components/items/ItemCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Toast';
import {
  FileText,
  PlusCircle,
  Search,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { lostItems, foundItems } = useItems();
  const [activeTab, setActiveTab] = useState<string>('lost');
  const [requests, setRequests] = useState<ContactRequest[]>([]);

  useEffect(() => {
    if (user) {
      contactService.getContactRequests(user.id).then(setRequests);
    }
  }, [user]);

  // User's own items
  const myLostItems = lostItems.filter((i) => i.userId === user?.id);
  const myFoundItems = foundItems.filter((i) => i.finderId === user?.id);

  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const recoveredCount = lostItems.filter((i) => i.status === 'resolved').length;
  const matchesCount = lostItems.filter((i) => i.status === 'match_found').length;

  const tabs = [
    { id: 'lost', label: 'My Lost Reports', count: myLostItems.length, icon: <FileText className="h-4 w-4" /> },
    { id: 'found', label: 'My Discovered Listings', count: myFoundItems.length, icon: <PlusCircle className="h-4 w-4" /> },
    { id: 'requests', label: 'Inquiries & Contact', count: requests.length, icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Welcome back, {user ? user.fullName : 'Guest'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your lost belongings, discovered items, AI similarity matches, and recovery handovers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/report-lost">
            <Button size="sm" variant="danger" className="gap-1.5 font-bold shadow-sm">
              <Search className="h-3.5 w-3.5" />
              <span>Report Lost</span>
            </Button>
          </Link>
          <Link to="/report-found">
            <Button size="sm" variant="primary" className="gap-1.5 font-bold shadow-sm">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Report Found</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Lost Reports</span>
            <FileText className="h-4 w-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{myLostItems.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Your submitted reports</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Found Items</span>
            <PlusCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{myFoundItems.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Reported by you</p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-bold text-purple-900">AI Matches</span>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{matchesCount}</p>
          <p className="text-[10px] text-purple-600/80 mt-0.5">Candidate items found</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-bold text-amber-900">Pending Inquiries</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700">{pendingRequests}</p>
          <p className="text-[10px] text-amber-600/80 mt-0.5">Awaiting reply</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-xs font-bold text-emerald-900">Recovered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{recoveredCount}</p>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">Successful returns</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <div>
        {activeTab === 'lost' && (
          <div className="space-y-4">
            {myLostItems.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
                <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-navy-900">No lost item reports yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Report any misplaced item to let our computer vision engine continuously monitor new discoveries.
                </p>
                <Link to="/report-lost">
                  <Button size="sm" variant="danger" className="text-xs font-bold">
                    Report a Lost Item
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myLostItems.map((item) => (
                  <ItemCard key={item.id} item={item} type="lost" />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'found' && (
          <div className="space-y-4">
            {myFoundItems.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
                <PlusCircle className="h-8 w-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-navy-900">No discovered items reported by you</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Found someone's keys, water bottle, or backpack? Post it to help reconnect the owner.
                </p>
                <Link to="/report-found">
                  <Button size="sm" variant="primary" className="text-xs font-bold">
                    Report Found Item
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFoundItems.map((item) => (
                  <ItemCard key={item.id} item={item} type="found" />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
                <MessageSquare className="h-8 w-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-navy-900">No active recovery inquiries</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All claim messages and verification conversations will be organized here.
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-navy-900 truncate">
                      {req.itemTitle}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 italic mt-0.5">
                      "{req.message}"
                    </p>
                  </div>
                  <Link to={`/messages/${req.id}`}>
                    <Button size="sm" variant="primary" className="text-xs gap-1">
                      <span>View Thread</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
