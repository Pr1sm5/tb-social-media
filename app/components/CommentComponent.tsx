"use client";

import { useState } from "react";
import { PostComment } from "@/lib/types/postComment";

function generateColor(username: string): string {
    const colors = ["#1d9bf0","#7856ff","#ff6b6b","#00ba7c","#ff9f1c","#e040fb","#00bcd4","#ff5722"];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function InitialsAvatar({ username, size = 36 }: { username: string; size?: number }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: generateColor(username),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.35, fontWeight: 700, color: "white", flexShrink: 0,
        }}>
            {username.slice(0, 2).toUpperCase()}
        </div>
    );
}

function highlightMentions(text: string) {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) =>
        part.startsWith("@")
            ? <span key={i} style={{ color: "#1d9bf0", fontWeight: 600 }}>{part}</span>
            : part
    );
}

type CommentProps = {
    comments: PostComment[];
    onAddComment: (text: string) => void;
    onDeleteComment: (commentId: string) => void;
    currentUsername?: string;
    hideInput?: boolean; // neu — versteckt die Eingabezeile wenn sticky footer genutzt wird
};

export default function CommentComponent({ comments, onAddComment, onDeleteComment, currentUsername, hideInput }: CommentProps) {
    const [input, setInput] = useState("");

    return (
        <div style={containerStyle}>
            <div>
                {comments.filter(Boolean).map((c) => (
                    <div key={c.commentId} style={commentCard} className="comment-card comment-appear">
                        <div style={topRow}>
                            <InitialsAvatar username={c.userId} />
                            <div>
                                <div style={name}>{c.userId}</div>
                                <div style={handle}>@{c.userId}</div>
                            </div>
                        </div>

                        <p style={text}>{highlightMentions(c.content)}</p>

                        <div style={actionsStyle}>
                            <button className="icon-btn comment" onClick={(e) => e.stopPropagation()}>💬</button>
                            <button className="icon-btn like" onClick={(e) => e.stopPropagation()}>❤️</button>
                            <button
                                className="icon-btn delete"
                                onClick={(e) => { e.stopPropagation(); onDeleteComment(c.commentId); }}
                            >🗑</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Eingabe nur anzeigen wenn hideInput nicht gesetzt ist */}
            {!hideInput && (
                <div style={inputRowStyle}>
                    {currentUsername && <InitialsAvatar username={currentUsername} size={32} />}
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && input.trim() && (onAddComment(input), setInput(""))}
                        placeholder="Write a comment..."
                        style={inputStyle}
                        className="text-input"
                    />
                    <button
                        className="send-btn"
                        style={{ padding: "8px 14px", fontSize: "14px" }}
                        onClick={() => { if (!input.trim()) return; onAddComment(input); setInput(""); }}
                    >
                        Post
                    </button>
                </div>
            )}
        </div>
    );
}

const containerStyle: React.CSSProperties = { padding: "10px 0", display: "flex", flexDirection: "column", gap: "10px" };
const inputRowStyle: React.CSSProperties  = { display: "flex", gap: "8px", padding: "8px 12px", alignItems: "center" };
const inputStyle: React.CSSProperties     = { flex: 1, padding: "8px", background: "#111", border: "1px solid #333", color: "white", borderRadius: "8px" };
const commentCard: React.CSSProperties    = { padding: "12px", borderBottom: "1px solid #2a2a2a", display: "flex", flexDirection: "column", gap: "8px", marginLeft: "40px" };
const topRow: React.CSSProperties         = { display: "flex", alignItems: "center", gap: "10px" };
const name: React.CSSProperties           = { fontWeight: 600, color: "white" };
const handle: React.CSSProperties         = { fontSize: "12px", color: "#888" };
const text: React.CSSProperties           = { color: "#ddd", margin: 0 };
const actionsStyle: React.CSSProperties   = { display: "flex", gap: "4px", marginTop: "5px" };