import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'error' | 'empty';
  className?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try again',
  variant = 'error',
  className,
}: ErrorStateProps) {
  const isError = variant === 'error';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-16 h-16 rounded-full mb-4',
          isError ? 'bg-rose-100 dark:bg-rose-950/50' : 'bg-muted'
        )}
      >
        {isError ? (
          <AlertCircle className="h-8 w-8 text-rose-500" />
        ) : (
          <Inbox className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {title || (isError ? 'Something went wrong' : 'No results')}
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {message ||
          (isError
            ? 'We couldn\'t load the data. Please try again.'
            : 'There\'s nothing to show here yet.')}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant={isError ? 'default' : 'outline'}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
