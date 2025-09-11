// Utility functions for the Network Port Manager

export const sortWallPorts = (a, b) => {
    const aIsNumeric = /^\d+$/.test(a.portNumber.toString().replace(/-/g, ''));
    const bIsNumeric = /^\d+$/.test(b.portNumber.toString().replace(/-/g, ''));
    if (aIsNumeric && bIsNumeric) { 
        return parseInt(a.portNumber.toString().replace(/-/g, ''), 10) - parseInt(b.portNumber.toString().replace(/-/g, ''), 10); 
    }
    if (aIsNumeric) return -1;
    if (bIsNumeric) return 1;
    return a.portNumber.toString().localeCompare(b.portNumber.toString());
};

// CSV Export utility function
export const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Get headers from the first row
    const headers = Object.keys(data[0]);
    
    // Escape CSV values and handle commas, quotes, newlines
    const escapeCSVValue = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = value.toString();
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };
    
    // Create CSV content
    const csvContent = [
        // Header row
        headers.map(header => escapeCSVValue(header)).join(','),
        // Data rows
        ...data.map(row => 
            headers.map(header => escapeCSVValue(row[header])).join(',')
        )
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};