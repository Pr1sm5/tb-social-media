"use client";

import "./globals.css";
import { useEffect, useRef, useState } from "react";

import Texteingabefeld from "./components/TextInputComponent";
import TextOutputComponent from "./components/TextOutputComponent";
import CommentComponent from "./components/CommentComponent";
import LoginOverlay from "./components/LoginOverlay";
import Header from "./components/Header";
import InfoBox from "./components/InfoBox";

import { Post } from "@/lib/types/post";
import { PostComment } from "@/lib/types/postComment";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { INFO_EVENTS, InfoBoxItem } from "@/lib/infoTexts/infoTexts";

/*
type InfoBoxItem = {
    text: string;
    type?: "info" | "error" | "success" | "warning";
};
*/

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


    console.log(INFO_EVENTS);
    function startInfoSequence(lang: "de" | "en") {
        console.log("START", lang);

        setInfoBoxes([]);

        INFO_EVENTS[lang].forEach(({ delay, data }) => {
            console.log("Scheduling:", data.text);

            setTimeout(() => {
                console.log("Showing:", data.text);
                setInfoBoxes(prev => [...prev, data]);
            }, delay);
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
                        key={`${box.text}-${box.type}-${index}`}
                        text={box.text}
                        type={box.type}
                    />
                ))}
            </div>
        </>
    );
}