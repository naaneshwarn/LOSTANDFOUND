import React, { useState } from 'react';
import { LostItem } from '../../types/item';
import { MatchCandidate, UserFeedbackStatus } from '../../types/matching';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/utils';
import {
  Check,
  X,
  MessageSquare,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ZoomIn,
} from 'lucide-react';

export interface ImageComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lostItem: LostItem;
  candidate: MatchCandidate;
  onFeedback: (feedback: UserFeedbackStatus) => void;
  onRequestContact: () => void;
}

export const ImageComparisonModal: React.FC<ImageComparisonModalProps> = ({
  isOpen,
  onClose,
  lostItem,
  candidate,
  onFeedback,
  onRequestContact,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const foundItem = candidate.foundItem;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Visual Comparison & Feature Inspection"
      description="Compare your reported lost photograph directly against the found item image."
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Similarity Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
              {candidate.similarityPercentage}%
            </div>
            <div>
              <p className="text-xs font-bold text-navy-900">
                Composite Match Confidence
              </p>
              <p className="text-[11px] text-slate-500">
                Visual Cosine Score: {(candidate.similarityScore * 100).toFixed(1)}% | Method: {candidate.matchingMethod}
              </p>
            </div>
          </div>

          {/* Zoom Controller */}
          <div className="flex items-center gap-2 text-xs">
            <ZoomIn className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500">Zoom:</span>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-24 accent-brand-600"
            />
            <span className="font-mono text-slate-700 w-8">{zoomLevel.toFixed(1)}x</span>
          </div>
        </div>

        {/* Side-by-Side Photographs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lost Item Photo (Reference) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                Your Lost Item (Query)
              </span>
              <span className="text-xs text-slate-500">{lostItem.title}</span>
            </div>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
              <img
                src={lostItem.imageUrl}
                alt={lostItem.title}
                style={{ transform: `scale(${zoomLevel})` }}
                className="h-full w-full object-cover transition-transform duration-200"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1 text-slate-600 border border-slate-100">
              <p><strong>Reported Category:</strong> {lostItem.category}</p>
              <p><strong>Reported Color:</strong> {lostItem.color || 'Not specified'}</p>
              <p><strong>Brand:</strong> {lostItem.brand || 'Unbranded / Unknown'}</p>
              <p><strong>Marks:</strong> {lostItem.identifyingMarks || 'None noted'}</p>
            </div>
          </div>

          {/* Found Item Photo (Candidate) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Discovered Item (Candidate)
              </span>
              <span className="text-xs text-slate-500">{foundItem.title}</span>
            </div>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
              <img
                src={foundItem.imageUrl}
                alt={foundItem.title}
                style={{ transform: `scale(${zoomLevel})` }}
                className="h-full w-full object-cover transition-transform duration-200"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1 text-slate-600 border border-slate-100">
              <p><strong>Found Category:</strong> {foundItem.category}</p>
              <p><strong>Observed Color:</strong> {foundItem.color || 'Not specified'}</p>
              <p><strong>Brand:</strong> {foundItem.brand || 'Unbranded'}</p>
              <p><strong>Found At:</strong> {foundItem.locationFound}</p>
            </div>
          </div>
        </div>

        {/* Verified Shared Visual & Metadata Attributes */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <span>Multi-Signal Alignment Breakdown</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {candidate.explanation}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {candidate.sharedAttributes.map((attr, idx) => (
              <Badge key={idx} variant="default" className="text-[11px] bg-white">
                {attr}
              </Badge>
            ))}
          </div>
        </div>

        {/* Feedback & Action Controls */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Provide Feedback:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFeedback('not_a_match')}
              className="text-xs text-slate-600 hover:text-rose-600 hover:border-rose-200 gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Not a Match</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onFeedback('potential_match')}
              className="text-xs gap-1"
            >
              <Check className="h-3.5 w-3.5 text-brand-600" />
              <span>Potential Match</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                onClose();
                onRequestContact();
              }}
              className="gap-1.5 font-bold shadow-md"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Request Contact with Finder</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
