// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
    // TODO: Sobald euer Auth-System steht — hier Session/Cookie löschen, z.B.:
    // const response = NextResponse.json({ success: true });
    // response.cookies.delete("session");
    // return response;

    console.log("Logout ausgelöst (Platzhalter — noch kein echtes Auth-System).");

    return NextResponse.json({ success: true });
}