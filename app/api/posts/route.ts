// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { CreatePostInput } from "@/lib/types/post";
import { getPosts, createPost } from "@/lib/services/post.service";
import { getAllBotComments } from "@/lib/ai/aiGenerator";
import { createComment } from "@/lib/services/comment.service";

// GET app/api/posts
export async function GET() {
    const posts = getPosts();
    return NextResponse.json({ success: true, data: posts });
}

// POST app/api/posts — Post erstellen + Bots antworten lassen + Kommentare speichern
export async function POST(req: Request) {
    const body: CreatePostInput = await req.json();

    if (!body.content || !body.userId) {
        return NextResponse.json(
            { success: false, error: "Content and userId are mandatory" },
            { status: 400 }
        );
    }

    // 1. Post erstellen
    const post = createPost(body);

    // 2. Bots generieren Kommentare (3–5 Stück)
    let botComments = [];
    try {
        const generated = await getAllBotComments(post.content, 5);

        // 3. Jeden Bot-Kommentar in comments.json speichern
        botComments = generated.map((botComment) =>
            createComment({
                postId: post.postId,
                content: botComment.content,
                userId: botComment.userId,  // botId als userId
            })
        );
    } catch (error) {
        console.error("Bot-Generierung fehlgeschlagen:", error);
    }

    // 4. Post + gespeicherte Bot-Kommentare zurückgeben
    return NextResponse.json({
        success: true,
        data: post,
        botComments, // [{ commentId, postId, userId, content, timestamp }, ...]
    });
}