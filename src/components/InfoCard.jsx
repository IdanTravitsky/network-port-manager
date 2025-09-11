import React from 'react';

const InfoCard = ({ title, value }) => (
    <div className="bg-slate-800/70 p-4 rounded-lg">
        <h4 className="text-slate-400 text-sm">{title}</h4>
        <p className="text-3xl font-bold text-white">{value}</p>
    </div>
);

export default InfoCard;