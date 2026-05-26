// app/api/posts/route.ts
import { NextResponse } from "next/server";
import path from "path";
import {Post} from "@/lib/types/post";
import {CreatePostInput} from "@/lib/types/post";
import {getPosts, createPost, updatePost, deletePost} from "@/lib/services/post.service";

//GET app/api/posts
export async function GET() {
    const posts = getPosts();
    return NextResponse.json({success: true, data: posts})
}

export async function POST(req: Request){
    const body: CreatePostInput = await req.json()

    if (!body.content || !body.userId){
        return NextResponse.json(
            {success: false, error: "Content and userId are mandatory"}
        )
    }

    const post = createPost(body)
    return NextResponse.json({success: true, data: post})
}