import React from 'react';

const styles = `
/* Performance-First 2025 Design System */
:root {
    --primary: #6366f1;
    --primary-light: #818cf8;
    --primary-dark: #4f46e5;
    --accent: #06b6d4;
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
    
    --text-primary: #ffffff;
    --text-secondary: #a1a1aa;
    --text-muted: #71717a;
    
    --surface-primary: #0a0a0a;
    --surface-secondary: #171717;
    --surface-tertiary: #262626;
    
    --border-subtle: rgba(255, 255, 255, 0.1);
    --border-default: rgba(255, 255, 255, 0.15);
    
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
}

/* Global Base - Minimal */
body {
    background: var(--surface-primary);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* Container - Narrow and Clean */
.startup-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
}

/* Simple Input System - No Blur */
.input-style { 
    background: var(--surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color 0.15s ease;
    width: 100%;
}
.input-style:focus { 
    outline: none;
    border-color: var(--primary);
}
.input-style::placeholder {
    color: var(--text-muted);
}

/* Label System */
.label-style { 
    display: block;
    margin-bottom: var(--spacing-sm);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
}

/* Button System - Minimal Animations */
.button-primary { 
    background: var(--primary);
    color: white;
    font-weight: 500;
    font-size: 14px;
    padding: 10px 20px;
    border-radius: var(--radius-md);
    transition: background-color 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    border: none;
    cursor: pointer;
}
.button-primary:hover { 
    background: var(--primary-dark);
}

.button-secondary { 
    background: var(--surface-secondary);
    color: var(--text-primary);
    font-weight: 500;
    font-size: 14px;
    padding: 10px 20px;
    border-radius: var(--radius-md);
    transition: background-color 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    border: 1px solid var(--border-subtle);
    cursor: pointer;
}
.button-secondary:hover { 
    background: var(--surface-tertiary);
}

/* Navigation - Minimal */
.nav-pill {
    padding: 8px 16px;
    border-radius: var(--radius-lg);
    font-weight: 500;
    font-size: 13px;
    transition: background-color 0.15s ease;
    background: transparent;
    color: var(--text-muted);
    border: 1px solid transparent;
    cursor: pointer;
}
.nav-pill:hover {
    background: var(--surface-secondary);
    color: var(--text-secondary);
}
.nav-pill.active {
    background: var(--primary);
    color: white;
    font-weight: 600;
}

/* Card System - Simple */
.glass-card {
    background: var(--surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    transition: border-color 0.15s ease;
}

.glass-card:hover {
    border-color: var(--border-default);
}

/* Modal System - No Blur */
.modal-backdrop {
    background: rgba(0, 0, 0, 0.7);
}

.modal-content {
    background: var(--surface-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

/* Switch & Port Components - Minimal */
.switch-chassis {
    background: var(--surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
}

.port-container {
    background: var(--surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    transition: border-color 0.15s ease;
    cursor: pointer;
}

.port-container:hover {
    border-color: var(--border-default);
}

.port-container.connected {
    border-color: var(--success);
}

/* VLAN - Simple */
.vlan-indicator {
    border-radius: 50%;
}

.vlan-badge {
    background: var(--surface-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 600;
}

/* Dropdown - Simple */
.dropdown-container {
    position: relative;
    z-index: 1000;
}

.custom-dropdown-portal {
    position: fixed !important;
    z-index: 999999 !important;
    background: var(--surface-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* Scrollbars - Simple */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: var(--surface-primary);
}

::-webkit-scrollbar-thumb {
    background: var(--border-default);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--border-subtle);
}

/* Header - Clean */
.modern-header {
    background: var(--surface-primary);
    border-bottom: 1px solid var(--border-subtle);
}

.search-dropdown {
    background: var(--surface-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    z-index: 1001 !important;
}

.search-result-item {
    transition: background-color 0.1s ease;
    border-bottom: 1px solid var(--border-subtle);
}

.search-result-item:hover {
    background: var(--surface-tertiary);
}

.search-result-item:last-child {
    border-bottom: none;
}

/* Status indicators - Simple */
.status-online {
    color: var(--success);
    background: rgba(16, 185, 129, 0.1);
}

.status-offline {
    color: var(--error);
    background: rgba(239, 68, 68, 0.1);
}

.status-warning {
    color: var(--warning);
    background: rgba(245, 158, 11, 0.1);
}

/* Typography helpers - Simple */
.text-gradient {
    color: var(--primary-light);
}

.text-accent-gradient {
    color: var(--accent);
}

.text-success-gradient {
    color: var(--success);
}

/* Remove ALL performance-heavy properties */
* {
    /* Remove GPU acceleration overrides */
}

/* Responsive - Minimal */
@media (max-width: 768px) {
    .startup-container {
        padding: 0 var(--spacing-md);
    }
    
    .nav-pill {
        padding: 6px 12px;
        font-size: 12px;
    }
    
    .button-primary, .button-secondary {
        padding: 8px 16px;
        font-size: 13px;
    }
    
    .input-style {
        padding: 10px 12px;
        font-size: 13px;
    }
}

/* Disable animations on low-power devices */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Activity Cards - Latest Changes View */
.activity-card {
    background: var(--surface-secondary);
    transition: background-color 0.15s ease;
}

.activity-card:hover {
    background: var(--surface-tertiary);
}

/* Remove all will-change and transform properties for better performance */
/* Only essential styles remain */
`;

const StyleInjector = () => <style>{styles}</style>;

export default StyleInjector;