export type PostType = {
    id: string;
    user_id: string;
    caption: string;
    url: string;
    file_type: "image" | "video";
    file_name: string;
    created_at: string;
    is_owner: boolean;
    email: string;
}

export type FeedResponse = {
    posts: PostType[];
}