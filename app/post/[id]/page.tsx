"use client";

import { useEffect, useRef, useState } from "react";
import { Post } from "@/lib/types/post";
import { PostComment } from "@/lib/types/postComment";
import TextOutputComponent from "@/app/components/TextOutputComponent";
import CommentComponent from "@/app/components/CommentComponent";
import LoginOverlay from "@/app/components/LoginOverlay";
import Header from "@/app/components/Header";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

const NEW_POST_THRESHOLD_MS = 30_000;

function isNewPost(timestamp: string): boolean {
    return Date.now() - new Date(timestamp).getTime() < NEW_POST_THRESHOLD_MS;
}

function generateRevealDelays(count: number): number[] {
    const delays: number[] = [];
    let accumulated = 0;
    for (let i = 0; i < count; i++) {
        const roll = Math.random();
        let gap: number;
        if (roll < 0.2)      gap = 300 + Math.random() * 600;
        else if (roll < 0.6) gap = 1500 + Math.random() * 2500;
        else                 gap = 4000 + Math.random() * 5000;
        accumulated += gap;
        delays.push(accumulated);
    }
    return delays;
}

function generateColor(username: string): string {
    const colors = ["#1d9bf0","#7856ff","#ff6b6b","#00ba7c","#ff9f1c","#e040fb","#00bcd4","#ff5722"];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export default function PostPage() {
    const params = useParams();
    const { user, login, ready } = useUser();

    const id = params?.id as string | undefined;

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [visibleComments, setVisibleComments] = useState<PostComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentInput, setCommentInput] = useState("");

    const commentsRef = useRef<PostComment[]>([]);
    commentsRef.current = comments;

    useEffect(() => {
        if (comments.length === 0) return;

        if (!post || !isNewPost(post.timestamp)) {
            setVisibleComments(
                [...comments].sort((a, b) =>
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                )
            );
            return;
        }

        setVisibleComments((prev) => {
            const visibleIds = new Set(prev.map((c) => c.commentId));
            const toReveal = comments.filter((c) => !visibleIds.has(c.commentId));
            if (toReveal.length === 0) return prev;

            const delays = generateRevealDelays(toReveal.length);
            toReveal.forEach((comment, index) => {
                setTimeout(() => {
                    setVisibleComments((current) => {
                        if (current.find((c) => c.commentId === comment.commentId)) return current;
                        return [...current, comment].sort((a, b) =>
                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                        );
                    });
                }, delays[index]);
            });

            return prev;
        });
    }, [comments, post]);

    useEffect(() => {
        if (!id) return;
        loadData(id);
    }, [id]);

    useEffect(() => {
        if (!id) return;
        const interval = setInterval(() => loadComments(id), 10000);
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
        if (!user || !text.trim()) return;
        const res = await fetch(`/api/posts/${id}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.username, content: text }),
        });
        const data = await res.json();
        if (data.success) {
            setComments((prev) => [data.data, ...prev]);
            setVisibleComments((prev) => [data.data, ...prev]);
            setCommentInput("");
        }
    }

    async function deleteComment(commentId: string) {
        const res = await fetch(`/api/posts/comments/${commentId}`, { method: "DELETE" });
        if (!res.ok) { console.error("DELETE FAILED"); return; }
        setComments((prev) => prev.filter((c) => c.commentId !== commentId));
        setVisibleComments((prev) => prev.filter((c) => c.commentId !== commentId));
    }

    if (!ready) return null;

    return (
        <>
            {!user && <LoginOverlay onLogin={login} />}

            <Header showBack />

            <main style={{ paddingBottom: "80px" }}>
                <div className="feed">
                    {loading || !post ? (
                        <div>Loading...</div>
                    ) : (
                        <>
                            <TextOutputComponent
                                text={post.content}
                                name={post.userId}
                                username={post.userId}
                                onDelete={() => {}}
                            />

                            <CommentComponent
                                comments={visibleComments}
                                onAddComment={addComment}
                                onDeleteComment={deleteComment}
                                currentUsername={user?.username}
                                hideInput
                            />
                        </>
                    )}
                </div>
            </main>

            <div style={footerStyle}>
                <div style={footerInnerStyle}>
                    {user && (
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            background: generateColor(user.username),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "12px", fontWeight: 700, color: "white", flexShrink: 0,
                        }}>
                            {user.initials}
                        </div>
                    )}

                    <input
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addComment(commentInput)}
                        placeholder="Schreib einen Kommentar..."
                        style={footerInputStyle}
                        className="text-input"
                    />

                    <button
                        className="send-btn"
                        style={{ padding: "8px 16px", fontSize: "14px", flexShrink: 0 }}
                        onClick={() => addComment(commentInput)}
                    >
                        Post
                    </button>
                </div>
            </div>
        </>
    );
}

const footerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 0, left: 0, right: 0,
    background: "#000",
    borderTop: "1px solid #2f2f2f",
    zIndex: 100,
    backdropFilter: "blur(12px)",
};

const footerInnerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 20px",
    maxWidth: "600px",
    margin: "0 auto",
};

const footerInputStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 14px",
    background: "#111",
    border: "1px solid #333",
    borderRadius: "999px",
    color: "white",
    fontSize: "15px",
    outline: "none",
};