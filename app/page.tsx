"use client";

import "./globals.css";
import { useEffect, useState } from "react";

import Texteingabefeld from "./components/TextInputComponent";
import TextOutputComponent from "./components/TextOutputComponent";
import CommentComponent from "./components/CommentComponent";
import LoginOverlay from "./components/LoginOverlay";

import { Post } from "../lib/types/post";
import { PostComment } from "@/lib/types/postComment";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();
    const { user, login, logout, ready } = useUser();

    const [posts, setPosts] = useState<Post[]>([]);
    const [comments, setComments] = useState<Record<string, PostComment[]>>({});
    const [openComments, setOpenComments] = useState<string | null>(null);

    useEffect(() => { fetchPosts(); }, []);

    async function fetchPosts() {
        try {
            const res = await fetch("/api/posts");
            const data = await res.json();
            if (data.success) setPosts(data.data);
        } catch (err) {
            console.error("Fehler beim Laden der Posts:", err);
        }
    }

    async function addPost(content: string) {
        if (!user) return;
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.username, content }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts((prev) => [data.data, ...prev]);
                router.push(`/post/${data.data.postId}`);
            }
        } catch (err) {
            console.error("Fehler beim Erstellen:", err);
        }
    }

    async function deletePost(postId: string) {
        try {
            const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) setPosts((prev) => prev.filter((p) => p.postId !== postId));
        } catch (err) {
            console.error("Fehler beim Löschen:", err);
        }
    }

    async function addComment(postId: string, content: string) {
        if (!user) return;
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.username, content }),
            });
            const data = await res.json();
            if (data.success) {
                setComments((prev) => ({
                    ...prev,
                    [postId]: [data.data, ...(prev[postId] || [])],
                }));
            }
        } catch (err) {
            console.error("Fehler beim Kommentieren:", err);
        }
    }

    async function toggleComments(postId: string) {
        if (openComments === postId) { setOpenComments(null); return; }
        setOpenComments(postId);
        if (!comments[postId]) {
            const res = await fetch(`/api/posts/${postId}/comments`);
            const data = await res.json();
            if (data.success) setComments((prev) => ({ ...prev, [postId]: data.data }));
        }
    }

    async function deleteComment(commentId: string) {
        try {
            const res = await fetch(`/api/posts/comments/${commentId}`, { method: "DELETE" });
            if (!res.ok) console.error("DELETE FAILED");
        } catch (err) {
            console.error(err);
        }
    }

    if (!ready) return null;

    return (
        <>
            {!user && <LoginOverlay onLogin={login} />}

            <header className="header">
                <div className="logo"><h1>LOGO</h1></div>

                <div className="header-nav">
                    <button>For you</button>
                    <button>Following</button>
                </div>

                {user && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {/* Avatar */}
                        <div style={{
                            width: "34px", height: "34px", borderRadius: "50%",
                            background: user.color, display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "13px", fontWeight: 700,
                            color: "white", flexShrink: 0,
                        }}>
                            {user.initials}
                        </div>

                        {/* Logout */}
                        <button className="back-btn" onClick={logout}>
                            Logout
                        </button>
                    </div>
                )}
            </header>

            <main>
                <div className="feed">
                    <section>
                        <Texteingabefeld onSend={addPost} />
                    </section>

                    <section>
                        {posts.map((post) => (
                            <div key={post.postId}>
                                <div
                                    className="post-card"
                                    onClick={() => router.push(`/post/${post.postId}`)}
                                >
                                    <TextOutputComponent
                                        text={post.content}
                                        name={post.userId}
                                        username={post.userId}
                                        onDelete={() => deletePost(post.postId)}
                                    />
                                </div>

                                {openComments === post.postId && (
                                    <CommentComponent
                                        comments={comments[post.postId] || []}
                                        onAddComment={(text) => addComment(post.postId, text)}
                                        onDeleteComment={deleteComment}
                                        currentUsername={user?.username}
                                    />
                                )}
                            </div>
                        ))}
                    </section>
                </div>
            </main>
        </>
    );
}