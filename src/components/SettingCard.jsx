import React from 'react';

const SettingCard = ({ title, children }) => (
    <div className="bg-slate-800 rounded-lg p-5">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400 border-b border-slate-700 pb-2">{title}</h3>
        {children}
    </div>
);

export default SettingCard;