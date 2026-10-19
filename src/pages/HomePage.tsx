import React from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import { LiveMatchingSimulator } from '../components/matching/LiveMatchingSimulator';
import { ItemCard } from '../components/items/ItemCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Search,
  PlusCircle,
  Sparkles,
  Shield,
  ArrowRight,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Compass,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { foundItems, lostItems } = useItems();

  const recentFound = foundItems.slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),theme(colors.slate.50))] opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-brand-700 text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>Next-Gen Visual Computer Vision & Cosine Similarity</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-navy-900 max-w-4xl mx-auto leading-[1.15]">
            Lost something?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              Let AI help you find it.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload a photo, discover visually similar found items, and reconnect with what matters.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link to="/report-lost">
              <Button size="lg" variant="primary" className="font-bold gap-2 text-base shadow-lg shadow-brand-500/20 px-7">
                <Search className="h-5 w-5" />
                <span>Find My Item</span>
              </Button>
            </Link>

            <Link to="/report-found">
              <Button size="lg" variant="secondary" className="font-semibold gap-2 text-base px-6">
                <PlusCircle className="h-5 w-5 text-slate-600" />
                <span>Report a Found Item</span>
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200/60 mt-10 text-left">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-2xl font-extrabold text-navy-900">{foundItems.length}</p>
              <p className="text-xs text-slate-500 font-medium">Found Items Indexed</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-2xl font-extrabold text-brand-600">{lostItems.length}</p>
              <p className="text-xs text-slate-500 font-medium">Active Lost Reports</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-2xl font-extrabold text-emerald-600">94.8%</p>
              <p className="text-xs text-slate-500 font-medium">AI Cosine Precision</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-2xl font-extrabold text-purple-600">100%</p>
              <p className="text-xs text-slate-500 font-medium">Privacy Preserved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visual AI Simulator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LiveMatchingSimulator />
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="default" className="text-xs">
            How It Works
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            Intelligent Recovery in Three Simple Steps
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Traditional lost-and-found boards rely on vague descriptions. Our system pairs visual neural embeddings with multi-signal campus context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-3 relative">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 text-brand-600 font-bold flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-base text-navy-900">Snap or Upload a Photo</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a snapshot of your lost belonging or pick from our high-resolution presets. The vision engine extracts a 512-dimension normalized feature vector representing shape, color, and texture.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-3 relative">
            <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 font-bold flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-base text-navy-900">Cosine Similarity Search</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Candidate items in the database are ranked via mathematical vector dot product, combined with category, location proximity, and temporal decay weighting.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-3 relative">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-base text-navy-900">Safe In-App Recovery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect candidate matches side-by-side. Initiate safe in-app verification without exposing personal phone numbers or email addresses to strangers.
            </p>
          </div>
        </div>
      </section>

      {/* Recently Discovered Belongings Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900">
              Recently Discovered Belongings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Items found across campus awaiting their rightful owners
            </p>
          </div>
          <Link to="/found-items">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <span>View All ({foundItems.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentFound.map((item) => (
            <ItemCard key={item.id} item={item} type="found" />
          ))}
        </div>
      </section>

      {/* Safety & Trust Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-navy-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-600/20 to-transparent pointer-events-none" />

          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-800 text-indigo-300 text-xs font-semibold border border-indigo-700/50">
              <Shield className="h-3.5 w-3.5" />
              <span>Campus Security & Data Privacy Standards</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Built for campus integrity and student privacy.
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              Every found item listing undergoes moderation. High-value belongings like wallets and government IDs are protected with redacted identifying details, and handovers can be coordinated securely through campus security desks.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/report-lost">
                <Button variant="primary" className="font-bold">
                  Report a Lost Item
                </Button>
              </Link>
              <Link to="/setup">
                <Button variant="secondary" className="bg-navy-800 border-navy-700 text-white hover:bg-navy-700">
                  Read Architecture & AI Docs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
