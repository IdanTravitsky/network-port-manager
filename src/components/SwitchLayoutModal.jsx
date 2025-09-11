import React, { useState, useEffect, useCallback } from 'react';
import { X, Grid, Settings, Eye, Move } from 'lucide-react';

const SwitchLayoutModal = ({ switchData, layoutTemplates, onSave, onClose }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState(switchData?.layoutTemplateId || 'odd_even');
    const [customRows, setCustomRows] = useState([]);
    const [previewRows, setPreviewRows] = useState([]);

    const generatePreview = useCallback(() => {
        if (!switchData) return;

        const template = layoutTemplates.find(t => t.id === selectedTemplateId);
        if (!template) return;

        const allPorts = Array.from({ length: switchData.portCount }, (_, i) => i + 1);
        let rows = [];

        switch (template.config.type) {
            case 'odd_even': {
                const oddPorts = allPorts.filter(p => p % 2 !== 0);
                const evenPorts = allPorts.filter(p => p % 2 === 0);
                rows = [oddPorts, evenPorts];
                break;
            }
            case 'sequential': {
                const portsPerRow = template.config.portsPerRow;
                for (let i = 0; i < allPorts.length; i += portsPerRow) {
                    rows.push(allPorts.slice(i, i + portsPerRow));
                }
                break;
            }
            case 'custom': {
                rows = customRows.length > 0 ? customRows : [allPorts];
                break;
            }
            default:
                rows = [allPorts];
        }

        setPreviewRows(rows);
    }, [switchData, layoutTemplates, selectedTemplateId, customRows]);

    useEffect(() => {
        generatePreview();
    }, [generatePreview]);

    const handleSave = () => {
        const updatedSwitch = {
            ...switchData,
            layoutTemplateId: selectedTemplateId
        };

        // If custom layout, store the custom rows
        if (selectedTemplateId === 'custom') {
            updatedSwitch.customLayout = {
                rows: customRows
            };
        }

        onSave(updatedSwitch);
        onClose();
    };

    const addCustomRow = () => {
        setCustomRows([...customRows, []]);
    };

    const updateCustomRow = (rowIndex, newPorts) => {
        const updated = [...customRows];
        updated[rowIndex] = newPorts;
        setCustomRows(updated);
    };

    const removeCustomRow = (rowIndex) => {
        const updated = customRows.filter((_, i) => i !== rowIndex);
        setCustomRows(updated);
    };

    const getAvailablePorts = () => {
        if (!switchData) return [];
        const allPorts = Array.from({ length: switchData.portCount }, (_, i) => i + 1);
        const usedPorts = customRows.flat();
        return allPorts.filter(p => !usedPorts.includes(p));
    };

    const selectedTemplate = layoutTemplates.find(t => t.id === selectedTemplateId);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 modal-backdrop" style={{ zIndex: 9999999 }}>
            <div className="modal-content max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--primary-gradient)' }}>
                            <Grid size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gradient">Configure Switch Layout</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {switchData?.name} ({switchData?.portCount} ports)
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-lg transition-colors hover:bg-slate-600/50"
                    >
                        <X size={20} style={{ color: 'var(--text-muted)' }} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Layout Templates */}
                        <div>
                            <h3 className="text-lg font-semibold text-gradient mb-4 flex items-center gap-2">
                                <Settings size={20} />
                                Layout Templates
                            </h3>
                            
                            <div className="space-y-3">
                                {layoutTemplates.map(template => (
                                    <div
                                        key={template.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                                            selectedTemplateId === template.id
                                                ? 'border-cyan-500 bg-cyan-500/10'
                                                : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                                        }`}
                                        onClick={() => setSelectedTemplateId(template.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-white">{template.name}</h4>
                                            <input
                                                type="radio"
                                                checked={selectedTemplateId === template.id}
                                                onChange={() => setSelectedTemplateId(template.id)}
                                                className="w-4 h-4 text-cyan-500"
                                            />
                                        </div>
                                        <p className="text-sm text-slate-400">{template.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Custom Layout Editor */}
                            {selectedTemplateId === 'custom' && (
                                <div className="mt-6">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Move size={16} />
                                        Custom Layout Editor
                                    </h4>
                                    
                                    <div className="space-y-2">
                                        {customRows.map((row, rowIndex) => (
                                            <div key={rowIndex} className="flex items-center gap-2">
                                                <span className="text-sm text-slate-400 w-12">Row {rowIndex + 1}:</span>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., 1,2,3,4,5"
                                                    value={row.join(',')}
                                                    onChange={(e) => {
                                                        const ports = e.target.value
                                                            .split(',')
                                                            .map(p => parseInt(p.trim()))
                                                            .filter(p => !isNaN(p) && p > 0 && p <= switchData.portCount);
                                                        updateCustomRow(rowIndex, ports);
                                                    }}
                                                    className="input-style flex-1 text-sm"
                                                />
                                                <button
                                                    onClick={() => removeCustomRow(rowIndex)}
                                                    className="button-secondary px-3 py-1 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        
                                        <button
                                            onClick={addCustomRow}
                                            className="button-primary text-sm"
                                        >
                                            Add Row
                                        </button>
                                        
                                        <div className="text-xs text-slate-400">
                                            Available ports: {getAvailablePorts().join(', ')}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        <div>
                            <h3 className="text-lg font-semibold text-gradient mb-4 flex items-center gap-2">
                                <Eye size={20} />
                                Layout Preview
                            </h3>
                            
                            {selectedTemplate && (
                                <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                                    <p className="text-sm text-slate-300">
                                        <strong>{selectedTemplate.name}:</strong> {selectedTemplate.description}
                                    </p>
                                </div>
                            )}

                            <div className="switch-preview bg-slate-800/50 p-4 rounded-lg">
                                <div className="space-y-2">
                                    {previewRows.map((row, rowIndex) => (
                                        <div key={rowIndex} className="flex flex-wrap gap-1">
                                            {row.map(portNum => (
                                                <div
                                                    key={portNum}
                                                    className="w-8 h-8 flex items-center justify-center text-xs font-mono rounded border border-slate-500 bg-slate-600/50 text-white"
                                                >
                                                    {portNum}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {previewRows.length === 0 && (
                                    <div className="text-center py-8 text-slate-400">
                                        <Grid size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>Configure layout to see preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-600">
                    <button
                        onClick={onClose}
                        className="button-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="button-primary"
                    >
                        Apply Layout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SwitchLayoutModal;