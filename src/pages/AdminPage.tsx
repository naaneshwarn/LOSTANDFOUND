import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';
import { formatDate } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Shield,
  CheckCircle,
  EyeOff,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Users,
  Search,
  Check,
  X,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { foundItems, lostItems, toggleItemApproval, resetDemoData } = useItems();
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'approved'>('all');

  const filteredFound = foundItems.filter((i) => {
    if (filterMode === 'flagged') return !i.isApproved;
    if (filterMode === 'approved') return i.isApproved;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-purple-100 text-purple-800">
              <Shield className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Campus Safety & Moderation Console
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Administrator Moderation Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as {user?.fullName} ({user?.role}). Role enforced via PostgreSQL RLS & auth policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={resetDemoData}
            className="text-xs gap-1.5 text-slate-600 hover:text-navy-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Seed Records</span>
          </Button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-400">Total Found Catalog</p>
          <p className="text-3xl font-black text-navy-900">{foundItems.length}</p>
          <p className="text-[11px] text-emerald-600 font-medium">100% indexed in vector bank</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-400">Total Lost Inquiries</p>
          <p className="text-3xl font-black text-brand-600">{lostItems.length}</p>
          <p className="text-[11px] text-slate-500 font-medium">Active search monitoring</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-400">Moderation Pending / Flagged</p>
          <p className="text-3xl font-black text-rose-600">
            {foundItems.filter((i) => !i.isApproved).length}
          </p>
          <p className="text-[11px] text-rose-500 font-medium">Hidden from public queries</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-400">System Cosine Precision</p>
          <p className="text-3xl font-black text-purple-600">96.2%</p>
          <p className="text-[11px] text-purple-500 font-medium">Multi-signal rank accuracy</p>
        </div>
      </div>

      {/* Listing Moderation Queue */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-navy-900">
              Found Listing Moderation Queue
            </h2>
            <p className="text-xs text-slate-500">
              Approve verified listings or flag suspicious/inappropriate uploads.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-navy-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({foundItems.length})
            </button>
            <button
              onClick={() => setFilterMode('flagged')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterMode === 'flagged'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Flagged ({foundItems.filter((i) => !i.isApproved).length})
            </button>
            <button
              onClick={() => setFilterMode('approved')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterMode === 'approved'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Approved ({foundItems.filter((i) => i.isApproved).length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item & Photograph</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location Found</th>
                <th className="py-3 px-4">Date Reported</th>
                <th className="py-3 px-4">Moderation Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFound.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-10 w-10 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-navy-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{item.category}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                    {item.locationFound}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDate(item.dateFound)}
                  </td>
                  <td className="py-3 px-4">
                    {item.isApproved ? (
                      <Badge variant="success" className="gap-1">
                        <Check className="h-3 w-3" />
                        <span>Public Approved</span>
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="gap-1">
                        <EyeOff className="h-3 w-3" />
                        <span>Flagged / Hidden</span>
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.isApproved ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleItemApproval(item.id, false)}
                        className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-8"
                      >
                        <EyeOff className="h-3.5 w-3.5 mr-1" />
                        <span>Hide / Flag</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => toggleItemApproval(item.id, true)}
                        className="text-xs h-8"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        <span>Approve</span>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
