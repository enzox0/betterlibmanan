# Contributing to BetterLibmanan.org

Thank you for your interest in contributing to BetterLibmanan.org! This civic-tech project thrives on community participation. Whether you're a developer, designer, translator, or a concerned citizen of Libmanan, your contributions are welcome.

## Getting Started

### Prerequisites

- Node.js v18 or higher
- pnpm v8 or higher
- Git

### Setup

```bash
git clone https://github.com/enzox0/betterlibmanan.git
cd betterlibmanan
npm install -g pnpm@8.15.0
pnpm install
pnpm run dev
```

Open in your browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## How to Contribute

### Reporting Bugs

1. Check existing [issues](https://github.com/enzox0/betterlibmanan/issues) to avoid duplicates
2. Create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and device information
   - Screenshots if applicable

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature and its benefit to users
3. Include mockups or examples if possible

### Submitting Code

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make** your changes
4. **Test** your changes
   ```bash
   pnpm run lint
   pnpm run build
   ```
5. **Commit** with a descriptive message
   ```bash
   git commit -m "Add: brief description of changes"
   ```
6. **Push** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open** a Pull Request

### Commit Message Format

```
Type: Brief description

Types:
- Add: New feature or content
- Fix: Bug fix
- Update: Changes to existing feature
- Remove: Removed feature or content
- Docs: Documentation changes
- Style: CSS/formatting changes (no logic change)
- Refactor: Code restructuring
```

## Contribution Areas

| Area               | Description                          |
| ------------------ | ------------------------------------ |
| Bug Fixes          | Fix reported issues                  |
| Features           | Implement new functionality          |
| Content            | Update Libmanan service information  |
| Translations       | Translate to Filipino or local languages |
| Design             | Improve UI/UX and accessibility      |
| Data               | Verify and update statistics         |
| Documentation      | Improve guides and comments          |
| API Integration    | Connect real-time data sources       |
| Backend API        | Enhance Express.js backend           |
| Frontend UI        | Improve React frontend               |
| Data Visualization | Enhance charts and graphs            |

## Code Guidelines

### Frontend (React + TypeScript)

- Use meaningful variable and function names
- Add comments for complex logic
- Ensure type safety
- Use Tailwind CSS classes
- Ensure responsive design

### Backend (Express.js + TypeScript)

- Follow REST API best practices
- Use proper error handling
- Document API endpoints
- Ensure type safety
- Follow existing code patterns

### Shared Packages

- Use `@betterlibmanan/types` for shared types
- Use `@betterlibmanan/utils` for shared utilities
- Keep packages focused and reusable

### Accessibility

- Maintain WCAG 2.1 compliance
- Include alt text for images
- Ensure keyboard navigation works
- Test with screen readers if possible

### Data Accuracy

- Only use data from official government sources
- Include source attribution
- Verify information before submitting
- Do not include unverified or speculative data

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if needed
3. Test thoroughly before submitting
4. Fill out the PR template completely
5. Link related issues
6. Wait for review and address feedback

## Review Criteria

Pull requests are reviewed for:

- Code quality and style consistency
- Functionality and bug-free operation
- Accessibility compliance
- Mobile responsiveness
- Data accuracy (for content changes)
- Security considerations
- Proper use of shared packages

## Community

- **Discord:** [Join our community](https://discord.com/invite/qeSu7RJkjQ)
- **Email:** volunteer@betterlibmanan.org

## Recognition

All contributors are recognized in our repository. Significant contributions may be highlighted on the website.

## Questions?

Feel free to open an issue or reach out on Discord. We're happy to help!

---

Thank you for helping make government information accessible to the people of Libmanan.