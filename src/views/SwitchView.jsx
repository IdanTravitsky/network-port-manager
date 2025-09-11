import React, { useState, memo, useMemo } from 'react';
import { Download, Pin, Search, X, Grid, Server } from 'lucide-react';
import SwitchPort from '../components/SwitchPort.jsx';
import InlineEditableField from '../components/InlineEditableField.jsx';
import LazyRender from '../components/LazyRender.jsx';
import SwitchLayoutModal from '../components/SwitchLayoutModal.jsx';
import { exportToCSV } from '../utils/helpers.js';

// Helper function to calculate switch port layout
const calculateSwitchPortLayout = (switchData, layoutTemplate) => {
    if (!switchData || !layoutTemplate) {
        return { rows: [], allPorts: [] };
    }

    const allPorts = Array.from({ length: switchData.portCount }, (_, i) => i + 1);
    let rows = [];

    switch (layoutTemplate.config.type) {
        case 'odd_even': {
            const oddPorts = allPorts.filter(p => p % 2 !== 0);
            const evenPorts = allPorts.filter(p => p % 2 === 0);
            rows = [oddPorts, evenPorts].filter(row => row.length > 0);
            break;
        }
        case 'sequential': {
            const portsPerRow = layoutTemplate.config.portsPerRow || 10;
            for (let i = 0; i < allPorts.length; i += portsPerRow) {
                rows.push(allPorts.slice(i, i + portsPerRow));
            }
            break;
        }
        case 'custom': {
            if (switchData.customLayout && switchData.customLayout.rows) {
                rows = switchData.customLayout.rows.filter(row => row.length > 0);
            } else {
                // Fallback to sequential if no custom layout defined
                rows = [allPorts];
            }
            break;
        }
        default:
            rows = [allPorts];
    }

    return {
        rows: rows.filter(row => row.length > 0),
        allPorts,
        template: layoutTemplate
    };
};

const SwitchView = memo(({ data, maps, connectionsBySwitchAndPort, onUpdateSwitch, onEditConnection, onAssignConnection, onDisconnect, onNavigateToSwitch }) => {
    const { switches } = data;
    const [showIp, setShowIp] = useState(true);
    const [showUser, setShowUser] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedPort, setHighlightedPort] = useState(null);
    const [layoutModalSwitch, setLayoutModalSwitch] = useState(null);
    const [rackView, setRackView] = useState(false);

    // Search for user and find their connection
    const searchResult = useMemo(() => {
        if (!searchTerm.trim()) return null;
        
        const term = searchTerm.toLowerCase();
        
        // Find user by name
        const user = data.users.find(u => u.name.toLowerCase().includes(term));
        if (!user) return null;
        
        // Find connection for this user
        const connection = data.connections.find(c => c.userId === user.id);
        if (!connection || connection.connectionType === 'local_device') return null;
        
        // Return the switch and port information
        return {
            userId: user.id,
            userName: user.name,
            switchId: connection.switchId,
            switchPort: connection.switchPort,
            connectionId: connection.id
        };
    }, [searchTerm, data.users, data.connections]);

    // Handle search input changes
    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    // Handle search result highlighting and navigation
    React.useEffect(() => {
        if (searchResult && searchTerm.trim()) {
            setHighlightedPort(`${searchResult.switchId}-${searchResult.switchPort}`);
            // Scroll to the switch
            setTimeout(() => {
                const switchElement = document.getElementById(`switch-${searchResult.switchId}`);
                if (switchElement) {
                    switchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } else {
            setHighlightedPort(null);
        }
    }, [searchResult, searchTerm]);

    // Clear search on blur/tab out
    const handleSearchBlur = () => {
        // Add a small delay to allow dropdown interactions
        setTimeout(() => {
            setSearchTerm('');
            setHighlightedPort(null);
        }, 150);
    };

    // Clear search completely
    const clearSearch = () => {
        setSearchTerm('');
        setHighlightedPort(null);
    };

    const handleExportCSV = () => {
        const exportData = [];
        
        switches.forEach(sw => {
            const floorName = maps.floors.get(sw.floorId)?.name || 'Unknown';
            
            // Generate data for each port
            for (let portNum = 1; portNum <= sw.portCount; portNum++) {
                const connection = connectionsBySwitchAndPort.get(`${sw.id}-${portNum}`);
                const wallPort = connection ? maps.wallPorts.get(connection.wallPortId) : null;
                const user = connection ? maps.users.get(connection.userId) : null;
                
                exportData.push({
                    'Switch Name': sw.name,
                    'Switch IP': sw.ip,
                    'Floor': floorName,
                    'Switch Port': portNum,
                    'Port Status': connection ? 'Used' : 'Available',
                    'Connection Type': connection ? (connection.connectionType === 'local_device' ? 'Local Device' : 'Patched') : '',
                    'Link Status': connection ? (connection.connectionType === 'local_device' ? 'Up' : (connection.hasLink ? 'Up' : 'Down')) : '',
                    'Wall Port': wallPort ? wallPort.portNumber : '',
                    'VLAN': connection?.vlan || '',
                    'Room': connection?.room || '',
                    'Device Description': connection?.deviceDescription || '',
                    'Assigned User': user?.name || '',
                    'User Department': user?.department || '',
                    'IP Address': connection?.ipAddress || '',
                    'Wall Port Type': wallPort ? (wallPort.isVirtual ? 'Virtual' : 'Physical') : ''
                });
            }
        });
        
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `switches-overview-${timestamp}.csv`;
        
        exportToCSV(exportData, filename);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                 <h2 className="text-2xl font-bold text-gradient mb-4 sm:mb-0">Switches</h2>
                 
                 {/* User Search */}
                 <div className="flex items-center gap-4">
                     <div className="relative">
                         <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                         <input 
                             type="text" 
                             value={searchTerm}
                             onChange={(e) => handleSearch(e.target.value)}
                             onBlur={handleSearchBlur}
                             placeholder="Search for user..." 
                             className="input-style pl-10 pr-10 w-64"
                         />
                         {searchTerm && (
                             <button 
                                 onClick={clearSearch}
                                 className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-opacity-20 hover:bg-white p-1 rounded transition-colors"
                                 title="Clear search"
                             >
                                 <X size={16} style={{ color: 'var(--text-muted)' }} />
                             </button>
                         )}
                         {searchTerm && !searchResult && (
                             <div className="absolute top-full left-0 right-0 mt-1 search-dropdown">
                                 <div className="px-3 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                     No user found matching "{searchTerm}"
                                 </div>
                             </div>
                         )}
                         {searchResult && (
                             <div className="absolute top-full left-0 right-0 mt-1 search-dropdown">
                                 <div className="px-3 py-2 text-sm">
                                     <div style={{ color: 'var(--text-primary)' }} className="font-medium">{searchResult.userName}</div>
                                     <div style={{ color: 'var(--text-muted)' }}>
                                         Switch: {maps.switches.get(searchResult.switchId)?.name || 'Unknown'} | Port: {searchResult.switchPort}
                                     </div>
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
                 
                 <div className="flex items-center gap-4 text-sm">
                     <label className="flex items-center gap-2 cursor-pointer">
                         <input 
                             type="checkbox" 
                             checked={showIp} 
                             onChange={e => setShowIp(e.target.checked)} 
                             className="w-4 h-4 rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-600"
                         /> 
                         Show IP
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                         <input 
                             type="checkbox" 
                             checked={showUser} 
                             onChange={e => setShowUser(e.target.checked)} 
                             className="w-4 h-4 rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-600"
                         /> 
                         Show User
                     </label>
                     <button 
                         onClick={() => setRackView(!rackView)} 
                         className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                             rackView 
                                 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                                 : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
                         }`}
                         title={rackView ? 'Switch to card view' : 'Switch to horizontal rack view'}
                     >
                         <Server size={16} />
                         <span className="hidden sm:inline">
                             {rackView ? 'Card View' : 'Rack View'}
                         </span>
                     </button>
                     <button onClick={handleExportCSV} className="button-secondary p-2.5" title="Export to CSV">
                         <Download size={16} />
                     </button>
                 </div>
            </div>
            <div className="space-y-8" style={{ willChange: 'scroll-position' }}>
                {switches.map(sw => {
                    // Get layout template for this switch
                    const layoutTemplate = data.switchLayoutTemplates?.find(t => t.id === sw.layoutTemplateId) || 
                                          data.switchLayoutTemplates?.find(t => t.id === 'odd_even') ||
                                          { id: 'odd_even', config: { type: 'odd_even' } };
                    
                    // Calculate port layout using the template
                    const portLayout = calculateSwitchPortLayout(sw, layoutTemplate);
                    
                    // Calculate used ports count
                    let usedPorts = 0;
                    for (let i = 1; i <= sw.portCount; i++) {
                        if (connectionsBySwitchAndPort.get(`${sw.id}-${i}`)) {
                            usedPorts++;
                        }
                    }
                    
                    const switchData = { ...portLayout, usedPorts };
                    const category = maps.switchCategories.get(sw.categoryId);
                    const categoryColor = category?.color || '#10b981';

                    return (
                        <LazyRender
                            key={sw.id}
                            threshold={0.1}
                            rootMargin="200px"
                            fallback={
                                <div 
                                    className="switch-chassis rounded-2xl p-6 shadow-2xl animate-pulse"
                                    style={{ borderLeftColor: categoryColor, borderLeftWidth: '6px', minHeight: '300px' }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="h-6 w-32 bg-slate-600 rounded mb-2"></div>
                                            <div className="h-4 w-24 bg-slate-600 rounded"></div>
                                        </div>
                                        <div className="h-4 w-20 bg-slate-600 rounded"></div>
                                    </div>
                                </div>
                            }
                        >
                        <div 
                            id={`switch-${sw.id}`}
                            className="switch-chassis rounded-2xl p-6 shadow-2xl"
                            style={{ borderLeftColor: categoryColor, borderLeftWidth: '6px' }}
                        >
                            <div className="flex justify-between items-start mb-4 pb-2 border-b border-slate-700">
                                <div>
                                    <InlineEditableField 
                                        value={sw.name} 
                                        onSave={(newValue) => onUpdateSwitch(sw.id, { name: newValue })} 
                                        className="font-bold text-lg text-cyan-400" 
                                        inputClassName="font-bold text-lg text-cyan-400 bg-slate-700 p-1 rounded outline-none w-full"
                                    />
                                    <InlineEditableField 
                                        value={sw.ip} 
                                        onSave={(newValue) => onUpdateSwitch(sw.id, { ip: newValue })} 
                                        className="text-sm text-slate-400 font-mono" 
                                        inputClassName="text-sm text-slate-400 font-mono bg-slate-700 p-1 rounded outline-none w-full"
                                    />
                                    {category && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: categoryColor }}
                                            />
                                            <span className="text-xs text-slate-500">{category.name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                     <div className="flex items-center gap-2 justify-end">
                                        <button
                                            onClick={() => setLayoutModalSwitch(sw)}
                                            className="p-1 rounded-full transition-colors text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/20"
                                            title="Configure port layout"
                                        >
                                            <Grid size={14} />
                                        </button>
                                        <button
                                            onClick={() => onUpdateSwitch(sw.id, { isPinned: !sw.isPinned })}
                                            className={`p-1 rounded-full transition-colors ${
                                                sw.isPinned 
                                                    ? 'text-yellow-400 bg-yellow-400/20 hover:bg-yellow-400/30' 
                                                    : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/20'
                                            }`}
                                            title={sw.isPinned ? 'Unpin switch' : 'Pin switch'}
                                        >
                                            <Pin size={14} />
                                        </button>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <span>PWR</span>
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <span>SYS</span>
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        </div>
                                     </div>
                                     <p className="text-xs text-slate-500 mt-1">{switchData.usedPorts} / {sw.portCount} Ports Used</p>
                                </div>
                            </div>
                            {rackView ? (
                                // Horizontal Rack View - like real network equipment
                                <div className="mt-6">
                                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-slate-400 font-mono">RACK UNIT</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <div className="flex flex-wrap gap-1 min-w-max">
                                                {switchData.allPorts.map(portNum => (
                                                    <SwitchPort 
                                                        key={portNum} 
                                                        portNum={portNum} 
                                                        switchId={sw.id} 
                                                        connection={connectionsBySwitchAndPort.get(`${sw.id}-${portNum}`)} 
                                                        maps={maps} 
                                                        onEdit={onEditConnection} 
                                                        onAssign={onAssignConnection} 
                                                        onDisconnect={onDisconnect}
                                                        onNavigateToSwitch={onNavigateToSwitch}
                                                        showIp={showIp} 
                                                        showUser={showUser}
                                                        isHighlighted={highlightedPort === `${sw.id}-${portNum}`}
                                                        rackView={true}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Original Card View
                                <div className="overflow-x-auto pb-2 pt-16 -mt-16">
                                    <div className="flex flex-col gap-1 px-2 min-w-max">
                                        {switchData.rows.map((row, rowIndex) => (
                                            <div key={rowIndex} className="flex flex-nowrap gap-2">
                                                {row.map(portNum => (
                                                    <SwitchPort 
                                                        key={portNum} 
                                                        portNum={portNum} 
                                                        switchId={sw.id} 
                                                        connection={connectionsBySwitchAndPort.get(`${sw.id}-${portNum}`)} 
                                                        maps={maps} 
                                                        onEdit={onEditConnection} 
                                                        onAssign={onAssignConnection} 
                                                        onDisconnect={onDisconnect}
                                                        onNavigateToSwitch={onNavigateToSwitch}
                                                        showIp={showIp} 
                                                        showUser={showUser}
                                                        isHighlighted={highlightedPort === `${sw.id}-${portNum}`}
                                                        rackView={false}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        </LazyRender>
                    );
                })}
            </div>
            
            {/* Switch Layout Configuration Modal */}
            {layoutModalSwitch && (
                <SwitchLayoutModal
                    switchData={layoutModalSwitch}
                    layoutTemplates={data.switchLayoutTemplates || []}
                    onSave={(updatedSwitch) => {
                        onUpdateSwitch(updatedSwitch.id, updatedSwitch);
                        setLayoutModalSwitch(null);
                    }}
                    onClose={() => setLayoutModalSwitch(null)}
                />
            )}
        </div>
    );
});

export default SwitchView;