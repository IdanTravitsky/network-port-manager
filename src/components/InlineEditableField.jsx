import React, { useState, useEffect, useRef } from 'react';

const InlineEditableField = ({ value, onSave, className, inputClassName }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const inputRef = useRef(null);
    
    useEffect(() => { 
        if (isEditing) { 
            inputRef.current?.focus(); 
            inputRef.current?.select(); 
        } 
    }, [isEditing]);
    
    const handleSave = () => { 
        if (currentValue.trim() && currentValue !== value) { 
            onSave(currentValue.trim()); 
        } 
        setIsEditing(false); 
    };
    
    const handleKeyDown = (e) => { 
        if (e.key === 'Enter') handleSave(); 
        else if (e.key === 'Escape') { 
            setCurrentValue(value); 
            setIsEditing(false); 
        } 
    };
    
    if (isEditing) { 
        return (
            <input 
                ref={inputRef} 
                type="text" 
                value={currentValue} 
                onChange={e => setCurrentValue(e.target.value)} 
                onBlur={handleSave} 
                onKeyDown={handleKeyDown} 
                className={inputClassName} 
            />
        ); 
    }
    
    return (
        <div 
            onClick={() => setIsEditing(true)} 
            className={`${className} cursor-text hover:bg-slate-700/50 rounded px-1 -mx-1 py-0.5`}
        >
            {value}
        </div>
    );
};

export default InlineEditableField;