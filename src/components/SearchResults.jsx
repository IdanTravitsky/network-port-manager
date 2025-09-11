import React, { useState } from 'react';
import { MapPin, Server, Wifi, Cable, Hash, User, X, ExternalLink, Edit2, Save } from 'lucide-react';

const SearchResults = ({ user, connections, maps, onClose, onNavigateToSwitch, onNavigateToWallPort, onUserUpdate }) => {
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editedUserName, setEditedUserName] = useState(user?.name || '');

    if (!user) return null;

    const userConnections = connections.filter(conn => conn.userId === user.id);

    const handleSaveUser = () => {
        if (editedUserName.trim() && editedUserName.trim() !== user.name && onUserUpdate) {
            onUserUpdate(user.id, { ...user, name: editedUserName.trim() });
        }
        setIsEditingUser(false);
    };

    const handleCancelEdit = () => {
        setEditedUserName(user.name);
        setIsEditingUser(false);
    };

    const handleViewSwitch = (connection) => {
        // Close the search results modal first, then navigate to switch
        onClose();
        if (onNavigateToSwitch) {
            onNavigateToSwitch(connection);
        }
    };

    const getConnectionDetails = (connection) => {
        const wallPort = maps.wallPorts.get(connection.wallPortId);
        const floor = wallPort ? maps.floors.get(wallPort.floorId) : null;
        const switchData = connection.connectionType !== 'local_device' ? maps.switches.get(connection.switchId) : null;
        const vlanColor = connection.vlan ? maps.vlanColors.get(connection.vlan)?.color : null;

        return { wallPort, floor, switchData, vlanColor };
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 modal-backdrop" style={{ zIndex: 9999999 }}>
            <div className="modal-content max-w-lg w-full max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--primary-gradient)' }}>
                            <User size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                            {isEditingUser ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editedUserName}
                                        onChange={(e) => setEditedUserName(e.target.value)}
                                        className="input-style text-xl font-bold text-gradient bg-slate-700/50 px-3 py-1 flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveUser();
                                            if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveUser}
                                        className="button-primary px-3 py-1.5 text-sm"
                                        title="Save changes"
                                    >
                                        <Save size={14} />
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="button-secondary px-3 py-1.5 text-sm"
                                        title="Cancel editing"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div>
                                        <h2 className="text-xl font-bold text-gradient">{user.name}</h2>
                                        <p style={{ color: 'var(--text-secondary)' }}>Connection Details</p>
                                    </div>
                                    {onUserUpdate && (
                                        <button
                                            onClick={() => setIsEditingUser(true)}
                                            className="p-2 rounded-lg transition-colors hover:bg-slate-600/50"
                                            title="Edit user name"
                                        >
                                            <Edit2 size={16} style={{ color: 'var(--text-muted)' }} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-lg transition-colors" 
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--glass-hover)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <X size={20} style={{ color: 'var(--text-muted)' }} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {userConnections.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
                                <Cable size={24} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>No Connections Found</h3>
                            <p style={{ color: 'var(--text-muted)' }}>This user is not currently assigned to any network connections.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gradient">Active Connections</h3>
                                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'var(--primary-gradient)', color: 'white' }}>
                                    {userConnections.length} connection{userConnections.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {userConnections.map((connection) => {
                                    const { wallPort, floor, switchData, vlanColor } = getConnectionDetails(connection);

                                    return (
                                        <div key={connection.id} className="glass-card p-3 hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                                            {/* Connection Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-5 h-5 rounded-full border-2 border-white/30 shadow-lg animate-pulse"
                                                        style={{ 
                                                            backgroundColor: vlanColor || '#64748b',
                                                            boxShadow: `0 0 20px ${vlanColor || '#64748b'}40`
                                                        }}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-lg">
                                                            Port {wallPort?.portNumber || 'Unknown'}
                                                        </span>
                                                        <span className="text-xs text-slate-400">Wall Port</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                                                        connection.hasLink 
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30' 
                                                            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                                                    }`}>
                                                        {connection.hasLink ? '🟢 Link Up' : '🔴 Link Down'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Connection Details Grid */}
                                            <div className="grid grid-cols-1 gap-3">
                                                {/* Location */}
                                                <div className="flex items-start gap-2 group hover:scale-102 transition-all duration-300">
                                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md group-hover:shadow-teal-500/30 transition-all duration-300">
                                                        <MapPin size={16} className="text-white" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-slate-300">Location</p>
                                                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 truncate">
                                                            {floor?.name || 'Unknown Floor'}
                                                        </p>
                                                        {connection.room && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <span className="px-2 py-1 bg-gradient-to-r from-slate-600 to-slate-500 text-white text-xs rounded-full font-medium shadow-lg">
                                                                    Room {connection.room}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Connection Type */}
                                                <div className="flex items-start gap-2 group hover:scale-102 transition-all duration-300">
                                                    <div className={`p-1.5 rounded-lg shadow-md transition-all duration-300 ${
                                                        connection.connectionType === 'local_device'
                                                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 group-hover:shadow-amber-500/30'
                                                            : 'bg-gradient-to-br from-blue-500 to-indigo-500 group-hover:shadow-blue-500/30'
                                                    }`}>
                                                        {connection.connectionType === 'local_device' ? (
                                                            <Wifi size={16} className="text-white" />
                                                        ) : (
                                                            <Server size={16} className="text-white" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-slate-300">Connection Type</p>
                                                        <p className={`text-lg font-bold text-transparent bg-clip-text truncate ${
                                                            connection.connectionType === 'local_device'
                                                                ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                                                                : 'bg-gradient-to-r from-blue-400 to-indigo-400'
                                                        }`}>
                                                            {connection.connectionType === 'local_device' 
                                                                ? 'Local Device' 
                                                                : 'Network Switch'
                                                            }
                                                        </p>
                                                        {connection.deviceDescription && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <span className="px-2 py-1 bg-gradient-to-r from-slate-600 to-slate-500 text-white text-xs rounded-full font-medium shadow-lg truncate">
                                                                    {connection.deviceDescription}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Switch Info (if applicable) */}
                                                {switchData && (
                                                    <div className="flex items-start gap-3 group hover:scale-105 transition-all duration-300">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg group-hover:shadow-purple-500/30">
                                                            <Server size={16} className="text-white" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-slate-300">Network Switch</p>
                                                            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 truncate">
                                                                {switchData.name}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs rounded-full font-mono shadow-lg">
                                                                    Port {connection.switchPort}
                                                                </span>
                                                                <span className="text-xs text-slate-500">
                                                                    {switchData.portCount} ports total
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleViewSwitch(connection)}
                                                                className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30"
                                                            >
                                                                <ExternalLink size={12} />
                                                                View Switch
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* VLAN & Network Info */}
                                                <div className="flex items-start gap-2 group hover:scale-102 transition-all duration-300">
                                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 shadow-md group-hover:shadow-emerald-500/30 transition-all duration-300">
                                                        <Hash size={16} className="text-white" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-slate-300">Network Info</p>
                                                        {connection.vlan && (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span 
                                                                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold text-white shadow-lg animate-pulse"
                                                                    style={{ 
                                                                        backgroundColor: vlanColor || '#64748b',
                                                                        boxShadow: `0 4px 20px ${vlanColor || '#64748b'}40`
                                                                    }}
                                                                >
                                                                    <Hash size={12} className="mr-1" />
                                                                    VLAN {connection.vlan}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-slate-300">IP:</span>
                                                            <span className={`px-2 py-1 rounded-lg text-sm font-mono font-bold shadow-lg ${
                                                                connection.ipAddress && connection.ipAddress !== 'DHCP'
                                                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                                                    : 'bg-gradient-to-r from-slate-600 to-slate-500 text-slate-300'
                                                            }`}>
                                                                {connection.ipAddress || 'DHCP'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-600/50">
                                                <button
                                                    onClick={() => onNavigateToWallPort && onNavigateToWallPort(wallPort)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                                                >
                                                    <ExternalLink size={14} />
                                                    Edit Connection
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;