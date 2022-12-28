export interface News {
    id: string,
    title: string;
    subtitle: string | null;
    date: string;
    shortDescription: string | null;
    newsUrl: string;
    disabled: boolean;
    thumbnailUrl: string;
}
