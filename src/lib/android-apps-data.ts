export interface AndroidApp {
  id: number
  title: string
  description: string
  category: string
  downloads: string
  rating: string
  lastUpdated: string
  image: string
  developer: string
  license: string
  stars: string
  tags: string[]
}

export const mockAndroidApps: AndroidApp[] = [
  {
    id: 1,
    title: "WhatsApp ",
    description: "Simple, reliable messaging app with end-to-end encryption for private conversations and",
    category: "Communication",
    downloads: "5B+",
    rating: "4.3",
    lastUpdated: "2 days ago",
    image: "/api/placeholder/300/200",
    developer: "WhatsApp LLC",
    license: "Free",
    stars: "12.3k",
    tags: ["Messaging", "End-to-End", "Social"]
  },
  {
    id: 2,
    title: "Instagram",
    description: "Share photos, videos, and stories with friends and followers in a beautiful, intuitive",
    category: "Social",
    downloads: "1B+",
    rating: "4.0",
    lastUpdated: "1 week ago",
    image: "/api/placeholder/300/200",
    developer: "Instagram",
    license: "Free",
    stars: "9.8k",
    tags: ["Stories", "Creators", "AI Tools"]
  },
  {
    id: 3,
    title: "YouTube",
    description: "Watch and upload videos, subscribe to channels, and discover new content",
    category: "Entertainment",
    downloads: "10B+",
    rating: "4.2",
    lastUpdated: "3 days ago",
    image: "/api/placeholder/300/200",
    developer: "Google LLC",
    license: "Free",
    stars: "15.6k",
    tags: ["Streaming", "Creators", "Subscriptions"]
  },
  {
    id: 4,
    title: "Spotify",
    description: "Stream millions of songs, create playlists, and discover new music tailored to your taste and",
    category: "Music",
    downloads: "1B+",
    rating: "4.4",
    lastUpdated: "1 day ago",
    image: "/api/placeholder/300/200",
    developer: "Spotify Ltd.",
    license: "Free",
    stars: "11.4k",
    tags: ["Music", "Podcasts", "Discover"]
  },
  {
    id: 5,
    title: "Google Maps",
    description: "Navigate the world with real-time traffic, public transit info, and detailed street views for",
    category: "Navigation",
    downloads: "10B+",
    rating: "4.1",
    lastUpdated: "5 days ago",
    image: "/api/placeholder/300/200",
    developer: "Google LLC",
    license: "Free",
    stars: "8.9k",
    tags: ["Offline", "Traffic", "Transit"]
  },
  {
    id: 6,
    title: "Netflix",
    description: "Stream movies and TV shows in stunning 4K quality with personalized recommendations.",
    category: "Entertainment",
    downloads: "1B+",
    rating: "4.3",
    lastUpdated: "4 days ago",
    image: "/api/placeholder/300/200",
    developer: "Netflix, Inc.",
    license: "Subscription",
    stars: "7.2k",
    tags: ["4K", "Downloads", "Profiles"]
  },
  {
    id: 7,
    title: "TikTok",
    description: "Create and share short videos with music, effects, and trending challenges for viral content",
    category: "Social",
    downloads: "3B+",
    rating: "4.2",
    lastUpdated: "2 days ago",
    image: "/api/placeholder/300/200",
    developer: "TikTok Ltd.",
    license: "Free",
    stars: "10.7k",
    tags: ["Shorts", "Music", "For You"]
  },
  {
    id: 8,
    title: "Zoom",
    description: "Host and join video meetings, webinars, and virtual events with crystal-clear audio and video",
    category: "Business",
    downloads: "500M+",
    rating: "4.0",
    lastUpdated: "1 week ago",
    image: "/api/placeholder/300/200",
    developer: "Zoom Video Communications",
    license: "Free",
    stars: "6.4k",
    tags: ["Meetings", "Webinars", "Collaboration"]
  },
  {
    id: 9,
    title: "Duolingo",
    description: "Learn languages through interactive lessons, games, and daily challenges in a fun, engaging",
    category: "Education",
    downloads: "500M+",
    rating: "4.7",
    lastUpdated: "3 days ago",
    image: "/api/placeholder/300/200",
    developer: "Duolingo",
    license: "Free",
    stars: "5.8k",
    tags: ["Languages", "Gamified", "Daily"]
  }
]

export type SortOption = "popular" | "newest" | "rating" | "atoz" | "ztoa" | "downloads"
