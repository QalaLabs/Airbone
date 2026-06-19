'use client';

import React, { useState, useEffect, useRef } from 'react';

// A simple utility for conditional class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
}

const CircularGallery = React.forwardRef(
  ({ items, className, radius = 950, autoRotateSpeed = 0.05, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);
    const animationFrameRef = useRef(null);
    const containerRef = useRef(null);

    // Combine forwarded ref and local ref
    const setRefs = (element) => {
      containerRef.current = element;
      if (typeof ref === 'function') ref(element);
      else if (ref) ref.current = element;
    };

    // Effect to handle scroll-based rotation based on component visibility/scroll position
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Calculate rotation based on window scroll
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        // Adjust the multiplier to control how fast it rotates on scroll
        const scrollRotation = scrollProgress * 720; 
        setRotation(scrollRotation);

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    // Effect for auto-rotation when not scrolling
    useEffect(() => {
      const autoRotate = () => {
        if (!isScrolling) {
          setRotation(prev => prev + autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isScrolling, autoRotateSpeed]);

    const anglePerItem = 360 / items.length;
    
    return (
      <div
        ref={setRefs}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn("relative w-full flex items-center justify-center overflow-hidden", className)}
        style={{ perspective: '3000px', height: '600px', marginTop: '2rem' }}
        {...props}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d',
            transition: isScrolling ? 'none' : 'transform 0.1s linear',
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            // Calculate opacity to fade out items in the back
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            // Items in front (normalizedAngle near 0 or 360) are fully opaque. Items in back (near 180) are faded.
            const isBack = normalizedAngle > 110;
            const opacity = isBack ? Math.max(0.05, 1 - (normalizedAngle / 180)) : 1;
            const pointerEvents = isBack ? 'none' : 'auto';

            return (
              <div
                key={i} 
                role="group"
                className="absolute"
                style={{
                  width: '320px',
                  transform: `translate(-50%, -50%) rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: '50%',
                  top: '50%',
                  opacity: opacity,
                  pointerEvents: pointerEvents,
                  transition: 'opacity 0.3s linear'
                }}
              >
                {/* The Card UI exactly as requested */}
                <div 
                  className="advantage-card-hover"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    borderRadius: '12px', 
                    padding: '2rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    transition: 'transform 0.3s ease, border-color 0.3s ease, background 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--gold)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.25rem', color: 'var(--gold)' }}>✓</span>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: 'var(--font-b)', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
