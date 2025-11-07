import type { Item } from "../types/Item";
import { recentlyVisited, learnItems, upcomingEvents } from "./mockData";

// Giả lập gọi API backend
export async function fetchItemsByCategory(category: string): Promise<Item[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            switch (category) {
                case "recent":
                    resolve(recentlyVisited);
                    break;
                case "learn":
                    resolve(learnItems);
                    break;
                case "event":
                    resolve(upcomingEvents);
                    break;
                default:
                    resolve([]);
            }
        }, 400); // mô phỏng network delay
    });
}
