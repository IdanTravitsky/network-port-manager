# Network Port Manager

A free, web-based network asset management tool built to help organize network infrastructure without the expense of commercial network management software.

## Why This Project Exists

As a network administrator, I needed a way to track wall ports, switch connections, user assignments, and network assets across our organization. Commercial network management solutions often come with hefty licensing fees, especially for smaller organizations or departments with budget constraints. This tool was created to provide essential network asset tracking capabilities without the recurring costs.

## Features

- **Port Management**: Track wall ports, their connections, and assignments
- **Switch Management**: Configure switches and manage port mappings
- **User Assignment**: Assign ports to users with IP address tracking
- **Visual Network Closet**: Interactive visual representation of network closets
- **Activity Logging**: Comprehensive audit trail of all changes
- **Search & Filter**: Find ports, switches, and users quickly
- **Bulk Operations**: Edit multiple ports simultaneously
- **Data Export**: Export configurations and reports
- **Custom Fields**: Add custom columns for organization-specific needs

## Technology Stack

- **Frontend**: React 19 with Vite for fast development
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography
- **Storage**: Local storage for data persistence (no server required)
- **Performance**: Virtual scrolling for large datasets

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/network-port-manager.git
   cd network-port-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Dashboard**: Get an overview of your network infrastructure
2. **Wall Ports**: Add and manage wall port connections
3. **Switches**: Configure switches and assign ports
4. **Latest Changes**: View activity log and recent modifications
5. **Settings**: Customize the application and manage data

## Data Management

- All data is stored locally in your browser's local storage
- Export your data regularly as backup
- Import/export functionality available in Settings
- No server or database required - runs entirely in the browser

## Contributing

This is an open-source project created to solve real-world network management challenges. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - Feel free to use, modify, and distribute as needed.

## Cost Savings

By using this tool instead of commercial alternatives, organizations can save:
- Monthly/annual licensing fees (typically $50-500+ per month)
- Per-user costs for team access
- Training costs on complex commercial platforms
- Integration and setup fees

Perfect for small to medium organizations, departments with limited budgets, or anyone who needs basic network asset tracking without enterprise overhead.

## Roadmap

- [ ] Network diagram generation
- [ ] SNMP integration for automatic discovery
- [ ] Multi-site support
- [ ] Advanced reporting features
- [ ] API for external integrations
- [ ] Mobile-responsive improvements

---

*Built with ❤️ to make network management accessible to everyone, regardless of budget.*
