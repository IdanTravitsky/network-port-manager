import React, { useState, useEffect } from 'react';
import { X, Plus, GripVertical, Trash2, Server, Grid, Save, Cancel } from 'lucide-react';

const ClosetLayoutModal = ({ 
    isOpen, 
    onClose, 
    floorId, 
    currentLayout, 
    availableSwitches, 
    onSave 
}) => {
    const [layoutItems, setLayoutItems] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [newPatchPanel, setNewPatchPanel] = useState({
        startPort: 1,
        endPort: 24,
        portsPerRow: 10
    });
    const [selectedSwitchId, setSelectedSwitchId] = useState('');

    // Initialize layout items when modal opens
    useEffect(() => {
        if (isOpen && currentLayout) {
            setLayoutItems([...currentLayout]);
        }
    }, [isOpen, currentLayout]);

    const handleAddPatchPanel = () => {
        const newId = `patch-panel-${Date.now()}`;
        const newItem = {
            id: newId,
            type: 'patchPanel',
            startPort: parseInt(newPatchPanel.startPort),
            endPort: parseInt(newPatchPanel.endPort),
            portsPerRow: parseInt(newPatchPanel.portsPerRow)
        };
        
        setLayoutItems([...layoutItems, newItem]);
        
        // Reset form
        setNewPatchPanel({
            startPort: newPatchPanel.endPort + 1,
            endPort: newPatchPanel.endPort + 24,
            portsPerRow: 10
        });
    };

    const handleAddSwitch = () => {
        if (!selectedSwitchId) return;
        
        const newId = `switch-${Date.now()}`;
        const newItem = {
            id: newId,
            type: 'switch',
            switchId: selectedSwitchId
        };
        
        setLayoutItems([...layoutItems, newItem]);
        setSelectedSwitchId('');
    };

    const handleDeleteItem = (index) => {
        const newItems = [...layoutItems];
        newItems.splice(index, 1);
        setLayoutItems(newItems);
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const newItems = [...layoutItems];
        const draggedItem = newItems[draggedIndex];
        
        // Remove dragged item and insert at new position
        newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, draggedItem);
        
        setLayoutItems(newItems);
        setDraggedIndex(null);
    };

    const handleSave = () => {
        onSave(floorId, layoutItems);
        onClose();
    };

    const handleCancel = () => {
        setLayoutItems([...currentLayout]); // Reset to original
        onClose();
    };

    if (!isOpen) return null;

    // Filter switches that are on the current floor and not already in layout
    const usedSwitchIds = layoutItems.filter(item => item.type === 'switch').map(item => item.switchId);
    const availableFloorSwitches = availableSwitches.filter(sw => 
        sw.floorId === floorId && !usedSwitchIds.includes(sw.id)
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 modal-backdrop" style={{ zIndex: 9999999 }}>
            <div className="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--primary-gradient)' }}>
                            <Grid size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gradient">Edit Closet Layout</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Configure rack layout for Floor {floorId}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleCancel}
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
                    {/* Current Layout Items */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gradient mb-4">Current Layout</h3>
                        {layoutItems.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
                                    <Grid size={24} style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <p style={{ color: 'var(--text-muted)' }}>No layout items configured</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {layoutItems.map((item, index) => (
                                    <div 
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className="glass-card p-4 flex items-center gap-3 hover:border-cyan-500/50 transition-colors"
                                    >
                                        <div className="cursor-move">
                                            <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        
                                        {item.type === 'patchPanel' ? (
                                            <>
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                                                    <Grid size={16} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white">
                                                        Patch Panel (Ports {item.startPort}-{item.endPort})
                                                    </h4>
                                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                        {item.portsPerRow} ports per row
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                                                    <Server size={16} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white">
                                                        {availableSwitches.find(sw => sw.id === item.switchId)?.name || 'Unknown Switch'}
                                                    </h4>
                                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                        Network Switch
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                        
                                        <button
                                            onClick={() => handleDeleteItem(index)}
                                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add New Items */}
                    <div className="space-y-6">
                        {/* Add Patch Panel */}
                        <div className="glass-card p-4">
                            <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                                <Grid size={16} />
                                Add Patch Panel
                            </h4>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="label-style">Start Port</label>
                                    <input
                                        type="number"
                                        value={newPatchPanel.startPort}
                                        onChange={(e) => setNewPatchPanel({...newPatchPanel, startPort: e.target.value})}
                                        className="input-style"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="label-style">End Port</label>
                                    <input
                                        type="number"
                                        value={newPatchPanel.endPort}
                                        onChange={(e) => setNewPatchPanel({...newPatchPanel, endPort: e.target.value})}
                                        className="input-style"
                                        min={newPatchPanel.startPort}
                                    />
                                </div>
                                <div>
                                    <label className="label-style">Ports Per Row</label>
                                    <input
                                        type="number"
                                        value={newPatchPanel.portsPerRow}
                                        onChange={(e) => setNewPatchPanel({...newPatchPanel, portsPerRow: e.target.value})}
                                        className="input-style"
                                        min="1"
                                        max="50"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleAddPatchPanel}
                                className="button-primary w-full"
                                disabled={!newPatchPanel.startPort || !newPatchPanel.endPort || newPatchPanel.startPort >= newPatchPanel.endPort}
                            >
                                <Plus size={16} />
                                Add Patch Panel
                            </button>
                        </div>

                        {/* Add Switch */}
                        <div className="glass-card p-4">
                            <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                                <Server size={16} />
                                Add Switch
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="label-style">Select Switch</label>
                                    <select
                                        value={selectedSwitchId}
                                        onChange={(e) => setSelectedSwitchId(e.target.value)}
                                        className="input-style"
                                    >
                                        <option value="">Choose a switch...</option>
                                        {availableFloorSwitches.map(sw => (
                                            <option key={sw.id} value={sw.id}>
                                                {sw.name} ({sw.portCount} ports)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleAddSwitch}
                                    className="button-primary w-full"
                                    disabled={!selectedSwitchId}
                                >
                                    <Plus size={16} />
                                    Add Switch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={handleSave}
                        className="button-primary flex-1"
                    >
                        <Save size={16} />
                        Save Layout
                    </button>
                    <button
                        onClick={handleCancel}
                        className="button-secondary flex-1"
                    >
                        <Cancel size={16} />
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClosetLayoutModal;