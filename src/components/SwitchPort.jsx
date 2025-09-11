import React, { useState, memo, useMemo, useCallback } from 'react';
import { Edit, Copy, Trash2, Plus } from 'lucide-react';
import ContextMenu from './ContextMenu.jsx';

const SwitchPort = memo(({ portNum, switchId, connection, maps, onEdit, onAssign, onDisconnect, onNavigateToSwitch, showIp, showUser, isHighlighted = false, rackView = false }) => {
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    
    const portData = useMemo(() => {
        const isConnected = !!connection;
        const hasLink = isConnected && connection.hasLink;
        const wallPort = isConnected ? maps.wallPorts.get(connection.wallPortId) : null;
        const user = isConnected ? maps.users.get(connection.userId) : null;
        const vlanColor = isConnected && connection.vlan ? maps.vlanColors.get(connection.vlan)?.color : null;
        
        const borderClass = isHighlighted
            ? 'border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400 ring-opacity-50'
            : isConnected 
                ? (hasLink ? 'border-cyan-500 bg-cyan-500/10' : 'border-orange-500 bg-orange-500/10') 
                : 'border-slate-600 bg-slate-700/50';
        const textClass = isHighlighted
            ? 'text-yellow-300'
            : isConnected 
                ? (hasLink ? 'text-cyan-400' : 'text-orange-400') 
                : 'text-slate-400';
            
        return { isConnected, hasLink, wallPort, user, vlanColor, borderClass, textClass };
    }, [connection, maps.wallPorts, maps.users, maps.vlanColors, isHighlighted]);
    
    const handleDoubleClick = () => {
        if (portData.isConnected && onNavigateToSwitch) {
            // Navigate to switch port edit (not wall port edit)
            onNavigateToSwitch(connection);
        } else if (portData.isConnected) {
            // Fallback to wall port edit if navigation function not available
            onEdit(connection.wallPortId);
        } else {
            onAssign(switchId, portNum);
        }
    };

    const handleRightClick = (e) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleCopyIP = useCallback(() => {
        if (connection?.ipAddress && connection.ipAddress !== 'DHCP') {
            navigator.clipboard.writeText(connection.ipAddress);
        }
    }, [connection?.ipAddress]);

    const contextMenuItems = useMemo(() => {
        return portData.isConnected ? [
            {
                id: 'edit',
                label: 'Edit Connection',
                icon: Edit,
                onClick: () => onEdit(connection.wallPortId)
            },
            {
                id: 'copy-ip',
                label: 'Copy IP Address',
                icon: Copy,
                onClick: handleCopyIP,
                disabled: !connection?.ipAddress || connection.ipAddress === 'DHCP'
            },
            { type: 'separator' },
            {
                id: 'disconnect',
                label: 'Disconnect',
                icon: Trash2,
                onClick: () => onDisconnect && onDisconnect(connection.wallPortId),
                destructive: true,
                disabled: !onDisconnect
            }
        ] : [
            {
                id: 'assign',
                label: 'Assign Connection',
                icon: Plus,
                onClick: () => onAssign(switchId, portNum)
            }
        ];
    }, [portData.isConnected, connection, onEdit, onAssign, onDisconnect, switchId, portNum, handleCopyIP]);


    return (
        <>
            <div className="group relative" onDoubleClick={handleDoubleClick} onContextMenu={handleRightClick}>
                {rackView ? (
                    // Horizontal Rack Port View - compact like real switches
                    <div 
                        className={`port-container ${portData.isConnected ? 'connected' : ''} w-12 h-16 flex flex-col items-center justify-center rounded-md border cursor-pointer ${portData.borderClass} p-1 shadow-sm relative overflow-hidden transition-all hover:scale-105`}
                        style={portData.vlanColor ? { 
                            borderBottom: `3px solid ${portData.vlanColor}`,
                        } : undefined}
                    >
                        {/* Status LED */}
                        <div className={`w-1.5 h-1.5 rounded-full mb-1 ${
                            portData.isConnected 
                                ? (portData.hasLink ? 'bg-green-500 animate-pulse' : 'bg-orange-500') 
                                : 'bg-slate-600'
                        }`} />
                        
                        {/* Port Number */}
                        <span className={`text-[10px] font-mono font-bold ${portData.textClass} relative z-10`}>{portNum}</span>
                        
                        {/* Connection indicator */}
                        {portData.isConnected && (
                            <div className="w-2 h-0.5 bg-cyan-400 mt-1 rounded-full opacity-80" />
                        )}
                        
                        {/* VLAN color accent */}
                        {portData.vlanColor && (
                            <div 
                                className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
                                style={{ backgroundColor: portData.vlanColor }}
                            />
                        )}
                    </div>
                ) : (
                    // Original Card View
                    <div 
                        className={`port-container ${portData.isConnected ? 'connected' : ''} w-32 h-20 flex flex-col items-center justify-center rounded-xl border-2 cursor-pointer ${portData.borderClass} p-1 shadow-lg relative overflow-hidden`}
                        style={portData.vlanColor ? { 
                            borderTop: `4px solid ${portData.vlanColor}`,
                            borderLeft: `3px solid ${portData.vlanColor}`,
                        } : undefined}
                    >
                    {/* VLAN color accent */}
                    {portData.vlanColor && (
                        <div 
                            className="absolute top-0 right-0 w-6 h-6 opacity-20 rounded-bl-lg"
                            style={{ backgroundColor: portData.vlanColor }}
                        />
                    )}
                    
                    <span className={`text-sm font-mono font-bold ${portData.textClass} relative z-10`}>{portNum}</span>
                    {portData.isConnected && (
                        <div className="text-[10px] text-slate-300 truncate w-full text-center leading-tight relative z-10">
                            <p>{portData.wallPort?.portNumber || '??'}</p>
                            {showIp && <p className="font-semibold text-slate-400">{connection.ipAddress || 'N/A'}</p>}
                            {showUser && <p className="font-semibold">{portData.user?.name || 'N/A'}</p>}
                            {connection?.vlan && (
                                <div 
                                    className="inline-block px-1 rounded text-[8px] font-bold mt-0.5"
                                    style={{ 
                                        backgroundColor: portData.vlanColor || '#4b5563',
                                        color: portData.vlanColor ? '#fff' : '#9ca3af'
                                    }}
                                >
                                    VLAN {connection.vlan}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                )}
                
                {/* Tooltip - shows for both views */}
                {portData.isConnected && (
                    <div className={`absolute ${rackView ? 'top-full left-1/2 -translate-x-1/2 mt-2' : 'bottom-full left-1/2 -translate-x-1/2 mb-2'} w-max max-w-xs p-2.5 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-xs`}>
                        <p><strong>Status:</strong> <span className={portData.hasLink ? 'text-green-400' : 'text-orange-400'}>{portData.hasLink ? 'Link Up' : 'Link Down'}</span></p>
                        <p><strong>Wall Port:</strong> {maps.floors.get(portData.wallPort?.floorId)?.name} / {portData.wallPort?.portNumber}</p>
                        <p><strong>User:</strong> {portData.user?.name || 'N/A'}</p>
                        <p><strong>IP:</strong> {connection.ipAddress || 'N/A'}</p>
                        <p><strong>VLAN:</strong> {connection?.vlan || 'N/A'}</p>
                    </div>
                )}
            </div>
            <ContextMenu
                visible={contextMenu.visible}
                x={contextMenu.x}
                y={contextMenu.y}
                items={contextMenuItems}
                onClose={() => setContextMenu({ ...contextMenu, visible: false })}
            />
        </>
    );
});

export default SwitchPort;