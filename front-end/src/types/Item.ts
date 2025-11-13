export interface Item {
    id: number;
    title: string;
    icon?: string;
    description?: string;
    image?: string;
    date?: string;
    time?: string;
    category: "recent" | "learn" | "event";
}

