import type { Item } from "../types/Item";



export const learnResources = [
    {
        id: 1,
        title: "The Ultimate Guide to Templates",
        image: "/images/templates.jpg",
        description: "Master building with SmartNote templates",
        readTime: "5m read",
    },
    {
        id: 2,
        title: "Style & Personalize Your Page",
        image: "/images/style.jpg",
        description: "Customize pages with layouts & icons",
        readTime: "2m read",
    },
    {
        id: 3,
        title: "Getting Started with SmartNote",
        image: "/images/started.jpg",
        description: "Create your first workspace and note",
        readTime: "2m read",
    },
];

export const upcomingEvents: Item[] = [
    { id: 5, title: "Team Meeting", description: "Project review", date: "2025-11-10", category: "event" },
];
export const recentlyVisited: Item[] = [
    {
        id: 1,
        title: "Travel Planner",
        description: "Trip ideas & packing",
        icon: "🧳",
        image: "/images/travel.jpg",
        category: "recent",
    },
    {
        id: 2,
        title: "PBL 3 - SmartNote",
        description: "Group workspace",
        icon: "💡",
        image: "/images/pbl3.jpg",
        category: "recent",
    },
    {
        id: 3,
        title: "Task List",
        description: "Daily todos",
        icon: "📝",
        image: "/images/task.jpg",
        category: "recent",
    },
    {
        id: 4,
        title: "Project Brainstorm",
        description: "Ideas for new app",
        icon: "🧠",
        image: "/images/brainstorm.jpg",
        category: "recent",
    },
    {
        id: 5,
        title: "Weekly Journal",
        description: "Reflections and notes",
        icon: "📔",
        image: "/images/journal.jpg",
        category: "recent",
    },
];
