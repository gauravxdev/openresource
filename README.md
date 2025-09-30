# Openresource - Open Source Resources Hub

🚀 **Open-source apps & resources at your fingertips**

OpenResource is a modern, open-source web platform designed to help developers and users discover, explore, and share free open-source alternatives for web applications, tools, and resources.

## ✨ Features

- **Resource Discovery**: Browse and search through a curated collection of open-source alternatives
- **Newsletter Subscription**: Stay updated with the latest open-source resources
- **Modern UI**: Beautiful, responsive design built with Tailwind CSS
- **Real-time Notifications**: Get notified about new resources and updates
- **Type-Safe**: Built with TypeScript for better development experience
- **Fast & Optimized**: Powered by Next.js 15 with Turbo mode for lightning-fast development

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library

### Backend & Database
- **tRPC** - End-to-end typesafe APIs
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Robust relational database

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Turbo** - Fast development builds

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Package manager (npm, yarn, or bun)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Openresource
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your `.env` file with the required values:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push database schema
   npm run db:push

   # (Optional) Open Prisma Studio to view your database
   npm run db:studio
   ```

5. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see Openresource in action!

## 📜 Available Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Run TypeScript type checking
- `npm run db:studio` - Open Prisma Studio
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Regenerate Prisma client

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm run check`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting PR

## 🌟 Roadmap

- [ ] Advanced search and filtering
- [ ] User authentication and profiles
- [ ] Resource submission system
- [ ] Categories and tags
- [ ] API endpoints for third-party integrations
- [ ] Mobile app development
- [ ] Advanced analytics and insights

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with the amazing [T3 Stack](https://create.t3.gg/)
- UI components powered by [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Fonts from [Google Fonts](https://fonts.google.com/)

## 📞 Support

If you have any questions, feel free to:
- Open an issue on GitHub
- Join our community discussions
- Follow us for updates on new open-source resources

---

**Made with ❤️ for the open-source community**
