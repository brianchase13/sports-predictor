'use client';

import { useState } from 'react';
import { Share2, Check, Link2, Twitter, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
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

export function ShareButton({
  url,
  title = 'Check out this prediction!',
  text = "I found this sports prediction interesting. What do you think?",
  size = 'md',
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        // Haptic feedback on success
        if (navigator.vibrate) {
          navigator.vibrate([10, 50, 10]);
        }
      } catch (error) {
        // User cancelled or error - silently fail
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleTwitterShare = () => {
    const tweetText = encodeURIComponent(`${title}\n\n${text}`);
    const tweetUrl = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`${title}\n\n${text}\n\n${shareUrl}`);
    window.open(
      `https://wa.me/?text=${message}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // Check if native share is available
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  // Simple share button for mobile with native share
  if (hasNativeShare) {
    return (
      <button
        type="button"
        onClick={handleNativeShare}
        className={cn(
          'rounded-full transition-all duration-200 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          buttonSizes[size],
          className
        )}
        aria-label="Share prediction"
      >
        <Share2 className={cn(sizes[size], 'text-muted-foreground hover:text-foreground')} />
      </button>
    );
  }

  // Dropdown menu for desktop
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-full transition-all duration-200 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            buttonSizes[size],
            className
          )}
          aria-label="Share prediction"
        >
          <Share2 className={cn(sizes[size], 'text-muted-foreground hover:text-foreground')} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4 mr-2" />
              Copy link
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppShare} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2" />
          Share on WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
