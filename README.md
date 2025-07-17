# 🌙 Lunar Date Converter

A modern web application for converting between Gregorian and Chinese lunar calendar dates, built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- Convert Chinese lunar calendar dates to Gregorian calendar dates
- Support for leap months in lunar calendar
- Bilingual interface (English and Chinese)
- Responsive design optimized for all devices
- Real-time input validation and error handling
- Cultural accuracy with traditional Chinese zodiac information

## 🚀 Getting Started

### Prerequisites

- Node.js 18.20.0 or higher (see `.nvmrc`)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/comeredon/lunar-date-converter.git

# Navigate to the project directory
cd lunar-date-converter

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:3000
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with auto-fix
- `npm run lint:check` - Check linting without auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

## 🏗️ Project Structure

```
lunar-date-converter/
├── .github/              # GitHub workflows and templates
├── src/                  # Source code
│   ├── components/       # React components
│   │   └── ui/          # Reusable UI components (shadcn/ui)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── styles/          # Global styles and themes
│   ├── test/            # Test utilities and test files
│   └── types/           # TypeScript type definitions
├── dist/                # Production build output
├── coverage/            # Test coverage reports
└── public/              # Static assets
```

## 🧪 Testing

The project uses Vitest for testing with React Testing Library:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage
```

## 🔧 Development Tools

This project is configured with modern development tools:

- **TypeScript** - Type safety and better developer experience
- **ESLint** - Code linting with React and TypeScript rules
- **Prettier** - Code formatting
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Testing utilities for React components
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library

## 📱 Technologies Used

- **React 19** - UI framework
- **TypeScript** - Programming language
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **lunar-typescript** - Lunar calendar calculations
- **Framer Motion** - Animations

## 🌐 Browser Support

This application supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (enforced by ESLint and Prettier)
- Write tests for new features
- Update documentation as needed
- Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [lunar-typescript](https://github.com/6tail/lunar-typescript) - Lunar calendar calculation library
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

Last updated: 2025-01-17  
Maintained by: [@comeredon](https://github.com/comeredon)
