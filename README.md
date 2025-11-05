# Premium DTF Print Solutions

A professional e-commerce platform for Direct-to-Film (DTF) printing and custom transfer solutions, built for manufacturers and commercial clients.

## Features

- **Product Catalog** - Browse DTF transfers, heat press equipment, and vinyl products
- **Custom Designer** - Create and customize your own designs
- **Order Management** - Track and manage orders efficiently
- **Shopping Cart** - Streamlined checkout experience
- **Resource Center** - Access guides, specifications, and support materials

## Technology Stack

This project is built with modern web technologies:

- **React 18** - Component-based UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library built on Radix UI
- **React Router** - Client-side routing
- **React Hook Form** - Performant form validation
- **TanStack Query** - Data fetching and state management
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm (recommend using [nvm](https://github.com/nvm-sh/nvm))

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd mami_pub

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure

```
mami_pub/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components (routes)
│   ├── assets/         # Images and static assets
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utility functions
├── public/             # Static files
└── docs/               # Documentation
```

## Documentation

- [Project Structure](docs/project_structure.md) - Detailed architecture documentation
- [Changelog](docs/changelog.md) - Version history and updates

## Code Quality Standards

This project follows strict architectural principles:

- **Single Responsibility** - Each component/file has one clear purpose
- **Modular Design** - Reusable, testable, independent components
- **File Size Limits** - Max 500 lines per file
- **Responsive Design** - Mobile-first approach
- **Type Safety** - Full TypeScript coverage

## Contributing

Please read our documentation standards before contributing:

1. Review `docs/project_structure.md` before making changes
2. Update documentation when changing structure
3. Follow existing code patterns and naming conventions
4. Keep components focused and under 500 lines
5. Update changelog for all structural changes

## License

Proprietary - All rights reserved
