import React, { useState, useMemo } from 'react';
import { Clock, Server, Plug, User, ArrowRight, Filter, Calendar } from 'lucide-react';

const LatestChangesView = ({ data, maps }) => {
    const [filter, setFilter] = useState('all'); // all, connections, disconnections, modifications
    const [timeFilter, setTimeFilter] = useState('all'); // all, today, week, month
    
    // Combine and sort activities
    const combinedActivities = useMemo(() => {
        const activities = [];
        
        // Add general activity log
        data.activityLog?.forEach(activity => {
            activities.push({
                ...activity,
                source: 'general',
                icon: activity.type === 'disconnect' ? Plug : Clock
            });
        });
        
        // Add switch port specific history
        data.switchPortHistory?.forEach(history => {
            const switchName = maps.switches.get(history.switchId)?.name || 'Unknown Switch';
            const user = maps.users.get(history.userId);
            const wallPort = maps.wallPorts.get(history.wallPortId);
            
            activities.push({
                ...history,
                source: 'switch_port',
                icon: Server,
                switchName,
                userName: user?.name,
                wallPortNumber: wallPort?.portNumber
            });
        });
        
        // Sort by timestamp (newest first)
        return activities.sort((a, b) => b.timestamp - a.timestamp);
    }, [data.activityLog, data.switchPortHistory, maps]);
    
    // Apply filters
    const filteredActivities = useMemo(() => {
        let filtered = combinedActivities;
        
        // Apply type filter
        if (filter !== 'all') {
            filtered = filtered.filter(activity => {
                switch (filter) {
                    case 'connections':
                        return activity.action === 'connected' || activity.type === 'connection';
                    case 'disconnections':
                        return activity.action === 'disconnected' || activity.type === 'disconnect';
                    case 'modifications':
                        return activity.action === 'modified';
                    case 'switch_ports':
                        return activity.source === 'switch_port';
                    default:
                        return true;
                }
            });
        }
        
        // Apply time filter
        if (timeFilter !== 'all') {
            const now = Date.now();
            const timeThresholds = {
                today: 24 * 60 * 60 * 1000, // 24 hours
                week: 7 * 24 * 60 * 60 * 1000, // 7 days
                month: 30 * 24 * 60 * 60 * 1000 // 30 days
            };
            
            const threshold = timeThresholds[timeFilter];
            if (threshold) {
                filtered = filtered.filter(activity => 
                    now - activity.timestamp <= threshold
                );
            }
        }
        
        return filtered;
    }, [combinedActivities, filter, timeFilter]);
    
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const getActivityColor = (activity) => {
        switch (activity.action || activity.type) {
            case 'connected':
            case 'connection':
                return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'disconnected':
            case 'disconnect':
                return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'modified':
                return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default:
                return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };
    
    const renderActivityDetails = (activity) => {
        if (activity.source === 'switch_port') {
            return (
                <div className="text-sm space-y-1">
                    <p className="text-slate-200">{activity.details}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                        <span>Switch: {activity.switchName}</span>
                        <span>Port: {activity.portNumber}</span>
                        {activity.wallPortNumber && <span>Wall Port: {activity.wallPortNumber}</span>}
                        {activity.userName && <span>User: {activity.userName}</span>}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="text-sm">
                    <p className="text-slate-200">{activity.message}</p>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-1 text-xs text-slate-400">
                            {activity.metadata.switchId && <span>Switch: {maps.switches.get(activity.metadata.switchId)?.name || 'Unknown'} </span>}
                            {activity.metadata.portNumber && <span>Port: {activity.metadata.portNumber} </span>}
                            {activity.metadata.wallPort && <span>Wall Port: {activity.metadata.wallPort} </span>}
                            {activity.metadata.user && <span>User: {activity.metadata.user}</span>}
                        </div>
                    )}
                </div>
            );
        }
    };
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gradient">Latest Changes</h2>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <select 
                            value={filter} 
                            onChange={e => setFilter(e.target.value)}
                            className="input-style py-1 px-3 text-sm"
                        >
                            <option value="all">All Activities</option>
                            <option value="connections">Connections</option>
                            <option value="disconnections">Disconnections</option>
                            <option value="modifications">Modifications</option>
                            <option value="switch_ports">Switch Port Activities</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <select 
                            value={timeFilter} 
                            onChange={e => setTimeFilter(e.target.value)}
                            className="input-style py-1 px-3 text-sm"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Activity List */}
            <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Clock size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No activities found matching your filters.</p>
                    </div>
                ) : (
                    filteredActivities.map(activity => {
                        const IconComponent = activity.icon;
                        const colorClasses = getActivityColor(activity);
                        
                        return (
                            <div 
                                key={activity.id} 
                                className={`activity-card border rounded-lg p-4 ${colorClasses}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <IconComponent size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {renderActivityDetails(activity)}
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-slate-500">
                                                {formatTimestamp(activity.timestamp)}
                                            </span>
                                            {activity.source === 'switch_port' && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-slate-600 text-slate-300">
                                                    Switch Port Activity
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            {filteredActivities.length > 0 && (
                <div className="mt-8 text-center text-sm text-slate-400">
                    Showing {filteredActivities.length} activit{filteredActivities.length === 1 ? 'y' : 'ies'}
                    {filter !== 'all' && ` (${filter} filter applied)`}
                    {timeFilter !== 'all' && ` (${timeFilter} filter applied)`}
                </div>
            )}
        </div>
    );
};

export default LatestChangesView;