export interface PostComment {
    postId: string
    commentId: string
    userId: string
    content: string
    timestamp: string
    isBot? : boolean
    botType? : string
}

export interface CreateCommentInput {
    postId: string
    userId: string
    content: string
    isBot? : boolean
    botType? : string
    language? : string
}