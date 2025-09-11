import React, { useState, useMemo, memo } from 'react';
import { Search, Columns, Edit, Trash2, Download, Pin, Copy, Plus } from 'lucide-react';
import ContextMenu from '../components/ContextMenu.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import EditableCell from '../components/EditableCell.jsx';
import VirtualScrollTable from '../components/VirtualScrollTable.jsx';
import { exportToCSV } from '../utils/helpers.js';

const WallPortView = memo(({ data, maps, connectionsByWallPortId, wallPortsByFloorId, onEditConnection, onInlineUpdate, onCustomizeColumns, onDeletePort, onBulkEdit, selectedFloorId, setSelectedFloorId }) => {
    const { floors, columns } = data;
    const [searchTerm, setSearchTerm] = useState('');
    const [showVirtual, setShowVirtual] = useState(false);
    const [selectedPorts, setSelectedPorts] = useState(new Set());
    const [vlanFilter, setVlanFilter] = useState('');
    const [linkStatusFilter, setLinkStatusFilter] = useState('');
    const [connectionStatusFilter, setConnectionStatusFilter] = useState('');
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, port: null });
    
    const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);
    
    // Get unique VLANs for filter options
    const availableVlans = useMemo(() => {
        const vlans = new Set();
        data.connections.forEach(conn => {
            if (conn.vlan && conn.vlan.trim()) {
                vlans.add(conn.vlan.trim());
            }
        });
        return Array.from(vlans).sort();
    }, [data.connections]);
    
    const portsByFloor = useMemo(() => {
        const ports = wallPortsByFloorId.get(selectedFloorId) || [];
        return ports.filter(p => showVirtual ? p.isVirtual : !p.isVirtual);
    }, [selectedFloorId, wallPortsByFloorId, showVirtual]);

    const connectionsForFloor = useMemo(() => {
        const map = new Map();
        portsByFloor.forEach(port => {
            const conn = connectionsByWallPortId.get(port.id);
            if (conn) map.set(port.id, conn);
        });
        return map;
    }, [portsByFloor, connectionsByWallPortId]);

    const portsAfterFilters = useMemo(() => {
        if (!vlanFilter && !linkStatusFilter && !connectionStatusFilter) {
            return portsByFloor;
        }
        
        return portsByFloor.filter(port => {
            const connection = connectionsForFloor.get(port.id);

            if (vlanFilter && (!connection || !connection.vlan || connection.vlan.trim() !== vlanFilter)) {
                return false;
            }

            if (linkStatusFilter) {
                if (!connection) return false;
                if (connection.connectionType === 'local_device') {
                    if (linkStatusFilter === 'down') return false;
                } else {
                    const hasLink = connection.hasLink;
                    if (linkStatusFilter === 'up' && !hasLink) return false;
                    if (linkStatusFilter === 'down' && hasLink) return false;
                }
            }

            if (connectionStatusFilter) {
                const isConnected = !!connection;
                if (connectionStatusFilter === 'patched' && !isConnected) return false;
                if (connectionStatusFilter === 'unpatched' && isConnected) return false;
            }

            return true;
        });
    }, [portsByFloor, connectionsForFloor, vlanFilter, linkStatusFilter, connectionStatusFilter]);

    const filteredPorts = useMemo(() => {
        if (!searchTerm) return portsAfterFilters;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return portsAfterFilters.filter(port => {
            const connection = connectionsForFloor.get(port.id);
            const user = connection ? maps.users.get(connection.userId) : null;
            
            return (
                port.portNumber?.toLowerCase().includes(lowerCaseSearch) ||
                user?.name?.toLowerCase().includes(lowerCaseSearch) ||
                connection?.ipAddress?.toLowerCase().includes(lowerCaseSearch) ||
                connection?.vlan?.toLowerCase().includes(lowerCaseSearch) ||
                connection?.room?.toLowerCase().includes(lowerCaseSearch)
            );
        });
    }, [portsAfterFilters, searchTerm, connectionsForFloor, maps.users]);
    
    const handleSelectPort = (portId) => {
        setSelectedPorts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(portId)) {
                newSet.delete(portId);
            } else {
                newSet.add(portId);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = () => {
        if (selectedPorts.size === filteredPorts.length) {
            setSelectedPorts(new Set());
        } else {
            setSelectedPorts(new Set(filteredPorts.map(p => p.id)));
        }
    };
    
    const handleExportCSV = () => {
        const exportData = filteredPorts.map(port => {
            const connection = connectionsByWallPortId.get(port.id);
            const switchInfo = connection ? maps.switches.get(connection.switchId) : null;
            const user = connection ? maps.users.get(connection.userId) : null;
            
            return {
                'Port Number': port.portNumber,
                'Connection Status': connection ? 'Connected' : 'Disconnected',
                'Connection Type': connection ? (connection.connectionType === 'local_device' ? 'Local Device' : 'Patched to Switch') : '',
                'Switch': switchInfo ? switchInfo.name : '',
                'Switch IP': switchInfo ? switchInfo.ip : '',
                'Switch Port': connection && connection.connectionType !== 'local_device' ? connection.switchPort : '',
                'Link Status': connection ? (connection.connectionType === 'local_device' ? 'Up' : (connection.hasLink ? 'Up' : 'Down')) : '',
                'Device Description': connection?.deviceDescription || '',
                'VLAN': connection?.vlan || '',
                'Room': connection?.room || '',
                'Assigned User': user?.name || '',
                'IP Address': connection?.ipAddress || '',
                'Floor': maps.floors.get(port.floorId)?.name || '',
                'Port Type': port.isVirtual ? 'Virtual' : 'Physical'
            };
        });
        
        const floorName = maps.floors.get(selectedFloorId)?.name || 'Unknown';
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `wall-ports-${floorName.replace(/\s+/g, '-')}-${timestamp}.csv`;
        
        exportToCSV(exportData, filename);
    };

    const handleRowRightClick = (e, port) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            port
        });
    };

    const handleCopyIP = (port) => {
        const connection = connectionsByWallPortId.get(port.id);
        if (connection?.ipAddress && connection.ipAddress !== 'DHCP') {
            navigator.clipboard.writeText(connection.ipAddress);
        }
    };

    const getContextMenuItems = (port) => {
        const connection = connectionsByWallPortId.get(port.id);
        const isConnected = !!connection;

        if (isConnected) {
            return [
                {
                    id: 'edit',
                    label: 'Edit Connection',
                    icon: Edit,
                    onClick: () => onEditConnection(port.id)
                },
                {
                    id: 'copy-ip',
                    label: 'Copy IP Address',
                    icon: Copy,
                    onClick: () => handleCopyIP(port),
                    disabled: !connection?.ipAddress || connection.ipAddress === 'DHCP'
                },
                { type: 'separator' },
                {
                    id: 'delete',
                    label: 'Delete Port',
                    icon: Trash2,
                    onClick: () => onDeletePort(port.id),
                    destructive: true,
                    disabled: !onDeletePort
                }
            ];
        } else {
            return [
                {
                    id: 'create-connection',
                    label: 'Create Connection',
                    icon: Plus,
                    onClick: () => onEditConnection(port.id)
                },
                { type: 'separator' },
                {
                    id: 'delete',
                    label: 'Delete Port',
                    icon: Trash2,
                    onClick: () => onDeletePort(port.id),
                    destructive: true,
                    disabled: !onDeletePort
                }
            ];
        }
    };
    
    const renderCellContent = (port, col) => {
        const connection = connectionsByWallPortId.get(port.id);
        const switchInfo = connection ? maps.switches.get(connection.switchId) : null;
        const user = connection ? maps.users.get(connection.userId) : null;
        const vlanColor = connection?.vlan ? maps.vlanColors.get(connection.vlan)?.color : null;
        
        switch (col.id) {
            case 'portNumber': 
                return (
                    <div className="flex items-center gap-2">
                        {vlanColor && (
                            <div 
                                className="w-3 h-3 rounded-full border border-slate-600 vlan-indicator"
                                style={{ backgroundColor: vlanColor }}
                                title={`VLAN ${connection.vlan}`}
                            />
                        )}
                        <span className="font-mono font-bold text-cyan-400">{port.portNumber}</span>
                    </div>
                );
            case 'status': 
                if (!connection) return <span className="text-slate-500 italic">Disconnected</span>;
                if (connection.connectionType === 'local_device') {
                    return (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-yellow-400 font-semibold">{connection.deviceDescription || 'Local Device'}</span>
                        </div>
                    );
                }
                if (switchInfo) {
                    const hasLink = connection.hasLink;
                    return (
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${hasLink ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                            <span className="text-green-400 font-semibold">{switchInfo.name}</span>
                        </div>
                    );
                }
                return <span className="text-slate-500 italic">Disconnected</span>;
            case 'switchPort': return (connection && connection.connectionType !== 'local_device') ? <span className="font-mono">{connection.switchPort}</span> : '';
            case 'vlan': 
                if (connection && connection.connectionType !== 'local_device' && connection.vlan) {
                    return (
                        <div className="flex items-center gap-2">
                            {vlanColor && (
                                <div 
                                    className="w-2 h-2 rounded-full vlan-indicator"
                                    style={{ backgroundColor: vlanColor }}
                                />
                            )}
                            <span 
                                className="px-2 py-1 rounded text-xs font-semibold vlan-badge"
                                style={{ 
                                    backgroundColor: vlanColor ? `${vlanColor}20` : '#374151',
                                    color: vlanColor || '#9ca3af',
                                    border: vlanColor ? `1px solid ${vlanColor}40` : '1px solid #4b5563'
                                }}
                            >
                                {connection.vlan}
                            </span>
                        </div>
                    );
                }
                return '';
            case 'room': return connection?.room || '';
            case 'user': return user?.name || '';
            case 'ipAddress': return connection?.ipAddress || '';
            default: return col.isCustom ? (connection?.customData?.[col.id] || '') : '';
        }
    };
    
    const getFieldAndValue = (port, col) => {
        const connection = connectionsByWallPortId.get(port.id);
        let value, fieldId = col.id;
        if(col.type === 'select') {
            fieldId = `${col.optionsKey.slice(0, -1)}Id`;
            value = connection?.[fieldId] || '';
        } else {
            value = connection?.[fieldId] || '';
        }
        return { value, fieldId };
    };

    // Virtual scrolling row renderer
    const renderPortRow = (port) => {
        const connection = connectionsForFloor.get(port.id);
        const vlanColor = connection?.vlan ? maps.vlanColors.get(connection.vlan)?.color : null;
        
        return (
            <div 
                className="w-full border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors flex items-center min-h-[60px] px-3 relative"
                onContextMenu={(e) => handleRowRightClick(e, port)}
                style={{ 
                    transform: 'translateZ(0)',
                    borderLeft: vlanColor ? `4px solid ${vlanColor}` : undefined
                }} // GPU acceleration + VLAN color border
            >
                {/* VLAN background accent */}
                {vlanColor && (
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1 opacity-30"
                        style={{ backgroundColor: vlanColor }}
                    />
                )}
                
                <div className="w-12 flex-shrink-0">
                    <input
                        type="checkbox"
                        checked={selectedPorts.has(port.id)}
                        onChange={() => handleSelectPort(port.id)}
                        className="w-4 h-4 rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-600"
                    />
                </div>
                {visibleColumns.map(col => {
                    const { value, fieldId } = getFieldAndValue(port, col);
                    return (
                        <div key={col.id} className="flex-1 min-w-0 px-2">
                            <EditableCell
                                isEditable={col.isEditable && !!connectionsForFloor.get(port.id)}
                                type={col.type || 'text'}
                                value={value}
                                displayValue={renderCellContent(port, col)}
                                options={col.optionsKey ? data[col.optionsKey].map(i => ({value: i.id, label: i.name || i.tag})) : []}
                                onSave={(newValue) => onInlineUpdate(port.id, fieldId, newValue)}
                            />
                        </div>
                    );
                })}
                <div className="w-24 flex-shrink-0 flex items-center gap-1 px-2">
                    <button
                        onClick={() => onInlineUpdate(port.id, { isPinned: !port.isPinned })}
                        className={`p-2 rounded-md transition-colors ${
                            port.isPinned
                                ? 'text-yellow-400 bg-yellow-400/20 hover:bg-yellow-400/30'
                                : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/20'
                        }`}
                        title={port.isPinned ? 'Unpin port' : 'Pin port'}
                    >
                        <Pin size={16} />
                    </button>
                    <button
                        onClick={() => onEditConnection(port.id)}
                        className="p-2 rounded-md hover:bg-slate-600 transition-colors"
                        title="Edit Connection"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onDeletePort(port.id)}
                        className="p-2 rounded-md text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Delete Port"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    };

    // Table headers for virtual scrolling
    const tableHeaders = (
        <div className="flex items-center bg-slate-700/50 min-h-[60px] px-3">
            <div className="w-12 flex-shrink-0">
                <input
                    type="checkbox"
                    checked={selectedPorts.size === filteredPorts.length && filteredPorts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-600"
                />
            </div>
            {visibleColumns.map(col => 
                <div key={col.id} className="flex-1 min-w-0 px-2 font-medium text-slate-300">{col.label}</div>
            )}
            <div className="w-24 flex-shrink-0 px-2 font-medium text-slate-300">Actions</div>
        </div>
    );

    const useVirtualScrolling = filteredPorts.length > 50;

    
    return (
        <>
        <div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <h2 className="text-2xl font-bold text-white">Wall Ports</h2>
                    {floors.length > 0 && (
                        <CustomSelect 
                            value={selectedFloorId} 
                            onChange={setSelectedFloorId} 
                            options={floors.map(f => ({ value: f.id, label: f.name }))} 
                            placeholder="Select a Floor"
                        />
                    )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedPorts.size > 0 && (
                        <button 
                            onClick={() => onBulkEdit(Array.from(selectedPorts))} 
                            className="button-primary px-4 py-2 text-sm font-medium"
                        >
                            Bulk Edit ({selectedPorts.size})
                        </button>
                    )}
                    <div className="relative w-full">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className="input-style w-full pl-10"
                        />
                    </div>
                    <button onClick={onCustomizeColumns} className="button-secondary p-2.5">
                        <Columns size={16} />
                    </button>
                    <button onClick={handleExportCSV} className="button-secondary p-2.5" title="Export to CSV">
                        <Download size={16} />
                    </button>
                </div>
            </div>
            
            {/* Filter dropdowns */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Filter by VLAN</label>
                    <CustomSelect 
                        value={vlanFilter} 
                        onChange={setVlanFilter} 
                        options={[
                            { value: '', label: 'All VLANs' },
                            ...availableVlans.map(vlan => ({ value: vlan, label: vlan }))
                        ]}
                        placeholder="All VLANs"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Link Status</label>
                    <CustomSelect 
                        value={linkStatusFilter} 
                        onChange={setLinkStatusFilter} 
                        options={[
                            { value: '', label: 'All Links' },
                            { value: 'up', label: 'Link Up' },
                            { value: 'down', label: 'Link Down' }
                        ]}
                        placeholder="All Links"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Connection</label>
                    <CustomSelect 
                        value={connectionStatusFilter} 
                        onChange={setConnectionStatusFilter} 
                        options={[
                            { value: '', label: 'All Ports' },
                            { value: 'patched', label: 'Connected' },
                            { value: 'unpatched', label: 'Disconnected' }
                        ]}
                        placeholder="All Ports"
                    />
                </div>
            </div>
            
            <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                    <input 
                        type="checkbox" 
                        checked={showVirtual} 
                        onChange={e => setShowVirtual(e.target.checked)} 
                        className="w-4 h-4 rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-600"
                    />
                    Show Temporary Ports
                </label>
            </div>
            {useVirtualScrolling ? (
                <div className="bg-slate-800 rounded-lg">
                    <VirtualScrollTable
                        items={filteredPorts}
                        renderRow={renderPortRow}
                        rowHeight={60}
                        containerHeight={600}
                        headers={tableHeaders}
                        className="bg-slate-800 rounded-lg"
                    />
                </div>
            ) : (
                <div className="overflow-x-auto bg-slate-800 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="p-3 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedPorts.size === filteredPorts.length && filteredPorts.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-600"
                                    />
                                </th>
                                {visibleColumns.map(col => 
                                    <th key={col.id} className="p-3">{col.label}</th>
                                )}
                                <th className="p-3 w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPorts.map(port => (
                                <tr key={port.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors" onContextMenu={(e) => handleRowRightClick(e, port)}>
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedPorts.has(port.id)}
                                            onChange={() => handleSelectPort(port.id)}
                                            className="w-4 h-4 rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-600"
                                        />
                                    </td>
                                    {visibleColumns.map(col => {
                                        const { value, fieldId } = getFieldAndValue(port, col);
                                        return (
                                            <td key={col.id} className="p-0">
                                                <EditableCell
                                                    isEditable={col.isEditable && !!connectionsForFloor.get(port.id)}
                                                    type={col.type || 'text'}
                                                    value={value}
                                                    displayValue={renderCellContent(port, col)}
                                                    options={col.optionsKey ? data[col.optionsKey].map(i => ({value: i.id, label: i.name || i.tag})) : []}
                                                    onSave={(newValue) => onInlineUpdate(port.id, fieldId, newValue)}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="p-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onInlineUpdate(port.id, { isPinned: !port.isPinned })}
                                                className={`p-2 rounded-md transition-colors ${
                                                    port.isPinned
                                                        ? 'text-yellow-400 bg-yellow-400/20 hover:bg-yellow-400/30'
                                                        : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/20'
                                                }`}
                                                title={port.isPinned ? 'Unpin port' : 'Pin port'}
                                            >
                                                <Pin size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEditConnection(port.id)}
                                                className="p-2 rounded-md hover:bg-slate-600 transition-colors"
                                                title="Edit Connection"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDeletePort(port.id)}
                                                className="p-2 rounded-md text-red-400 hover:bg-red-500/20 transition-colors"
                                                title="Delete Port"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        <ContextMenu
            visible={contextMenu.visible}
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextMenu.port ? getContextMenuItems(contextMenu.port) : []}
            onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        />
        </>
    );
});

export default WallPortView;
