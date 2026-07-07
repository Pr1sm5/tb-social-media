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
    try {
        const { id } = await context.params;
        const comments = getCommentsByPostId(id);
        return NextResponse.json({ success: true, data: comments });
    } catch (error) {
        console.error("GET /api/posts/[id]/comments fehlgeschlagen:", error);
        return NextResponse.json(
            { success: false, error: "Kommentare konnten nicht geladen werden" },
            { status: 500 }
        );
    }
}

// POST /api/posts/:id/comments
export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    let body: { userId?: string; content?: string; language?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { success: false, error: "Ungültiger Request-Body (kein valides JSON)" },
            { status: 400 }
        );
    }

    if (!body.userId || !body.content) {
        return NextResponse.json(
            { success: false, error: "userId und content sind Pflicht" },
            { status: 400 }
        );
    }

    try {
        // Sprache aus dem Request — Standard ist Deutsch
        const language: Language = body.language === "en" ? "en" : "de";

        // 1. User-Kommentar speichern
        const comment = createComment({
            postId: id,
            userId: body.userId,
            content: body.content,
            language: body.language
        });

        if (!comment) {
            return NextResponse.json(
                { success: false, error: "Kommentar konnte nicht gespeichert werden" },
                { status: 500 }
            );
        }

        // 2. Bots reagieren im Hintergrund auf den neuen Thread-Stand
        const post = getPostById(id);
        if (post) {
            const existingComments = getCommentsByPostId(id);
            getCommentsForPostAndComments(post, existingComments, 2, language)
                .catch((err) => console.error("Bot Follow-Up fehlgeschlagen:", err));
        }

        return NextResponse.json({ success: true, data: comment });
    } catch (error) {
        console.error("POST /api/posts/[id]/comments fehlgeschlagen:", error);
        return NextResponse.json(
            { success: false, error: "Kommentar konnte nicht erstellt werden" },
            { status: 500 }
        );
    }
}