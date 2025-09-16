
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
}

export function StarRating({ rating, onRatingChange, readOnly = false, size = 16 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (rate: number) => {
    if (readOnly || !onRatingChange) return;
    onRatingChange(rate);
  };

  const handleMouseEnter = (rate: number) => {
    if (readOnly) return;
    setHoverRating(rate);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            'transition-colors',
            (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
            !readOnly && 'cursor-pointer'
          )}
          onClick={() => handleRating(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  );
}
