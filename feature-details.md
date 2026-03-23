# OpenResource Project Features

OpenResource is a comprehensive hub for discovering and sharing high-quality open-source projects, developer tools, and applications. The platform is designed to empower the open-source community by providing a curated database of resources with rich metadata and AI-powered discovery.

---

## 👥 User Roles & Permissions

The platform supports three distinct user roles, each with a specific set of capabilities:

1.  **Normal User**: Focused on discovery, browsing, and personalizing their experience.
2.  **Contributor**: Users who actively share and manage open-source resources.
3.  **Admin**: Responsible for platform moderation, resource management, and system oversight.

---

## 🔍 Normal User Features

### 1. Resource Discovery & Navigation
*   **Categories**: Browse resources organized by functional areas (e.g., UI Libraries, DevOps, AI Tools, Frameworks).
*   **Platform-Specific Browsing**: Dedicated sections for:
    *   **GitHub Repos**: Discover trending and useful repositories.
    *   **Android Apps**: Open-source mobile applications.
    *   **Windows Apps**: Desktop software for Windows.
*   **Advanced Search**: Robust search functionality with filtering by:
    *   Category
    *   Submission Status (Approved/Pending/Rejected)
    *   Sorting (Newest, Oldest, Name A-Z/Z-A)
*   **Tagging System**: Explore resources via granular tags (e.g., #llm, #automation, #cli) for precise discovery.

### 2. Rich Resource Insights
*   **Project Overview**: Detailed views including one-liners, short descriptions, and full MDX-rendered documentation.
*   **GitHub Integration**: Real-time stats such as Star count, Fork count, License type, and Last Commit date.
*   **Metadata**: View "Built With" technology stacks and "Alternative To" proprietary software tags.
*   **Social Sharing**: Easy sharing of resources across platforms.
*   **Contributor Attribution**: Links to the profile of the user who submitted the resource.

### 3. AI-Powered Interaction
*   **AI Chat/Search**: An interactive chat interface to ask questions about resources or find recommendations based on natural language queries.
*   **Smart Suggestions**: AI-driven discovery of related tools and projects.

### 4. Personal Dashboard & Account
*   **Authentication**: Secure sign-in/up via Google or Email.
*   **Profile Management**:
    *   Customizable Avatar and Display Name.
    *   Unique Username selection (with reserved name protection and 30-day change limit).
*   **Theme Support**: Seamless switching between Dark and Light modes.
*   **Engagement Tracking**: Record of viewed resources and interaction history.

---

## 🛠️ Contributor Features

### 1. Resource Submission Workflow
*   **Submission Form**: A comprehensive form to submit new open-source resources with the following fields:
    *   Name, Website URL, and Repository URL.
    *   Logo and Banner Image uploads.
    *   Short Description, One-Liner, and Full MDX Description.
    *   Category selection (up to 5) and custom Tags.
    *   Tech Stack ("Built With") and Market Positioning ("Alternative To").
*   **AI Assistance**: Built-in AI to automatically generate descriptions and suggest categories/tags based on the provided repository URL.
*   **GitHub Preview**: Instant preview of GitHub stats before final submission.

### 2. Contributor Dashboard
*   **Stats Overview**: Real-time tracking of:
    *   Total Submissions
    *   Approved Resources
    *   Pending Reviews
    *   Rejected Submissions (with feedback)
*   **Submission Management**: List of all submitted resources with current status and historical details.

### 3. Submission Guidelines & Requirements
*   **Quality Control**: All submissions must meet platform standards:
    *   Must be a public, non-archived GitHub repository.
    *   Must have a custom domain (no temporary subdomains like .vercel.app).
    *   Must be "Available Now" (no waitlists or "coming soon").
    *   Must serve as an alternative to proprietary software.

---

## 🛡️ Admin Features

### 1. Command Center (Admin Dashboard)
*   **Site-wide Analytics**: High-level metrics for Total Users, Resources, Pending Submissions, and Subscribers.
*   **Recent Activity**: Live feed of new user registrations and resource updates.

### 2. Resource & Content Moderation
*   **Approval Queue**: Review pending submissions with the ability to Approve or Reject.
*   **Rejection Feedback**: Provide specific reasons for rejection to help contributors improve their submissions.
*   **Full CRUD Mastery**: Create, Edit, or Delete any resource or category directly from the admin interface.
*   **Image Management**: Direct control over resource logos and banners.

### 3. User & Community Management
*   **User Oversight**: View and manage user accounts, roles, and status.
*   **Subscriber Management**: Access and manage Newsletter and Waitlist sign-ups.

### 4. System Operations
*   **Audit Logs**: Comprehensive logs of administrative actions for security and transparency.
*   **Site Analytics**: Dedicated analytics module for tracking platform growth and usage patterns.
*   **Category Management**: Add, Rename, or Delete resource categories dynamically.

---

## 💻 Technical Highlights
*   **Tech Stack**: Built with Next.js (App Router), Prisma ORM, PostgreSQL, and tRPC.
*   **SEO Optimized**: Dynamic meta tags, structured data, and semantic HTML for high search visibility.
*   **Performance**: Optimized image delivery, server-side rendering, and caching strategies.
*   **Modern UI**: Responsive design using Tailwind CSS with glassmorphism and smooth animations.
