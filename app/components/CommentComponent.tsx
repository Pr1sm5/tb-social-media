"use client";
import { useState } from "react";
import {PostComment} from "@/lib/types/postComment";

import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaTrash
} from "react-icons/fa";

type CommentProps = {
  comments: PostComment[];
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
};

export default function CommentComponent({
  comments,
  onAddComment,
  onDeleteComment,
}: CommentProps) {
  const [input, setInput] = useState("");

  

  return (
    <div style={containerStyle}>
      <div>
        {comments
  .filter(Boolean)
  .map((c) => (
    <div key={c.commentId} style={commentCard}>
      
      <div style={topRow}>
        <div style={avatar}>👤</div>

        <div>
          <div style={name}>User</div>
          <div style={handle}>@{c.userId}</div>
        </div>
      </div>

      <p style={text}>{c.content}</p>

      <div style={actionsStyle}>

  {/* COMMENT */}
  <button
    style={actionBtn}
    onClick={(e) => e.stopPropagation()}
  >
    💬
  </button>

  {/* LIKE */}
  <button
    style={actionBtn}
    onClick={(e) => e.stopPropagation()}
  >
    ❤️
  </button>

  {/* DELETE */}
  <button
    style={actionBtn}
    onClick={(e) => {
      e.stopPropagation();
      onDeleteComment(c.commentId);
    }}
>
    🗑
  </button>

</div>

    </div>
  ))
}
      </div>

      <div style={inputRowStyle}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a comment..."
          style={inputStyle}
        />

        <button
          onClick={() => {
            if (!input.trim()) return;
            onAddComment(input);
            setInput("");
          }}
          style={buttonStyle}
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

const commentStyle: React.CSSProperties = {
  color: "#bbb",
  fontSize: "14px",
  margin: "4px 0",
};

const inputRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px",
  background: "#111",
  border: "1px solid #333",
  color: "white",
  borderRadius: "8px",
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 12px",
  background: "#222",
  color: "white",
  border: "1px solid #444",
  borderRadius: "8px",
  cursor: "pointer",
};

const actionsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  marginTop: "5px",
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

const name: React.CSSProperties = {
  fontWeight: 600,
  color: "white",
};

const handle: React.CSSProperties = {
  fontSize: "12px",
  color: "#888",
};

const text: React.CSSProperties = {
  color: "#ddd",
  margin: 0,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  marginTop: "5px",
};

const actionBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#888",
  cursor: "pointer",
};