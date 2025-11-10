export type DocumentBlockType =
    | { type: "heading"; content: string }
    | { type: "subheading"; content: string }
    | { type: "paragraph"; content: string }
    | { type: "image"; src: string; caption?: string }
    | { type: "list"; items: string[] }
    | { type: "tip"; content: string }
    | { type: "note"; content: string };

export const documentsMeta  = [
    {
        id: 1,
        title: "Understanding Stack and Queue",
        author: "Gem Nguyen",
        tags: ["CS", "Data Structure"],
        lastUpdated: "2025-11-07",
        readTime: "7 min",
        difficulty: "Beginner",
        summary:
            "Learn about the fundamentals of stacks and queues, their operations, and how they are used in algorithms.",
    },
    {
        id: 2,
        title: "Implementing Queue in C#",
        author: "Gem Nguyen",
        tags: ["C#", "Implementation", "Queue"],
        lastUpdated: "2025-10-30",
        readTime: "5 min",
        difficulty: "Intermediate",
        summary:
            "Step-by-step guide to building a Queue data structure in C# using classes and interfaces.",
    },
];
export const documentContent: Record<number, DocumentBlockType[]>  = {
    1: [
        {
            type: "heading",
            content: "📘 The Ultimate Guide to Templates",
        },
        {
            type: "paragraph",
            content:
                "Templates in SmartNote help you structure your ideas and workflows efficiently. They’re like blueprints that save time while keeping consistency across your pages.",
        },
        {
            type: "image",
            src: "/images/templates.jpg",
            caption: "A sample SmartNote template layout",
        },
        {
            type: "subheading",
            content: "Why use templates?",
        },
        {
            type: "list",
            items: [
                "Speed up repetitive tasks",
                "Maintain consistency across your workspace",
                "Encourage standard workflows for teams",
            ],
        },
        {
            type: "tip",
            content:
                "Start from a blank page, design your structure, then click 'Save as Template' — you can reuse it anytime!",
        },
    ],

    2: [
        {
            type: "heading",
            content: "🎨 Style & Personalize Your Page",
        },
        {
            type: "paragraph",
            content:
                "SmartNote allows you to customize your workspace to match your personality or team identity. Add icons, cover images, and colors easily.",
        },
        {
            type: "image",
            src: "/images/style.jpg",
            caption: "Personalized workspace example",
        },
        {
            type: "note",
            content:
                "Changing the page style doesn’t affect the content — it’s purely visual customization.",
        },
    ],

    3: [
        {
            type: "heading",
            content: "🚀 Getting Started with SmartNote",
        },
        {
            type: "paragraph",
            content:
                "Welcome to SmartNote! This quick guide walks you through creating your first workspace, note, and using blocks effectively.",
        },
        {
            type: "image",
            src: "/images/started.jpg",
            caption: "Creating your first note in SmartNote",
        },
        {
            type: "subheading",
            content: "Step 1: Create a Workspace",
        },
        {
            type: "paragraph",
            content:
                "Click on 'New Workspace', give it a name, and start adding members if needed.",
        },
        {
            type: "subheading",
            content: "Step 2: Add Your First Note",
        },
        {
            type: "paragraph",
            content:
                "Click 'New Note' and start typing — every paragraph, image, or checklist is a block you can move or style independently.",
        },
        {
            type: "tip",
            content:
                "Try typing '/' to open the block menu, where you can insert lists, headers, quotes, or code blocks!",
        },
    ],
};

