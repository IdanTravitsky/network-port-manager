import React from 'react';
import { MapPin, Server, Wifi, Cable, Hash, User, X, ExternalLink } from 'lucide-react';

const SearchResults = ({ user, connections, maps, onClose, onNavigateToSwitch, onNavigateToWallPort }) => {
    if (!user) return null;

    const userConnections = connections.filter(conn => conn.userId === user.id);

    const getConnectionDetails = (connection) => {
        const wallPort = maps.wallPorts.get(connection.wallPortId);
        const floor = wallPort ? maps.floors.get(wallPort.floorId) : null;
        const switchData = connection.connectionType !== 'local_device' ? maps.switches.get(connection.switchId) : null;
        const vlanColor = connection.vlan ? maps.vlanColors.get(connection.vlan)?.color : null;

        return { wallPort, floor, switchData, vlanColor };
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 modal-backdrop" style={{ zIndex: 9999999 }}>
            <div className="modal-content max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--primary-gradient)' }}>
                            <User size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gradient">{user.name}</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Connection Details</p>
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
                <div className="p-6">
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
                                        <div key={connection.id} className="glass-card p-4">
                                            {/* Connection Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-4 h-4 rounded-full border-2 border-white/20"
                                                        style={{ backgroundColor: vlanColor || '#64748b' }}
                                                    />
                                                    <span className="font-mono font-bold text-accent-gradient">
                                                        {wallPort?.portNumber || 'Unknown Port'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        connection.hasLink 
                                                            ? 'status-online' 
                                                            : 'status-offline'
                                                    }`}>
                                                        {connection.hasLink ? 'Link Up' : 'Link Down'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Connection Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Location */}
                                                <div className="flex items-start gap-3">
                                                    <div className="p-1.5 rounded" style={{ background: 'var(--glass-bg)' }}>
                                                        <MapPin size={16} className="text-slate-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Location</p>
                                                        <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                                                            {floor?.name || 'Unknown Floor'}
                                                        </p>
                                                        {connection.room && (
                                                            <p className="text-xs text-slate-500">Room: {connection.room}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Connection Type */}
                                                <div className="flex items-start gap-3">
                                                    <div className="p-1.5 rounded" style={{ background: 'var(--glass-bg)' }}>
                                                        {connection.connectionType === 'local_device' ? (
                                                            <Wifi size={16} className="text-slate-400" />
                                                        ) : (
                                                            <Server size={16} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Connection</p>
                                                        <p className="text-sm text-slate-400">
                                                            {connection.connectionType === 'local_device' 
                                                                ? 'Local Device' 
                                                                : 'Network Switch'
                                                            }
                                                        </p>
                                                        {connection.deviceDescription && (
                                                            <p className="text-xs text-slate-500 truncate">{connection.deviceDescription}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Switch Info (if applicable) */}
                                                {switchData && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-1.5 rounded" style={{ background: 'var(--glass-bg)' }}>
                                                            <Server size={16} className="text-slate-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Switch</p>
                                                            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{switchData.name}</p>
                                                            <p className="text-xs text-slate-500">Port: {connection.switchPort}</p>
                                                            <button
                                                                onClick={() => onNavigateToSwitch && onNavigateToSwitch(connection)}
                                                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1"
                                                            >
                                                                <ExternalLink size={10} />
                                                                View Switch
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* VLAN & Network Info */}
                                                <div className="flex items-start gap-3">
                                                    <div className="p-1.5 rounded" style={{ background: 'var(--glass-bg)' }}>
                                                        <Hash size={16} className="text-slate-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Network</p>
                                                        {connection.vlan && (
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span 
                                                                    className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white"
                                                                    style={{ backgroundColor: vlanColor || '#64748b' }}
                                                                >
                                                                    VLAN {connection.vlan}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-slate-400">
                                                            IP: {connection.ipAddress || 'DHCP'}
                                                        </p>
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