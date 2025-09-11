import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Move, Grid, Plus, Minus, GripVertical, ChevronDown, Building2, Server, Waypoints, Edit } from 'lucide-react';
import SwitchPort from './SwitchPort.jsx';
import ClosetLayoutModal from './ClosetLayoutModal.jsx';

// Helper function to calculate switch port layout (copied from SwitchView)
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

const NetworkClosetView = ({ 
    data, 
    maps, 
    connectionsByWallPortId, 
    connectionsBySwitchAndPort,
    onEditConnection, 
    onAssignConnection, 
    onDisconnect, 
    onNavigateToSwitch,
    onUpdateSwitch,
    onUpdateClosetLayout,
    selectedFloorId, 
    setSelectedFloorId 
}) => {
    const [closetConfig, setClosetConfig] = useState({
        wallPortsPerRow: 10,
        rackItems: []
    });

    const [draggedItem, setDraggedItem] = useState(null);
    const [showFloorSelector, setShowFloorSelector] = useState(false);
    const [showLayoutModal, setShowLayoutModal] = useState(false);

    // Get current floor data
    const currentFloor = maps.floors.get(selectedFloorId);
    
    // Get wall ports for current floor only
    const currentFloorWallPorts = useMemo(() => {
        if (!selectedFloorId) return [];
        return data.wallPorts
            .filter(port => port.floorId === selectedFloorId)
            .sort((a, b) => parseInt(a.portNumber) - parseInt(b.portNumber));
    }, [data.wallPorts, selectedFloorId]);

    // Get switches for current floor only
    const currentFloorSwitches = useMemo(() => {
        if (!selectedFloorId) return [];
        return data.switches
            .filter(sw => sw.floorId === selectedFloorId)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [data.switches, selectedFloorId]);

    // Initialize rack configuration based on current floor data
    useEffect(() => {
        if (!currentFloor) return;

        const rackItems = [];
        
        // Group wall ports into ranges of 50
        const wallPortRanges = [];
        if (currentFloorWallPorts.length > 0) {
            const totalPorts = currentFloorWallPorts.length;
            const rangeSize = 50;
            for (let i = 0; i < totalPorts; i += rangeSize) {
                const endIndex = Math.min(i + rangeSize, totalPorts);
                const startPort = parseInt(currentFloorWallPorts[i].portNumber);
                const endPort = parseInt(currentFloorWallPorts[endIndex - 1].portNumber);
                wallPortRanges.push({
                    type: 'wallports',
                    id: `wp-${Math.floor(i / rangeSize)}`,
                    label: `Wall Ports ${startPort}-${endPort}`,
                    startPort,
                    endPort,
                    ports: currentFloorWallPorts.slice(i, endIndex)
                });
            }
        }

        // Interleave wall ports and switches
        let wallPortIndex = 0;
        let switchIndex = 0;

        while (wallPortIndex < wallPortRanges.length || switchIndex < currentFloorSwitches.length) {
            // Add wall port range
            if (wallPortIndex < wallPortRanges.length) {
                rackItems.push(wallPortRanges[wallPortIndex]);
                wallPortIndex++;
            }
            
            // Add switch
            if (switchIndex < currentFloorSwitches.length) {
                const sw = currentFloorSwitches[switchIndex];
                rackItems.push({
                    type: 'switch',
                    id: `sw-${sw.id}`,
                    switchId: sw.id,
                    label: sw.name,
                    switchData: sw
                });
                switchIndex++;
            }
        }

        setClosetConfig(prev => ({
            ...prev,
            rackItems
        }));
    }, [currentFloor, currentFloorWallPorts, currentFloorSwitches]);

    // Get wall ports for a specific range
    const getWallPortsInRange = (startPort, endPort) => {
        return currentFloorWallPorts.filter(port => {
            const portNum = parseInt(port.portNumber);
            return portNum >= startPort && portNum <= endPort;
        });
    };

    // Group wall ports into rows
    const groupPortsIntoRows = (ports, portsPerRow) => {
        const rows = [];
        for (let i = 0; i < ports.length; i += portsPerRow) {
            rows.push(ports.slice(i, i + portsPerRow));
        }
        return rows;
    };

    // Handle drag and drop
    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === dropIndex) return;

        const newItems = [...closetConfig.rackItems];
        const draggedItemData = newItems[draggedItem];
        
        // Remove dragged item and insert at new position
        newItems.splice(draggedItem, 1);
        newItems.splice(dropIndex, 0, draggedItemData);
        
        setClosetConfig(prev => ({
            ...prev,
            rackItems: newItems
        }));
        
        setDraggedItem(null);
    };

    const updateWallPortsPerRow = (newCount) => {
        setClosetConfig(prev => ({
            ...prev,
            wallPortsPerRow: Math.max(1, Math.min(50, newCount))
        }));
    };

    const handleSaveLayout = (floorId, layoutItems) => {
        if (onUpdateClosetLayout) {
            onUpdateClosetLayout(floorId, layoutItems);
        }
    };

    const WallPortPanel = ({ wallPortData, portsPerRow, onEditConnection }) => {
        const rows = groupPortsIntoRows(wallPortData.ports, portsPerRow);
        
        return (
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Waypoints size={16} className="text-slate-400" />
                        <h3 className="text-sm font-medium text-slate-300">{wallPortData.label}</h3>
                    </div>
                    <div className="text-xs text-slate-400">
                        {wallPortData.ports.length} ports ({portsPerRow}/row)
                    </div>
                </div>
                
                <div className="space-y-1">
                    {rows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-1 justify-start">
                            {row.map(port => {
                                const connection = connectionsByWallPortId[port.id];
                                const isConnected = !!connection;
                                const hasLink = isConnected && connection.hasLink;
                                
                                return (
                                    <div
                                        key={port.id}
                                        className={`
                                            w-6 h-6 rounded border text-xs font-mono flex items-center justify-center cursor-pointer
                                            transition-all hover:scale-110 relative
                                            ${isConnected 
                                                ? (hasLink 
                                                    ? 'bg-green-500/20 border-green-500 text-green-300' 
                                                    : 'bg-orange-500/20 border-orange-500 text-orange-300')
                                                : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                                            }
                                        `}
                                        onClick={() => onEditConnection?.(port.id)}
                                        title={`Port ${port.portNumber}${isConnected ? ` - ${hasLink ? 'Connected' : 'No Link'}` : ''}`}
                                    >
                                        {port.portNumber}
                                        {isConnected && (
                                            <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                                                hasLink ? 'bg-green-500' : 'bg-orange-500'
                                            }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const SwitchPanel = ({ switchData, onUpdateSwitch, onAssignConnection, onDisconnect, onNavigateToSwitch }) => {
        if (!switchData) return null;

        const switchConnections = connectionsBySwitchAndPort[switchData.id] || {};
        
        // Use exact same logic as SwitchView
        const templateId = switchData.layoutTemplateId || 'odd_even';
        const layoutTemplate = data.switchLayoutTemplates.find(t => t.id === templateId) || {
            id: 'odd_even',
            name: 'Odd/Even',
            config: { type: 'odd_even' }
        };
        
        const portLayout = calculateSwitchPortLayout(switchData, layoutTemplate);
        const switchDataWithRows = {
            ...switchData,
            ...portLayout
        };

        const usedPorts = Object.keys(switchConnections).length;

        return (
            <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Server size={16} className="text-cyan-400" />
                        <h3 className="text-sm font-medium text-cyan-300">{switchData.name}</h3>
                    </div>
                    <div className="text-xs text-slate-400">
                        {switchData.portCount} ports - {usedPorts} used
                    </div>
                </div>
                
                <div className="flex flex-col gap-1 px-2 min-w-max">
                    {switchDataWithRows.rows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-1 justify-start">
                            {row.map(portNum => {
                                const connection = switchConnections[portNum];
                                return (
                                    <SwitchPort
                                        key={portNum}
                                        portNum={portNum}
                                        switchId={switchData.id}
                                        connection={connection}
                                        maps={maps}
                                        onEdit={onEditConnection}
                                        onAssign={onAssignConnection}
                                        onDisconnect={onDisconnect}
                                        onNavigateToSwitch={onNavigateToSwitch}
                                        showIp={false}
                                        showUser={false}
                                        rackView={true}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with Floor Selector */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
                        <Building2 size={24} />
                        Network Closet View
                    </h2>
                    
                    {/* Floor Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFloorSelector(!showFloorSelector)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 text-slate-300"
                        >
                            <span>{currentFloor?.name || 'Select Floor'}</span>
                            <ChevronDown size={16} />
                        </button>
                        
                        {showFloorSelector && (
                            <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10">
                                {data.floors.map(floor => (
                                    <button
                                        key={floor.id}
                                        onClick={() => {
                                            setSelectedFloorId(floor.id);
                                            setShowFloorSelector(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg ${
                                            floor.id === selectedFloorId ? 'bg-slate-700 text-cyan-300' : 'text-slate-300'
                                        }`}
                                    >
                                        {floor.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowLayoutModal(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 text-slate-300 transition-colors"
                        disabled={!selectedFloorId}
                    >
                        <Edit size={16} />
                        Edit Layout
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Ports per row:</span>
                        <button
                            onClick={() => updateWallPortsPerRow(closetConfig.wallPortsPerRow - 1)}
                            className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-mono bg-slate-800 px-2 py-1 rounded">
                            {closetConfig.wallPortsPerRow}
                        </span>
                        <button
                            onClick={() => updateWallPortsPerRow(closetConfig.wallPortsPerRow + 1)}
                            className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {!selectedFloorId ? (
                <div className="text-center py-12">
                    <Building2 size={48} className="mx-auto text-slate-500 mb-4" />
                    <h3 className="text-lg font-medium text-slate-400 mb-2">Select a Floor</h3>
                    <p className="text-slate-500">Choose a floor to view its network closet layout</p>
                </div>
            ) : (
                <>
                    {/* Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500/20 border border-green-500 rounded"></div>
                            <span className="text-xs text-slate-300">Connected & Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500/20 border border-orange-500 rounded"></div>
                            <span className="text-xs text-slate-300">Connected, No Link</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-700 border border-slate-600 rounded"></div>
                            <span className="text-xs text-slate-300">Wall Port Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-800 border border-slate-700 rounded"></div>
                            <span className="text-xs text-slate-300">Switch Port Available</span>
                        </div>
                    </div>

                    {/* Rack View */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                        <div className="max-w-4xl mx-auto">
                            <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                <Move size={18} />
                                Physical Rack Layout - {currentFloor?.name}
                                <span className="text-xs text-slate-400 font-normal">(drag to reorder)</span>
                            </h3>
                            
                            {closetConfig.rackItems.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Grid size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No network equipment found on this floor</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {closetConfig.rackItems.map((item, index) => (
                                        <div
                                            key={item.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index)}
                                            className={`
                                                group cursor-move transition-all
                                                ${draggedItem === index ? 'opacity-50' : ''}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 text-slate-500 group-hover:text-slate-400">
                                                    <GripVertical size={16} />
                                                </div>
                                                
                                                <div className="flex-1">
                                                    {item.type === 'wallports' && (
                                                        <WallPortPanel
                                                            wallPortData={item}
                                                            portsPerRow={closetConfig.wallPortsPerRow}
                                                            onEditConnection={onEditConnection}
                                                        />
                                                    )}
                                                    
                                                    {item.type === 'switch' && (
                                                        <SwitchPanel
                                                            switchData={item.switchData}
                                                            onUpdateSwitch={onUpdateSwitch}
                                                            onAssignConnection={onAssignConnection}
                                                            onDisconnect={onDisconnect}
                                                            onNavigateToSwitch={onNavigateToSwitch}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Configuration Help */}
                    <div className="text-xs text-slate-500 bg-slate-800/30 p-3 rounded-lg">
                        <strong>Usage:</strong> This view shows your network closet layout for <strong>{currentFloor?.name}</strong> as it appears physically. 
                        Wall ports show as small squares (numbered by last 2 digits), switches show their actual port layout with the same functionality as the Switches view. 
                        Green = active connection, Orange = connected but no link, Gray = available. 
                        Drag equipment up/down to match your real rack layout.
                    </div>
                </>
            )}
            
            <ClosetLayoutModal
                isOpen={showLayoutModal}
                onClose={() => setShowLayoutModal(false)}
                floorId={selectedFloorId}
                currentLayout={data.closetLayouts?.[selectedFloorId] || []}
                availableSwitches={data.switches}
                onSave={handleSaveLayout}
            />
        </div>
    );
};

export default NetworkClosetView;