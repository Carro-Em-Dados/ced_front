export interface Ad {
    workshop: string;
    title: string;
    image_url: string;
    description: string;
    start: Timestamp;
    end: Timestamp;
    createdAt: Timestamp;
    users_reacted?: string[];
    clicks?: number;
    closes?: number;
}