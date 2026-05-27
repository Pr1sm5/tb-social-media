// app/api/posts/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { getCommentsByPostId, createComment } from "@/lib/services/comment.service";

// GET /api/posts/:id/comments
export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const comments = getCommentsByPostId(params.id)

    return NextResponse.json({ success: true, data: comments })
}

// POST /api/posts/:id/comments
export async function POST(req: Request, { params }: { params: { id: string } }) {
    const {id} = await params
    const body = await req.json()

    if (!body.userId || !body.content) {
        return NextResponse.json(
            { success: false, error: "userId und content sind Pflicht" }
        )
    }


    console.log(params.id)

    const comment = createComment({
        postId: id,   // ← kommt aus der URL, nicht aus dem Body
        userId: body.userId,
        content: body.content
    })

    return NextResponse.json({ success: true, data: comment })
}