'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const buttonSizes = {
  sm: 'p-1',
  md: 'p-1.5',
  lg: 'p-2',
};

export function FavoriteButton({
  isFavorite,
  onToggle,
  size = 'md',
  className,
}: FavoriteButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Haptic feedback on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }

    onToggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'rounded-full transition-all duration-200 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        buttonSizes[size],
        className
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={cn(
          sizes[size],
          'transition-all duration-200',
          isFavorite
            ? 'fill-amber-400 text-amber-400'
            : 'text-muted-foreground hover:text-amber-400',
          isAnimating && 'scale-125'
        )}
      />
    </button>
  );
}

// Standalone hook-connected version
import { useFavorites } from '@/hooks/use-favorites';

interface ConnectedFavoriteButtonProps {
  predictionId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onToggled?: (isFavorite: boolean) => void;
}

export function ConnectedFavoriteButton({
  predictionId,
  size = 'md',
  className,
  onToggled,
}: ConnectedFavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(predictionId);

  const handleToggle = () => {
    const newState = toggleFavorite(predictionId);
    onToggled?.(newState);
  };

  return (
    <FavoriteButton
      isFavorite={favorited}
      onToggle={handleToggle}
      size={size}
      className={className}
    />
  );
}
