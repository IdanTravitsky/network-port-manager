import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronsUpDown, Plus, Check } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder, isCreatable = false, onCreate = () => {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
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
                    <ul className="bg-slate-700 border border-slate-600 rounded-md max-h-60 overflow-auto shadow-xl">
                        {isCreatable && canCreate && (
                            <li onClick={handleCreate} className="px-3 py-2 bg-cyan-700 hover:bg-cyan-600 cursor-pointer flex items-center gap-2">
                                <Plus size={16}/> Create "{inputValue}"
                            </li>
                        )}
                        {filteredOptions.map(opt => (
                            <li key={opt.value} onClick={() => handleSelect(opt.value)} className="px-3 py-2 hover:bg-cyan-600 cursor-pointer flex justify-between items-center">
                                {opt.label}
                                {value === opt.value && <Check size={16} />}
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