// app/api/posts/[id]/comments/route.ts
import { NextResponse } from "next/server";
import {
    getCommentsByPostId,
    createComment
} from "@/lib/services/comment.service";

// GET /api/posts/:id/comments
export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const comments = getCommentsByPostId(id);

    return NextResponse.json({
        success: true,
        data: comments
    });
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

    const comment = createComment({
        postId: id,
        userId: body.userId,
        content: body.content
    });

    return NextResponse.json({
        success: true,
        data: comment
    });
}