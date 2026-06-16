import {getComments as loadComments, saveComments, saveComment} from "../data/dataManager"
import {CreateCommentInput, PostComment} from "@/lib/types/postComment";
import {randomUUID} from "node:crypto";

//TEST FILE
const comment: CreateCommentInput = {
    postId: "3",
    content: "Das ist ein Kommentar",
    userId: "WeebMaxi"
}



export function createComment(input : CreateCommentInput): PostComment | null{
    const comment: PostComment = {
        postId: input.postId,
        content: input.content,
        userId: input.userId,
        commentId: randomUUID(),
        timestamp: new Date().toISOString(),
    }

    saveComment(comment)
    return comment
}


export function getCommentsByPostId(postId : string): PostComment[]{
    const comments: PostComment[] = loadComments()
        .filter(c => c.postId === postId)
        .sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    return comments
}


export function updateComment(
    commentId: string,
    update: { content: string }
): PostComment | null {

    const comments = loadComments();

    const index: number = comments.findIndex(
        c => c.commentId === commentId
    );

    if (index === -1) return null;

    comments[index] = {
        ...comments[index],
        content: update.content,
    };

    saveComments(comments);

    return comments[index];
}


export function deleteComment(commentId: string){
    const comments : PostComment[] = loadComments()

    const index :number = comments.findIndex(c => c.commentId === commentId)
    if (index === -1) return false

    const deleted = comments[index]

    comments.splice(index, 1)
    saveComments(comments)

    return deleted
}

export function getCommentById(commentId: string): PostComment | null{
    const comment = loadComments()
        .find(c => c.commentId === commentId)

    if (!comment) return null

    return comment
}
