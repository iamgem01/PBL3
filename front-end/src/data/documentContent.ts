export type DocumentBlockType =
    | { type: "heading"; content: string }
    | { type: "subheading"; content: string }
    | { type: "paragraph"; content: string }
    | { type: "image"; src: string; caption?: string }
    | { type: "list"; items: string[] }
    | { type: "tip"; content: string }
    | { type: "note"; content: string };

export const documentsMeta = [
    {
        id: 1,
        title: "Mastering Markdown: Complete Guide for Documentation",
        author: "Aeternus Team",
        tags: ["Markdown", "Documentation", "Writing"],
        lastUpdated: "2025-01-15",
        readTime: "8 min",
        difficulty: "Beginner",
        summary:
            "Learn essential Markdown syntax for creating beautiful, structured documents. Perfect for technical writing, notes, and documentation.",
    },
    {
        id: 2,
        title: "Effective Note-Taking Strategies for Productivity",
        author: "Aeternus Team",
        tags: ["Productivity", "Organization", "Methods"],
        lastUpdated: "2025-01-10",
        readTime: "6 min",
        difficulty: "Beginner",
        summary:
            "Discover proven note-taking methods like Cornell, Zettelkasten, and PARA to organize your thoughts and boost retention.",
    },
    {
        id: 3,
        title: "Building a Second Brain: Information Management",
        author: "Aeternus Team",
        tags: ["PKM", "Knowledge", "Systems"],
        lastUpdated: "2025-01-05",
        readTime: "10 min",
        difficulty: "Intermediate",
        summary:
            "Implement a personal knowledge management system to capture, organize, and retrieve information effectively.",
    },
];

export const documentContent: Record<number, DocumentBlockType[]> = {
    1: [
        {
            type: "heading",
            content: "Mastering Markdown: Complete Guide for Documentation",
        },
        {
            type: "paragraph",
            content:
                "Markdown is a lightweight markup language that's become the standard for writing documentation, notes, and web content. This guide covers everything you need to know to write professional, well-structured documents.",
        },
        {
            type: "subheading",
            content: "Why Markdown?",
        },
        {
            type: "list",
            items: [
                "Plain text format - works anywhere, never becomes obsolete",
                "Easy to learn - master the basics in 10 minutes",
                "Version control friendly - track changes with Git",
                "Platform independent - write once, use everywhere",
                "Converts to HTML, PDF, and other formats seamlessly"
            ],
        },
        {
            type: "subheading",
            content: "Essential Syntax",
        },
        {
            type: "paragraph",
            content:
                "Headings: Use # for headings (# H1, ## H2, ### H3). Emphasis: Wrap text with *asterisks* for italic or **double asterisks** for bold. Lists: Start lines with - for bullets or 1. for numbered lists. Links: Use [text](url) format. Code: Wrap inline code with backticks or use triple backticks for code blocks.",
        },
        {
            type: "tip",
            content:
                "Pro tip: Use a Markdown preview tool while learning. Most modern editors like VS Code, Obsidian, and Notion support live preview, helping you see results immediately.",
        },
        {
            type: "subheading",
            content: "Advanced Techniques",
        },
        {
            type: "list",
            items: [
                "Tables: Create data tables using pipes | and hyphens -",
                "Task lists: Use - [ ] for checkboxes (great for todo lists)",
                "Blockquotes: Prefix lines with > for quoted text",
                "Horizontal rules: Use --- or *** for section dividers",
                "Footnotes: Add references with [^1] notation"
            ],
        },
        {
            type: "note",
            content:
                "Different Markdown flavors (GitHub, CommonMark, etc.) support slightly different features. Check your platform's documentation for specific capabilities.",
        },
    ],

    2: [
        {
            type: "heading",
            content: "Effective Note-Taking Strategies for Productivity",
        },
        {
            type: "paragraph",
            content:
                "The way you take notes directly impacts how well you retain information and how easily you can retrieve it later. This guide explores battle-tested methods used by students, professionals, and researchers worldwide.",
        },
        {
            type: "subheading",
            content: "The Cornell Method",
        },
        {
            type: "paragraph",
            content:
                "Developed at Cornell University, this method divides your page into three sections: a narrow left column for cues/questions, a wide right column for notes, and a bottom section for summary. During lectures or reading, take notes in the right column. Afterward, add questions or keywords in the left column, and write a brief summary at the bottom.",
        },
        {
            type: "tip",
            content:
                "The Cornell method forces active recall. By creating questions in the left column, you're essentially creating a self-quiz system that dramatically improves retention.",
        },
        {
            type: "subheading",
            content: "Zettelkasten (Slip Box) Method",
        },
        {
            type: "paragraph",
            content:
                "This German method, used by prolific sociologist Niklas Luhmann, focuses on atomic notes (one idea per note) connected through links. Each note should be self-contained and linked to related concepts. Over time, you build a web of knowledge where ideas naturally emerge from connections.",
        },
        {
            type: "list",
            items: [
                "Write atomically: One idea per note, fully explained",
                "Link liberally: Connect related notes bidirectionally",
                "Use your own words: This ensures understanding",
                "Add context: Each note should stand alone",
                "Review regularly: Strengthen connections over time"
            ],
        },
        {
            type: "subheading",
            content: "PARA Method (Projects, Areas, Resources, Archives)",
        },
        {
            type: "paragraph",
            content:
                "Tiago Forte's PARA method organizes information by actionability. Projects are short-term efforts with deadlines. Areas are long-term responsibilities. Resources are topics of interest. Archives hold inactive items. This system helps you focus on what's actionable right now.",
        },
        {
            type: "note",
            content:
                "The best note-taking system is the one you'll actually use. Start with one method, adapt it to your needs, and don't be afraid to combine techniques that work for different contexts.",
        },
    ],

    3: [
        {
            type: "heading",
            content: "Building a Second Brain: Information Management",
        },
        {
            type: "paragraph",
            content:
                "In the information age, our biological brains can't keep up with the volume of valuable knowledge we encounter. A 'Second Brain' is a personal knowledge management system that captures, organizes, and surfaces information when you need it. Think of it as a digital extension of your mind.",
        },
        {
            type: "subheading",
            content: "The Four-Step CODE Method",
        },
        {
            type: "paragraph",
            content:
                "Capture: Save anything that resonates with you - articles, quotes, ideas, insights. Don't organize yet, just capture. Organize: File items into PARA categories (Projects, Areas, Resources, Archives). Distill: Highlight and summarize key points. Future you shouldn't have to re-read everything. Express: Share your knowledge through writing, teaching, or creating.",
        },
        {
            type: "list",
            items: [
                "Capture: Use quick capture tools like mobile apps, browser extensions, or voice memos",
                "Organize: Spend 10 minutes daily organizing captures into proper categories",
                "Distill: Progressive summarization - bold key sentences, highlight critical phrases",
                "Express: Create at least one output per week - a blog post, presentation, or discussion"
            ],
        },
        {
            type: "tip",
            content:
                "Follow the 'just-in-time' principle: Don't organize something until you need it. Your future projects will naturally pull relevant information from your Second Brain when the time is right.",
        },
        {
            type: "subheading",
            content: "Choosing Your Tools",
        },
        {
            type: "paragraph",
            content:
                "The best PKM tool depends on your workflow. Notion excels at databases and project management. Obsidian offers powerful linking and local-first storage. Roam Research pioneered bidirectional linking. Evernote provides robust capture and OCR. Aeternus combines the best of all worlds with templates, organization, and AI-powered insights.",
        },
        {
            type: "subheading",
            content: "Key Principles for Success",
        },
        {
            type: "list",
            items: [
                "Focus on actionability over completeness - perfect is the enemy of good",
                "Use consistent naming conventions and tags for easy retrieval",
                "Review your system weekly - prune outdated info, strengthen connections",
                "Link ideas together - your brain works associatively, your system should too",
                "Create more than you consume - knowledge unused is knowledge lost"
            ],
        },
        {
            type: "note",
            content:
                "Building a Second Brain is a marathon, not a sprint. Start small with one project or area of your life. As you see benefits, gradually expand your system. The goal isn't to capture everything - it's to make your knowledge work for you.",
        },
    ],
};