import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Trash2, History, Zap } from 'lucide-react';
import CustomSelect from './CustomSelect.jsx';

const ConnectionModal = ({ mode, portId, switchId, switchPort, data, maps, onSave, onDisconnect, onClose, onUserCreate }) => {
    const isCreateMode = mode === 'create';
    const connection = isCreateMode ? null : data.connections.find(c => c.wallPortId === portId);
    const wallPort = isCreateMode ? null : maps.wallPorts.get(portId);
    const floor = isCreateMode ? maps.floors.get(maps.switches.get(switchId).floorId) : maps.floors.get(wallPort.floorId);
    const switchForCreate = isCreateMode ? maps.switches.get(switchId) : null;

    const [selectedWallPortId, setSelectedWallPortId] = useState(portId || '');
    const [createModeType, setCreateModeType] = useState('physical');
    const [virtualPortName, setVirtualPortName] = useState('');
    const [isDhcp, setIsDhcp] = useState(connection?.ipAddress === 'DHCP' || isCreateMode);

    const [connectionType, setConnectionType] = useState(connection?.connectionType || 'patched');
    const [activeTab, setActiveTab] = useState('details');
    const [formData, setFormData] = useState({
        switchId: connection?.switchId || switchId || '',
        switchPort: connection?.switchPort || switchPort || '',
        vlan: connection?.vlan || '',
        room: connection?.room || '',
        userId: connection?.userId || '',
        ipAddress: connection?.ipAddress || 'DHCP',
        hasLink: connection?.hasLink ?? true,
        deviceDescription: connection?.deviceDescription || '',
    });
    
    useEffect(() => {
        if(isDhcp) setFormData(p => ({...p, ipAddress: 'DHCP'}));
    }, [isDhcp]);

    const availableWallPorts = useMemo(() => {
        if (!isCreateMode) return [];
        const connectedPortIds = new Set(data.connections.map(c => c.wallPortId));
        return data.wallPorts.filter(p => !p.isVirtual && !connectedPortIds.has(p.id) && p.floorId === switchForCreate.floorId);
    }, [data.connections, data.wallPorts, isCreateMode, switchForCreate]);

    const switchesOnFloor = useMemo(() => {
        if (isCreateMode) return [];
        return data.switches.filter(s => s.floorId === floor.id);
    }, [data.switches, floor, isCreateMode]);
    
    const findNextAvailablePort = (targetSwitchId) => {
        if (!targetSwitchId) return null;
        
        const targetSwitch = maps.switches.get(targetSwitchId);
        if (!targetSwitch) return null;
        
        // Get all used ports on this switch
        const usedPorts = new Set(
            data.connections
                .filter(c => c.switchId === targetSwitchId && c.connectionType === 'patched')
                .map(c => Number(c.switchPort))
        );
        
        // Find the lowest available port number
        for (let port = 1; port <= targetSwitch.portCount; port++) {
            if (!usedPorts.has(port)) {
                return port;
            }
        }
        
        return null; // All ports are used
    };
    
    const handleFindNextPort = () => {
        const nextPort = findNextAvailablePort(formData.switchId);
        if (nextPort !== null) {
            setFormData(p => ({ ...p, switchPort: nextPort.toString() }));
        } else {
            alert('All ports on this switch are already in use.');
        }
    };
    
    const handleSave = (e) => {
        e.preventDefault();
        let wallPortToSave = selectedWallPortId;
        let newVirtualPort = null;
        if (isCreateMode && createModeType === 'virtual') {
            if (!virtualPortName.trim()) return alert('Please provide a name for the temporary port.');
            const virtualId = `virtual-${Date.now()}`;
            newVirtualPort = { id: virtualId, floorId: switchForCreate.floorId, portNumber: virtualPortName.trim(), isVirtual: true };
            wallPortToSave = virtualId;
        }
        if (!wallPortToSave) return alert('Please select a wall port to connect.');
        
        // For local devices, we don't need switch info
        if (connectionType === 'local_device') {
            if (!formData.deviceDescription.trim()) return alert('Please provide a device description.');
            onSave({ 
                wallPortId: wallPortToSave, 
                connectionType,
                deviceDescription: formData.deviceDescription,
                room: formData.room,
                userId: formData.userId,
                ipAddress: formData.ipAddress
            }, newVirtualPort);
        } else {
            // For patched connections, we need switch info
            if (!formData.switchId) return alert('Please select a switch.');
            onSave({ 
                wallPortId: wallPortToSave, 
                connectionType,
                ...formData, 
                switchPort: Number(formData.switchPort) 
            }, newVirtualPort);
        }
    };
    
    const title = isCreateMode ? `Assign to ${switchForCreate.name} / Port ${switchPort}` : `Edit: ${floor.name} - Port ${wallPort.portNumber}`;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold">
                        <span className="text-cyan-400">{title}</span>
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
                        <X/>
                    </button>
                </div>
                
                {/* Tab Navigation */}
                <div className="border-b border-slate-700 flex">
                    <button 
                        type="button"
                        onClick={() => setActiveTab('details')} 
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-cyan-400 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Details
                    </button>
                    {!isCreateMode && (
                        <button 
                            type="button"
                            onClick={() => setActiveTab('history')} 
                            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-cyan-400 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <History size={16} />
                            History
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleSave}>
                    {activeTab === 'details' && (
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {isCreateMode ? (
                            <div>
                                <div className="flex gap-2 mb-4 border-b border-slate-700 pb-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setCreateModeType('physical')} 
                                        className={createModeType === 'physical' ? 'button-primary w-full' : 'button-secondary w-full'}
                                    >
                                        Physical Wall Port
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setCreateModeType('virtual')} 
                                        className={createModeType === 'virtual' ? 'button-primary w-full' : 'button-secondary w-full'}
                                    >
                                        Temporary Port
                                    </button>
                                </div>
                                {createModeType === 'physical' ? (
                                    <div>
                                        <label className="label-style">Available Wall Ports on {floor?.name}</label>
                                        <CustomSelect 
                                            options={availableWallPorts.map(p => ({ value: p.id, label: `Port ${p.portNumber}` }))} 
                                            value={selectedWallPortId} 
                                            onChange={setSelectedWallPortId} 
                                            placeholder="Select a wall port"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="label-style">Temporary Port Name</label>
                                        <input 
                                            type="text" 
                                            value={virtualPortName} 
                                            onChange={e => setVirtualPortName(e.target.value)} 
                                            className="input-style w-full" 
                                            placeholder="e.g., Unknown Patch, Temp Link"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : null}
                        
                        {/* Connection Type Selection */}
                        <div className="flex gap-2 border-b border-slate-700 pb-4">
                            <button 
                                type="button" 
                                onClick={() => setConnectionType('patched')} 
                                className={connectionType === 'patched' ? 'button-primary w-full' : 'button-secondary w-full'}
                            >
                                Patched to Switch
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setConnectionType('local_device')} 
                                className={connectionType === 'local_device' ? 'button-primary w-full' : 'button-secondary w-full'}
                            >
                                Local Device
                            </button>
                        </div>

                        {connectionType === 'patched' ? (
                            <>
                                {!isCreateMode && (
                                    <div>
                                        <label className="label-style">Switch</label>
                                        <CustomSelect 
                                            options={switchesOnFloor.map(s => ({ value: s.id, label: `${s.name} (${s.ip})` }))} 
                                            value={formData.switchId} 
                                            onChange={v => setFormData(p => ({ ...p, switchId: v }))} 
                                            placeholder="Select a switch on this floor"
                                        />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-style">Switch Port</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                name="switchPort" 
                                                value={formData.switchPort} 
                                                onChange={e=>setFormData(p=>({...p, switchPort: e.target.value}))} 
                                                className="input-style flex-1" 
                                                disabled={isCreateMode}
                                            />
                                            {!isCreateMode && formData.switchId && (
                                                <button
                                                    type="button"
                                                    onClick={handleFindNextPort}
                                                    className="button-secondary p-2.5 flex-shrink-0"
                                                    title="Find Next Available Port"
                                                >
                                                    <Zap size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-style">VLAN</label>
                                        <input 
                                            type="text" 
                                            name="vlan" 
                                            value={formData.vlan} 
                                            onChange={e => {
                                                const vlanValue = e.target.value;
                                                const newFormData = { ...formData, vlan: vlanValue };
                                                
                                                // If VLAN contains a number, auto-suggest IP and uncheck DHCP
                                                if (vlanValue && /^\d+$/.test(vlanValue.trim())) {
                                                    const vlanNumber = parseInt(vlanValue.trim(), 10);
                                                    if (vlanNumber >= 1 && vlanNumber <= 4094) { // Valid VLAN range
                                                        newFormData.ipAddress = `10.0.${vlanNumber}.`;
                                                        setIsDhcp(false);
                                                    }
                                                }
                                                
                                                setFormData(newFormData);
                                            }} 
                                            className="input-style w-full"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.hasLink} 
                                            onChange={e => setFormData(p => ({...p, hasLink: e.target.checked}))} 
                                            className="w-4 h-4 rounded text-cyan-500 bg-slate-600 border-slate-500 focus:ring-cyan-600" 
                                        />
                                        <span className="label-style mb-0">Link Active</span>
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="label-style">Device Description</label>
                                <input 
                                    type="text" 
                                    name="deviceDescription" 
                                    value={formData.deviceDescription} 
                                    onChange={e=>setFormData(p=>({...p, deviceDescription: e.target.value}))} 
                                    className="input-style w-full" 
                                    placeholder="e.g., Conference Room TV, Printer"
                                />
                            </div>
                        )}
                        
                        {/* Common fields for both connection types */}
                        <div>
                            <label className="label-style">IP Address</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    name="ipAddress" 
                                    value={formData.ipAddress} 
                                    onChange={e=>setFormData(p=>({...p, ipAddress: e.target.value}))} 
                                    className="input-style w-full" 
                                    disabled={isDhcp}
                                />
                                <label className="flex items-center gap-2 text-sm text-slate-300 whitespace-nowrap">
                                    <input 
                                        type="checkbox" 
                                        checked={isDhcp} 
                                        onChange={e => setIsDhcp(e.target.checked)} 
                                        className="w-4 h-4 rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-600"
                                    /> 
                                    DHCP
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="label-style">Room</label>
                            <input 
                                type="text" 
                                name="room" 
                                value={formData.room} 
                                onChange={e=>setFormData(p=>({...p, room: e.target.value}))} 
                                className="input-style w-full"
                            />
                        </div>
                        <div>
                            <label className="label-style">Assign User</label>
                            <CustomSelect 
                                options={data.users.map(u => ({ value: u.id, label: u.name }))} 
                                value={formData.userId} 
                                onChange={v => setFormData(p => ({ ...p, userId: v }))} 
                                placeholder="Select or create a user" 
                                isCreatable={true} 
                                onCreate={(userName) => { 
                                    const newUser = onUserCreate(userName); 
                                    setFormData(p => ({ ...p, userId: newUser.id })); 
                                }}
                            />
                        </div>
                        </div>
                    )}
                    
                    {activeTab === 'history' && !isCreateMode && (
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white mb-4">Connection History</h3>
                                {connection?.history && connection.history.length > 0 ? (
                                    <ul className="space-y-3">
                                        {connection.history.map((entry, index) => (
                                            <li key={index} className="border-l-2 border-slate-600 pl-4 py-2">
                                                <p className="font-semibold text-slate-300">{entry.message}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(entry.timestamp).toLocaleString()}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-slate-400 text-center py-8">No history available for this connection.</p>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between items-center p-4 bg-slate-700/50">
                        {isCreateMode ? <div></div> : (
                            <button 
                                type="button" 
                                onClick={() => onDisconnect(portId)} 
                                className="text-red-400 font-semibold flex items-center gap-1"
                            >
                                <Trash2 size={16}/> Disconnect
                            </button>
                        )}
                        <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="button-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="button-primary flex items-center gap-1">
                                <Save size={16}/> Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConnectionModal;