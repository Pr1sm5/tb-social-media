// app/api/posts/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { getCommentsByPostId, createComment } from "@/lib/services/comment.service";
import { getPostById } from "@/lib/services/post.service";
import { getCommentsForPostAndComments } from "@/lib/ai/aiGenerator";

// GET /api/posts/:id/comments
export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const comments = getCommentsByPostId(id);

    return NextResponse.json({ success: true, data: comments });
}

// POST /api/posts/:id/comments
export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const body = await req.json();

    if (!body.userId || !body.content) {
        return NextResponse.json({
            success: false,
            error: "userId und content sind Pflicht"
        });
    }

    // 1. User-Kommentar speichern
    const comment = createComment({
        postId: id,
        userId: body.userId,
        content: body.content,
    });

    // 2. Bots reagieren im Hintergrund auf den neuen Thread-Stand
    // (fire-and-forget — User bekommt sofort seine Antwort)
    const post = getPostById(id);
    if (post) {
        const existingComments = getCommentsByPostId(id);

        getCommentsForPostAndComments(post, existingComments, 2)
            .catch((err) => console.error("Bot Follow-Up fehlgeschlagen:", err));
    }

    return NextResponse.json({ success: true, data: comment });
}