'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function AnimatedCounter({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  delay = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            // Start animation after delay
            const timeoutId = setTimeout(() => {
              const startTime = performance.now();
              const startValue = 0;
              const endValue = value;

              const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutExpo(progress);

                const currentValue = startValue + (endValue - startValue) * easedProgress;
                setDisplayValue(currentValue);

                if (progress < 1) {
                  frameRef.current = requestAnimationFrame(animate);
                }
              };

              frameRef.current = requestAnimationFrame(animate);
            }, delay);

            return () => clearTimeout(timeoutId);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration, hasAnimated, delay]);

  // Update value if it changes after initial animation
  useEffect(() => {
    if (hasAnimated) {
      const startTime = performance.now();
      const startValue = displayValue;
      const endValue = value;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration / 2), 1);
        const easedProgress = easeOutExpo(progress);

        const currentValue = startValue + (endValue - startValue) * easedProgress;
        setDisplayValue(currentValue);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, hasAnimated]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

// Convenience wrapper for percentage display
interface AnimatedPercentageProps {
  value: number;
  className?: string;
  delay?: number;
}

export function AnimatedPercentage({
  value,
  className,
  delay = 0,
}: AnimatedPercentageProps) {
  return (
    <AnimatedCounter
      value={value}
      decimals={1}
      suffix="%"
      className={className}
      delay={delay}
    />
  );
}
