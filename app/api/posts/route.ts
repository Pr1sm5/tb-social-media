// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { CreatePostInput } from "@/lib/types/post";
import { Language } from "@/lib/types/bot";
import { getPosts, createPost } from "@/lib/services/post.service";
import { getCommentCounts } from "@/lib/services/comment.service";
import { getAllBotComments } from "@/lib/ai/aiGenerator";
import { scheduleFollowUpComments } from "@/lib/ai/botScheduler";

// GET app/api/posts
export async function GET() {
    try {
        const posts = getPosts();
        const commentCounts = getCommentCounts();

        const postsWithCommentCount = posts.map((post) => ({
            ...post,
            commentCount: commentCounts[post.postId] ?? 0,
        }));

        return NextResponse.json({ success: true, data: postsWithCommentCount });
    } catch (error) {
        console.error("GET /api/posts fehlgeschlagen:", error);
        return NextResponse.json(
            { success: false, error: "Posts konnten nicht geladen werden" },
            { status: 500 }
        );
    }
}

// POST app/api/posts — Post erstellen + Bots antworten lassen (fire-and-forget)
export async function POST(req: Request) {
    let body: CreatePostInput & { language?: Language };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { success: false, error: "Ungültiger Request-Body (kein valides JSON)" },
            { status: 400 }
        );
    }

    if (!body.content || !body.userId) {
        return NextResponse.json(
            { success: false, error: "Content and userId are mandatory" },
            { status: 400 }
        );
    }

    try {
        // Sprache aus dem Request — Standard ist Deutsch
        const language: Language = body.language === "en" ? "en" : "de";

        // 1. Post erstellen
        const post = createPost(body);

        // 2. Bots generieren Kommentare (3–5 Stück) — läuft im Hintergrund weiter,
        //    Response wartet nicht darauf (fire-and-forget)
        getAllBotComments(post, 5, language)
            .then(() => {
                // Zweite Welle — nach 45 Sekunden, gleiche Sprache
                scheduleFollowUpComments(post, 45_000, language);
            })
            .catch((error) => {
                console.error("Bot-Generierung fehlgeschlagen:", error);
            });

        // 3. Post sofort zurückgeben — Bot-Kommentare folgen asynchron
        return NextResponse.json({
            success: true,
            data: post,
        });
    } catch (error) {
        console.error("POST /api/posts fehlgeschlagen:", error);
        return NextResponse.json(
            { success: false, error: "Post konnte nicht erstellt werden" },
            { status: 500 }
        );
    }
}