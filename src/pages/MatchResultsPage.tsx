import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { contactService } from '../services/contactService';
import { LostItem } from '../types/item';
import { MatchCandidate, RankingWeights, UserFeedbackStatus } from '../types/matching';
import { DEFAULT_RANKING_WEIGHTS } from '../lib/constants';
import { MatchResultCard } from '../components/matching/MatchResultCard';
import { RankingControls } from '../components/matching/RankingControls';
import { ImageComparisonModal } from '../components/items/ImageComparisonModal';
import { ContactRequestModal } from '../components/messaging/ContactRequestModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Sparkles,
  ArrowLeft,
  SlidersHorizontal,
  RotateCcw,
  Search,
  Filter,
  AlertCircle,
  HelpCircle,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const MatchResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { lostItems, getMatchesForLostItem } = useItems();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [lostItem, setLostItem] = useState<LostItem | null>(null);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Ranking & Filter State
  const [weights, setWeights] = useState<RankingWeights>(DEFAULT_RANKING_WEIGHTS);
  const [showRankingControls, setShowRankingControls] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'composite' | 'visual' | 'newest'>('composite');
  const [minThreshold, setMinThreshold] = useState<number>(30); // 30% min

  // Modals
  const [comparingCandidate, setComparingCandidate] = useState<MatchCandidate | null>(null);
  const [contactingCandidate, setContactingCandidate] = useState<MatchCandidate | null>(null);

  // Fetch Lost Item & Run AI Matching
  const executeMatching = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');

    try {
      const item = lostItems.find((l) => l.id === id);
      if (!item) {
        throw new Error('Lost item report not found. It may have been removed or belongs to another session.');
      }
      setLostItem(item);

      // Execute AI Matching with current weights
      const results = await getMatchesForLostItem(item.id, weights);
      setCandidates(results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [id, lostItems, weights, getMatchesForLostItem]);

  useEffect(() => {
    executeMatching();
  }, [executeMatching]);

  // Handle Candidate Feedback
  const handleFeedback = (candidateId: string, feedback: UserFeedbackStatus) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.foundItem.id === candidateId ? { ...c, userFeedback: feedback } : c
      )
    );
    showToast({
      type: 'info',
      title: 'Feedback Recorded',
      message: `Marked candidate as ${feedback.replace('_', ' ')}. This helps tune matching precision.`,
    });
  };

  // Submit Contact Request
  const handleSendContactRequest = async (message: string) => {
    if (!contactingCandidate || !user) {
      showToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in or choose a demo persona to request contact.',
      });
      return;
    }

    await contactService.createContactRequest({
      lostItemId: lostItem?.id,
      foundItemId: contactingCandidate.foundItem.id,
      requesterId: user.id,
      recipientId: contactingCandidate.foundItem.finderId,
      requesterName: user.fullName,
      recipientName: contactingCandidate.foundItem.finderName,
      itemTitle: contactingCandidate.foundItem.title,
      initialMessage: message,
    });

    handleFeedback(contactingCandidate.foundItem.id, 'contact_requested');

    showToast({
      type: 'success',
      title: 'Contact Request Sent!',
      message: 'The finder has received your inquiry. Check your Dashboard or Requests page for replies.',
    });
  };

  // Filter and Sort Candidates
  const filteredCandidates = candidates
    .filter((c) => c.similarityPercentage >= minThreshold)
    .sort((a, b) => {
      if (sortBy === 'visual') {
        return b.similarityScore - a.similarityScore;
      }
      if (sortBy === 'newest') {
        return (
          new Date(b.foundItem.dateFound).getTime() -
          new Date(a.foundItem.dateFound).getTime()
        );
      }
      return b.compositeScore - a.compositeScore;
    });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !lostItem) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-navy-900">Matching Error</h2>
        <p className="text-xs text-slate-500">{error || 'Unable to locate report.'}</p>
        <div className="pt-2">
          <Link to="/report-lost">
            <Button variant="primary" size="sm">
              Create New Report
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Navigation & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRankingControls(!showRankingControls)}
            className="text-xs gap-1.5 font-medium"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Tune Multi-Signal Weights</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={executeMatching}
            className="text-xs gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Re-scan</span>
          </Button>
        </div>
      </div>

      {/* Query Lost Item Summary Card */}
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative h-28 w-28 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
          <img
            src={lostItem.imageUrl}
            alt={lostItem.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-1 left-1">
            <Badge variant="danger" className="text-[9px] px-1.5 py-0 bg-rose-600 text-white">
              LOST
            </Badge>
          </div>
        </div>

        <div className="flex-1 space-y-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-xl font-extrabold text-navy-900">
              {lostItem.title}
            </h1>
            <Badge variant="navy" className="text-xs">
              {lostItem.category}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
            {lostItem.description}
          </p>
          <p className="text-[11px] text-slate-400">
            Last seen: {lostItem.locationLost} • Lost on {lostItem.dateLost}
          </p>
        </div>

        <div className="text-center md:text-right shrink-0 border-t md:border-t-0 md:border-l border-slate-200/80 pt-4 md:pt-0 md:pl-6">
          <p className="text-2xl font-extrabold text-brand-600">
            {filteredCandidates.length}
          </p>
          <p className="text-xs text-slate-500 font-medium">Candidate Matches</p>
        </div>
      </div>

      {/* Collapsible Multi-Signal Weight Controls */}
      {showRankingControls && (
        <RankingControls
          weights={weights}
          onChange={(newWeights) => setWeights(newWeights)}
          onReset={() => setWeights(DEFAULT_RANKING_WEIGHTS)}
        />
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700">Sort Candidates:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="composite">Overall Multi-Signal Match</option>
            <option value="visual">Pure Visual Cosine Similarity</option>
            <option value="newest">Recently Discovered First</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Min Threshold:</span>
          <select
            value={minThreshold}
            onChange={(e) => setMinThreshold(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800 bg-slate-50 focus:outline-none"
          >
            <option value="20">20% (Broadest)</option>
            <option value="30">30% (Recommended)</option>
            <option value="50">50% (Strict)</option>
            <option value="70">70% (Very High)</option>
          </select>
        </div>
      </div>

      {/* Candidate Matches List */}
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
            <Search className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-navy-900">
              No matching found items above {minThreshold}% threshold
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              We did not detect existing found items matching your photograph at this confidence level. Items are frequently reported within 24-48 hours of loss.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMinThreshold(20)}
                className="text-xs"
              >
                Lower Threshold to 20%
              </Button>
              <Link to="/found-items">
                <Button variant="secondary" size="sm" className="text-xs">
                  Browse All Found Listings
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <MatchResultCard
              key={candidate.foundItem.id}
              candidate={candidate}
              onCompare={() => setComparingCandidate(candidate)}
              onRequestContact={() => setContactingCandidate(candidate)}
              onFeedback={(feedback) =>
                handleFeedback(candidate.foundItem.id, feedback)
              }
            />
          ))
        )}
      </div>

      {/* Side-by-Side Comparison Modal */}
      {comparingCandidate && (
        <ImageComparisonModal
          isOpen={Boolean(comparingCandidate)}
          onClose={() => setComparingCandidate(null)}
          lostItem={lostItem}
          candidate={comparingCandidate}
          onFeedback={(feedback) =>
            handleFeedback(comparingCandidate.foundItem.id, feedback)
          }
          onRequestContact={() => {
            const cand = comparingCandidate;
            setComparingCandidate(null);
            setContactingCandidate(cand);
          }}
        />
      )}

      {/* Safe Contact Request Modal */}
      {contactingCandidate && (
        <ContactRequestModal
          isOpen={Boolean(contactingCandidate)}
          onClose={() => setContactingCandidate(null)}
          foundItem={contactingCandidate.foundItem}
          lostItem={lostItem}
          onSubmit={handleSendContactRequest}
        />
      )}
    </div>
  );
};
