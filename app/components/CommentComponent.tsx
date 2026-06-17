"use client";

import { useState } from "react";
import { PostComment } from "@/lib/types/postComment";

type CommentProps = {
  comments: PostComment[];
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
};

export default function CommentComponent({ comments, onAddComment, onDeleteComment }: CommentProps) {
  const [input, setInput] = useState("");

  return (
      <div style={containerStyle}>

        <div>
          {comments.filter(Boolean).map((c) => (
              <div key={c.commentId} style={commentCard} className="comment-card comment-appear">

                <div style={topRow}>
                  <div style={avatar} className="avatar">👤</div>
                  <div>
                    <div style={name}>{c.userId}</div>
                    <div style={handle}>{c.userId}</div>
                  </div>
                </div>

                <p style={text}>{c.content}</p>

                <div style={actionsStyle}>
                  <button className="icon-btn comment" onClick={(e) => e.stopPropagation()}>💬</button>
                  <button className="icon-btn like"    onClick={(e) => e.stopPropagation()}>❤️</button>
                  <button
                      className="icon-btn delete"
                      onClick={(e) => { e.stopPropagation(); onDeleteComment(c.commentId); }}
                  >
                    🗑
                  </button>
                </div>

              </div>
          ))}
        </div>

        <div style={inputRowStyle}>
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

      </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: "10px 0",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const inputRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  padding: "8px 12px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px",
  background: "#111",
  border: "1px solid #333",
  color: "white",
  borderRadius: "8px",
};

const commentCard: React.CSSProperties = {
  padding: "12px",
  borderBottom: "1px solid #2a2a2a",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginLeft: "40px",
};

const topRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const avatar: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "#333",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const name: React.CSSProperties = { fontWeight: 600, color: "white" };
const handle: React.CSSProperties = { fontSize: "12px", color: "#888" };
const text: React.CSSProperties   = { color: "#ddd", margin: 0 };

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "4px",
  marginTop: "5px",
};