'use client';

import { useEffect, useState, useCallback } from 'react';
import { Prediction, Sport } from '@/lib/types';
import { SportSelector } from '@/components/SportSelector';
import { PredictionCard } from '@/components/PredictionCard';
import { PredictionCardSkeletonGrid } from '@/components/skeletons/PredictionCardSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { useDashboard } from '@/components/DashboardLayout';
import { toast } from '@/components/ui/sonner';

export default function Home() {
  const { selectedSport: sidebarSport, setSelectedSport: setSidebarSport } = useDashboard();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingGame, setAnalyzingGame] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Convert null to 'all' for the sport selector
  const selectedSport: Sport | 'all' = sidebarSport ?? 'all';

  const setSelectedSport = (sport: Sport | 'all') => {
    setSidebarSport(sport === 'all' ? null : sport);
  };

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sportParam = selectedSport === 'all' ? '' : `?sport=${selectedSport}`;
      const response = await fetch(`/api/predictions${sportParam}`);

      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load predictions';
      setError(message);
      toast.error('Error loading predictions', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedSport]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const handleAnalyze = async (gameId: string) => {
    setAnalyzingGame(gameId);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze game');
      }

      const data = await response.json();

      if (data.prediction) {
        // Update the prediction in the list
        setPredictions((prev) =>
          prev.map((p) =>
            p.gameId === gameId ? { ...p, ...data.prediction } : p
          )
        );
        setSelectedPrediction(data.prediction);
        setDialogOpen(true);

        toast.success('Analysis complete', {
          description: 'AI insights are ready to view',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze game';
      toast.error('Analysis failed', {
        description: message,
        action: {
          label: 'Retry',
          onClick: () => handleAnalyze(gameId),
        },
      });
    } finally {
      setAnalyzingGame(null);
    }
  };

  const highConfidencePicks = predictions.filter((p) => p.confidence >= 70);
  const regularPicks = predictions.filter((p) => p.confidence < 70);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Today&apos;s Predictions</h1>
          <p className="text-muted-foreground">
            AI-powered predictions for upcoming games across all major sports
          </p>
        </div>
        <Button onClick={fetchPredictions} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Sport Filter */}
      <SportSelector selectedSport={selectedSport} onSelect={setSelectedSport} />

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <PredictionCardSkeletonGrid count={8} />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <ErrorState
          title="Couldn't load predictions"
          message={error}
          onRetry={fetchPredictions}
        />
      )}

      {/* High Confidence Picks */}
      {!loading && !error && highConfidencePicks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-semibold">High Confidence Picks</h2>
            <span className="text-sm text-muted-foreground">
              ({highConfidencePicks.length})
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {highConfidencePicks.map((prediction, index) => (
              <div
                key={prediction.id}
                className={`animate-stagger stagger-${Math.min(index + 1, 8)}`}
              >
                <PredictionCard
                  prediction={prediction}
                  onAnalyze={() => handleAnalyze(prediction.gameId)}
                  isAnalyzing={analyzingGame === prediction.gameId}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Predictions */}
      {!loading && !error && regularPicks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">All Games</h2>
            <span className="text-sm text-muted-foreground">
              ({regularPicks.length})
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {regularPicks.map((prediction, index) => (
              <div
                key={prediction.id}
                className={`animate-stagger stagger-${Math.min(index + 1, 8)}`}
              >
                <PredictionCard
                  prediction={prediction}
                  onAnalyze={() => handleAnalyze(prediction.gameId)}
                  isAnalyzing={analyzingGame === prediction.gameId}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && predictions.length === 0 && (
        <ErrorState
          variant="empty"
          title="No games scheduled"
          message="There are no games scheduled for the selected sport at this time."
          onRetry={fetchPredictions}
          retryLabel="Refresh"
        />
      )}

      {/* Analysis Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Analysis
            </DialogTitle>
          </DialogHeader>
          {selectedPrediction && (
            <PredictionCard
              prediction={selectedPrediction}
              defaultExpanded
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
