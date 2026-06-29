// app/api/posts/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { getCommentsByPostId, createComment } from "@/lib/services/comment.service";
import { getPostById } from "@/lib/services/post.service";
import { getCommentsForPostAndComments } from "@/lib/ai/aiGenerator";
import { Language } from "@/lib/types/bot";

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

    // Sprache aus dem Request — Standard ist Deutsch
    const language: Language = body.language === "en" ? "en" : "de";

    // 1. User-Kommentar speichern
    const comment = createComment({
        postId: id,
        userId: body.userId,
        content: body.content,
        language: body.language
    });

    // 2. Bots reagieren im Hintergrund auf den neuen Thread-Stand
    const post = getPostById(id);
    if (post) {
        const existingComments = getCommentsByPostId(id);
        getCommentsForPostAndComments(post, existingComments, 2, language)
            .catch((err) => console.error("Bot Follow-Up fehlgeschlagen:", err));
    }

    return NextResponse.json({ success: true, data: comment });
}