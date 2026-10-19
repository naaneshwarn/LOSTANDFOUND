import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Cpu, Lock, Code2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                <Search className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-base text-navy-900 tracking-tight">
                LOSTANDFOUND AI
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Smart lost and found platform powered by multimodal neural image embeddings, cosine similarity search, and privacy-preserving recovery workflows.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              <span>for College & Campus Communities</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/found-items" className="hover:text-brand-600 transition-colors">
                  Browse Found Items
                </Link>
              </li>
              <li>
                <Link to="/lost-items" className="hover:text-brand-600 transition-colors">
                  Browse Lost Reports
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-brand-600 transition-colors">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-brand-600 transition-colors">
                  Report a Found Belonging
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-600 transition-colors">
                  My Dashboard & Activity
                </Link>
              </li>
            </ul>
          </div>

          {/* AI & Security Principles */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900 mb-3">
              AI & Architecture
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-500">
                <Cpu className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                <span>512-Dim Normalized Vectors</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <Shield className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                <span>Multi-Signal Ranking Engine</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <Lock className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                <span>PostgreSQL Row Level Security</span>
              </li>
              <li>
                <Link to="/setup" className="hover:text-brand-600 transition-colors font-medium text-brand-600">
                  Setup Guide & API Docs →
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy Disclaimer */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900 mb-3">
              Ethics & Privacy Guard
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Visual similarity candidates are surfaced mathematically based on feature vectors. Candidates are not confirmed identities. Personal phone numbers, home addresses, and private student records are never exposed publicly.
            </p>
            <div className="mt-3">
              <a
                href="https://github.com/naaneshwarn/LOSTANDFOUND.git"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>naaneshwarn/LOSTANDFOUND</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} LOSTANDFOUND AI. All rights reserved.</p>
          <p>Built with React, TypeScript, Tailwind CSS & Supabase.</p>
        </div>
      </div>
    </footer>
  );
};
