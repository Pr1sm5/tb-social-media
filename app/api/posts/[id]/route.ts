import { NextResponse } from "next/server";
import { getPostById, updatePost, deletePost } from "@/lib/services/post.service";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const post = getPostById(id);

        if (!post) {
            return NextResponse.json(
                { success: false, error: "Post nicht gefunden" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error("GET /api/posts/[id] fehlgeschlagen:", error);
        return NextResponse.json(
            { success: false, error: "Post konnte nicht geladen werden" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { success: false, error: "Ungültiger Request-Body (kein valides JSON)" },
            { status: 400 }
        );
    }

    try {
        const updated = updatePost(id, body);

        if (!updated) {
            return NextResponse.json(
                { success: false, error: "Post nicht gefunden" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.error("PATCH /api/posts/[id] fehlgeschlagen:", error);
        return NextResponse.json(
            { success: false, error: "Post konnte nicht aktualisiert werden" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const deleted = deletePost(id);

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: "Post nicht gefunden" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Post gelöscht"
        });
    } catch (error) {
        console.error("DELETE /api/posts/[id] fehlgeschlagen:", error);
        return NextResponse.json(
            { success: false, error: "Post konnte nicht gelöscht werden" },
            { status: 500 }
        );
    }
}