import React, { useState, useEffect, useRef, memo } from 'react';

const LazyRender = memo(({ 
    children, 
    threshold = 0.1, 
    rootMargin = '100px',
    fallback = null,
    triggerOnce = true 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;
        
        // Early return if already triggered and triggerOnce is true
        if (triggerOnce && hasTriggered) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        setHasTriggered(true);
                        observer.unobserve(entry.target);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin
            }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin, triggerOnce, hasTriggered]);

    return (
        <div 
            ref={elementRef} 
            className="lazy-render"
            style={{ 
                minHeight: isVisible ? 'auto' : '200px',
                contain: 'layout style paint'
            }}
        >
            {(isVisible || hasTriggered) ? children : fallback}
        </div>
    );
});

export default LazyRender;