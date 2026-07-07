import fs from 'fs';
import path from "path";
import {Post} from "@/lib/types/post";
import {PostComment} from "@/lib/types/postComment";
import {Bot} from "@/lib/types/bot";


const commentsFilePath = path.join(process.cwd(), "data", "comments.json");
const postsFilePath = path.join(process.cwd(), "data", "posts.json");
const botsFilePath = path.join(process.cwd(), "data", "bots.json");

// Liest eine JSON-Datei robust ein. Fehlt die Datei, wird sie mit "[]" angelegt.
// Ist der Inhalt kein valides JSON (z.B. durch manuelles Editieren kaputt gegangen),
// wird die defekte Datei gesichert und ein leeres Array zurückgegeben, statt die App abstürzen zu lassen.
function safeReadJsonArray<T>(filePath: string): T[] {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "[]");
        }

        const raw = fs.readFileSync(filePath, "utf-8");

        if (!raw.trim()) return [];

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            console.error(`[dataManager] ${filePath} enthält kein Array — verwende leeres Array.`);
            return [];
        }

        return parsed as T[];
    } catch (err) {
        console.error(`[dataManager] Konnte ${filePath} nicht lesen/parsen:`, err);

        try {
            const backupPath = `${filePath}.corrupted-${Date.now()}.bak`;
            fs.copyFileSync(filePath, backupPath);
            console.error(`[dataManager] Defekte Datei gesichert unter ${backupPath}`);
        } catch {
            // Backup ist best-effort — wenn das auch fehlschlägt, trotzdem sauber weitermachen
        }

        return [];
    }
}

function safeWriteJsonArray<T>(filePath: string, data: T[]): boolean {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`[dataManager] Konnte ${filePath} nicht schreiben:`, err);
        return false;
    }
}


//region POSTS

function loadPosts(): Post[] {
    return safeReadJsonArray<Post>(postsFilePath);
}

export function savePosts(posts: Post[]): boolean {
    return safeWriteJsonArray(postsFilePath, posts);
}

export function savePost(post: Post): boolean {
    const posts = loadPosts()
    posts.push(post)
    return savePosts(posts)
}

export function getPosts(): Post[]{
    return loadPosts()
}
//endregion

//region Comments

function loadComments(): PostComment[] {
    return safeReadJsonArray<PostComment>(commentsFilePath);
}

export function saveComments(comments: PostComment[]): boolean {
    return safeWriteJsonArray(commentsFilePath, comments);
}

export function getComments(): PostComment[]{
    return loadComments()
}

export function saveComment(comment: PostComment): boolean {
    const comments = loadComments()
    comments.push(comment)
    return saveComments(comments)
}
//endregion


//region Bots
export function loadBots() : Bot[]{
    return safeReadJsonArray<Bot>(botsFilePath);
}

//endregion
