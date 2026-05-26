import fs from 'fs';
import {Post} from "@/lib/types/post";
import {PostComment} from "@/lib/types/postComment";

const postsFilePath: string = "data/posts.json";
const commentsFilePath: string = "data/comments.json";
const botsFilePath: string = "data/bots.json";


//region POSTS

function loadPosts(): Post[]{
    const data = fs.readFileSync(postsFilePath, "utf-8")
    return JSON.parse(data || "[]")
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

function loadComments(): PostComment[]{
    const data = fs.readFileSync(commentsFilePath, "utf-8")
    return JSON.parse(data || "[]")
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

