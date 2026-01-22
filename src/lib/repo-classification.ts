/**
 * Universal Repo Classification Layer
 *
 * A multi-stage, confidence-based classifier that analyzes repository structure,
 * metadata, and content to determine project type and tech stack.
 *
 * Design principles:
 * - Structure > Name > Topics > README (confidence hierarchy)
 * - Never guess: if signals are weak, default to "neutral"
 * - Generic is better than wrong
 * - Classification is INTERNAL only (not user-facing)
 */

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

/**
 * The type classification for a repository.
 * Each value guides how downstream AI should phrase descriptions.
 */
export type RepoType =
    | "application" // Runnable software (web apps, servers, mobile apps)
    | "library" // Reusable code dependency (SDKs, packages, plugins)
    | "monorepo" // Workspace containing multiple projects
    | "tool" // CLI tools, scripts, utilities
    | "resource" // Documentation, tutorials, awesome-lists
    | "template" // Starter projects, boilerplates
    | "neutral"; // Fallback when signals are too weak

/**
 * Detected technology stack entries.
 */
export type TechStack = string;

/**
 * Result of the classification process.
 */
export interface ClassificationResult {
    type: RepoType;
    stack: TechStack[];
    isExperimental: boolean; // True if README is missing or very short
    confidence: "high" | "medium" | "low";
}

/**
 * Input data for classification.
 */
export interface RepoClassificationInput {
    name: string;
    description: string | null;
    topics: string[] | undefined;
    readmeContent: string | undefined;
    fileList: FileEntry[] | undefined;
}

export interface FileEntry {
    name: string;
    type: "file" | "dir";
}

// -----------------------------------------------------------------------------
// Configuration: File Signatures (Stage 1 - Highest Confidence)
// -----------------------------------------------------------------------------

/**
 * File/directory patterns that strongly indicate a specific repo type.
 * Order matters: first match wins within each category.
 */
const FILE_SIGNATURES: Record<RepoType, { files: string[]; dirs: string[] }> = {
    monorepo: {
        files: [
            "lerna.json",
            "pnpm-workspace.yaml",
            "turbo.json",
            "nx.json",
            "rush.json",
        ],
        dirs: ["packages", "apps", "modules"],
    },
    application: {
        files: [
            "Dockerfile",
            "docker-compose.yml",
            "docker-compose.yaml",
            "next.config.js",
            "next.config.ts",
            "next.config.mjs",
            "nuxt.config.ts",
            "nuxt.config.js",
            "vite.config.ts",
            "vite.config.js",
            "angular.json",
            "vue.config.js",
            "remix.config.js",
            "astro.config.mjs",
            "manage.py", // Django
            "app.py", // Flask
            "main.go", // Go entrypoint
            "Procfile", // Heroku
            "vercel.json",
            "netlify.toml",
        ],
        dirs: ["public", "pages", "app", "src/app"],
    },
    tool: {
        files: [
            "cli.js",
            "cli.ts",
            "bin.js",
            "bin.ts",
            ".goreleaser.yml",
            ".goreleaser.yaml",
        ],
        dirs: ["bin", "cmd"],
    },
    template: {
        files: ["cookiecutter.json", "copier.yaml", "copier.yml"],
        dirs: ["{{cookiecutter.project_name}}"],
    },
    resource: {
        files: [], // Resources are detected by ABSENCE of code files
        dirs: ["docs", "examples"],
    },
    library: {
        files: [], // Library is a fallback for code repos
        dirs: ["lib", "dist", "src"],
    },
    neutral: {
        files: [],
        dirs: [],
    },
};

// -----------------------------------------------------------------------------
// Configuration: Tech Stack Detection
// -----------------------------------------------------------------------------

/**
 * Maps file names/patterns to technology stack entries.
 */
const STACK_SIGNATURES: Record<string, TechStack> = {
    // JavaScript/TypeScript ecosystem
    "package.json": "Node.js",
    "tsconfig.json": "TypeScript",
    "next.config.js": "Next.js",
    "next.config.ts": "Next.js",
    "next.config.mjs": "Next.js",
    "nuxt.config.ts": "Nuxt",
    "nuxt.config.js": "Nuxt",
    "vite.config.ts": "Vite",
    "vite.config.js": "Vite",
    "angular.json": "Angular",
    "vue.config.js": "Vue",
    "remix.config.js": "Remix",
    "astro.config.mjs": "Astro",
    "tailwind.config.js": "Tailwind CSS",
    "tailwind.config.ts": "Tailwind CSS",
    // Python
    "requirements.txt": "Python",
    "pyproject.toml": "Python",
    "setup.py": "Python",
    "Pipfile": "Python",
    "manage.py": "Django",
    // Go
    "go.mod": "Go",
    "go.sum": "Go",
    // Rust
    "Cargo.toml": "Rust",
    // Ruby
    Gemfile: "Ruby",
    // Java/Kotlin
    "pom.xml": "Java",
    "build.gradle": "Gradle",
    "build.gradle.kts": "Kotlin",
    // DevOps
    Dockerfile: "Docker",
    "docker-compose.yml": "Docker",
    "docker-compose.yaml": "Docker",
    ".github": "GitHub Actions",
    "vercel.json": "Vercel",
    "netlify.toml": "Netlify",
};

// -----------------------------------------------------------------------------
// Configuration: Keyword Patterns (Stage 2 - Medium Confidence)
// -----------------------------------------------------------------------------

const NAME_KEYWORDS: Record<RepoType, string[]> = {
    template: ["template", "starter", "boilerplate", "scaffold", "skeleton"],
    tool: ["cli", "tool", "generator", "linter", "parser", "formatter"],
    resource: ["awesome", "list", "tutorial", "guide", "cheatsheet", "cheat-sheet", "learning"],
    application: ["app", "dashboard", "website", "server", "api", "web", "mobile"],
    library: ["sdk", "client", "lib", "plugin", "package", "core", "utils"],
    monorepo: [],
    neutral: [],
};

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const MIN_README_LENGTH = 200;

// -----------------------------------------------------------------------------
// Classification Logic
// -----------------------------------------------------------------------------

/**
 * Detects tech stack from file list.
 */
function detectStack(fileList: FileEntry[] | undefined): TechStack[] {
    if (!fileList) return [];
    const stack = new Set<TechStack>();

    for (const entry of fileList) {
        const tech = STACK_SIGNATURES[entry.name];
        if (tech) {
            stack.add(tech);
        }
    }

    return Array.from(stack);
}

/**
 * Stage 1: Structure-based classification (highest confidence).
 * Checks for definitive file/directory signatures.
 */
function classifyByStructure(
    fileList: FileEntry[] | undefined
): { type: RepoType; confidence: "high" } | null {
    if (!fileList || fileList.length === 0) return null;

    const fileNames = new Set(
        fileList.filter((f) => f.type === "file").map((f) => f.name.toLowerCase())
    );
    const dirNames = new Set(
        fileList.filter((f) => f.type === "dir").map((f) => f.name.toLowerCase())
    );

    // Check in priority order: monorepo > application > tool > template
    const checkOrder: RepoType[] = ["monorepo", "application", "tool", "template"];

    for (const repoType of checkOrder) {
        const signatures = FILE_SIGNATURES[repoType];

        // Check files
        for (const file of signatures.files) {
            if (fileNames.has(file.toLowerCase())) {
                return { type: repoType, confidence: "high" };
            }
        }

        // Check directories
        for (const dir of signatures.dirs) {
            if (dirNames.has(dir.toLowerCase())) {
                return { type: repoType, confidence: "high" };
            }
        }
    }

    return null;
}

/**
 * Stage 2: Keyword-based classification (medium confidence).
 * Analyzes name, description, and topics.
 */
function classifyByKeywords(
    name: string,
    description: string | null,
    topics: string[] | undefined
): { type: RepoType; confidence: "medium" } | null {
    const lowerName = name.toLowerCase();
    const lowerDesc = (description || "").toLowerCase();
    const lowerTopics = (topics || []).map((t) => t.toLowerCase());

    // Score each type
    const scores: Partial<Record<RepoType, number>> = {};

    for (const [repoType, keywords] of Object.entries(NAME_KEYWORDS) as [
        RepoType,
        string[]
    ][]) {
        if (keywords.length === 0) continue;

        let score = 0;
        for (const keyword of keywords) {
            // Name match = 3 points (strongest signal)
            if (lowerName.includes(keyword)) score += 3;
            // Name suffix/prefix match = 2 extra points
            if (lowerName.endsWith(`-${keyword}`) || lowerName.startsWith(`${keyword}-`)) {
                score += 2;
            }
            // Description match = 1 point
            if (lowerDesc.includes(keyword)) score += 1;
            // Topic match = 2 points
            if (lowerTopics.includes(keyword)) score += 2;
        }

        if (score > 0) {
            scores[repoType] = score;
        }
    }

    // Find the highest scoring type
    let bestType: RepoType | null = null;
    let bestScore = 0;

    for (const [type, score] of Object.entries(scores) as [RepoType, number][]) {
        if (score > bestScore) {
            bestScore = score;
            bestType = type;
        }
    }

    // Require minimum score of 3 to return a classification
    if (bestType && bestScore >= 3) {
        return { type: bestType, confidence: "medium" };
    }

    return null;
}

/**
 * Checks if the repo appears to be a resource (non-code) repository.
 */
function isResourceRepo(
    name: string,
    fileList: FileEntry[] | undefined
): boolean {
    // Check for "awesome-" prefix (strong signal for curated lists)
    if (name.toLowerCase().startsWith("awesome-")) {
        return true;
    }

    // If we have file list, check if it's mostly markdown
    if (fileList && fileList.length > 0) {
        const codeFiles = fileList.filter(
            (f) =>
                f.type === "file" &&
                !f.name.endsWith(".md") &&
                !f.name.endsWith(".txt") &&
                f.name !== "LICENSE" &&
                f.name !== ".gitignore"
        );
        // If less than 20% are code files, likely a resource repo
        if (codeFiles.length / fileList.length < 0.2) {
            return true;
        }
    }

    return false;
}

/**
 * Main classification function.
 *
 * Uses a multi-stage approach:
 * 1. Structure analysis (highest confidence)
 * 2. Keyword matching (medium confidence)
 * 3. Fallback to library or neutral (low confidence)
 */
export function classifyRepo(input: RepoClassificationInput): ClassificationResult {
    const { name, description, topics, readmeContent, fileList } = input;

    // Detect tech stack regardless of classification
    const stack = detectStack(fileList);

    // Check if repo is experimental (weak documentation)
    const isExperimental =
        !readmeContent || readmeContent.trim().length < MIN_README_LENGTH;

    // Stage 1: Structure-based classification
    const structureResult = classifyByStructure(fileList);
    if (structureResult) {
        return {
            ...structureResult,
            stack,
            isExperimental,
        };
    }

    // Check for resource repos (special case)
    if (isResourceRepo(name, fileList)) {
        return {
            type: "resource",
            stack: [],
            isExperimental: false, // Resources don't need substantive README
            confidence: "medium",
        };
    }

    // Stage 2: Keyword-based classification
    const keywordResult = classifyByKeywords(name, description, topics);
    if (keywordResult) {
        return {
            ...keywordResult,
            stack,
            isExperimental,
        };
    }

    // Stage 3: Fallback
    // If we have code file indicators (package.json, go.mod, etc.), assume library
    const hasCodeIndicators = stack.length > 0;

    if (hasCodeIndicators) {
        return {
            type: "library",
            stack,
            isExperimental,
            confidence: "low",
        };
    }

    // Final fallback: neutral
    return {
        type: "neutral",
        stack,
        isExperimental,
        confidence: "low",
    };
}

// -----------------------------------------------------------------------------
// Legacy Compatibility (if needed)
// -----------------------------------------------------------------------------

/**
 * @deprecated Use classifyRepo instead for richer output.
 * Simple wrapper that returns just the type string.
 */
export function classifyRepoStyle(input: {
    name: string;
    description: string | null;
    topics: string[] | undefined;
    readmeContent: string | undefined;
}): string {
    const result = classifyRepo({
        ...input,
        fileList: undefined, // No file list in legacy interface
    });
    return result.type;
}
