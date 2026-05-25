"use client";
import { useState } from "react";

type CommentProps = {
  comments: string[];
  onAddComment: (text: string) => void;
};

export default function CommentComponent({
  comments,
  onAddComment,
}: CommentProps) {
  const [input, setInput] = useState("");

  return (
    <div style={containerStyle}>
      <div>
        {comments.map((c, i) => (
          <p key={i} style={commentStyle}>
            💬 {c}
          </p>
        ))}
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