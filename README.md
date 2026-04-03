<p align="center">
  <img src="public/icon.png" alt="OpenResource Logo" width="200"/>
</p>

<h1 align="center">OpenResource</h1>

<p align="center">
  <i>A curated directory of open-source projects, tools, and applications for developers</i>
</p>

<p align="center">
  <a href="https://openresource.site">
    <img src="https://img.shields.io/badge/Visit-OpenResource-8b5cf6?style=for-the-badge" alt="Website"/>
  </a>
  <a href="https://github.com/gauravxdev/openresource">
    <img src="https://img.shields.io/badge/GitHub-gauravxdev-242424?style=for-the-badge" alt="GitHub"/>
  </a>
  <a href="https://x.com/bitsbygaurav">
    <img src="https://img.shields.io/badge/Twitter-@bitsbygaurav-1DA1F2?style=for-the-badge" alt="Twitter"/>
  </a>
  <a href="https://discord.gg/PdPhSvyrp">
    <img src="https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge" alt="Discord"/>
  </a>
</p>

---

## 🎥 Watch the AI Features in Action

See how OpenResource's AI-powered chat helps you discover the perfect open-source tools:

<!-- Replace YOUR_VIDEO_ID below with your YouTube video ID -->
<!-- Example: If video URL is https://www.youtube.com/watch?v=abcd123, use abcd123 -->

<div align="center">
  <a href="https://www.youtube.com/watch?v=JtZ0pe8GDXQ">
    <img src="https://img.youtube.com/vi/JtZ0pe8GDXQ/maxresdefault.jpg" alt="OpenResource AI Features Demo" width="100%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);">
  </a>
</div>


<p align="center">
  <i>👆 Click play to watch the AI features in action</i>
</p>

---

## ✨ Features

<div align="center">

| Feature                  | Description                               |
| ------------------------ | ----------------------------------------- |
| 🔍 **Smart Search**      | Find any open-source tool instantly       |
| 🤖 **AI Assistant**      | Get personalized recommendations via chat |
| 📱 **Multi-Platform**    | Windows apps, Android apps, GitHub repos  |
| 🏷️ **Categories & Tags** | Organized by type and functionality       |
| 👤 **User Profiles**     | Showcase your contributions               |
| 🔖 **Bookmarks**         | Save favorites for later                  |
| 📝 **Submit Resources**  | Community-driven submissions              |
| 🌐 **SEO Ready**         | Search engine optimized                   |

</div>

---

## 🚀 AI-Powered Features

OpenResource goes beyond a simple directory with intelligent AI features:

### 💬 AI Chat Assistant

- **Natural Language Search**: Ask questions in plain English
- **Smart Recommendations**: Get personalized tool suggestions
- **Compare Tools**: Side-by-side feature comparisons
- **Context-Aware**: Remembers your preferences

### 🎯 Example AI Queries

```
"Find open-source alternatives to Notion"
"Show me the best GitHub repos for productivity"
"What are the best self-hosted alternatives to Slack?"
"Find Windows apps for video editing"
"Compare Figma vs Pencil for UI design"
```

---

## 🛠 Tech Stack

### Frontend

- **Next.js 15** • **React 19** • **TypeScript** • **Tailwind CSS v4** • **Radix UI**

### Backend & Database

- **tRPC** • **Prisma** • **PostgreSQL** • **Better Auth**

### AI & Analytics

- **AI SDK (Vercel)** • **Mistral AI** • **PostHog**

---

## 🏗️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or bun

### Quick Start

```bash
# Clone the repository
git clone https://github.com/gauravxdev/openresource.git
cd openresource

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Initialize database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📜 Available Scripts

| Command             | Description             |
| ------------------- | ----------------------- |
| `npm run dev`       | Start dev server        |
| `npm run build`     | Production build        |
| `npm run start`     | Start production server |
| `npm run lint`      | Run ESLint              |
| `npm run typecheck` | TypeScript check        |
| `npm run db:push`   | Push schema to DB       |
| `npm run db:studio` | Open Prisma Studio      |

---

## 📁 Project Structure

```
openresource/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/           # Public pages
│   │   │   ├── ai/chat/      # AI chat interface
│   │   │   ├── windows-apps/ # Windows apps
│   │   │   ├── android-apps/# Android apps
│   │   │   ├── github-repos/ # GitHub repos
│   │   │   └── ...
│   │   ├── (admin)/          # Admin dashboard
│   │   └── api/              # API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui
│   │   ├── chat/             # AI chat components
│   │   └── admin/            # Admin components
│   ├── lib/                   # Utilities
│   │   ├── chat/             # AI chat tools
│   │   └── ai/               # AI utilities
│   └── actions/              # Server actions
├── prisma/                    # Database schema
├── public/                    # Static assets
└── scripts/                   # Utility scripts
```

---

## 🌐 SEO Features

Built with search engine best practices:

- ✅ Dynamic metadata for every page
- ✅ Open Graph & Twitter Cards
- ✅ XML sitemap
- ✅ robots.txt
- ✅ JSON-LD structured data
- ✅ Canonical URLs

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run check`
5. Commit and push: `git commit -m 'Add amazing feature'`
6. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) - UI components
- [Lucide React](https://lucide.dev/) - Icons
- [Google Fonts](https://fonts.google.com/) - Lexend & Righteous fonts
- [Better Auth](https://better-auth.com/) - Authentication
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI features

---

<p align="center">
  <strong>Made with ❤️ by <a href="https://gauravxdev.site">Gaurav Sharma</a></strong>
</p>

<p align="center">
  <sub>Star ⭐ if you find this project useful!</sub>
</p>
