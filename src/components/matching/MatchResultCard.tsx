import React from 'react';
import { MatchCandidate, UserFeedbackStatus } from '../../types/matching';
import { formatDate } from '../../lib/utils';
import {
  MapPin,
  Calendar,
  Sparkles,
  Eye,
  MessageSquare,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MatchScoreIndicator } from './MatchScoreIndicator';

export interface MatchResultCardProps {
  candidate: MatchCandidate;
  onCompare: () => void;
  onRequestContact: () => void;
  onFeedback: (feedback: UserFeedbackStatus) => void;
}

export const MatchResultCard: React.FC<MatchResultCardProps> = ({
  candidate,
  onCompare,
  onRequestContact,
  onFeedback,
}) => {
  const item = candidate.foundItem;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col md:flex-row gap-5 p-5">
      {/* Photograph Container */}
      <div className="relative aspect-[4/3] md:w-56 md:aspect-square shrink-0 rounded-xl overflow-hidden bg-slate-100 group">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-2.5 left-2.5">
          <Badge variant="navy" className="text-[10px] bg-slate-900/80 backdrop-blur-md">
            {item.category}
          </Badge>
        </div>

        <button
          onClick={onCompare}
          className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]"
        >
          <Eye className="h-4 w-4" />
          <span>Compare Side-by-Side</span>
        </button>
      </div>

      {/* Info & Metrics */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-navy-900 leading-snug">
                  {item.title}
                </h3>
                {item.brand && (
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {item.brand}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Score Ring / Indicator */}
            <div className="w-full sm:w-48">
              <MatchScoreIndicator scorePercentage={candidate.similarityPercentage} />
            </div>
          </div>

          {/* Location & Date */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{item.locationFound}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Found {formatDate(item.dateFound)}</span>
            </span>
          </div>

          {/* Multi-Signal Breakdown Chips */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Signals:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Visual: {candidate.signals.visual}%
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Category: {candidate.signals.category}%
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Location: {candidate.signals.location}%
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Date: {candidate.signals.date}%
            </span>
          </div>
        </div>

        {/* Action Controls & Feedback */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Candidate Feedback */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Your feedback:</span>
            <button
              onClick={() => onFeedback('not_a_match')}
              className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors ${
                candidate.userFeedback === 'not_a_match'
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <X className="h-3 w-3" />
              <span>Not a Match</span>
            </button>
            <button
              onClick={() => onFeedback('potential_match')}
              className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors ${
                candidate.userFeedback === 'potential_match'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Check className="h-3 w-3" />
              <span>Potential Match</span>
            </button>
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onCompare}
              className="text-xs gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Compare Photo</span>
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={onRequestContact}
              className="text-xs font-bold gap-1.5 shadow-sm"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Request Contact</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
