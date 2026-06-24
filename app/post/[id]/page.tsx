"use client";

import { useEffect, useRef, useState } from "react";
import { Post } from "@/lib/types/post";
import { PostComment } from "@/lib/types/postComment";
import TextOutputComponent from "@/app/components/TextOutputComponent";
import CommentComponent from "@/app/components/CommentComponent";
import LoginOverlay from "@/app/components/LoginOverlay";
import Header from "@/app/components/Header";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import InfoBox from "@/app/components/InfoBox";

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

type InfoBoxItem = {
    text: string;
    type?: "info" | "error" | "success" | "warning";
};

export default function PostPage() {
    const params = useParams();
    const { user, login, ready } = useUser();

    const id = params?.id as string | undefined;

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [visibleComments, setVisibleComments] = useState<PostComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentInput, setCommentInput] = useState("");
    const [infoBoxes, setInfoBoxes] = useState<InfoBoxItem[]>([]);
    const [footerShake, setFooterShake] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    const hasStarted = useRef(false);
    const prevVisibleCount = useRef(0);
    const commentsRef = useRef<PostComment[]>([]);
    commentsRef.current = comments;

    // Footer schütteln wenn neuer Bot-Kommentar reinkommt
    useEffect(() => {
        if (visibleComments.length > prevVisibleCount.current && prevVisibleCount.current > 0) {
            setFooterShake(true);
            setTimeout(() => setFooterShake(false), 600);
        }
        prevVisibleCount.current = visibleComments.length;
    }, [visibleComments]);

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

    function startInfoSequence() {
        if (hasStarted.current) return;
        hasStarted.current = true;
        setInfoBoxes([]);

        const events: { delay: number; data: InfoBoxItem }[] = [
            { delay: 15000, data: { text: "Durch das Erstellen des Kommentars wurde etwas ausgelöst.", type: "warning" } },
            { delay: 25000, data: { text: "Mehrere Personen kommentieren unter deinem Post.", type: "info" } },
            { delay: 35000, data: { text: "Die Aktivität steigt ungewöhnlich schnell an.", type: "error" } },
            { delay: 45000, data: { text: "Die Aktivität steigt ungewöhnlich schnell an.", type: "success" } },
        ];

        events.forEach(({ delay, data }) => {
            setTimeout(() => setInfoBoxes(prev => [...prev, data]), delay);
        });
    }

    async function loadData(postId: string) {
        setLoading(true);
        try {
            const [postRes, commentRes] = await Promise.all([
                fetch(`/api/posts/${postId}`),
                fetch(`/api/posts/${postId}/comments`),
            ]);
            startInfoSequence();

            const postData = await postRes.json();
            const commentData = await commentRes.json();

            if (postData.success) {
                setPost(postData.data);
                // Banner nur bei neuem Post anzeigen
                if (isNewPost(postData.data.timestamp)) {
                    setShowBanner(true);
                    setTimeout(() => setShowBanner(false), 4000);
                }
            }
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

            <div className="info-container">
                {infoBoxes.map((box, index) => (
                    <InfoBox
                        key={`${box.text}-${box.type}-${index}`}
                        text={box.text}
                        type={box.type}
                    />
                ))}
            </div>

            {/* Sticky Footer — mit Shake-Animation bei neuem Kommentar */}
            <div style={footerStyle} className={footerShake ? "footer-shake" : ""}>
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
                        className="text-input comment-input-glow"
                    />
                    <button
                        className="send-btn"
                        style={pillBtnStyle}
                        onClick={() => addComment(commentInput)}
                    >
                        Post
                    </button>
                </div>
            </div>
        </>
    );
}

const bannerStyle: React.CSSProperties = {
    position: "fixed",
    top: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1d9bf0",
    color: "white",
    padding: "10px 20px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 500,
    zIndex: 200,
    whiteSpace: "nowrap",
    boxShadow: "0 4px 20px rgba(29,155,240,0.4)",
};

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

const pillBtnStyle: React.CSSProperties = {
    padding: "6px 18px",
    borderRadius: "999px",
    border: "1px solid #333",
    background: "transparent",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
};