// app/api/posts/[id]/route.ts
import { NextResponse } from "next/server";
import { getPostById, updatePost, deletePost } from "@/lib/services/post.service";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const post = getPostById(params.id)

    if (!post) {
        return NextResponse.json({ success: false, error: "Post nicht gefunden" })
    }

    return NextResponse.json({ success: true, data: post })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const body = await req.json()

    const updated = updatePost(params.id, body)

    if (!updated) {
        return NextResponse.json({ success: false, error: "Post nicht gefunden" })
    }

    return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const deleted = deletePost(params.id)

    if (!deleted) {
        return NextResponse.json({ success: false, error: "Post nicht gefunden" })
    }

    return NextResponse.json({ success: true, message: "Post gelöscht" })
}