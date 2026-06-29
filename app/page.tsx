"use client";

import "./globals.css";
import { useEffect, useRef, useState } from "react";

import Texteingabefeld from "./components/TextInputComponent";
import TextOutputComponent from "./components/TextOutputComponent";
import CommentComponent from "./components/CommentComponent";
import LoginOverlay from "./components/LoginOverlay";
import Header from "./components/Header";
import InfoBox from "./components/InfoBox";

import { Post } from "../lib/types/post";
import { PostComment } from "@/lib/types/postComment";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

type InfoBoxItem = {
    text: string;
    type?: "info" | "error" | "success" | "warning";
};

export default function Page() {
    const router = useRouter();
    const { user, login, ready } = useUser();

    // Ref damit async Funktionen immer den aktuellen User lesen
    const userRef = useRef(user);
    useEffect(() => { userRef.current = user; }, [user]);

    const [posts, setPosts] = useState<Post[]>([]);
    const [comments, setComments] = useState<Record<string, PostComment[]>>({});
    const [openComments, setOpenComments] = useState<string | null>(null);
    const [infoBoxes, setInfoBoxes] = useState<InfoBoxItem[]>([]);

    useEffect(() => { fetchPosts(); }, []);

    function startInfoSequence(lang: "de" | "en") {
        setInfoBoxes([]);

        const events: { delay: number; data: InfoBoxItem }[] = lang === "en" ? [
            { delay: 15000, data: { text: "Something was triggered by creating the post.", type: "warning" } },
            { delay: 25000, data: { text: "Multiple bots are commenting on your post.", type: "info" } },
            { delay: 35000, data: { text: "Activity is rising unusually fast.", type: "error" } },
            { delay: 45000, data: { text: "20% of social media traffic during global events comes from bots. (Nature, 2025)", type: "success" } },
        ] : [
            { delay: 15000, data: { text: "Durch das Erstellen des Posts wurde etwas ausgelöst.", type: "warning" } },
            { delay: 25000, data: { text: "Mehrere Bots kommentieren unter deinem Post.", type: "info" } },
            { delay: 35000, data: { text: "Die Aktivität steigt ungewöhnlich schnell an.", type: "error" } },
            { delay: 45000, data: { text: "20% aller Social-Media-Kommentare stammen von Bots. (Nature, 2025)", type: "success" } },
        ];

        events.forEach(({ delay, data }) => {
            setTimeout(() => setInfoBoxes(prev => [...prev, data]), delay);
        });
    }

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
        // Sprache aus Ref lesen — immer aktuell, nie stale
        const currentUser = userRef.current;
        if (!currentUser) return;
        const lang = currentUser.language ?? "de";

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.username,
                    content,
                    language: lang,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts((prev) => [data.data, ...prev]);
                startInfoSequence(lang);
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
        const currentUser = userRef.current;
        if (!currentUser) return;

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.username,
                    content,
                    language: currentUser.language ?? "de",
                }),
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

    function handlePostClick(e: React.MouseEvent, postId: string) {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;
        router.push(`/post/${postId}`);
    }

    if (!ready) return null;

    return (
        <>
            {!user && <LoginOverlay onLogin={login} />}

            <Header />

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
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => handlePostClick(e, post.postId)}
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

            <div className="info-container">
                {infoBoxes.map((box, index) => (
                    <InfoBox
                        text={box.text}
                        type={box.type}
                    />
                ))}
            </div>
        </>
    );
}