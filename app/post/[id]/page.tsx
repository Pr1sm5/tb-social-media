"use client";

import { useEffect, useRef, useState } from "react";
import { Post } from "@/lib/types/post";
import { PostComment } from "@/lib/types/postComment";
import TextOutputComponent from "@/app/components/TextOutputComponent";
import CommentComponent from "@/app/components/CommentComponent";
import { useParams, useRouter } from "next/navigation";

const NEW_POST_THRESHOLD_MS = 30_000;

function isNewPost(timestamp: string): boolean {
    return Date.now() - new Date(timestamp).getTime() < NEW_POST_THRESHOLD_MS;
}

// Zufällige Delays — manchmal schnell hintereinander, manchmal längere Pause
function generateRevealDelays(count: number): number[] {
    const delays: number[] = [];
    let accumulated = 0;

    for (let i = 0; i < count; i++) {
        const roll = Math.random();
        let gap: number;

        if (roll < 0.2) {
            // 20%: sehr schnell (0.3–0.9s) — "zwei auf einmal" Effekt
            gap = 300 + Math.random() * 600;
        } else if (roll < 0.6) {
            // 40%: normale Pause (1.5–4s)
            gap = 1500 + Math.random() * 2500;
        } else {
            // 40%: längere Pause (4–9s)
            gap = 4000 + Math.random() * 5000;
        }

        accumulated += gap;
        delays.push(accumulated);
    }

    return delays;
}

export default function PostPage() {
    const params = useParams();
    const router = useRouter();

    const id = params?.id as string | undefined;

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [visibleComments, setVisibleComments] = useState<PostComment[]>([]);
    const [loading, setLoading] = useState(true);

    const commentsRef = useRef<PostComment[]>([]);
    commentsRef.current = comments;

    // ─── Kommentare einblenden ────────────────────────────────────────────────
    useEffect(() => {
        if (comments.length === 0) return;

        // Alter Post → alle sofort anzeigen
        if (!post || !isNewPost(post.timestamp)) {
            setVisibleComments(
                [...comments].sort(
                    (a, b) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime()
                )
            );
            return;
        }

        // Neuer Post → neue Kommentare mit zufälligen Delays einblenden
        setVisibleComments((prev) => {
            const visibleIds = new Set(prev.map((c) => c.commentId));
            const toReveal = comments.filter((c) => !visibleIds.has(c.commentId));

            if (toReveal.length === 0) return prev;

            const delays = generateRevealDelays(toReveal.length);

            toReveal.forEach((comment, index) => {
                setTimeout(() => {
                    setVisibleComments((current) => {
                        if (current.find((c) => c.commentId === comment.commentId)) {
                            return current;
                        }
                        return [...current, comment].sort(
                            (a, b) =>
                                new Date(a.timestamp).getTime() -
                                new Date(b.timestamp).getTime()
                        );
                    });
                }, delays[index]);
            });

            return prev;
        });
    }, [comments, post]);

    // ─── Daten laden ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        loadData(id);
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const interval = setInterval(() => {
            loadComments(id);
        }, 10000);

        return () => clearInterval(interval);
    }, [id]);

    async function loadComments(postId: string) {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`);
            const data = await response.json();
            if (data.success) setComments(data.data);
        } catch (err) {
            console.error("ERROR loading comments:", err);
        }
    }

    async function loadData(postId: string) {
        setLoading(true);
        try {
            const [postRes, commentRes] = await Promise.all([
                fetch(`/api/posts/${postId}`),
                fetch(`/api/posts/${postId}/comments`),
            ]);

            const postData = await postRes.json();
            const commentData = await commentRes.json();

            if (postData.success) setPost(postData.data);
            if (commentData.success) setComments(commentData.data);
        } catch (err) {
            console.error("ERROR loading post:", err);
        } finally {
            setLoading(false);
        }
    }

    async function addComment(text: string) {
        const res = await fetch(`/api/posts/${id}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "123", content: text }),
        });

        const data = await res.json();

        if (data.success) {
            // Eigene Kommentare immer sofort sichtbar
            setComments((prev) => [data.data, ...prev]);
            setVisibleComments((prev) => [data.data, ...prev]);
        }
    }

    async function deleteComment(commentId: string) {
        const res = await fetch(`/api/posts/comments/${commentId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            console.error("DELETE FAILED");
            return;
        }

        setComments((prev) => prev.filter((c) => c.commentId !== commentId));
        setVisibleComments((prev) => prev.filter((c) => c.commentId !== commentId));
    }

    if (loading || !post) {
        return <div>Loading...</div>;
    }

    return (
        <main>
            <div className="feed">
                <button className="back-btn" onClick={() => router.back()}>
                    ← Back
                </button>

                <TextOutputComponent
                    text={post.content}
                    name="Kinky"
                    username="Samed123"
                    onDelete={() => {}}
                />

                <CommentComponent
                    comments={visibleComments}
                    onAddComment={addComment}
                    onDeleteComment={deleteComment}
                />
            </div>
        </main>
    );
}