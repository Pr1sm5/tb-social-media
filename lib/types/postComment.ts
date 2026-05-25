export interface PostComment {
    postId: string
    commentId: string
    userId: string
    content: string
    timestamp: string
}

export interface CreateCommentInput {
    postId: string
    userId: string
    content: string
}