import { NextResponse } from "next/server";
import { deleteComment } from "@/lib/services/comment.service";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  console.log("DELETE ID:", id);

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
}