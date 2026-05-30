<img width="2560" height="423" alt="github_betterlibmanan" src="https://github.com/user-attachments/assets/84aafadb-ca9d-46af-a52c-78e02ea64051" />

# BetterLibmanan

Enterprise-Grade Local Government Monolith for Libmanan

A modern, multilingual, and accessible enterprise monolith designed specifically for the people of Libmanan. Built with React, TypeScript, Express, and Tailwind CSS in a Turbo monorepo architecture.

## Features

- **Enterprise Monolith Architecture**: Turbo-powered monorepo with shared packages
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + MongoDB + Redis
- **Worker**: Background job processor
- **Multilingual Support**: English, Filipino, and other Philippine languages
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Accessibility**: WCAG 2.1 compliant design
- **Content Management**: YAML-based content system for easy updates
- **Customizable**: Easy theming and branding customization
- **Fast Performance**: Built with Vite for optimal loading speeds
- **SEO Optimized**: Built-in SEO with react-helmet, meta tags, and Open Graph support

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git

### Installation

1. Fork the repository

   Visit `https://github.com/enzox0/betterlibmanan`
   Click the "Fork" button in the top right
   This creates your own copy of the repository

2. Clone your forked repository

   ```bash
   git clone https://github.com/YOUR-USERNAME/betterlibmanan.git
   cd betterlibmanan
   ```

   Replace YOUR-USERNAME with your GitHub username.

3. Add upstream remote (to get updates from the original repo)

   ```bash
   git remote add upstream https://github.com/enzox0/betterlibmanan.git
   ```

4. Install pnpm (if not already installed)

   ```bash
   npm install -g pnpm@8.15.0
   ```

5. Install dependencies

   ```bash
   pnpm install
   ```

6. Start development servers

   ```bash
   # Start all apps (frontend, backend, worker)
   pnpm run dev

   # Or start them separately
   pnpm run dev:frontend
   pnpm run dev:backend
   pnpm run dev:worker
   ```

7. Open your browser and navigate to:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Documentation

- DEPLOYMENT-GUIDE.md - Deployment instructions for Docker and other platforms
- CHANGELOG.md - Version history and release notes
- docs/architecture/ - Architecture documentation
- docs/api/ - API documentation
- docs/decisions/ - Architecture decision records
- docs/runbooks/ - Operations runbooks
- docs/diagrams/ - System diagrams

## Perfect For

- The people of Libmanan
- Government IT Departments looking for modern web solutions
- Civic Technology Organizations building government tools
- Government Officials wanting professional online presence

## What Makes This Different

### Enterprise Monolith Architecture

- Turbo-powered monorepo for efficient code sharing
- Shared packages for types, utilities, UI kit, and SDK
- Separate frontend, backend, and worker applications
- Scalable architecture for future growth

### Built for Libmanan

- Multilingual: English, Filipino, and other local languages
- Local Context: Designed for Libmanan's government structure
- Cultural Sensitivity: Respects local customs and practices
- Accessibility: WCAG 2.1 compliant for all citizens

### Modern & Professional

- Mobile-First: Works perfectly on all devices
- Fast Loading: Optimized for performance
- SEO Ready: Built-in search engine optimization
- Secure: Modern security best practices
- Docker Support: Containerized deployment ready
- Kubernetes support for orchestration
- Infrastructure as Code with Terraform and Ansible

## Development

### Available Scripts

- `pnpm run dev` - Start all development servers (frontend, backend, worker)
- `pnpm run dev:frontend` - Start only frontend dev server (port 5173)
- `pnpm run dev:backend` - Start only backend dev server (port 5000)
- `pnpm run dev:worker` - Start only worker process
- `pnpm run build` - Build all applications for production
- `pnpm run test` - Run all tests
- `pnpm run lint` - Run ESLint on all packages
- `pnpm run format` - Format code with Prettier
- `pnpm run clean` - Clean build artifacts and node_modules
- `pnpm run docker:up` - Start Docker services
- `pnpm run docker:down` - Stop Docker services
- `pnpm run docker:build` - Build Docker images

### Project Structure

```
betterlibmanan/
├── apps/                      # Application packages
│   ├── frontend/              # React + Vite frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── shell/     # App shell and layout
│   │   │   │   ├── providers/ # React providers
│   │   │   │   └── router/    # Routing configuration
│   │   │   ├── modules/       # Feature modules
│   │   │   ├── shared/        # Shared UI components and utilities
│   │   │   └── main.tsx
│   │   ├── public/            # Static assets
│   │   └── tests/             # Test files
│   ├── backend/               # Express.js backend
│   │   ├── src/
│   │   │   ├── bootstrap/     # App initialization
│   │   │   ├── gateway/       # API controllers and routes (HTTP, GraphQL, WebSocket)
│   │   │   ├── modules/       # Domain modules
│   │   │   ├── shared/        # Shared utilities and middleware
│   │   │   ├── infrastructure/# Database and external services
│   │   │   └── main.ts
│   │   └── tests/             # Unit, integration, and E2E tests
│   └── worker/                # Background job processor
│       ├── src/
│       │   ├── jobs/          # Job definitions
│       │   ├── queues/        # Queue configuration
│       │   ├── schedulers/    # Scheduled jobs
│       │   └── processors/    # Job processors
│       └── package.json
├── packages/                  # Shared packages
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Shared utility functions
│   ├── eslint-config/         # ESLint configuration
│   ├── tsconfig/              # TSConfig presets
│   ├── ui-kit/                # Shared UI component library
│   └── sdk/                   # API client SDK
├── infrastructure/            # Infrastructure files
│   ├── docker/                # Docker configuration (frontend, backend, worker, nginx)
│   ├── kubernetes/            # Kubernetes manifests
│   ├── terraform/             # Terraform IaC
│   ├── ansible/               # Ansible playbooks
│   ├── monitoring/            # Prometheus, Grafana, Loki
│   └── scripts/               # Utility scripts
├── docs/                      # Documentation
│   ├── architecture/
│   ├── api/
│   ├── decisions/
│   ├── runbooks/
│   └── diagrams/
├── tools/                     # Development tools
│   ├── generators/            # Code generators
│   ├── codemods/              # Codemod scripts
│   └── automation/            # Automation scripts
└── .github/                   # GitHub workflows and config
    └── workflows/             # CI/CD, lint, security workflows
```

## Contributors

- enzox0 - Project creator and maintainer

## Contributing

We welcome contributions from everyone! Whether you're a developer, government official, or community member, there are many ways to help improve this project. See CONTRIBUTING.md for detailed guidelines.

## Need Help?

- For Technical Issues: Open an issue on GitHub
- For General Questions: Contact the project maintainers

## Recognition

All contributors are recognized in our project documentation. Your contributions help make government services more accessible to all citizens!

## License

This project is licensed under the Creative Commons Zero (CC0) License - see the LICENSE file for details.

### CC0 License Benefits

- Public Domain: No restrictions on use, modification, or distribution
- Government Friendly: Perfect for public sector projects
- Maximum Reusability: Anyone can use, modify, and distribute freely
- No Attribution Required: Though attribution is appreciated

## Acknowledgments

- Built with React and Express
- Styled with Tailwind CSS
- Turbo-powered monorepo
- Icons by Lucide React
- Internationalization with i18next
- Made with love for Philippine Local Government Units
