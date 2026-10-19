import React from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { getActiveEmbeddingProvider } from '../services/ai';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Database,
  Shield,
  Key,
  Terminal,
  ExternalLink,
  Copy,
  Sparkles,
} from 'lucide-react';

export const SetupGuidePage: React.FC = () => {
  const provider = getActiveEmbeddingProvider();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" className="text-xs">
            <Cpu className="h-3 w-3" />
            <span>Architecture & Configuration Guide</span>
          </Badge>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          System Status & AI Integration Guide
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed technical documentation for connecting Supabase PostgreSQL, pgvector, and Gemini Multimodal AI.
        </p>
      </div>

      {/* Live Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Supabase Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-brand-600" />
              <h3 className="font-bold text-sm text-navy-900">Supabase Database & Auth</h3>
            </div>
            {isSupabaseConfigured ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Connected</span>
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Demo Storage Active</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isSupabaseConfigured
              ? 'Connected to live Supabase project. Row Level Security and PostgreSQL persistence are active.'
              : 'Running on local browser-persistent demo storage. Seed records for campus items are fully operational.'}
          </p>
        </div>

        {/* AI Model Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-sm text-navy-900">AI Embedding Engine</h3>
            </div>
            {provider.isDemo ? (
              <Badge variant="warning" className="gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Deterministic Demo</span>
              </Badge>
            ) : (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>{provider.name}</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Active Provider: <strong>{provider.name}</strong>. Uses normalized 512-dimension vector representations and mathematically rigorous cosine similarity.
          </p>
        </div>
      </div>

      {/* Step-by-Step Setup Guide */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
          <Key className="h-5 w-5 text-brand-600" />
          <span>Step-by-Step Production Setup</span>
        </h2>

        {/* Step 1 */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-sm text-navy-900">
              Create Supabase Project & Run Database Migrations
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-8">
            Create a free PostgreSQL database on{' '}
            <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-brand-600 font-bold underline">
              supabase.com
            </a>
            . Navigate to <strong>SQL Editor</strong> and execute the provided migration file:
          </p>

          <div className="pl-8">
            <div className="rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto relative group">
              <button
                onClick={() => copyToClipboard('supabase/migrations/20261019000000_init_lost_and_found.sql')}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Copy Path"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <code>supabase/migrations/20261019000000_init_lost_and_found.sql</code>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              This migration script configures 9 tables, creates strict Row Level Security policies, indexes for spatial/temporal querying, and sets up the <code>match_found_items</code> stored function.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-sm text-navy-900">
              Configure Storage Bucket
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-8">
            In your Supabase dashboard, navigate to <strong>Storage</strong> and create a public bucket named:
          </p>
          <div className="pl-8">
            <code className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-brand-700">
              item-photos
            </code>
            <p className="text-[11px] text-slate-500 mt-1">
              Ensure the public toggle is enabled so photographs of lost and found belongings can be loaded by authenticated users.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-sm text-navy-900">
              Configure Environment Variables (.env)
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-8">
            Copy <code>.env.example</code> to <code>.env</code> in the project root and fill in your credentials:
          </p>

          <div className="pl-8">
            <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_AI_PROVIDER=gemini # or 'edge-function' or 'demo'
VITE_GEMINI_API_KEY=AIzaSy...`}
            </pre>
          </div>
        </div>

        {/* Step 4 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-sm text-navy-900">
              Deploy Supabase Edge Functions (Optional for Server-side AI Matching)
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-8">
            To keep API keys securely on the server side, deploy the included Edge Functions:
          </p>

          <div className="pl-8">
            <pre className="rounded-xl bg-slate-900 text-slate-100 p-3 font-mono text-xs overflow-x-auto">
              npx supabase functions deploy embed-image
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
