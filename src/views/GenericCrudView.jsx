import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const GenericCrudView = ({ title, items, fields, onSave }) => {
    const [editingItem, setEditingItem] = useState(null);
    
    const handleSave = (e) => { 
        e.preventDefault(); 
        onSave(editingItem.id ? 'update' : 'add', editingItem); 
        setEditingItem(null); 
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <button 
                    className="button-primary" 
                    onClick={() => setEditingItem(fields.reduce((acc, f) => ({...acc, [f.key]: ''}), {}))}
                >
                    <Plus size={16}/> Add New
                </button>
            </div>
            {editingItem && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                        <form onSubmit={handleSave}>
                            <div className="p-6 space-y-4">
                                {fields.map(field => (
                                    <div key={field.key}>
                                        <label className="label-style">{field.label}</label>
                                        <input 
                                            type="text" 
                                            value={editingItem[field.key] || ''} 
                                            onChange={e => setEditingItem({...editingItem, [field.key]: e.target.value})} 
                                            className="input-style w-full" 
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end p-4 bg-slate-700/50 gap-2">
                                <button 
                                    type="button" 
                                    className="button-secondary" 
                                    onClick={() => setEditingItem(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="button-primary">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="bg-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-700/50">
                        <tr>
                            {fields.map(f => 
                                <th key={f.key} className="p-3">{f.label}</th>
                            )}
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-b border-slate-700">
                                {fields.map(f => 
                                    <td key={f.key} className="p-3">{item[f.key]}</td>
                                )}
                                <td className="p-3 flex gap-2">
                                    <button 
                                        onClick={() => setEditingItem(item)} 
                                        className="p-2 text-slate-400 hover:text-white"
                                    >
                                        <Edit size={16}/>
                                    </button>
                                    <button 
                                        onClick={() => onSave('delete', item)} 
                                        className="p-2 text-red-500 hover:text-red-400"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GenericCrudView;