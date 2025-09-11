import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const BulkEditModal = ({ selectedPortIds, onSave, onClose }) => {
    const [vlan, setVlan] = useState('');
    const [room, setRoom] = useState('');
    
    const handleSave = () => {
        const updates = {};
        if (vlan.trim()) updates.vlan = vlan.trim();
        if (room.trim()) updates.room = room.trim();
        
        if (Object.keys(updates).length > 0) {
            onSave(selectedPortIds, updates);
        }
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold">Bulk Edit Ports</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="text-sm text-slate-400 mb-4">
                        Editing {selectedPortIds.length} selected port{selectedPortIds.length > 1 ? 's' : ''}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            VLAN
                        </label>
                        <input 
                            type="text" 
                            value={vlan} 
                            onChange={e => setVlan(e.target.value)} 
                            placeholder="Leave blank to keep existing values" 
                            className="input-style w-full" 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Room
                        </label>
                        <input 
                            type="text" 
                            value={room} 
                            onChange={e => setRoom(e.target.value)} 
                            placeholder="Leave blank to keep existing values" 
                            className="input-style w-full" 
                        />
                    </div>
                </div>
                
                <div className="flex justify-end p-4 bg-slate-700/50 rounded-b-lg gap-2">
                    <button type="button" onClick={onClose} className="button-secondary">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} className="button-primary">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkEditModal;