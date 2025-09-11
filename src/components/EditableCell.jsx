import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

const EditableCell = memo(({ isEditable, type, value, displayValue, options, onSave }) => {
    const [isEditing, setIsEditing] = useState(false); 
    const [currentValue, setCurrentValue] = useState(value); 
    const wrapperRef = useRef(null);
    
    useEffect(() => { 
        setCurrentValue(value); 
    }, [value]);
    
    const handleSave = useCallback(() => {
        if (currentValue !== value) onSave(currentValue);
        setIsEditing(false);
    }, [currentValue, value, onSave]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target) && isEditing) handleSave();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, isEditing, handleSave]);
    
    if (isEditing) { 
        return (
            <div ref={wrapperRef} className="p-0">
                {type === 'select' ? (
                    <select 
                        value={currentValue} 
                        onChange={e => setCurrentValue(e.target.value)} 
                        onBlur={handleSave} 
                        autoFocus 
                        className="w-full bg-slate-600 text-white p-3 outline-none"
                    >
                        <option value="">-- Unassign --</option>
                        {options.map(opt => 
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        )}
                    </select>
                ) : (
                    <input 
                        type="text" 
                        value={currentValue} 
                        onChange={e => setCurrentValue(e.target.value)} 
                        onBlur={handleSave} 
                        onKeyDown={e => e.key === 'Enter' ? handleSave() : e.key === 'Escape' && setIsEditing(false)} 
                        autoFocus 
                        className="w-full bg-slate-600 text-white p-3 outline-none" 
                    />
                )}
            </div>
        ); 
    }
    
    return (
        <div 
            onClick={() => isEditable && setIsEditing(true)} 
            className={`p-3 truncate h-full ${isEditable ? 'cursor-text hover:bg-slate-700' : ''}`}
        >
            {displayValue || <span className="text-slate-600">--</span>}
        </div>
    );
});

export default EditableCell;