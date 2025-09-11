import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Upload, AlertCircle } from 'lucide-react';
import SettingCard from '../components/SettingCard.jsx';
import CustomSelect from '../components/CustomSelect.jsx';

const LOCAL_STORAGE_KEY = 'network-asset-manager-data-v7';

const SettingsView = ({ data, setData }) => {
    const { floors, wallPorts } = data;
    const [newFloorName, setNewFloorName] = useState('');
    const [newSwitch, setNewSwitch] = useState({ name: '', ip: '', portCount: 24, floorId: floors[0]?.id || '' });
    const [batchPorts, setBatchPorts] = useState({ floorId: floors[0]?.id || '', start: 1, end: 24, prefix: '' });
    const [singlePort, setSinglePort] = useState({ floorId: floors[0]?.id || '', name: '' });
    const [newCategory, setNewCategory] = useState({ name: '', color: '#10b981' });
    const [newVlanColor, setNewVlanColor] = useState({ vlanId: '', color: '#34d399' });
    
    useEffect(() => {
        if (!newSwitch.floorId && floors.length > 0) setNewSwitch(s => ({ ...s, floorId: floors[0].id }));
        if (!batchPorts.floorId && floors.length > 0) setBatchPorts(p => ({ ...p, floorId: floors[0].id }));
        if (!singlePort.floorId && floors.length > 0) setSinglePort(p => ({ ...p, floorId: floors[0].id }));
    }, [floors, newSwitch.floorId, batchPorts.floorId, singlePort.floorId]);
    
    const updateData = (key, value) => setData(prev => ({...prev, [key]: value}));
    
    const handleAddFloor = (e) => { 
        e.preventDefault(); 
        if (newFloorName.trim()) { 
            updateData('floors', [...data.floors, { id: `f-${Date.now()}`, name: newFloorName.trim() }]); 
            setNewFloorName(''); 
        }
    };
    
    const handleDeleteFloor = (floorId) => { 
        if (confirm('Delete this floor and ALL associated ports and switches?')) { 
            const portsOnFloor = wallPorts.filter(p => p.floorId === floorId).map(p => p.id); 
            setData(d => ({ 
                ...d, 
                floors: d.floors.filter(f => f.id !== floorId), 
                wallPorts: d.wallPorts.filter(p => p.floorId !== floorId), 
                switches: d.switches.filter(s => s.floorId !== floorId), 
                connections: d.connections.filter(c => !portsOnFloor.includes(c.wallPortId)) 
            })); 
        }
    };
    
    const handleAddSwitch = (e) => { 
        e.preventDefault(); 
        if (newSwitch.name.trim() && newSwitch.ip.trim() && newSwitch.portCount > 0 && newSwitch.floorId) { 
            updateData('switches', [...data.switches, { ...newSwitch, id: `sw-${Date.now()}`, portCount: Number(newSwitch.portCount) }]); 
            setNewSwitch({ name: '', ip: '', portCount: 24, floorId: floors[0]?.id || '' }); 
        }
    };
    
    const handleDeleteSwitch = (switchId) => { 
        if (confirm('Delete this switch and all its connections?')) { 
            setData(d => ({ 
                ...d, 
                switches: d.switches.filter(s => s.id !== switchId), 
                connections: d.connections.filter(c => c.switchId !== switchId) 
            })); 
        }
    };
    
    const handleBatchAddPorts = (e) => { 
        e.preventDefault(); 
        const { floorId, start, end, prefix } = batchPorts; 
        if (!floorId || start <= 0 || end < start) return alert('Invalid port range.'); 
        const newPorts = Array.from({length: end-start+1}, (_,i) => { 
            const pNum = `${prefix}${String(start+i).padStart(3, '0')}`; 
            return {id: `${floorId}-p${pNum}`, floorId, portNumber: pNum, isVirtual: false}; 
        }); 
        const uniqueNewPorts = newPorts.filter(p => !wallPorts.some(wp => wp.id === p.id)); 
        updateData('wallPorts', [...wallPorts, ...uniqueNewPorts]); 
        alert(`${uniqueNewPorts.length} new ports added!`); 
    };
    
    const handleSingleAddPort = (e) => { 
        e.preventDefault(); 
        const { floorId, name } = singlePort; 
        if (!floorId || !name.trim()) return alert('Please select a floor and provide a port name.'); 
        const newPortId = `${floorId}-p${name.trim()}`; 
        if (wallPorts.some(p => p.id === newPortId)) return alert('This port name already exists on this floor.'); 
        updateData('wallPorts', [...wallPorts, { id: newPortId, floorId, portNumber: name.trim(), isVirtual: false }]); 
        setSinglePort(p => ({...p, name: ''})); 
    };
    
    const handleExport = () => { 
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`; 
        const link = document.createElement("a"); 
        link.href = jsonString; 
        link.download = "network-data.json"; 
        link.click(); 
    };
    
    const handleImport = (event) => { 
        const fileReader = new FileReader(); 
        fileReader.readAsText(event.target.files[0], "UTF-8"); 
        fileReader.onload = e => {
            try {
                setData(JSON.parse(e.target.result));
                alert('Data imported successfully!');
            } catch {
                alert('Failed to import data.');
            }
        };
        event.target.value = null; 
    };
    
    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategory.name.trim()) {
            updateData('switchCategories', [
                ...data.switchCategories, 
                { 
                    id: `cat-${Date.now()}`, 
                    name: newCategory.name.trim(), 
                    color: newCategory.color 
                }
            ]);
            setNewCategory({ name: '', color: '#10b981' });
        }
    };

    const handleDeleteCategory = (categoryId) => {
        // Check if category is in use
        const categoriesInUse = data.switches.filter(sw => sw.categoryId === categoryId).length;
        if (categoriesInUse > 0) {
            if (!confirm(`This category is used by ${categoriesInUse} switch(es). Deleting it will move those switches to "Access Switches". Continue?`)) {
                return;
            }
            // Move switches to default category
            setData(prev => ({
                ...prev,
                switches: prev.switches.map(sw => 
                    sw.categoryId === categoryId ? { ...sw, categoryId: 'cat1' } : sw
                ),
                switchCategories: prev.switchCategories.filter(cat => cat.id !== categoryId)
            }));
        } else {
            if (confirm('Delete this category?')) {
                updateData('switchCategories', data.switchCategories.filter(cat => cat.id !== categoryId));
            }
        }
    };

    const handleAddVlanColor = (e) => {
        e.preventDefault();
        if (newVlanColor.vlanId.trim()) {
            // Check if VLAN already exists and update, otherwise add new
            const existingIndex = data.vlanColors.findIndex(vc => vc.vlanId === newVlanColor.vlanId.trim());
            if (existingIndex > -1) {
                // Update existing
                const updatedVlanColors = [...data.vlanColors];
                updatedVlanColors[existingIndex] = { vlanId: newVlanColor.vlanId.trim(), color: newVlanColor.color };
                updateData('vlanColors', updatedVlanColors);
            } else {
                // Add new
                updateData('vlanColors', [
                    ...data.vlanColors,
                    { vlanId: newVlanColor.vlanId.trim(), color: newVlanColor.color }
                ]);
            }
            setNewVlanColor({ vlanId: '', color: '#34d399' });
        }
    };

    const handleDeleteVlanColor = (vlanId) => {
        if (confirm(`Delete VLAN ${vlanId} color mapping?`)) {
            updateData('vlanColors', data.vlanColors.filter(vc => vc.vlanId !== vlanId));
        }
    };

    const handleResetData = () => { 
        if (confirm('Delete ALL data? This will reset the application to its default state.')) { 
            localStorage.removeItem(LOCAL_STORAGE_KEY); 
            window.location.reload(); 
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SettingCard title="Floors">
                <form onSubmit={handleAddFloor} className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newFloorName} 
                        onChange={(e) => setNewFloorName(e.target.value)} 
                        placeholder="New floor name" 
                        className="flex-grow input-style" 
                    />
                    <button type="submit" className="button-primary">
                        <Plus size={16} /> Add
                    </button>
                </form>
                <ul className="space-y-2">
                    {data.floors.map(floor => (
                        <li key={floor.id} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                            <span>{floor.name}</span>
                            <button 
                                onClick={() => handleDeleteFloor(floor.id)} 
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded-full"
                            >
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ul>
            </SettingCard>
            
            <SettingCard title="Switches">
                <form onSubmit={handleAddSwitch} className="space-y-2 mb-4">
                    <CustomSelect 
                        options={floors.map(f => ({ value: f.id, label: f.name }))} 
                        value={newSwitch.floorId} 
                        onChange={v => setNewSwitch(s => ({...s, floorId: v}))} 
                        placeholder="Select a floor"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input 
                            type="text" 
                            value={newSwitch.name} 
                            onChange={e => setNewSwitch({...newSwitch, name: e.target.value})} 
                            placeholder="Switch Name (e.g., F1-A)" 
                            className="input-style" 
                            required 
                        />
                        <input 
                            type="text" 
                            value={newSwitch.ip} 
                            onChange={e => setNewSwitch({...newSwitch, ip: e.target.value})} 
                            placeholder="IP Address" 
                            className="input-style" 
                            required 
                        />
                    </div>
                    <input 
                        type="number" 
                        value={newSwitch.portCount} 
                        onChange={e => setNewSwitch({...newSwitch, portCount: e.target.value})} 
                        placeholder="Port Count" 
                        className="input-style w-full" 
                        required 
                    />
                    <button type="submit" className="button-primary w-full" disabled={!newSwitch.floorId}>
                        <Plus size={16} /> Add Switch
                    </button>
                </form>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {data.switches.map(sw => (
                        <li key={sw.id} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                            <div>
                                <span className="font-semibold">{sw.name}</span>
                                <span className="text-sm text-slate-400 ml-2 font-mono">
                                    ({data.floors.find(f=>f.id===sw.floorId)?.name})
                                </span>
                            </div>
                            <button 
                                onClick={() => handleDeleteSwitch(sw.id)} 
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded-full"
                            >
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ul>
            </SettingCard>
            
            <SettingCard title="Switch Categories">
                <form onSubmit={handleAddCategory} className="space-y-3 mb-4">
                    <input 
                        type="text" 
                        value={newCategory.name} 
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} 
                        placeholder="Category name (e.g., Core, VoIP)" 
                        className="input-style w-full" 
                        required
                    />
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-slate-300">Color:</label>
                        <input 
                            type="color" 
                            value={newCategory.color} 
                            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })} 
                            className="w-8 h-8 rounded border border-slate-600 bg-slate-700 cursor-pointer"
                        />
                        <div 
                            className="w-4 h-4 rounded border border-slate-600" 
                            style={{ backgroundColor: newCategory.color }}
                            title="Preview"
                        />
                    </div>
                    <button type="submit" className="button-primary w-full">
                        <Plus size={16} /> Add Category
                    </button>
                </form>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {data.switchCategories.map(category => {
                        const switchesInCategory = data.switches.filter(sw => sw.categoryId === category.id).length;
                        return (
                            <li key={category.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-4 h-4 rounded-full border border-slate-400" 
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <div>
                                        <span className="font-semibold">{category.name}</span>
                                        <span className="text-sm text-slate-400 ml-2">
                                            ({switchesInCategory} switch{switchesInCategory !== 1 ? 'es' : ''})
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteCategory(category.id)} 
                                    className="p-1 text-red-400 hover:bg-red-500/20 rounded-full"
                                    title={switchesInCategory > 0 ? `Delete category (${switchesInCategory} switches will be moved to Access Switches)` : 'Delete category'}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </SettingCard>

            <SettingCard title="VLAN Colors">
                <form onSubmit={handleAddVlanColor} className="space-y-3 mb-4">
                    <input 
                        type="text" 
                        value={newVlanColor.vlanId} 
                        onChange={(e) => setNewVlanColor({ ...newVlanColor, vlanId: e.target.value })} 
                        placeholder="VLAN ID (e.g., 100, 200)" 
                        className="input-style w-full" 
                        required
                    />
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-slate-300">Color:</label>
                        <input 
                            type="color" 
                            value={newVlanColor.color} 
                            onChange={(e) => setNewVlanColor({ ...newVlanColor, color: e.target.value })} 
                            className="w-8 h-8 rounded border border-slate-600 bg-slate-700 cursor-pointer"
                        />
                        <div 
                            className="w-4 h-4 rounded border border-slate-600" 
                            style={{ backgroundColor: newVlanColor.color }}
                            title="Preview"
                        />
                    </div>
                    <button type="submit" className="button-primary w-full">
                        <Plus size={16} /> Add/Update VLAN Color
                    </button>
                </form>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {data.vlanColors.map(vlanColor => {
                        const connectionsWithVlan = data.connections.filter(c => c.vlan === vlanColor.vlanId).length;
                        return (
                            <li key={vlanColor.vlanId} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-4 h-4 rounded border border-slate-400" 
                                        style={{ backgroundColor: vlanColor.color }}
                                    />
                                    <div>
                                        <span className="font-semibold">VLAN {vlanColor.vlanId}</span>
                                        <span className="text-sm text-slate-400 ml-2">
                                            ({connectionsWithVlan} connection{connectionsWithVlan !== 1 ? 's' : ''})
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteVlanColor(vlanColor.vlanId)} 
                                    className="p-1 text-red-400 hover:bg-red-500/20 rounded-full"
                                    title={`Delete VLAN ${vlanColor.vlanId} color mapping`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </SettingCard>
            
            <SettingCard title="Batch Add Numbered Ports">
                <form onSubmit={handleBatchAddPorts} className="space-y-3">
                    <CustomSelect 
                        options={floors.map(f=>({value: f.id, label: f.name}))} 
                        value={batchPorts.floorId} 
                        onChange={v => setBatchPorts({...batchPorts, floorId:v})} 
                    />
                    <input 
                        type="text" 
                        value={batchPorts.prefix} 
                        onChange={e => setBatchPorts({...batchPorts, prefix: e.target.value})} 
                        placeholder="Prefix (e.g., '1-')" 
                        className="input-style w-full"
                    />
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={batchPorts.start} 
                            onChange={e => setBatchPorts({...batchPorts, start: Number(e.target.value)})} 
                            placeholder="Start #" 
                            className="input-style w-full"
                        />
                        <input 
                            type="number" 
                            value={batchPorts.end} 
                            onChange={e => setBatchPorts({...batchPorts, end: Number(e.target.value)})} 
                            placeholder="End #" 
                            className="input-style w-full"
                        />
                    </div>
                    <button type="submit" className="button-primary w-full">
                        <Plus/> Add Batch
                    </button>
                </form>
            </SettingCard>
            
            <SettingCard title="Add Single Wall Port">
                <form onSubmit={handleSingleAddPort} className="space-y-3">
                    <CustomSelect 
                        options={floors.map(f=>({value: f.id, label: f.name}))} 
                        value={singlePort.floorId} 
                        onChange={v => setSinglePort({...singlePort, floorId:v})} 
                    />
                    <input 
                        type="text" 
                        value={singlePort.name} 
                        onChange={e => setSinglePort({...singlePort, name: e.target.value})} 
                        placeholder="Port Name (e.g. A-3, 0-01)" 
                        className="input-style w-full"
                    />
                    <button type="submit" className="button-primary w-full">
                        <Plus/> Add Port
                    </button>
                </form>
            </SettingCard>
            
            <SettingCard title="Data Management">
                <div className="flex gap-4">
                    <button onClick={handleExport} className="button-primary w-full">
                        <Download size={16}/> Export
                    </button>
                    <label className="button-secondary w-full cursor-pointer">
                        <Upload size={16}/> Import
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleImport} 
                            className="hidden"
                        />
                    </label>
                </div>
            </SettingCard>
            
            <SettingCard title="Danger Zone">
                <p className="text-sm text-slate-400 mb-4">This action is irreversible. Please be certain.</p>
                <button 
                    onClick={handleResetData} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md flex items-center justify-center gap-2"
                >
                    <AlertCircle size={16} /> Reset All Application Data
                </button>
            </SettingCard>
        </div>
    );
};

export default SettingsView;