import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Hook to optimize scroll performance by throttling operations
 * and using requestAnimationFrame for smooth scrolling
 */
export const useScrollOptimizer = (callback, delay = 16) => {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef(null);
    const frameRef = useRef(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        (...args) => {
            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Clear any existing frame request
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }

            // Use requestAnimationFrame for smooth execution
            frameRef.current = requestAnimationFrame(() => {
                timeoutRef.current = setTimeout(() => {
                    callbackRef.current.apply(null, args);
                }, delay);
            });
        },
        [delay]
    );
};

/**
 * Hook to detect scroll direction and provide scroll state
 */
export const useScrollDirection = () => {
    const lastScrollTop = useRef(0);
    const scrollDirection = useRef('down');
    const isScrolling = useRef(false);
    const scrollTimeout = useRef(null);

    const handleScroll = useCallback((callback) => {
        return (e) => {
            const currentScrollTop = e.target.scrollTop;
            
            // Determine scroll direction
            if (currentScrollTop > lastScrollTop.current) {
                scrollDirection.current = 'down';
            } else if (currentScrollTop < lastScrollTop.current) {
                scrollDirection.current = 'up';
            }
            
            lastScrollTop.current = currentScrollTop;
            isScrolling.current = true;

            // Clear existing timeout
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }

            // Set scrolling to false after scroll ends
            scrollTimeout.current = setTimeout(() => {
                isScrolling.current = false;
            }, 150);

            if (callback) {
                callback({
                    scrollTop: currentScrollTop,
                    direction: scrollDirection.current,
                    isScrolling: isScrolling.current
                });
            }
        };
    }, []);

    return {
        handleScroll,
        getScrollState: () => ({
            direction: scrollDirection.current,
            isScrolling: isScrolling.current,
            scrollTop: lastScrollTop.current
        })
    };
};

/**
 * Hook for smooth scrolling to elements
 */
export const useSmoothScroll = () => {
    return useCallback((elementId, options = {}) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
            ...options
        };

        element.scrollIntoView(defaultOptions);
    }, []);
};

/**
 * Hook to optimize rendering during scroll by debouncing updates
 */
export const useScrollDebounce = (value, delay = 100) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, delay]);

    return debouncedValue;
};