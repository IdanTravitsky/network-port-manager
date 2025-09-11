# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Network Port Manager** - a React-based web application for managing network infrastructure including wall ports, switches, connections, and users. The application is built as a single-page application using React 19+ with Vite, Tailwind CSS, and local storage for data persistence.

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run ESLint with auto-fix
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Single File Architecture
The entire application is contained in `src/App.jsx` (~820 lines). This is intentional - the app uses a single-file architecture with the following major sections:

1. **Utils & Constants** (lines 4-67): Helper functions, data structures, and CSV export utilities
2. **Data Context & Provider** (lines 68-277): React Context for state management with localStorage persistence
3. **Core App & Views** (lines 278-594): Main app component and view components (Dashboard, Wall Ports, Switches, Users, Settings)
4. **Reusable Components** (lines 595-818): Modal components, UI components, and styled components

### Key Data Models
- **Floors**: Network floors/buildings
- **Wall Ports**: Physical network ports on walls
- **Switches**: Network switches with port counts
- **Connections**: Relationships between wall ports and switch ports (or local devices)
- **Users**: People assigned to network connections
- **Activity Log**: Audit trail of changes

### State Management
- Uses React Context (`DataContext`) for global state
- All data persists to localStorage with key `network-asset-manager-data-v8`
- Includes data migration logic for backward compatibility
- CRUD operations handled through `crudHandler` function

### Component Structure
- **Views**: Dashboard, WallPortView, SwitchView, UsersView, SettingsView
- **Modals**: ConnectionModal, ColumnCustomizationModal, BulkEditModal
- **UI Components**: CustomSelect, Switch, SwitchPort, GenericCrudView

## Styling Approach

The app uses a hybrid styling approach:
- **Tailwind CSS** for utility classes and layout
- **Inline styles** injected via `StyleInjector` component for custom component styles
- **Print styles** included for generating reports
- **Dark theme** with slate color palette as primary design

## Key Features
- Network port tracking and management
- Switch port visualization with real-time status
- User assignment and IP address tracking
- VLAN management with color coding
- Bulk editing capabilities
- CSV export functionality
- Print-friendly layouts
- Activity logging and history tracking

## Development Notes
- The app is fully functional offline (localStorage only)
- No backend API - all data is client-side
- Responsive design with mobile-first approach
- Uses Lucide React for consistent iconography
- Supports both "patched to switch" and "local device" connection types

## Important Implementation Details
- Port numbers are handled as strings to support alphanumeric identifiers
- Connection history is maintained for audit purposes
- VLAN colors are customizable per installation
- Switch ports are visualized in a two-row layout (odd/even)
- Custom dropdown component (`CustomSelect`) with creation capabilities