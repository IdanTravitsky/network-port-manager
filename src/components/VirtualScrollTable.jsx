import React, { useState, useCallback, useMemo, useRef } from 'react';

const VirtualScrollTable = ({ 
    items, 
    renderRow, 
    rowHeight = 60, 
    containerHeight = 400,
    overscan = 5,
    className = "",
    headers = null 
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);
    
    const totalHeight = items.length * rowHeight;
    
    // Calculate visible range with overscan
    const visibleRange = useMemo(() => {
        const visibleStart = Math.floor(scrollTop / rowHeight);
        const visibleEnd = Math.min(
            items.length - 1,
            Math.ceil((scrollTop + containerHeight) / rowHeight)
        );
        
        const start = Math.max(0, visibleStart - overscan);
        const end = Math.min(items.length - 1, visibleEnd + overscan);
        
        return { start, end };
    }, [scrollTop, rowHeight, containerHeight, items.length, overscan]);
    
    // Get visible items
    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.start, visibleRange.end + 1);
    }, [items, visibleRange]);
    
    // Handle scroll with throttling
    const handleScroll = useCallback((e) => {
        const newScrollTop = e.target.scrollTop;
        setScrollTop(newScrollTop);
    }, []);
    
    // Scroll to specific item - available for future use
    // const scrollToItem = useCallback((index) => {
    //     if (containerRef.current) {
    //         const scrollTop = index * rowHeight;
    //         containerRef.current.scrollTop = scrollTop;
    //         setScrollTop(scrollTop);
    //     }
    // }, [rowHeight]);
    
    return (
        <div 
            ref={containerRef}
            className={`virtual-scroll-container overflow-auto ${className}`}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            {/* Headers */}
            {headers && (
                <div 
                    className="sticky top-0 z-10 bg-slate-700/95 backdrop-blur-sm"
                    style={{ transform: 'translateZ(0)' }}
                >
                    {headers}
                </div>
            )}
            
            {/* Virtual scroll content */}
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                    style={{
                        transform: `translateY(${visibleRange.start * rowHeight}px)`,
                        willChange: 'transform'
                    }}
                >
                    {visibleItems.map((item, index) => {
                        const actualIndex = visibleRange.start + index;
                        return (
                            <div
                                key={item.id || actualIndex}
                                style={{ 
                                    height: rowHeight,
                                    display: 'flex',
                                    alignItems: 'center',
                                    transform: 'translateZ(0)' // GPU acceleration
                                }}
                            >
                                {renderRow(item, actualIndex)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default VirtualScrollTable;