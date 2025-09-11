import React from 'react';

const DashboardCard = ({ title, children }) => (
    <div className="bg-slate-800/70 rounded-lg shadow-lg">
        <h3 className="p-4 text-lg font-semibold border-b border-slate-700">{title}</h3>
        {children}
    </div>
);

export default DashboardCard;