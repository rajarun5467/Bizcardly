import { useEffect, useRef, useState } from 'react';

/**
 * WOW-like scroll reveal animation hook.
 * Uses IntersectionObserver to add animation classes when elements scroll into view.
 * Returns a ref to attach to the element and a boolean for visibility.
 */
export const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return [ref, isVisible];
};
