import { GitHubRepoCard } from "@/components/GitHubRepoCard"

// Mock data for demonstration
const mockRepos = [
  {
    name: "react",
    description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
    language: "JavaScript",
    stars: 224000,
    forks: 47000,
    updatedAt: "2024-01-15",
    url: "https://github.com/facebook/react"
  },
  {
    name: "next.js",
    description: "The React Framework for Production",
    language: "JavaScript",
    stars: 122000,
    forks: 27000,
    updatedAt: "2024-01-14",
    url: "https://github.com/vercel/next.js"
  },
  {
    name: "tailwindcss",
    description: "A utility-first CSS framework packed with classes",
    language: "CSS",
    stars: 80000,
    forks: 8500,
    updatedAt: "2024-01-13",
    url: "https://github.com/tailwindlabs/tailwindcss"
  },
  {
    name: "typescript",
    description: "TypeScript is a superset of JavaScript that compiles to clean JavaScript output.",
    language: "TypeScript",
    stars: 98000,
    forks: 12000,
    updatedAt: "2024-01-12",
    url: "https://github.com/microsoft/TypeScript"
  },
  {
    name: "vercel",
    description: "Develop. Preview. Ship.",
    language: "TypeScript",
    stars: 12000,
    forks: 2200,
    updatedAt: "2024-01-11",
    url: "https://github.com/vercel/vercel"
  },
  {
    name: "prisma",
    description: "Next-generation ORM for Node.js & TypeScript | PostgreSQL, MySQL, MariaDB & SQLite",
    language: "TypeScript",
    stars: 37000,
    forks: 1400,
    updatedAt: "2024-01-10",
    url: "https://github.com/prisma/prisma"
  }
]

export default function GitHubRepos() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GitHub Repositories</h1>
        <p className="text-gray-600">
          Discover popular open source projects and repositories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRepos.map((repo, index) => (
          <GitHubRepoCard
            key={index}
            name={repo.name}
            description={repo.description}
            language={repo.language}
            stars={repo.stars}
            forks={repo.forks}
            updatedAt={repo.updatedAt}
            url={repo.url}
          />
        ))}
      </div>
    </div>
  )
}
