export interface Post{
    postId: string
    userId: string
    image?: string
    content: string
    timestamp: string
}

export interface CreatePostInput{
    userId: string
    image?: string
    content: string
}