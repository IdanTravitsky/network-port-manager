import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronsUpDown, Plus, Check, Edit2 } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder, isCreatable = false, onCreate = () => {}, isRenameable = false, onRename = () => {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        const selectedOption = options.find(opt => opt.value === value);
        setInputValue(selectedOption ? selectedOption.label : '');
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
                const selectedOption = options.find(opt => opt.value === value);
                setInputValue(selectedOption ? selectedOption.label : '');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, value, options]);

    const filteredOptions = useMemo(() => {
        if (!inputValue) return options;
        return options.filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()));
    }, [inputValue, options]);

    const canCreate = isCreatable && inputValue && !options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase());

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };
    
    const handleCreate = () => {
        onCreate(inputValue);
        setIsOpen(false);
    };

    const handleStartRename = (optionValue, currentLabel) => {
        setRenamingId(optionValue);
        setRenameValue(currentLabel);
    };

    const handleSaveRename = () => {
        if (renameValue.trim() && renameValue !== options.find(opt => opt.value === renamingId)?.label) {
            onRename(renamingId, renameValue.trim());
        }
        setRenamingId(null);
        setRenameValue('');
    };

    const handleCancelRename = () => {
        setRenamingId(null);
        setRenameValue('');
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input 
                    type="text"
                    className="input-style w-full"
                    value={inputValue}
                    onChange={e => {
                        setInputValue(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                />
                <ChevronsUpDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {isOpen && (
                <div className="dropdown-container absolute w-full mt-1" style={{ zIndex: 999999 }}>
                    <ul className="search-dropdown max-h-60 overflow-auto">
                        {isCreatable && canCreate && (
                            <li onClick={handleCreate} className="px-3 py-2 cursor-pointer flex items-center gap-2" style={{ background: 'var(--primary)', color: 'white' }}>
                                <Plus size={16}/> Create "{inputValue}"
                            </li>
                        )}
                        {filteredOptions.map(opt => (
                            <li key={opt.value} className="search-result-item px-3 py-2 flex justify-between items-center">
                                {renamingId === opt.value ? (
                                    <div className="flex items-center gap-2 w-full">
                                        <input
                                            type="text"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveRename();
                                                if (e.key === 'Escape') handleCancelRename();
                                            }}
                                            className="input-style flex-1 py-1 px-2 text-sm"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveRename();
                                            }}
                                            className="button-primary px-2 py-1 text-xs"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancelRename();
                                            }}
                                            className="button-secondary px-2 py-1 text-xs"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span onClick={() => handleSelect(opt.value)} className="flex-1 cursor-pointer">
                                            {opt.label}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {value === opt.value && <Check size={16} style={{ color: 'var(--success)' }} />}
                                            {isRenameable && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStartRename(opt.value, opt.label);
                                                    }}
                                                    className="p-1 rounded hover:bg-opacity-20 hover:bg-white transition-colors"
                                                    title="Rename"
                                                >
                                                    <Edit2 size={14} style={{ color: 'var(--text-muted)' }} />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                        {filteredOptions.length === 0 && !canCreate && (
                             <li className="px-3 py-2 text-slate-400">No results found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;