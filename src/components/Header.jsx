import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Network, Settings, Waypoints, Server, LayoutDashboard, Users, Search, MapPin, User, X, Clock, Building2 } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs.jsx';
import SearchResults from './SearchResults.jsx';

const Header = ({ currentView, setView, data, setSelectedFloorId, breadcrumbs, onBreadcrumbNavigate, maps, onNavigateToSwitch, onNavigateToWallPort, onUserUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, 
        { id: 'wall', label: 'Wall Ports', icon: Waypoints }, 
        { id: 'switch', label: 'Switches', icon: Server }, 
        { id: 'closet', label: 'Network Closet', icon: Building2 }, 
        { id: 'users', label: 'Users', icon: Users }, 
        { id: 'latest', label: 'Latest Changes', icon: Clock }, 
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    // Search results with loading simulation
    const searchResults = useMemo(() => {
        if (!searchTerm.trim() || !data) {
            setIsSearching(false);
            return [];
        }
        
        // Simulate search delay for better UX
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 300);
        
        const term = searchTerm.toLowerCase();
        const results = [];

        // Search wall ports
        data.wallPorts?.forEach(port => {
            if (port.portNumber.toLowerCase().includes(term)) {
                const floor = data.floors?.find(f => f.id === port.floorId);
                results.push({
                    type: 'port',
                    id: port.id,
                    title: `Port ${port.portNumber}`,
                    subtitle: floor ? `Floor: ${floor.name}` : 'Unknown Floor',
                    floorId: port.floorId,
                    icon: Waypoints
                });
            }
        });

        // Search switches
        data.switches?.forEach(sw => {
            if (sw.name.toLowerCase().includes(term) || sw.ip.toLowerCase().includes(term)) {
                const floor = data.floors?.find(f => f.id === sw.floorId);
                results.push({
                    type: 'switch',
                    id: sw.id,
                    title: sw.name,
                    subtitle: `${sw.ip} (${floor ? floor.name : 'Unknown Floor'})`,
                    floorId: sw.floorId,
                    icon: Server
                });
            }
        });

        // Search users
        data.users?.forEach(user => {
            if (user.name.toLowerCase().includes(term)) {
                results.push({
                    type: 'user',
                    id: user.id,
                    title: user.name,
                    subtitle: 'User',
                    icon: User
                });
            }
        });
        
        return results.slice(0, 10); // Limit to 10 results
    }, [searchTerm, data]);

    const handleResultClick = (result) => {
        const context = {};
        
        if (result.type === 'port') {
            // For ports, include floor context for breadcrumbs
            const floor = data.floors?.find(f => f.id === result.floorId);
            if (floor) {
                context.floorName = floor.name;
                context.floorId = floor.id;
            }
            setView('wall', context);
            if (setSelectedFloorId && result.floorId) {
                setSelectedFloorId(result.floorId);
            }
        } else if (result.type === 'switch') {
            // For switches, we could add switch-specific context in the future
            setView('switch', context);
        } else if (result.type === 'user') {
            // Show detailed user search results instead of navigating to users page
            const user = data.users?.find(u => u.id === result.id);
            if (user) {
                setSelectedUser(user);
            }
        }
        setSearchTerm('');
        setIsSearchOpen(false);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setIsSearchOpen(false);
    };

    // Handle click outside to close search
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    return (
        <div>
            <header className="modern-header flex flex-col lg:flex-row justify-between items-center pb-6 gap-6">
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'var(--primary-gradient)' }}>
                    <Network className="text-white" size={24} />
                </div>
                <h1 className="text-xl lg:text-2xl font-bold text-gradient tracking-tight">Network Manager</h1>
            </div>
            
            {/* Global Search */}
            <div className="relative w-full lg:w-96" ref={searchRef}>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        placeholder="Search ports, switches, users..." 
                        className="input-style w-full pl-10 pr-10"
                    />
                    {searchTerm && (
                        <button 
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                
                {/* Search Results Dropdown */}
                {isSearchOpen && searchResults.length > 0 && (
                    <div className="search-dropdown absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto">
                        {searchResults.map((result, index) => (
                            <button
                                key={`${result.type}-${result.id}-${index}`}
                                onClick={() => handleResultClick(result)}
                                className="search-result-item w-full text-left px-4 py-3 flex items-center gap-3"
                            >
                                <result.icon size={16} className="text-slate-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <div className="font-medium text-white truncate">{result.title}</div>
                                    <div className="text-sm text-slate-400 truncate">{result.subtitle}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                
                {isSearchOpen && searchTerm && searchResults.length === 0 && (
                    <div className="search-dropdown absolute top-full left-0 right-0 mt-2">
                        <div className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                            No results found for "{searchTerm}"
                        </div>
                    </div>
                )}
            </div>
            
            <nav className="flex flex-wrap items-center justify-center gap-2">
                {navItems.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setView(item.id)} 
                        className={`nav-pill flex items-center gap-2 ${
                            currentView === item.id ? 'active' : ''
                        }`}
                    >
                        <item.icon size={16} />
                        <span className="hidden sm:inline">{item.label}</span>
                    </button>
                ))}
            </nav>
        </header>
        <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={onBreadcrumbNavigate} />
        
        {/* Enhanced Search Results Modal */}
        {selectedUser && (
            <SearchResults 
                user={selectedUser}
                connections={data.connections || []}
                maps={maps}
                onClose={() => setSelectedUser(null)}
                onNavigateToSwitch={onNavigateToSwitch}
                onNavigateToWallPort={onNavigateToWallPort}
                onUserUpdate={onUserUpdate}
            />
        )}
        </div>
    );
};

export default Header;