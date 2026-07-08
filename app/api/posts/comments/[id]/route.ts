import { NextResponse } from "next/server";
import { deleteComment } from "@/lib/services/comment.service";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const deleted = deleteComment(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Comment nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comment gelöscht",
    });
  } catch (error) {
    console.error("DELETE /api/posts/comments/[id] fehlgeschlagen:", error);
    return NextResponse.json(
      { success: false, error: "Comment konnte nicht gelöscht werden" },
      { status: 500 }
    );
  }
}