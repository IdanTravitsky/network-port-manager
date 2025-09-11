import React, { useState } from 'react';
import { X, Save, Plus, Trash2, GripVertical } from 'lucide-react';

const ColumnCustomizationModal = ({ columns, onSave, onClose }) => {
    const [localColumns, setLocalColumns] = useState(columns); 
    const [newColumnName, setNewColumnName] = useState('');
    
    const handleToggleVisibility = (id) => { 
        setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c)); 
    };
    
    const handleAddColumn = (e) => { 
        e.preventDefault(); 
        if (newColumnName.trim()) { 
            const newId = `custom_${newColumnName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`; 
            const newColumn = { 
                id: newId, 
                label: newColumnName.trim(), 
                visible: true, 
                isCustom: true, 
                isEditable: true, 
                type: 'text' 
            }; 
            setLocalColumns(prev => [...prev, newColumn]); 
            setNewColumnName(''); 
        }
    };
    
    const handleDeleteColumn = (id) => { 
        setLocalColumns(prev => prev.filter(c => c.id !== id)); 
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold">Customize Columns</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <h3 className="font-semibold text-slate-300">Manage Columns</h3>
                    <ul className="space-y-2">
                        {localColumns.map(col => (
                            <li key={col.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="cursor-grab text-slate-500" size={18}/>
                                    <span>{col.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={col.visible} 
                                            onChange={() => handleToggleVisibility(col.id)} 
                                            className="sr-only" 
                                        />
                                        <div className={`w-10 h-5 rounded-full transition-colors ${col.visible ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full m-0.5 transform transition-transform ${col.visible ? 'translate-x-5' : ''}`}></div>
                                        </div>
                                    </label>
                                    {col.isCustom && (
                                        <button 
                                            onClick={() => handleDeleteColumn(col.id)} 
                                            className="p-1 text-red-400 hover:bg-red-500/20 rounded-full"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <form onSubmit={handleAddColumn} className="pt-4 border-t border-slate-700">
                        <h3 className="font-semibold text-slate-300 mb-2">Add New Column</h3>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newColumnName} 
                                onChange={e => setNewColumnName(e.target.value)} 
                                placeholder="New column name" 
                                className="input-style flex-grow" 
                            />
                            <button type="submit" className="button-primary">
                                <Plus size={16} /> Add
                            </button>
                        </div>
                    </form>
                </div>
                <div className="flex justify-end p-4 bg-slate-700/50 rounded-b-lg gap-2">
                    <button type="button" onClick={onClose} className="button-secondary">
                        Cancel
                    </button>
                    <button type="button" onClick={() => { onSave(localColumns); onClose(); }} className="button-primary">
                        <Save size={16} /> Save View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColumnCustomizationModal;