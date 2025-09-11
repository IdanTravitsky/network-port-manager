import React, { useState, memo } from 'react';
import { Download, Pin } from 'lucide-react';
import SwitchPort from '../components/SwitchPort.jsx';
import InlineEditableField from '../components/InlineEditableField.jsx';
import LazyRender from '../components/LazyRender.jsx';
import { exportToCSV } from '../utils/helpers.js';

const SwitchView = memo(({ data, maps, connectionsBySwitchAndPort, onUpdateSwitch, onEditConnection, onAssignConnection, onDisconnect, onNavigateToSwitch }) => {
    const { switches } = data;
    const [showIp, setShowIp] = useState(true);
    const [showUser, setShowUser] = useState(true);

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
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Switches</h2>
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
                     <button onClick={handleExportCSV} className="button-secondary p-2.5" title="Export to CSV">
                         <Download size={16} />
                     </button>
                 </div>
            </div>
            <div className="space-y-8" style={{ willChange: 'scroll-position' }}>
                {switches.map(sw => {
                    const allPorts = Array.from({ length: sw.portCount }, (_, i) => i + 1);
                    const oddPorts = [];
                    const evenPorts = [];
                    let usedPorts = 0;
                    
                    for (let i = 1; i <= sw.portCount; i++) {
                        if (i % 2 !== 0) oddPorts.push(i);
                        else evenPorts.push(i);
                        
                        if (connectionsBySwitchAndPort.get(`${sw.id}-${i}`)) {
                            usedPorts++;
                        }
                    }
                    
                    const switchData = { allPorts, oddPorts, evenPorts, usedPorts };
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
                            <div className="overflow-x-auto pb-2 pt-16 -mt-16">
                                <div className="flex flex-col gap-1 px-2 min-w-max">
                                    <div className="flex flex-nowrap gap-2">
                                        {switchData.oddPorts.map(portNum => (
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
                                            />
                                        ))}
                                    </div>
                                    <div className="flex flex-nowrap gap-2">
                                        {switchData.evenPorts.map(portNum => (
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
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        </LazyRender>
                    );
                })}
            </div>
        </div>
    );
});

export default SwitchView;