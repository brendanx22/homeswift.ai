import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { Button } from "./ui/button";

// Minimum swipe distance to trigger image change (in pixels)
const SWIPE_THRESHOLD = 50;

export const PropertyImageCarousel = ({ 
  images = [], 
  onViewAll,
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const touchStartXRef = useRef(0);
  const autoPlayInterval = useRef(null);

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (images.length <= 1) return;
    
    clearInterval(autoPlayInterval.current);
    autoPlayInterval.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 5000);
  }, [images.length]);

  // Handle auto-play on mount/unmount
  useEffect(() => {
    if (isAutoPlaying) {
      startAutoPlay();
    }
    return () => clearInterval(autoPlayInterval.current);
  }, [isAutoPlaying, startAutoPlay]);

  // Pause auto-play on hover/focus
  const handlePause = useCallback(() => {
    clearInterval(autoPlayInterval.current);
    setIsAutoPlaying(false);
  }, []);

  // Resume auto-play
  const handleResume = useCallback(() => {
    if (images.length > 1) {
      startAutoPlay();
      setIsAutoPlaying(true);
    }
  }, [images.length, startAutoPlay]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    if (isAutoPlaying) {
      handlePause();
      startAutoPlay();
    }
  }, [images.length, isAutoPlaying, handlePause, startAutoPlay]);

  const previousImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    if (isAutoPlaying) {
      handlePause();
      startAutoPlay();
    }
  }, [images.length, isAutoPlaying, handlePause, startAutoPlay]);

  // Configure swipe handlers with react-swipeable
  const swipeHandlers = useSwipeable({
    onSwipedLeft: (e) => {
      handlePause();
      nextImage();
      setTimeout(handleResume, 1000);
    },
    onSwipedRight: (e) => {
      handlePause();
      previousImage();
      setTimeout(handleResume, 1000);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    trackTouch: true,
    delta: 10, // min distance(px) before a swipe starts
    swipeDuration: 300, // max time allowed for a swipe
    touchEventOptions: { passive: false },
  });

  // Don't render if no images
  if (images.length === 0) {
    return (
      <div className={`relative w-full h-64 bg-muted rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden group ${className}`}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
    >
      <div 
        className="relative w-full h-full"
        {...swipeHandlers}
        role="region"
        aria-label="Property images carousel"
        aria-roledescription="carousel"
        aria-atomic="false"
        aria-live="polite"
      >
        {/* Main image */}
        <div 
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            display: 'flex',
            transition: 'transform 0.3s ease-out'
          }}
        >
          {images.map((image, index) => (
            <div 
              key={index}
              className="w-full h-full flex-shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${images.length}`}
            >
              <img
                src={image}
                alt={`Property view ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          ))}
        </div>
        
        {/* Navigation arrows - only show on hover and if there are multiple images */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute top-3 right-3 text-xs bg-black/60 text-white px-2 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>

        {/* View all button */}
        {onViewAll && (
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onViewAll();
            }}
            className="absolute bottom-3 right-3 text-xs text-white bg-black/60 hover:bg-black/80 px-3 py-1.5 h-auto backdrop-blur-sm"
            aria-label="View all images"
          >
            View all {images.length} {images.length === 1 ? 'photo' : 'photos'}
          </Button>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                index === currentIndex 
                  ? 'w-6 bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  );
};