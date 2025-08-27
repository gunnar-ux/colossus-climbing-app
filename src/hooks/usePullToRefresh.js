import { useState, useRef, useEffect } from 'react';
import { clamp } from '../utils/index.js';

// Pull-to-refresh hook extracted from dashboard HTML
// Preserves exact touch handling and animation behavior

export const usePullToRefresh = (onRefresh) => {
  const containerRef = useRef(null);
  const [pull, setPull] = useState(0);
  const pulling = useRef(false);
  const startY = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onStart = (e) => {
      if (el.scrollTop === 0) {
        pulling.current = true;
        startY.current = e.touches[0].clientY;
      }
    };

    const onMove = (e) => {
      if (!pulling.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        e.preventDefault();
        setPull(clamp(dy, 0, 100));
      }
    };

    const onEnd = () => {
      if (pull >= 80) onRefresh?.();
      setPull(0);
      pulling.current = false;
    };

    el.addEventListener('touchstart', onStart, { passive: false });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [pull, onRefresh]);

  return { containerRef, pull };
};
