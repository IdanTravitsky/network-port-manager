import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ x, y, items, onClose, visible }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleScroll = () => {
            onClose();
        };

        if (visible) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [visible, onClose]);

    // Position adjustment to keep menu within viewport
    useEffect(() => {
        if (visible && menuRef.current) {
            const menu = menuRef.current;
            const rect = menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let adjustedX = x;
            let adjustedY = y;

            // Adjust horizontal position if menu would overflow
            if (x + rect.width > viewportWidth) {
                adjustedX = viewportWidth - rect.width - 10;
            }

            // Adjust vertical position if menu would overflow
            if (y + rect.height > viewportHeight) {
                adjustedY = viewportHeight - rect.height - 10;
            }

            menu.style.left = `${Math.max(10, adjustedX)}px`;
            menu.style.top = `${Math.max(10, adjustedY)}px`;
        }
    }, [visible, x, y]);

    if (!visible) return null;

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-2 min-w-48"
            style={{ left: x, top: y }}
        >
            {items.map((item, index) => {
                if (item.type === 'separator') {
                    return (
                        <div
                            key={`separator-${index}`}
                            className="border-t border-slate-700 my-1"
                        />
                    );
                }

                return (
                    <button
                        key={item.id || index}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            item.onClick();
                            onClose();
                        }}
                        disabled={item.disabled}
                        className={`
                            w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3
                            ${item.disabled 
                                ? 'text-slate-500 cursor-not-allowed' 
                                : item.destructive
                                    ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                            }
                        `}
                    >
                        {item.icon && <item.icon size={16} className="flex-shrink-0" />}
                        <span>{item.label}</span>
                        {item.shortcut && (
                            <span className="ml-auto text-xs text-slate-500">{item.shortcut}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default ContextMenu;