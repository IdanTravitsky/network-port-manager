import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ breadcrumbs, onNavigate }) => {
    if (!breadcrumbs || breadcrumbs.length === 0) {
        return null;
    }

    return (
        <nav className="flex items-center space-x-1 text-sm text-slate-400 mb-4">
            {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const isFirst = index === 0;
                
                return (
                    <React.Fragment key={crumb.id || index}>
                        {isFirst && (
                            <Home size={14} className="text-slate-500 mr-1" />
                        )}
                        
                        {isLast ? (
                            <span className="text-white font-medium">{crumb.label}</span>
                        ) : (
                            <button
                                onClick={() => onNavigate(crumb)}
                                className="hover:text-cyan-400 transition-colors cursor-pointer"
                            >
                                {crumb.label}
                            </button>
                        )}
                        
                        {!isLast && (
                            <ChevronRight size={14} className="text-slate-600 mx-1" />
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;