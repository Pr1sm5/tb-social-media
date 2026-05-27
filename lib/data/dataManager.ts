import fs from 'fs';
import path from "path";
import {Post} from "@/lib/types/post";
import {PostComment} from "@/lib/types/postComment";



const commentsFilePath = path.join(process.cwd(), "data", "comments.json");
const postsFilePath = path.join(process.cwd(), "data", "posts.json");
const botsFilePath = path.join(process.cwd(), "data", "bots.json");

//const postsFilePath: string = "data/posts.json";
//const commentsFilePath: string = "data/comments.json";
//const botsFilePath: string = "data/bots.json";


//region POSTS

//function loadPosts(): Post[]{
//   const data = fs.readFileSync(postsFilePath, "utf-8")
//    return JSON.parse(data || "[]")
//}

function loadPosts(): Post[] {
    if (!fs.existsSync(postsFilePath)) {
        fs.writeFileSync(postsFilePath, "[]");
    }

    const data = fs.readFileSync(postsFilePath, "utf-8");

    return data.trim()
        ? JSON.parse(data)
        : [];
}

export function savePosts(posts: Post[]){
   fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2))
}

export function savePost(post: Post){
    const posts = loadPosts()
    posts.push(post)
    savePosts(posts)
}

export function getPosts(): Post[]{
    return loadPosts()
}
//endregion

//region Comments

//function loadComments(): PostComment[]{
//    const data = fs.readFileSync(commentsFilePath, "utf-8")
//    return JSON.parse(data || "[]")
//}

function loadComments(): PostComment[] {
    if (!fs.existsSync(commentsFilePath)) {
        fs.writeFileSync(commentsFilePath, "[]");
    }

    const data = fs.readFileSync(commentsFilePath, "utf-8");

    console.log("COMMENTS RAW FILE:", data);

    return data.trim()
        ? JSON.parse(data)
        : [];
}

export function saveComments(comments: PostComment[]){
    fs.writeFileSync(commentsFilePath, JSON.stringify(comments, null, 2))
}

export function getComments(): PostComment[]{
    return loadComments()
}

export function saveComment(comment: PostComment){
    const comments = loadComments()
    comments.push(comment)
    saveComments(comments)
}
//endregion

