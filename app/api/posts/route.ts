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
    const posts = getPosts();
    const commentCounts = getCommentCounts();

    const postsWithCommentCount = posts.map((post) => ({
        ...post,
        commentCount: commentCounts[post.postId] ?? 0,
    }));

    return NextResponse.json({ success: true, data: postsWithCommentCount });
}

// POST app/api/posts — Post erstellen + Bots antworten lassen (fire-and-forget)
export async function POST(req: Request) {
    const body: CreatePostInput & { language?: Language } = await req.json();

    if (!body.content || !body.userId) {
        return NextResponse.json(
            { success: false, error: "Content and userId are mandatory" },
            { status: 400 }
        );
    }

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
}