import React, { memo, useMemo } from 'react';
import { Pin, Waypoints, Server } from 'lucide-react';
import DashboardCard from '../components/DashboardCard.jsx';
import InfoCard from '../components/InfoCard.jsx';

const DashboardView = memo(({ data, setView, setSelectedFloorId }) => {
    const { totalPorts, patchedPorts, localDevicePorts, connectedPorts, vlanUsage } = useMemo(() => {
        const total = data.wallPorts.length;
        let patched = 0, localDevice = 0;
        const vlans = {};
        
        data.connections.forEach(c => {
            if (c.connectionType === 'patched') patched++;
            else if (c.connectionType === 'local_device') localDevice++;
            
            const vlan = c.vlan && c.vlan.trim() ? c.vlan.trim() : 'Unassigned';
            vlans[vlan] = (vlans[vlan] || 0) + 1;
        });
        
        return {
            totalPorts: total,
            patchedPorts: patched,
            localDevicePorts: localDevice,
            connectedPorts: patched + localDevice,
            vlanUsage: vlans
        };
    }, [data.wallPorts.length, data.connections]);
    
    const vlanEntries = Object.entries(vlanUsage).sort(([,a], [,b]) => b - a);
    const totalVlanConnections = Object.values(vlanUsage).reduce((sum, count) => sum + count, 0);
    
    // Generate colors for pie chart
    const generateColor = (index) => {
        const hue = (index * 137.5) % 360; // Golden angle approximation for better distribution
        const saturation = 65 + (index % 3) * 10; // Vary saturation slightly
        const lightness = 55 + (index % 2) * 10; // Vary lightness slightly
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    // Pinned items analysis
    const pinnedSwitches = data.switches.filter(sw => sw.isPinned);
    const pinnedPorts = data.wallPorts.filter(port => port.isPinned);
    
    const handlePinnedItemClick = (item, type) => {
        if (type === 'switch') {
            setView('switch');
        } else if (type === 'port') {
            setView('wall');
            if (setSelectedFloorId && item.floorId) {
                setSelectedFloorId(item.floorId);
            }
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoCard title="Total Wall Ports" value={totalPorts} />
                        <InfoCard title="Connected Ports" value={connectedPorts} />
                        <InfoCard title="Available Ports" value={totalPorts - connectedPorts} />
                    </div>
                    <DashboardCard title="Switch Capacity">
                        <div className="space-y-4 p-4">
                            {data.switches.map(sw => { 
                                const used = data.connections.filter(c => c.switchId === sw.id).length; 
                                const capacity = sw.portCount > 0 ? (used / sw.portCount) * 100 : 0; 
                                return (
                                    <div key={sw.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-semibold">{sw.name}</span>
                                            <span className="text-slate-400">{used} / {sw.portCount} Ports</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{width: `${capacity}%`}}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </DashboardCard>
                </div>
                <div className="space-y-6">
                    <DashboardCard title="Connection Status">
                        <div className="p-4 flex flex-col items-center justify-center space-y-2 text-sm">
                            <div className="flex justify-between w-full">
                                <span className="text-slate-300">Patched to Switch:</span>
                                <span className="font-bold text-green-400">{patchedPorts}</span>
                            </div>
                            <div className="flex justify-between w-full">
                                <span className="text-slate-300">Local Devices:</span>
                                <span className="font-bold text-yellow-400">{localDevicePorts}</span>
                            </div>
                            <div className="flex justify-between w-full pt-2 border-t border-slate-700 mt-2">
                                <span className="font-bold text-cyan-400">Total Connected:</span>
                                <span className="font-bold text-cyan-400">{connectedPorts}</span>
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard title="VLAN Usage">
                        <div className="p-4">
                            {totalVlanConnections > 0 ? (
                                <div className="flex flex-col items-center">
                                    <div className="relative w-40 h-40 mb-4">
                                        <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                                            <circle 
                                                cx="21" 
                                                cy="21" 
                                                r="15.91549430918954" 
                                                fill="transparent" 
                                                stroke="#374151" 
                                                strokeWidth="3"
                                            />
                                            {vlanEntries.map(([vlan, count], index) => {
                                                const percentage = (count / totalVlanConnections) * 100;
                                                const strokeDasharray = `${percentage} ${100 - percentage}`;
                                                const strokeDashoffset = vlanEntries
                                                    .slice(0, index)
                                                    .reduce((offset, [,c]) => offset - (c / totalVlanConnections) * 100, 0);
                                                
                                                return (
                                                    <circle
                                                        key={vlan}
                                                        cx="21"
                                                        cy="21"
                                                        r="15.91549430918954"
                                                        fill="transparent"
                                                        stroke={generateColor(index)}
                                                        strokeWidth="3"
                                                        strokeDasharray={strokeDasharray}
                                                        strokeDashoffset={strokeDashoffset}
                                                    />
                                                );
                                            })}
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-white">{vlanEntries.length}</div>
                                                <div className="text-xs text-slate-400">VLANs</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full space-y-2 max-h-32 overflow-y-auto">
                                        {vlanEntries.map(([vlan, count], index) => (
                                            <div key={vlan} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full flex-shrink-0" 
                                                        style={{ backgroundColor: generateColor(index) }}
                                                    />
                                                    <span className="text-slate-300 truncate">
                                                        {vlan === 'Unassigned' ? 'No VLAN' : `VLAN ${vlan}`}
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-white ml-2">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <div className="text-4xl mb-2">📊</div>
                                    <div>No VLAN data available</div>
                                    <div className="text-xs mt-1">Connect some ports to see VLAN usage</div>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Port Status">
                        <div className="p-4 flex justify-center items-center h-48">
                            <svg viewBox="0 0 36 36" className="w-32 h-32">
                                <path 
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                    fill="none" 
                                    stroke="#475569" 
                                    strokeWidth="3" 
                                />
                                <path 
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                    fill="none" 
                                    stroke="#22d3ee" 
                                    strokeWidth="3" 
                                    strokeDasharray={`${totalPorts > 0 ? (connectedPorts/totalPorts)*100 : 0}, 100`} 
                                />
                                <text x="18" y="22" textAnchor="middle" className="text-2xl font-bold fill-white">
                                    {totalPorts > 0 ? Math.round((connectedPorts/totalPorts)*100) : 0}%
                                </text>
                            </svg>
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Pinned Items">
                        <div className="p-4">
                            {(pinnedSwitches.length > 0 || pinnedPorts.length > 0) ? (
                                <div className="space-y-3">
                                    {pinnedSwitches.map(sw => {
                                        const floor = data.floors.find(f => f.id === sw.floorId);
                                        return (
                                            <div 
                                                key={sw.id}
                                                onClick={() => handlePinnedItemClick(sw, 'switch')}
                                                className="flex items-center gap-3 p-2 rounded-md bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors group"
                                            >
                                                <Server size={16} className="text-blue-400 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-white text-sm truncate">{sw.name}</div>
                                                    <div className="text-xs text-slate-400 truncate">
                                                        {sw.ip} • {floor?.name || 'Unknown Floor'}
                                                    </div>
                                                </div>
                                                <Pin size={12} className="text-yellow-400 flex-shrink-0" />
                                            </div>
                                        );
                                    })}
                                    {pinnedPorts.map(port => {
                                        const floor = data.floors.find(f => f.id === port.floorId);
                                        const connection = data.connections.find(c => c.wallPortId === port.id);
                                        return (
                                            <div 
                                                key={port.id}
                                                onClick={() => handlePinnedItemClick(port, 'port')}
                                                className="flex items-center gap-3 p-2 rounded-md bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors group"
                                            >
                                                <Waypoints size={16} className="text-green-400 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-white text-sm truncate">Port {port.portNumber}</div>
                                                    <div className="text-xs text-slate-400 truncate">
                                                        {floor?.name || 'Unknown Floor'} • {connection ? 'Connected' : 'Available'}
                                                    </div>
                                                </div>
                                                <Pin size={12} className="text-yellow-400 flex-shrink-0" />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <Pin size={32} className="mx-auto mb-2 text-slate-500" />
                                    <div className="text-sm">No pinned items</div>
                                    <div className="text-xs mt-1">Pin switches or ports for quick access</div>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Recent Activity">
                        <ul className="p-4 space-y-2 text-sm max-h-60 overflow-y-auto">
                            {data.activityLog.map(log => (
                                <li key={log.timestamp} className="text-slate-400">
                                    <span className="font-semibold text-slate-300">{log.message}</span>
                                    <div className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</div>
                                </li>
                            ))}
                        </ul>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
});

export default DashboardView;