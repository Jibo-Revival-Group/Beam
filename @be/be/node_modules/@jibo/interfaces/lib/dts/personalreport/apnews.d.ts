export declare enum CategoryName {
    general = "general",
    technology = "technology",
    sports = "sports",
    business = "business",
    science = "science",
    entertainment = "entertainment",
    strange = "strange",
    health = "health",
    international = "international",
    national = "national",
    politics = "politics",
}
export declare const CATEGORIES: {
    [key: number]: CategoryName;
};
export interface NewsCategory {
    name: CategoryName;
    sourceID: number;
}
export interface RawNewsData {
    data?: any;
    error?: any;
    category: NewsCategory;
}
