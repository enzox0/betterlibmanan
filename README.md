# BetterLibmanan

Local Government Website for Libmanan

A modern, multilingual, and accessible website designed specifically for the people of Libmanan. Built with React, TypeScript, and Tailwind CSS.

## Coming Soon

This project is currently in active development! Here's what we're working on:

- Full implementation of the website template
- Comprehensive documentation
- Pre-built content templates for common government services
- Multilingual support for Philippine languages
- Accessibility compliance (WCAG 2.1)
- SEO optimization features

Stay tuned for updates! Follow the repository to be notified when we launch.

## Features

- Multilingual Support: English, Filipino, and other Philippine languages
- Responsive Design: Mobile-first approach with modern UI/UX
- Accessibility: WCAG 2.1 compliant design
- Content Management: YAML-based content system for easy updates
- Customizable: Easy theming and branding customization
- Fast Performance: Built with Vite for optimal loading speeds
- SEO Optimized: Built-in SEO with react-helmet, meta tags, and Open Graph support

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
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

4. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

5. Run the setup script

   ```bash
   npm run setup
   ```

   This will guide you through configuring your government's information.

6. Start development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open your browser and navigate to http://localhost:5173

## Documentation

- STARTER-KIT-README.md - Complete setup and customization guide
- CONTENT-GUIDE.md - Content writing and contribution guidelines
- CONTENT-MANAGEMENT.md - Guide for non-technical users to edit and manage website content
- DEPLOYMENT-GUIDE.md - Deployment instructions for Vercel and other platforms
- STARTER-KIT-SUMMARY.md - Audit results and implementation summary
- CHANGELOG.md - Version history and release notes

## Perfect For

- The people of Libmanan
- Government IT Departments looking for modern web solutions
- Civic Technology Organizations building government tools
- Government Officials wanting professional online presence

## Quick Setup (3-5 hours to live website)

1. Fork & Clone (5 minutes)

   Fork the repository on GitHub (click "Fork" at `https://github.com/enzox0/betterlibmanan`)

   ```bash
   git clone https://github.com/YOUR-USERNAME/betterlibmanan.git
   cd betterlibmanan
   git remote add upstream https://github.com/enzox0/betterlibmanan.git
   npm install
   ```

   Replace YOUR-USERNAME with your GitHub username.

2. Configure for Libmanan (15 minutes)

   ```bash
   npm run setup
   ```

   Interactive setup guides you through configuration.

3. Customize Content (2-4 hours)

   - Edit service information in content/services/
   - Add government department info in content/government/
   - Update contact information and branding

4. Deploy to Production (15 minutes)

   - Connect to Vercel for free hosting
   - Set up custom domain (optional)
   - Your website is live!

## What Makes This Different

### Built for Libmanan

- Multilingual: English, Filipino, and other local languages
- Local Context: Designed for Libmanan's government structure
- Cultural Sensitivity: Respects local customs and practices
- Accessibility: WCAG 2.1 compliant for all citizens

### Non-Technical Friendly

- YAML Content Management: Easy content updates without coding
- Visual Setup: Interactive configuration process
- Clear Documentation: Step-by-step guides for everything
- Template System: Pre-built content templates

### Modern & Professional

- Mobile-First: Works perfectly on all devices
- Fast Loading: Optimized for performance
- SEO Ready: Built-in search engine optimization
- Secure: Modern security best practices

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run setup` - Run setup script for new installations
- `npm run convert-yaml` - Convert YAML to JSON
- `npm run dev:yaml` - Convert YAML and start dev server

### Project Structure

```
content/
├── government/         # Government section markdown & YAML
│   └── departments/    # Department pages (executive, legislative, etc.)
└── services/           # Services section markdown & YAML

src/
├── components/         # Reusable UI components
│   ├── home/           # Home page components
│   ├── layout/         # Layout components (Navbar, Footer)
│   └── ui/             # Basic UI components
├── data/               # YAML configuration (services.yaml, government.yaml)
├── i18n/               # Internationalization
├── lib/                # Utility functions (markdownLoader, yamlLoader)
├── pages/              # Page components (Home, Services, Government, Document)
└── types/              # TypeScript type definitions
```

## Contributors

- iyanski - Project creator and maintainer
- Nicu Listana - Contributor

## Contributing

We welcome contributions from everyone! Whether you're a developer, government official, or community member, there are many ways to help improve this project.

### For Non-Technical Contributors

No coding experience required! You can contribute valuable content and improvements using GitHub's web interface.

#### Quick Start for Non-Technical Users

1. Create a GitHub account (free at github.com)
2. Navigate to the repository in your web browser
3. Use our detailed guide: CONTENT-MANAGEMENT.md - Complete step-by-step instructions for editing content without any technical knowledge

#### What You Can Contribute

- Content Updates: Fix outdated information, add new services, improve descriptions
- Translations: Help translate content to Filipino, Cebuano, or other local languages
- Service Information: Add details about government services, requirements, and processes
- Content Review: Check for accuracy, clarity, and completeness
- Suggestions: Propose new features or improvements

#### How to Contribute (No Git Required)

1. Find content to edit:

   Go to content/services/ for service pages or content/government/ for department pages
   Choose a category (health, education, business, departments, etc.)
   Click on any .md file to edit

2. Make your changes:

   Click the pencil icon to edit
   Update the content using simple text formatting
   Add new information, fix errors, or improve clarity

3. Save your changes:

   Write a brief description of what you changed
   Click "Commit changes"
   Your changes will be reviewed and merged

#### Content Types You Can Edit

- Service Descriptions: How to apply for permits, scholarships, health services
- Requirements: Documents needed, eligibility criteria, deadlines
- Contact Information: Office locations, phone numbers, hours
- Process Steps: Step-by-step instructions for government services
- Translations: Help make content available in local languages

### For Technical Contributors

#### Content Contributors (Basic Technical)

1. Fork the repository on GitHub (click "Fork" at `https://github.com/enzox0/betterlibmanan`)
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/betterlibmanan.git`
3. Add upstream remote: `git remote add upstream https://github.com/enzox0/betterlibmanan.git`
4. Create a content branch: `git checkout -b content/update-health-services`
5. Edit content files in content/
6. Test your changes: `npm run dev`
7. Submit a pull request to the original repository

#### Developers

1. Fork the repository on GitHub (click "Fork" at `https://github.com/enzox0/betterlibmanan`)
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/betterlibmanan.git`
3. Add upstream remote: `git remote add upstream https://github.com/enzox0/betterlibmanan.git`
4. Create a feature branch: `git checkout -b feature/new-component`
5. Make your changes
6. Run tests: `npm run lint && npm run build`
7. Submit a pull request to the original repository

#### Keeping Your Fork Updated

To get the latest changes from the original repository:

```bash
# Fetch the latest changes from upstream
git fetch upstream

# Switch to your main branch
git checkout main

# Merge upstream changes into your main branch
git merge upstream/main

# Push updates to your fork on GitHub
git push origin main
```

Best Practice: Always sync your fork before creating a new branch for contributions.

## Contribution Guidelines

### Content Guidelines

- Accuracy First: Ensure all information is current and correct
- Clear Language: Write for the general public, avoid jargon
- Complete Information: Include all necessary details (requirements, steps, contacts)
- Local Context: Consider the specific needs of your community
- Accessibility: Use clear headings, simple language, and logical structure

### Technical Guidelines

- Follow existing code style and patterns
- Test your changes thoroughly
- Update documentation when needed
- Ensure mobile responsiveness
- Maintain accessibility standards

## Priority Areas for Contribution

- Content Accuracy: Update outdated information, fix errors
- Localization: Translate content to Filipino, Cebuano, and other Philippine languages
- Service Coverage: Add missing government services and programs
- User Experience: Improve clarity and ease of use
- Accessibility: Ensure content is accessible to all citizens

## Need Help?

- For Content Questions: Check CONTENT-MANAGEMENT.md
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

- Built with React
- Styled with Tailwind CSS v4
- UI components by @bettergov/kapwa
- Icons by Lucide React
- Content management with YAML
- Internationalization with i18next
- Made with love for Philippine Local Government Units
