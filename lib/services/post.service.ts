//Retrive posts from database combined with logic
import { getPosts as loadPosts, savePost, savePosts } from "../data/dataManager";
import {Post} from "@/lib/types/post";
import {CreatePostInput} from "@/lib/types/post";

const start = new Date().getTime()

//This Service Provides Logic tasks for the API to send to the frontend
const post : CreatePostInput = {
    userId: "SomeName",
    image: "null",
    content: "Ich ficke deine mamamamama"
}


export function getPosts(): Post[] {
    return loadPosts()
}


export function createPost(input : CreatePostInput): Post {
    const posts = getPosts()

    const maxId = posts.length
        ? Math.max(...posts.map(p => Number(p.postId)))
        : 0

    const post: Post = {
        postId: (maxId + 1).toString(),
        ...input,
        timestamp: new Date().toISOString(),
    }
    savePost(post)

    return post
}


export function getPostById(id : number) : Post | undefined {
    return getPosts().find( p => p.postId === id.toString())
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
