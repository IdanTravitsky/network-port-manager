import React from 'react';

const styles = `
/* 2025 Startup Design System */
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    --dark-gradient: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
    
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-hover: rgba(255, 255, 255, 0.05);
    
    --text-primary: #ffffff;
    --text-secondary: #a1a1aa;
    --text-muted: #71717a;
    --text-disabled: #52525b;
    
    --surface-primary: #0a0a0a;
    --surface-secondary: #141414;
    --surface-tertiary: #1f1f23;
    --surface-elevated: #27272a;
    
    --border-subtle: rgba(255, 255, 255, 0.08);
    --border-default: rgba(255, 255, 255, 0.12);
    --border-strong: rgba(255, 255, 255, 0.18);
    
    --shadow-elevation-low: 0 1px 2px rgba(0, 0, 0, 0.5);
    --shadow-elevation-medium: 0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4);
    --shadow-elevation-high: 0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3);
    --shadow-elevation-extreme: 0 25px 50px rgba(0, 0, 0, 0.6), 0 12px 25px rgba(0, 0, 0, 0.4);
    
    --radius-sm: 6px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --radius-2xl: 24px;
    
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
    --spacing-3xl: 64px;
}

/* Global Base */
body {
    background: var(--surface-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--text-primary);
}

/* Container System - Narrower for Modern Look */
.startup-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
}

@media (min-width: 1440px) {
    .startup-container {
        max-width: 1400px;
        padding: 0 var(--spacing-2xl);
    }
}

/* Typography System */
.text-gradient {
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.text-accent-gradient {
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.text-success-gradient {
    background: var(--success-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Modern Input System */
.input-style { 
    background: var(--glass-bg);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 400;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow-elevation-low);
    width: 100%;
}
.input-style:focus { 
    outline: none;
    border-color: transparent;
    background: var(--glass-hover);
    box-shadow: 
        0 0 0 2px rgba(102, 126, 234, 0.3),
        var(--shadow-elevation-medium);
    transform: translateY(-1px);
}
.input-style::placeholder {
    color: var(--text-muted);
    font-weight: 400;
}

/* Label System */
.label-style { 
    display: block;
    margin-bottom: var(--spacing-sm);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.025em;
}

/* Button System */
.button-primary { 
    background: var(--primary-gradient);
    color: var(--text-primary);
    font-weight: 500;
    font-size: 14px;
    padding: 12px 24px;
    border-radius: var(--radius-md);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    border: none;
    box-shadow: var(--shadow-elevation-medium);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(12px);
    cursor: pointer;
}
.button-primary:hover { 
    transform: translateY(-1px);
    box-shadow: var(--shadow-elevation-high);
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}
.button-primary:active {
    transform: translateY(0);
}

.button-secondary { 
    background: var(--glass-bg);
    color: var(--text-primary);
    font-weight: 500;
    font-size: 14px;
    padding: 12px 24px;
    border-radius: var(--radius-md);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    border: 1px solid var(--border-subtle);
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow-elevation-low);
    cursor: pointer;
}
.button-secondary:hover { 
    background: var(--glass-hover);
    transform: translateY(-1px);
    border-color: var(--border-default);
    box-shadow: var(--shadow-elevation-medium);
}

/* Navigation System */
.nav-pill {
    padding: 10px 16px;
    border-radius: var(--radius-lg);
    font-weight: 500;
    font-size: 13px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    background: transparent;
    color: var(--text-muted);
    border: 1px solid transparent;
    backdrop-filter: blur(8px);
    letter-spacing: 0.025em;
    cursor: pointer;
}
.nav-pill:hover {
    background: var(--glass-bg);
    color: var(--text-secondary);
    border-color: var(--border-subtle);
}
.nav-pill.active {
    background: var(--primary-gradient);
    color: var(--text-primary);
    box-shadow: var(--shadow-elevation-medium);
    font-weight: 600;
}
.nav-pill.active:hover {
    box-shadow: var(--shadow-elevation-high);
}

/* Card System */
.glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-elevation-medium);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
    border-color: var(--border-default);
    box-shadow: var(--shadow-elevation-high);
}

.elevated-card {
    background: var(--surface-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-elevation-high);
}

/* Modal System */
.modal-backdrop {
    backdrop-filter: blur(12px);
    animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(0, 0, 0, 0.6);
}

.modal-content {
    animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: var(--surface-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-elevation-extreme);
    backdrop-filter: blur(20px);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes modalSlideIn {
    from { 
        opacity: 0; 
        transform: scale(0.95) translateY(-20px); 
    }
    to { 
        opacity: 1; 
        transform: scale(1) translateY(0); 
    }
}

/* Switch & Port Components */
.switch-chassis {
    background: var(--glass-bg);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-elevation-medium);
    backdrop-filter: blur(16px);
}

.port-container {
    background: var(--glass-bg);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(8px);
    cursor: pointer;
}

.port-container:hover {
    transform: translateY(-1px);
    border-color: var(--border-default);
    box-shadow: var(--shadow-elevation-medium);
}

.port-container.connected {
    border-color: rgba(67, 233, 123, 0.3);
    box-shadow: 0 0 20px rgba(67, 233, 123, 0.1);
}

.port-container.connected:hover {
    box-shadow: 
        0 0 20px rgba(67, 233, 123, 0.2),
        var(--shadow-elevation-medium);
}

/* VLAN Enhancements */
.vlan-indicator {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
    box-shadow: var(--shadow-elevation-low);
}

.vlan-indicator:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-elevation-medium);
}

.vlan-badge {
    background: var(--glass-bg);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 600;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(8px);
}

.vlan-badge:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-elevation-low);
}

/* Dropdown System */
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
    backdrop-filter: blur(16px);
    box-shadow: var(--shadow-elevation-extreme);
}

/* Custom Scrollbars */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: var(--surface-secondary);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: var(--border-strong);
    border-radius: 3px;
    transition: all 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--glass-border);
}

/* Performance Optimizations */
* {
    -webkit-transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    -webkit-perspective: 1000;
}

html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.overflow-auto, .overflow-x-auto, .overflow-y-auto {
    transform: translateZ(0);
    -webkit-overflow-scrolling: touch;
    will-change: transform;
}

/* Component-specific optimizations */
table {
    table-layout: fixed;
    transform: translateZ(0);
    will-change: contents;
}

tr:hover {
    isolation: isolate;
    will-change: background-color;
}

.port-container {
    transform: translateZ(0);
    will-change: transform, box-shadow;
    contain: layout style paint;
}

.switch-chassis {
    transform: translateZ(0);
    will-change: contents;
    contain: layout style;
}

.glass-card {
    transform: translateZ(0);
    will-change: transform;
    contain: style;
}

.modal-backdrop {
    transform: translateZ(0);
    will-change: opacity;
}

.modal-content {
    transform: translateZ(0);
    will-change: transform, opacity;
}

.button-primary, .button-secondary {
    transform: translateZ(0);
    will-change: transform;
    contain: layout style;
}

.nav-pill {
    transform: translateZ(0);
    will-change: transform;
}

.input-style {
    transform: translateZ(0);
    will-change: transform, box-shadow;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
    .startup-container {
        padding: 0 var(--spacing-md);
    }
    
    .nav-pill {
        padding: 8px 12px;
        font-size: 12px;
    }
    
    .button-primary, .button-secondary {
        padding: 10px 16px;
        font-size: 13px;
    }
    
    .input-style {
        padding: 12px 14px;
        font-size: 13px;
    }
}

/* Header and Layout Improvements */
.modern-header {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-subtle);
    position: sticky;
    top: 0;
    z-index: 100;
}

.search-dropdown {
    background: var(--surface-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-elevation-extreme);
    z-index: 1001 !important;
}

.search-result-item {
    transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
    border-bottom: 1px solid var(--border-subtle);
}

.search-result-item:hover {
    background: var(--glass-hover);
}

.search-result-item:last-child {
    border-bottom: none;
}

/* Status indicators */
.status-online {
    color: #43e97b;
    background: rgba(67, 233, 123, 0.1);
}

.status-offline {
    color: #fa709a;
    background: rgba(250, 112, 154, 0.1);
}

.status-warning {
    color: #fee140;
    background: rgba(254, 225, 64, 0.1);
}
`;

const StyleInjector = () => <style>{styles}</style>;

export default StyleInjector;