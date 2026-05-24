import fs from 'fs';
import {Post} from "@/lib/types/post";
import {PostComment} from "@/lib/types/postComment";

const postsFilePath: string = "data/posts.json";
const commentsFilePath: string = "data/comments.json";
const botsFilePath: string = "data/bots.json";

//TEST DATA!!!!
const post: Post = {
    postId: "2",
    userId: "4532",
    image: "image.png",
    content: "Hallo nr 3",
    timestamp: new Date().toISOString()
}

const comment: PostComment = {
    postId: "1",
    commentId: "1",
    userId: "DeineMudda",
    content: "Das ist ein Kommentar",
    timestamp: new Date().toISOString()
}

//region POSTS

function loadPosts(): Post[]{
    const data = fs.readFileSync(postsFilePath, "utf-8")
    return JSON.parse(data || "[]")
}

function savePosts(posts: Post[]){
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

function saveComments(comments: PostComment[]){
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


savePost(post)
saveComment(comment)
console.log(getPosts())
console.log(getComments())
