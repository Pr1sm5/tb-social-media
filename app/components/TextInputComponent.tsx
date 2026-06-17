"use client";

import { useState } from "react";

export default function Texteingabefeld({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  function handleSend() {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
      <div style={containerStyle}>
        <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="What's up?"
            style={inputStyle}
            className="text-input"
        />
        <button onClick={handleSend} className="send-btn">
          Send
        </button>
      </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "20px",
  borderBottom: "1px solid #2f2f2f",
  width: "100%",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  color: "white",
  border: "none",
  fontSize: "20px",
  outline: "none",
};