import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getActiveEmbeddingProvider } from '../../services/ai';
import { Sparkles, Info, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  const { isDemoMode, activePersona } = useAuth();
  const provider = getActiveEmbeddingProvider();

  // If live production mode is active and not using demo persona
  if (isSupabaseConfigured && !provider.isDemo && !activePersona) {
    return (
      <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-200" />
          <span>
            <strong>Production Mode Active:</strong> Connected to Supabase PostgreSQL & {provider.name}.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs px-4 py-2 font-medium border-b border-indigo-700/50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="flex items-center gap-1.5 font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Demo Mode
          </span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="text-slate-200 hidden sm:inline">
            Using deterministic high-dimensional visual feature vectors. Simulated matching is strictly distinguished from live AI inference.
          </span>
          {activePersona && (
            <span className="bg-indigo-800/80 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-600 text-[11px] ml-1">
              Active Persona: {activePersona.fullName} ({activePersona.role})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/setup"
            className="inline-flex items-center gap-1 text-amber-300 hover:text-white font-semibold transition-colors underline decoration-amber-400/40 underline-offset-2"
          >
            <span>Setup Guide & Connect API</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
