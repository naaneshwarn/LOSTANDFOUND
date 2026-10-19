import React, { useState } from 'react';
import { SAMPLE_LOST_PRESETS, SampleReportPreset } from '../../lib/constants';
import { INITIAL_FOUND_ITEMS } from '../../services/mockData';
import { cosineSimilarity, similarityToPercentage } from '../../services/ai/similarity';
import { SEEDED_ITEM_EMBEDDINGS } from '../../services/mockData';
import { Sparkles, Scan, ArrowRight, CheckCircle2, Cpu } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

export const LiveMatchingSimulator: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<SampleReportPreset>(SAMPLE_LOST_PRESETS[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(true);

  // Compute live similarity for the selected sample against all found items
  const queryEmbedding = SEEDED_ITEM_EMBEDDINGS[
    selectedSample.id === 'sample-backpack'
      ? 'b0000001-0000-0000-0000-000000000001'
      : 'b0000002-0000-0000-0000-000000000002'
  ] || SEEDED_ITEM_EMBEDDINGS['b0000001-0000-0000-0000-000000000001'];

  const candidateRankings = INITIAL_FOUND_ITEMS.map((item) => {
    const itemEmbedding = SEEDED_ITEM_EMBEDDINGS[item.id];
    let sim = 0.2;
    if (itemEmbedding && queryEmbedding) {
      sim = cosineSimilarity(queryEmbedding, itemEmbedding);
    }
    return {
      item,
      sim,
      percentage: similarityToPercentage(sim),
    };
  })
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 3);

  const handleSimulate = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 900);
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-bold text-navy-900">
              Interactive AI Visual Match Visualizer
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test how image embeddings and cosine similarity compare a lost photograph against candidate items in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" className="text-xs">
            <Cpu className="h-3 w-3" />
            <span>Cosine Dot Product Engine</span>
          </Badge>
        </div>
      </div>

      {/* Item Selector Pills */}
      <div className="py-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Select Query Photograph:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_LOST_PRESETS.slice(0, 4).map((preset) => {
            const isSelected = selectedSample.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedSample(preset);
                  handleSimulate();
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <img
                  src={preset.imageUrl}
                  alt={preset.name}
                  className="h-10 w-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-navy-900 truncate">{preset.name}</p>
                  <p className="text-[10px] text-slate-500">{preset.category}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Matching Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
        {/* Left: Query Photograph with Neural Laser Scan Overlay */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 shadow-md relative group">
            <div className="aspect-square relative overflow-hidden">
              <img
                src={selectedSample.imageUrl}
                alt={selectedSample.name}
                className="h-full w-full object-cover"
              />

              {/* Scanning Laser Line */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan" />
              )}

              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Scan className="h-3.5 w-3.5 text-cyan-400" />
                <span>Query Photograph</span>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <p className="text-sm font-bold text-navy-900">{selectedSample.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{selectedSample.locationLost}</p>

              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">Embedding: 512 dimensions</span>
                <span className="text-brand-600 font-semibold">Normalized ||v|| = 1.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Cosine Similarity Transform Arrow */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-sm mb-2">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <span className="text-xs font-mono font-bold text-navy-900">
            S_c(u, v)
          </span>
          <span className="text-[10px] text-slate-400">Cosine Distance</span>
        </div>

        {/* Right: Ranked Candidate Matches */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Top Ranked Found Matches
            </span>
            <span className="text-xs text-slate-500">Live Database Scan</span>
          </div>

          <div className="space-y-2.5">
            {candidateRankings.map((cand, idx) => (
              <div
                key={cand.item.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  idx === 0
                    ? 'border-emerald-300 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={cand.item.imageUrl}
                    alt={cand.item.title}
                    className="h-12 w-12 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-navy-900 truncate">
                        {cand.item.title}
                      </p>
                      {idx === 0 && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {cand.item.locationFound}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded ${
                      idx === 0
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cand.percentage}%
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Similarity</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link to="/report-lost">
              <Button size="sm" variant="primary" className="w-full justify-center gap-1.5 text-xs font-semibold">
                <span>Try Live Matching With Your Own Photo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
