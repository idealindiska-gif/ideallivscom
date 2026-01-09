'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/woocommerce';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

export function ProductImageGallery({
  images,
  productName,
  className,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const hasMultipleImages = images.length > 1;
  const currentImage = images[selectedIndex] || images[0];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleImageClick = () => {
    setIsLightboxOpen(true);
  };

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Main Image */}
        <div className="group relative aspect-square overflow-hidden rounded-xl border-2 border-border bg-muted">
          {currentImage ? (
            <>
              <div
                className="relative h-full w-full cursor-zoom-in transition-transform duration-300 hover:scale-105"
                onClick={handleImageClick}
              >
                <Image
                  src={currentImage.src}
                  alt={`${currentImage.alt || productName} | Ideal Indiska LIVS`}
                  fill
                  className="object-contain p-4"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={90}
                />
              </div>

              {/* Zoom Icon Overlay */}
              <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full shadow-lg"
                  onClick={handleImageClick}
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Arrows (only if multiple images) */}
              {hasMultipleImages && (
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                  {selectedIndex + 1} / {images.length}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary p-6">
                  <svg
                    className="h-full w-full text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground">No image available</p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {hasMultipleImages && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  'group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all hover:border-primary',
                  selectedIndex === index
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-border'
                )}
              >
                <Image
                  src={image.src}
                  alt={`${image.alt || productName} - Image ${index + 1} | Ideal Indiska LIVS`}
                  fill
                  className="object-contain p-1 transition-transform group-hover:scale-110"
                  sizes="(max-width: 768px) 20vw, 10vw"
                  quality={60}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl p-0">
          <div className="relative bg-black">
            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-4 top-4 z-50 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Main Lightbox Image */}
            <div className="relative aspect-square w-full md:aspect-video">
              <Image
                src={currentImage.src}
                alt={`${currentImage.alt || productName} | Ideal Indiska LIVS`}
                fill
                className={cn(
                  'object-contain transition-transform duration-300',
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                )}
                quality={100}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>

            {/* Lightbox Navigation */}
            {hasMultipleImages && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Lightbox Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-white">
                  {selectedIndex + 1} of {images.length}
                </div>
              </>
            )}

            {/* Lightbox Thumbnails */}
            {hasMultipleImages && images.length > 1 && (
              <div className="border-t border-white/10 bg-black/90 p-4">
                <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={image.id || index}
                      onClick={() => handleThumbnailClick(index)}
                      className={cn(
                        'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                        selectedIndex === index
                          ? 'border-white ring-2 ring-white'
                          : 'border-white/30 hover:border-white/60'
                      )}
                    >
                      <Image
                        src={image.src}
                        alt={`${image.alt || productName} - Thumbnail ${index + 1} | Ideal Indiska LIVS`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
