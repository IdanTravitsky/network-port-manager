import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Import utility functions
import { sortWallPorts } from './utils/helpers.js';

// Import components
import Header from './components/Header.jsx';
import ConnectionModal from './components/ConnectionModal.jsx';
import ColumnCustomizationModal from './components/ColumnCustomizationModal.jsx';
import BulkEditModal from './components/BulkEditModal.jsx';
import SwitchLayoutModal from './components/SwitchLayoutModal.jsx';
import StyleInjector from './components/StyleInjector.jsx';
import NetworkClosetView from './components/NetworkClosetView.jsx';

// Import views
import DashboardView from './views/DashboardView.jsx';
import WallPortView from './views/WallPortView.jsx';
import SwitchView from './views/SwitchView.jsx';
import LatestChangesView from './views/LatestChangesView.jsx';
import GenericCrudView from './views/GenericCrudView.jsx';
import SettingsView from './views/SettingsView.jsx';

// Constants
const LOCAL_STORAGE_KEY = 'network-asset-manager-data-v7';

const DEFAULT_COLUMNS = [
    { id: 'portNumber', label: 'Port', visible: true, isCustom: false, isEditable: false },
    { id: 'status', label: 'Status / Switch', visible: true, isCustom: false, isEditable: false },
    { id: 'user', label: 'Assigned User', visible: true, isCustom: false, isEditable: true, type: 'select', optionsKey: 'users' },
    { id: 'ipAddress', label: 'IP Address', visible: true, isCustom: false, isEditable: true, type: 'text' },
    { id: 'switchPort', label: 'Switch Port', visible: true, isCustom: false, isEditable: false },
    { id: 'vlan', label: 'VLAN', visible: true, isCustom: false, isEditable: true, type: 'text' },
    { id: 'room', label: 'Room', visible: true, isCustom: false, isEditable: true, type: 'text' },
];


// Activity logging helper
const logActivity = (setData, message, type = 'general', metadata = {}) => {
    const timestamp = Date.now();
    const activity = {
        id: `activity-${timestamp}`,
        timestamp,
        message,
        type, // general, connection, disconnect, switch_port, etc.
        metadata // Additional structured data
    };
    
    setData(prev => ({
        ...prev,
        activityLog: [activity, ...prev.activityLog.slice(0, 99)] // Keep last 100 activities
    }));
};

// Switch port history logging helper
const logSwitchPortActivity = (setData, switchId, portNumber, action, details, userId = null, wallPortId = null) => {
    const timestamp = Date.now();
    const historyEntry = {
        id: `switch-history-${timestamp}`,
        timestamp,
        switchId,
        portNumber,
        action, // 'connected', 'disconnected', 'modified', 'link_up', 'link_down'
        details, // Human readable description
        userId,
        wallPortId,
        metadata: details // Additional structured data
    };
    
    setData(prev => ({
        ...prev,
        switchPortHistory: [historyEntry, ...prev.switchPortHistory.slice(0, 199)] // Keep last 200 switch port activities
    }));
};

const App = () => {
    const [view, setView] = useState('dashboard');
    const [data, setData] = useState({ 
        floors: [], 
        wallPorts: [], 
        switches: [], 
        switchCategories: [],
        connections: [], 
        users: [], 
        columns: DEFAULT_COLUMNS, 
        activityLog: [],
        switchPortHistory: [], // New: Track switch port changes specifically
        switchLayoutTemplates: [], // Switch layout templates for different arrangements
        vlanColors: [],
        closetLayouts: {} // Network closet layout configurations per floor
    });
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [modal, setModal] = useState(null);
    const [selectedFloorId, setSelectedFloorId] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([{ label: 'Dashboard', view: 'dashboard' }]);
    const previousDataRef = useRef();

    // Data initialization and persistence
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            let initialData = savedData ? JSON.parse(savedData) : {
                floors: [{ id: 'f1', name: 'Floor 1' }, { id: 'f4', name: 'Floor 4'}],
                wallPorts: Array.from({ length: 24 }, (_, i) => ({ 
                    id: `f1-p${String(i + 1).padStart(3, '0')}`, 
                    floorId: 'f1', 
                    portNumber: String(i + 1).padStart(3, '0'), 
                    isVirtual: false,
                    isPinned: false
                })),
                switches: [ 
                    { id: 'sw1', name: 'F1-Access-A', ip: '10.0.1.200', portCount: 48, floorId: 'f1', categoryId: 'cat1', isPinned: false, layoutTemplateId: 'sequential_10' }, 
                    { id: 'sw2', name: 'F4-Core-A', ip: '10.0.4.200', portCount: 24, floorId: 'f4', categoryId: 'cat2', isPinned: false, layoutTemplateId: 'odd_even' }, 
                    { id: 'sw3', name: 'F4-Core-B', ip: '10.0.4.201', portCount: 24, floorId: 'f4', categoryId: 'cat2', isPinned: false, layoutTemplateId: 'sequential_12' }
                ],
                switchCategories: [
                    { id: 'cat1', name: 'Access Switches', color: '#10b981' },
                    { id: 'cat2', name: 'Core Infrastructure', color: '#3b82f6' },
                    { id: 'cat3', name: 'VoIP', color: '#f59e0b' },
                    { id: 'cat4', name: 'Security', color: '#ef4444' }
                ],
                connections: [ 
                    {id: "c-1", wallPortId: "f1-p001", switchId: "sw1", switchPort: 1, vlan: "100", room: "101", userId: "u1", ipAddress: "10.0.1.55", hasLink: true, connectionType: "patched", history: [{timestamp: Date.now() - 86400000, message: "Connection created"}]}, 
                    {id: "c-2", wallPortId: "f1-p002", switchId: "sw1", switchPort: 2, vlan: "100", room: "102", userId: "u2", ipAddress: "DHCP", hasLink: false, connectionType: "patched", history: [{timestamp: Date.now() - 43200000, message: "Connection created"}]} 
                ],
                users: [
                    { id: 'u1', name: 'John Doe' }, 
                    { id: 'u2', name: 'Jane Smith' }
                ],
                columns: DEFAULT_COLUMNS,
                activityLog: [{ timestamp: Date.now(), message: "Application initialized." }],
                switchPortHistory: [], // Initialize empty switch port history
                switchLayoutTemplates: [
                    { 
                        id: 'odd_even', 
                        name: 'Odd/Even Rows', 
                        description: 'Traditional layout with odd ports on top, even ports on bottom',
                        type: 'automatic',
                        config: { 
                            type: 'odd_even' 
                        }
                    },
                    { 
                        id: 'sequential_10', 
                        name: 'Sequential 10-Port Rows', 
                        description: '10 ports per row in sequential order (1-10, 11-20, etc.)',
                        type: 'automatic',
                        config: { 
                            type: 'sequential', 
                            portsPerRow: 10 
                        }
                    },
                    { 
                        id: 'sequential_12', 
                        name: 'Sequential 12-Port Rows', 
                        description: '12 ports per row in sequential order (1-12, 13-24, etc.)',
                        type: 'automatic',
                        config: { 
                            type: 'sequential', 
                            portsPerRow: 12 
                        }
                    },
                    { 
                        id: 'sequential_8', 
                        name: 'Sequential 8-Port Rows', 
                        description: '8 ports per row in sequential order (1-8, 9-16, etc.)',
                        type: 'automatic',
                        config: { 
                            type: 'sequential', 
                            portsPerRow: 8 
                        }
                    },
                    { 
                        id: 'custom', 
                        name: 'Custom Layout', 
                        description: 'Manually define port arrangement',
                        type: 'manual',
                        config: { 
                            type: 'custom',
                            customRows: [] // Will be populated per switch
                        }
                    }
                ],
                vlanColors: [
                    { vlanId: '100', color: '#34d399' }, // green
                    { vlanId: '200', color: '#60a5fa' }, // blue
                    { vlanId: '300', color: '#f59e0b' }, // amber
                ],
                closetLayouts: {
                    'f1': [
                        {
                            id: 'patch-panel-1',
                            type: 'patchPanel',
                            startPort: 1,
                            endPort: 24,
                            portsPerRow: 10
                        },
                        {
                            id: 'switch-1',
                            type: 'switch',
                            switchId: 'sw1'
                        }
                    ]
                }
            };
            
            // Data Migration for backward compatibility
            if (initialData.assets) delete initialData.assets;
            initialData.connections = initialData.connections.map(c => {
                const newC = {...c};
                if ('assetId' in newC) delete newC.assetId;
                if (!('ipAddress' in newC)) newC.ipAddress = 'DHCP';
                newC.hasLink = newC.hasLink ?? true;
                // Add connectionType for backward compatibility
                if (!newC.connectionType) {
                    newC.connectionType = 'patched'; // Default to patched for existing connections
                }
                // Add history array for backward compatibility
                if (!newC.history) {
                    newC.history = [{timestamp: Date.now(), message: "Legacy connection migrated"}];
                }
                return newC;
            });
            initialData.wallPorts = initialData.wallPorts.map(wp => ({...wp, isVirtual: wp.isVirtual ?? false, isPinned: wp.isPinned ?? false}));
            initialData.columns = DEFAULT_COLUMNS; // Always reset columns to remove old asset column

            // Add switch categories for backward compatibility
            if (!initialData.switchCategories) {
                initialData.switchCategories = [
                    { id: 'cat1', name: 'Access Switches', color: '#10b981' },
                    { id: 'cat2', name: 'Core Infrastructure', color: '#3b82f6' },
                    { id: 'cat3', name: 'VoIP', color: '#f59e0b' },
                    { id: 'cat4', name: 'Security', color: '#ef4444' }
                ];
            }
            
            // Add categoryId and isPinned to switches for backward compatibility
            initialData.switches = initialData.switches.map(sw => ({
                ...sw, 
                categoryId: sw.categoryId || 'cat1', // Default to Access Switches
                isPinned: sw.isPinned ?? false,
                layoutTemplateId: sw.layoutTemplateId || 'odd_even' // Default to current odd/even layout
            }));

            if (!initialData.activityLog) initialData.activityLog = [];
            if (!initialData.switchPortHistory) initialData.switchPortHistory = [];
            
            // Add switch layout templates for backward compatibility
            if (!initialData.switchLayoutTemplates) {
                initialData.switchLayoutTemplates = [
                    { 
                        id: 'odd_even', 
                        name: 'Odd/Even Rows', 
                        description: 'Traditional layout with odd ports on top, even ports on bottom',
                        type: 'automatic',
                        config: { type: 'odd_even' }
                    },
                    { 
                        id: 'sequential_10', 
                        name: 'Sequential 10-Port Rows', 
                        description: '10 ports per row in sequential order (1-10, 11-20, etc.)',
                        type: 'automatic',
                        config: { type: 'sequential', portsPerRow: 10 }
                    },
                    { 
                        id: 'sequential_12', 
                        name: 'Sequential 12-Port Rows', 
                        description: '12 ports per row in sequential order (1-12, 13-24, etc.)',
                        type: 'automatic',
                        config: { type: 'sequential', portsPerRow: 12 }
                    },
                    { 
                        id: 'sequential_8', 
                        name: 'Sequential 8-Port Rows', 
                        description: '8 ports per row in sequential order (1-8, 9-16, etc.)',
                        type: 'automatic',
                        config: { type: 'sequential', portsPerRow: 8 }
                    },
                    { 
                        id: 'custom', 
                        name: 'Custom Layout', 
                        description: 'Manually define port arrangement',
                        type: 'manual',
                        config: { type: 'custom', customRows: [] }
                    }
                ];
            }
            
            // Add vlanColors for backward compatibility
            if (!initialData.vlanColors) {
                initialData.vlanColors = [
                    { vlanId: '100', color: '#34d399' }, // green
                    { vlanId: '200', color: '#60a5fa' }, // blue
                    { vlanId: '300', color: '#f59e0b' }, // amber
                ];
            }
            
            // Add closetLayouts for backward compatibility
            if (!initialData.closetLayouts) {
                initialData.closetLayouts = {
                    'f1': [
                        {
                            id: 'patch-panel-1',
                            type: 'patchPanel',
                            startPort: 1,
                            endPort: 24,
                            portsPerRow: 10
                        },
                        {
                            id: 'switch-1',
                            type: 'switch',
                            switchId: 'sw1'
                        }
                    ]
                };
            }
            
            setData(initialData);
            setSelectedFloorId(initialData.floors[0]?.id || null);
            previousDataRef.current = initialData;
        } catch (error) { 
            console.error("Failed to load data", error); 
        }
        setIsDataLoaded(true);
    }, []);
    
    useEffect(() => {
        if (isDataLoaded && previousDataRef.current !== data) {
            try { 
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data)); 
                previousDataRef.current = data; 
            } catch (error) { 
                console.error("Failed to save data", error); 
            }
        }
    }, [data, isDataLoaded]);

    // Optimized cached data maps using useMemo
    const connectionsByWallPortId = useMemo(() => {
        const map = new Map();
        data.connections.forEach(conn => {
            map.set(conn.wallPortId, conn);
        });
        return map;
    }, [data.connections]);

    const connectionsBySwitchAndPort = useMemo(() => {
        const map = new Map();
        data.connections.forEach(conn => {
            map.set(`${conn.switchId}-${conn.switchPort}`, conn);
        });
        return map;
    }, [data.connections]);

    const wallPortsByFloorId = useMemo(() => {
        const map = new Map();
        data.floors.forEach(f => map.set(f.id, []));
        data.wallPorts.forEach(port => {
            if (map.has(port.floorId)) {
                map.get(port.floorId).push(port);
            }
        });
        map.forEach(ports => ports.sort(sortWallPorts));
        return map;
    }, [data.floors, data.wallPorts]);

    const dataMaps = useMemo(() => ({
        switches: new Map(data.switches.map(i => [i.id, i])),
        wallPorts: new Map(data.wallPorts.map(i => [i.id, i])),
        users: new Map(data.users.map(i => [i.id, i])),
        floors: new Map(data.floors.map(i => [i.id, i])),
        switchCategories: new Map(data.switchCategories.map(i => [i.id, i])),
        vlanColors: new Map(data.vlanColors.map(i => [i.vlanId, i]))
    }), [data.switches, data.wallPorts, data.users, data.floors, data.switchCategories, data.vlanColors]);

    // Event handlers
    const updateData = useCallback((key, value) => { 
        setData(prevData => ({ ...prevData, [key]: value })); 
    }, []);

    // Breadcrumb management
    const updateBreadcrumbs = useCallback((newView, context = {}) => {
        const viewLabels = {
            'dashboard': 'Dashboard',
            'wall': 'Wall Ports',
            'switch': 'Switches', 
            'users': 'Users',
            'settings': 'Settings'
        };

        let newBreadcrumbs = [{ label: 'Dashboard', view: 'dashboard' }];

        if (newView !== 'dashboard') {
            newBreadcrumbs.push({ label: viewLabels[newView] || newView, view: newView });

            // Add contextual breadcrumbs for specific items
            if (context.switchName) {
                newBreadcrumbs.push({ 
                    label: context.switchName, 
                    view: newView, 
                    context: { switchId: context.switchId } 
                });
            }
            if (context.floorName) {
                newBreadcrumbs.push({ 
                    label: context.floorName, 
                    view: newView, 
                    context: { floorId: context.floorId } 
                });
            }
        }

        setBreadcrumbs(newBreadcrumbs);
    }, []);

    const handleBreadcrumbNavigation = useCallback((crumb) => {
        setView(crumb.view);
        if (crumb.context?.floorId) {
            setSelectedFloorId(crumb.context.floorId);
        }
        // Update breadcrumbs to the clicked level
        const index = breadcrumbs.findIndex(b => b === crumb);
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }, [breadcrumbs]);

    const handleViewChange = useCallback((newView, context = {}) => {
        setView(newView);
        updateBreadcrumbs(newView, context);
    }, [updateBreadcrumbs]);

    const crudHandler = useCallback((type, action, payload) => {
        setData(prev => {
            let newItems = [...prev[type]]; 
            let newConnections = prev.connections;
            switch(action) {
                case 'add': 
                    newItems.push({ ...payload, id: `${type.slice(0, 1)}-${Date.now()}`}); 
                    break;
                case 'update': 
                    newItems = newItems.map(item => item.id === payload.id ? payload : item); 
                    break;
                case 'delete': {
                    newItems = newItems.filter(item => item.id !== payload.id); 
                    const key = `${type.slice(0, -1)}Id`; 
                    if (prev.connections.some(c => c[key])) 
                        newConnections = prev.connections.map(c => c[key] === payload.id ? {...c, [key]: null} : c); 
                    break;
                }
            }
            return { ...prev, [type]: newItems, connections: newConnections };
        });

        // Log activity for CRUD operations
        setTimeout(() => {
            const typeLabels = {
                'wallPorts': 'Wall Port',
                'switches': 'Switch',
                'users': 'User',
                'floors': 'Floor',
                'switchCategories': 'Switch Category',
                'vlanColors': 'VLAN Color'
            };
            const typeLabel = typeLabels[type] || type;
            const itemName = payload.name || payload.portNumber || payload.ip || payload.label || 'Item';

            let message;
            let activityType;
            
            switch(action) {
                case 'add':
                    message = typeLabel + ' created: "' + itemName + '"';
                    activityType = `${type}_create`;
                    break;
                case 'update':
                    message = typeLabel + ' updated: "' + itemName + '"';
                    activityType = `${type}_update`;
                    break;
                case 'delete':
                    message = typeLabel + ' deleted: "' + itemName + '"';
                    activityType = `${type}_delete`;
                    break;
            }
            
            logActivity(setData, message, activityType, {
                itemType: type,
                itemId: payload.id,
                itemName,
                action
            });
        }, 0);
        
        setModal(null);
    }, []);

    const handleUpdateConnection = useCallback((connectionData, newVirtualPort = null) => {
        setData(prevData => {
            const newWallPorts = newVirtualPort ? [...prevData.wallPorts, newVirtualPort] : prevData.wallPorts;
            const existingIndex = prevData.connections.findIndex(c => c.wallPortId === connectionData.wallPortId);
            const timestamp = Date.now();
            
            let newConnections;
            if (existingIndex > -1) {
                // Updating existing connection - track changes
                const existing = prevData.connections[existingIndex];
                const changes = [];
                
                // Compare fields and track what changed
                Object.keys(connectionData).forEach(key => {
                    if (key !== 'history' && key !== 'id' && existing[key] !== connectionData[key]) {
                        if (key === 'userId') {
                            const oldUser = prevData.users.find(u => u.id === existing[key])?.name || 'Unassigned';
                            const newUser = prevData.users.find(u => u.id === connectionData[key])?.name || 'Unassigned';
                            if (oldUser !== newUser) changes.push('user from \'' + oldUser + '\' to \'' + newUser + '\'');
                        } else if (key === 'switchId') {
                            const oldSwitch = prevData.switches.find(s => s.id === existing[key])?.name || 'None';
                            const newSwitch = prevData.switches.find(s => s.id === connectionData[key])?.name || 'None';
                            if (oldSwitch !== newSwitch) changes.push('switch from \'' + oldSwitch + '\' to \'' + newSwitch + '\'');
                        } else {
                            const oldValue = existing[key] || '';
                            const newValue = connectionData[key] || '';
                            if (oldValue !== newValue) changes.push(key + ' from \'' + oldValue + '\' to \'' + newValue + '\'');
                        }
                    }
                });
                
                const historyEntry = changes.length > 0 
                    ? { timestamp, message: 'Updated: ' + changes.join(', ') }
                    : null;
                    
                const updatedHistory = historyEntry 
                    ? [historyEntry, ...(existing.history || [])]
                    : existing.history || [];
                
                newConnections = prevData.connections.map(c => 
                    c.wallPortId === connectionData.wallPortId 
                        ? { ...c, ...connectionData, history: updatedHistory } 
                        : c
                );
                
                // Log switch port activity for updates
                if (changes.length > 0 && connectionData.switchId && connectionData.switchPort) {
                    const wallPort = prevData.wallPorts.find(wp => wp.id === connectionData.wallPortId);
                    const user = prevData.users.find(u => u.id === connectionData.userId);
                    const switchName = prevData.switches.find(s => s.id === connectionData.switchId)?.name || 'Unknown Switch';
                    
                    setTimeout(() => {
                        logSwitchPortActivity(
                            setData,
                            connectionData.switchId,
                            connectionData.switchPort,
                            'modified',
                            'Port ' + switchName + ':' + connectionData.switchPort + ' modified - ' + changes.join(', '),
                            connectionData.userId,
                            connectionData.wallPortId
                        );
                        
                        logActivity(
                            setData,
                            'Switch port ' + switchName + ':' + connectionData.switchPort + ' modified - ' + changes.join(', '),
                            'connection',
                            {
                                switchId: connectionData.switchId,
                                portNumber: connectionData.switchPort,
                                wallPort: wallPort?.portNumber,
                                user: user?.name,
                                changes
                            }
                        );
                    }, 0);
                }
            } else {
                // Creating new connection
                const historyEntry = { timestamp, message: "Connection created" };
                newConnections = [...prevData.connections, { 
                    ...connectionData, 
                    id: `c-${Date.now()}`,
                    history: [historyEntry]
                }];
                
                // Log switch port activity for new connections
                if (connectionData.switchId && connectionData.switchPort) {
                    const wallPort = prevData.wallPorts.find(wp => wp.id === connectionData.wallPortId);
                    const user = prevData.users.find(u => u.id === connectionData.userId);
                    const switchName = prevData.switches.find(s => s.id === connectionData.switchId)?.name || 'Unknown Switch';
                    
                    setTimeout(() => {
                        logSwitchPortActivity(
                            setData,
                            connectionData.switchId,
                            connectionData.switchPort,
                            'connected',
                            'Port ' + switchName + ':' + connectionData.switchPort + ' connected to wall port ' + (wallPort?.portNumber || 'Unknown') + (user ? ' (user: ' + user.name + ')' : ''),
                            connectionData.userId,
                            connectionData.wallPortId
                        );
                        
                        logActivity(
                            setData,
                            'New connection: Switch port ' + switchName + ':' + connectionData.switchPort + ' connected to wall port ' + (wallPort?.portNumber || 'Unknown') + (user ? ' for ' + user.name : ''),
                            'connection',
                            {
                                switchId: connectionData.switchId,
                                portNumber: connectionData.switchPort,
                                wallPort: wallPort?.portNumber,
                                user: user?.name
                            }
                        );
                    }, 0);
                }
            }
            
            return { ...prevData, wallPorts: newWallPorts, connections: newConnections };
        });
        setModal(null);
    }, []);

    const handleInlineUpdate = useCallback((wallPortId, field, value) => {
        const existing = connectionsByWallPortId.get(wallPortId);
        handleUpdateConnection({ ...(existing || { wallPortId, customData: {} }), [field]: value });
    }, [handleUpdateConnection, connectionsByWallPortId]);

    const handleUpdateSwitch = useCallback((switchId, updatedFields) => {
        setData(prev => ({ 
            ...prev, 
            switches: prev.switches.map(s => s.id === switchId ? {...s, ...updatedFields} : s) 
        }));

        // Log switch update activity
        setTimeout(() => {
            const switchName = updatedFields.name || 'Switch';
            const updateDetails = Object.keys(updatedFields).join(', ');
            logActivity(
                setData,
                'Switch updated: "' + switchName + '" (' + updateDetails + ')',
                'switch_update',
                {
                    switchId,
                    updatedFields,
                    switchName
                }
            );
        }, 0);
    }, []);
    
    const handleUserCreate = useCallback((userName) => {
        const newUser = { id: `u-${Date.now()}`, name: userName.trim() };
        setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
        return newUser;
    }, []);

    const handleUserRename = useCallback((userId, newName) => {
        setData(prev => ({
            ...prev,
            users: prev.users.map(user => 
                user.id === userId ? { ...user, name: newName.trim() } : user
            )
        }));

        // Log user rename activity
        setTimeout(() => {
            logActivity(
                setData,
                `User renamed to: "${newName.trim()}"`,
                'user_rename',
                {
                    userId,
                    newName: newName.trim()
                }
            );
        }, 0);
    }, []);

    const handleWallPortRename = useCallback((portId, newName) => {
        setData(prev => ({
            ...prev,
            wallPorts: prev.wallPorts.map(port => 
                port.id === portId ? { ...port, portNumber: newName.trim() } : port
            )
        }));

        // Log wall port rename activity
        setTimeout(() => {
            logActivity(
                setData,
                'Wall port renamed to: "' + newName.trim() + '"',
                'wallport_rename',
                {
                    portId,
                    newPortNumber: newName.trim()
                }
            );
        }, 0);
    }, []);

    const handleBulkEdit = useCallback((selectedPortIds, updates) => {
        setData(prev => {
            const newConnections = prev.connections.map(connection => {
                if (selectedPortIds.includes(connection.wallPortId)) {
                    const timestamp = Date.now();
                    const changes = [];
                    
                    Object.keys(updates).forEach(key => {
                        if (connection[key] !== updates[key]) {
                            const oldValue = connection[key] || '';
                            const newValue = updates[key] || '';
                            changes.push(key + ' from "' + oldValue + '" to "' + newValue + '"');
                        }
                    });
                    
                    const historyEntry = changes.length > 0 
                        ? { timestamp, message: 'Bulk edit: ' + changes.join(', ') }
                        : null;
                    
                    const updatedHistory = historyEntry 
                        ? [historyEntry, ...(connection.history || [])]
                        : connection.history || [];
                    
                    return { ...connection, ...updates, history: updatedHistory };
                }
                return connection;
            });
            
            // Handle ports that don't have connections yet
            const connectedPortIds = new Set(prev.connections.map(c => c.wallPortId));
            const newConnectionsForUnconnectedPorts = selectedPortIds
                .filter(portId => !connectedPortIds.has(portId))
                .map(portId => ({
                    id: 'c-' + Date.now() + '-' + Math.random(),
                    wallPortId: portId,
                    ...updates,
                    hasLink: true,
                    connectionType: 'patched',
                    history: [{
                        timestamp: Date.now(),
                        message: 'Bulk edit: Connection created with ' + Object.keys(updates).join(', ')
                    }]
                }));
            
            return { 
                ...prev, 
                connections: [...newConnections, ...newConnectionsForUnconnectedPorts] 
            };
        });

        // Log bulk edit activity
        setTimeout(() => {
            const fieldNames = Object.keys(updates).join(', ');
            const portCount = selectedPortIds.length;
            logActivity(
                setData,
                'Bulk edit applied to ' + portCount + ' port' + (portCount > 1 ? 's' : '') + ': ' + fieldNames,
                'bulk_edit',
                {
                    portIds: selectedPortIds,
                    updates,
                    portCount
                }
            );
        }, 0);
    }, []);

    const handleModalOpen = useCallback((modalConfig) => { setModal(modalConfig); }, []);

    const handleDeletePort = useCallback((portId) => {
        const port = dataMaps.wallPorts.get(portId);
        if (!port) return;

        const confirmMessage = 'Are you sure you want to delete port ' + port.portNumber + '? This will also remove any associated connection.';
        if (window.confirm(confirmMessage)) {
            setData(prev => ({
                ...prev,
                wallPorts: prev.wallPorts.filter(p => p.id !== portId),
                connections: prev.connections.filter(c => c.wallPortId !== portId)
            }));
        }
    }, [dataMaps.wallPorts]);

    const handleDisconnect = useCallback((portId) => {
        // Find the connection being disconnected for logging
        const connectionToDisconnect = data.connections.find(c => c.wallPortId === portId);
        
        if (connectionToDisconnect) {
            const wallPort = dataMaps.wallPorts.get(connectionToDisconnect.wallPortId);
            const user = dataMaps.users.get(connectionToDisconnect.userId);
            const switchName = dataMaps.switches.get(connectionToDisconnect.switchId)?.name || 'Unknown Switch';
            
            // Log the disconnect activity
            setTimeout(() => {
                logSwitchPortActivity(
                    setData,
                    connectionToDisconnect.switchId,
                    connectionToDisconnect.switchPort,
                    'disconnected',
                    'Port ' + switchName + ':' + connectionToDisconnect.switchPort + ' disconnected from wall port ' + (wallPort?.portNumber || 'Unknown') + (user ? ' (was: ' + user.name + ')' : ''),
                    connectionToDisconnect.userId,
                    connectionToDisconnect.wallPortId
                );
                
                logActivity(
                    setData,
                    'Disconnected: Switch port ' + switchName + ':' + connectionToDisconnect.switchPort + ' from wall port ' + (wallPort?.portNumber || 'Unknown') + (user ? ' (was: ' + user.name + ')' : ''),
                    'disconnect',
                    {
                        switchId: connectionToDisconnect.switchId,
                        portNumber: connectionToDisconnect.switchPort,
                        wallPort: wallPort?.portNumber,
                        user: user?.name
                    }
                );
            }, 0);
        }
        
        updateData('connections', data.connections.filter(c => c.wallPortId !== portId));
    }, [data.connections, updateData, dataMaps.wallPorts, dataMaps.users, dataMaps.switches]);

    // User update handler for search results
    const handleUserUpdate = useCallback((userId, updatedUser) => {
        setData(prev => ({
            ...prev,
            users: prev.users.map(user => 
                user.id === userId ? updatedUser : user
            )
        }));
        
        // Log the user update activity
        setTimeout(() => {
            logActivity(
                setData,
                'User updated: "' + updatedUser.name + '"',
                'user_update',
                {
                    userId: updatedUser.id,
                    userName: updatedUser.name
                }
            );
        }, 0);
    }, []);

    // View rendering
    const renderView = () => {
        switch (view) {
            case 'dashboard': 
                return <DashboardView data={data} setView={handleViewChange} setSelectedFloorId={setSelectedFloorId} />;
            case 'wall': 
                return <WallPortView 
                    data={data} 
                    maps={dataMaps} 
                    connectionsByWallPortId={connectionsByWallPortId} 
                    wallPortsByFloorId={wallPortsByFloorId} 
                    onEditConnection={(portId) => handleModalOpen({type: 'connection', mode: 'edit', portId})} 
                    onInlineUpdate={handleInlineUpdate} 
                    onCustomizeColumns={() => handleModalOpen({type: 'customizeColumns'})} 
                    onDeletePort={handleDeletePort}
                    onDisconnect={handleDisconnect}
                    onBulkEdit={(selectedPortIds) => handleModalOpen({type: 'bulkEdit', selectedPortIds})}
                    selectedFloorId={selectedFloorId} 
                    setSelectedFloorId={setSelectedFloorId} 
                />;
            case 'switch': 
                return <SwitchView 
                    data={data} 
                    maps={dataMaps} 
                    connectionsBySwitchAndPort={connectionsBySwitchAndPort} 
                    onUpdateSwitch={handleUpdateSwitch} 
                    onEditConnection={(portId) => handleModalOpen({type: 'connection', mode: 'edit', portId})} 
                    onAssignConnection={(switchId, switchPort) => handleModalOpen({type: 'connection', mode: 'create', switchId, switchPort})} 
                    onDisconnect={handleDisconnect}
                    onNavigateToSwitch={(connection) => {
                        // Edit the connection from switch perspective 
                        handleModalOpen({type: 'connection', mode: 'edit', portId: connection.wallPortId, fromSwitch: true});
                    }}
                />;
            case 'users': 
                return <GenericCrudView 
                    title="Users" 
                    items={data.users} 
                    fields={[{key: 'name', label: 'Name'}]} 
                    onSave={(action, payload) => crudHandler('users', action, payload)} 
                />;
            case 'closet':
                return <NetworkClosetView 
                    data={data} 
                    maps={dataMaps} 
                    connectionsByWallPortId={connectionsByWallPortId} 
                    connectionsBySwitchAndPort={connectionsBySwitchAndPort}
                    onEditConnection={(portId) => handleModalOpen({type: 'connection', mode: 'edit', portId})} 
                    onAssignConnection={(switchId, switchPort) => handleModalOpen({type: 'connection', mode: 'create', switchId, switchPort})} 
                    onDisconnect={handleDisconnect}
                    onNavigateToSwitch={(connection) => {
                        handleModalOpen({type: 'connection', mode: 'edit', portId: connection.wallPortId, fromSwitch: true});
                    }}
                    onUpdateSwitch={handleUpdateSwitch}
                    selectedFloorId={selectedFloorId} 
                    setSelectedFloorId={setSelectedFloorId} 
                />;
            case 'latest':
                return <LatestChangesView data={data} maps={dataMaps} />;
            case 'settings': 
                return <SettingsView data={data} setData={setData} />;
            default: 
                return <div>Unknown View</div>;
        }
    };
    
    // Modal rendering
    const renderModal = () => {
        if (!modal) return null;
        switch (modal.type) {
            case 'connection': 
                return <ConnectionModal 
                    data={data} 
                    onSave={handleUpdateConnection} 
                    onDisconnect={(portId) => { 
                        updateData('connections', data.connections.filter(c => c.wallPortId !== portId)); 
                        setModal(null); 
                    }} 
                    onClose={() => setModal(null)} 
                    maps={dataMaps} 
                    onUserCreate={handleUserCreate}
                    onUserRename={handleUserRename}
                    onWallPortRename={handleWallPortRename}
                    {...modal} 
                />;
            case 'customizeColumns': 
                return <ColumnCustomizationModal 
                    columns={data.columns} 
                    onSave={(newColumns) => updateData('columns', newColumns)} 
                    onClose={() => setModal(null)} 
                />;
            case 'bulkEdit':
                return <BulkEditModal 
                    selectedPortIds={modal.selectedPortIds}
                    onSave={handleBulkEdit}
                    onClose={() => setModal(null)} 
                />;
            default: 
                return null;
        }
    };

    if (!isDataLoaded) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--surface-primary)' }}>
            <StyleInjector />
            <div className="startup-container py-6">
                <Header 
                    currentView={view} 
                    setView={handleViewChange} 
                    data={data} 
                    setSelectedFloorId={setSelectedFloorId} 
                    breadcrumbs={breadcrumbs} 
                    onBreadcrumbNavigate={handleBreadcrumbNavigation}
                    maps={dataMaps}
                    onNavigateToSwitch={(connection) => handleModalOpen({type: 'connection', mode: 'edit', portId: connection.wallPortId})}
                    onNavigateToWallPort={(wallPort) => handleModalOpen({type: 'connection', mode: 'edit', portId: wallPort.id})}
                    onUserUpdate={handleUserUpdate}
                />
                <main className="mt-6 glass-card p-8 min-h-[75vh]">
                    {renderView()}
                </main>
            </div>
            {renderModal()}
        </div>
    );
};

export default App;