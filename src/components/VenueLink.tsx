'use client';

import { ExternalLink, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Sport } from '@/lib/types';
import { getVenueInfo, getGoogleMapsUrl, getSportIcon } from '@/lib/venues';
import { useState } from 'react';

interface VenueLinkProps {
  venueName: string;
  sport: Sport;
  showImage?: boolean;
  compact?: boolean;
}

export function VenueLink({
  venueName,
  sport,
  showImage = true,
  compact = false,
}: VenueLinkProps) {
  const venueInfo = getVenueInfo(venueName);
  const mapsUrl = venueInfo ? getGoogleMapsUrl(venueInfo) : getGoogleMapsUrl(venueName);
  const [imageError, setImageError] = useState(false);

  if (compact) {
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
      >
        <MapPin className="h-3 w-3" />
        <span className="group-hover:underline">{venueName}</span>
        <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-3 p-3">
        {/* Venue Image or Sport Icon */}
        {showImage && (
          <div className="relative w-16 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {venueInfo?.imageUrl && !imageError ? (
              <Image
                src={venueInfo.imageUrl}
                alt={venueName}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                unoptimized // Wikipedia URLs are external
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-muted to-muted/50">
                {getSportIcon(sport)}
              </div>
            )}
          </div>
        )}

        {/* Venue Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {venueInfo?.name || venueName}
            </span>
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          {venueInfo && (venueInfo.city || venueInfo.capacity) && (
            <div className="flex items-center gap-2 mt-0.5">
              {venueInfo.city && venueInfo.state && (
                <span className="text-xs text-muted-foreground">
                  {venueInfo.city}, {venueInfo.state}
                </span>
              )}
              {venueInfo.capacity && (
                <>
                  {venueInfo.city && <span className="text-xs text-muted-foreground">•</span>}
                  <span className="text-xs text-muted-foreground">
                    Capacity: {venueInfo.capacity.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
