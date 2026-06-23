import { Post } from "@/lib/types/post";
import { Language } from "@/lib/types/bot";
import { getCommentsByPostId } from "@/lib/services/comment.service";
import { getCommentsForPostAndComments } from "@/lib/ai/aiGenerator";

export async function scheduleFollowUpComments(
    post: Post,
    delayMs: number = 45_000,
    language: Language = "de"
) {
    setTimeout(async () => {
        const existingComments = getCommentsByPostId(post.postId);
        await getCommentsForPostAndComments(post, existingComments, 3, language);
    }, delayMs);
}