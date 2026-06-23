//Retrive posts from database combined with logic
import { getPosts as loadPosts, savePost, savePosts } from "../data/dataManager";
import {Post} from "@/lib/types/post";
import {CreatePostInput} from "@/lib/types/post";
import {randomUUID} from "node:crypto";

const start = new Date().getTime()

//This Service Provides Logic tasks for the API to send to the frontend
const post : CreatePostInput = {
    userId: "SomeName",
    image: "null",
    content: "guten tag"
}


export function getPosts(): Post[] {
    return loadPosts()
        .sort(
            (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}


export function createPost(input : CreatePostInput): Post {
    const post: Post = {
        postId: randomUUID(),
        ...input,
        timestamp: new Date().toISOString(),
    }
    savePost(post)

    return post
}


export function getPostById(id : string) : Post | undefined {
    return getPosts().find( p => p.postId === id)
}


export function updatePost(postId : string, update : Partial<Omit<Post, "postId" | "userId">>): Post | null{
    const posts = getPosts()
    const index = posts.findIndex(p => p.postId === postId)

    if (index === -1) return null;

    posts[index] = {
        ...posts[index],
        ...update
    }

    savePosts(posts)
    return posts[index]
}


export function deletePost(postId : string) {
    const posts = getPosts()

    const updated = posts.filter(p => p.postId !== postId)
    savePosts(updated)

    return true
}


export function getFeed(){

}

