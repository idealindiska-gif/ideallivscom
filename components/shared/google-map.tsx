/**
 * Google Map Component
 * Global reusable map component for Ideal Indiska LIVS store location
 *
 * Single source of truth for map embed URL
 * Update the mapEmbedUrl constant to change the map globally
 */

import { cn } from "@/lib/utils";

// SINGLE SOURCE: Update this URL to change the map across the entire site
const MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2038.769278826918!2d18.048690399999998!3d59.2700036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465f77d07b5889cf%3A0xd20e7ba594e09663!2sIdeal%20Indiska%20Livs%20Bandhagen!5e0!3m2!1sen!2s!4v1766272371672!5m2!1sen!2s";

interface GoogleMapProps {
  className?: string;
  height?: string;
  title?: string;
  showBorder?: boolean;
}

export function GoogleMap({
  className,
  height = "450px",
  title = "Ideal Indiska LIVS - Bandhagen, Stockholm",
  showBorder = true
}: GoogleMapProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", showBorder && "rounded-lg border", className)}>
      <iframe
        src={MAP_EMBED_URL}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        className="w-full"
      />
    </div>
  );
}

/**
 * Compact version for sidebars
 */
export function GoogleMapCompact({ className }: { className?: string }) {
  return (
    <GoogleMap
      height="250px"
      className={className}
      title="Store Location Map"
    />
  );
}

/**
 * Full-width version for main sections
 */
export function GoogleMapFull({ className }: { className?: string }) {
  return (
    <GoogleMap
      height="500px"
      className={className}
      title="Visit Our Store - Ideal Indiska LIVS"
    />
  );
}
