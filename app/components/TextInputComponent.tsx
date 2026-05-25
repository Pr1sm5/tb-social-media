"use client";

import { useState } from "react";

export default function Texteingabefeld({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
//Button logik
  function handleSend() {
    if (!text.trim()) return;

    onSend(text);
    setText("");
  }
//Button
  return (
    <div style={containerStyle}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's up?'"
        style={inputStyle}
      />

      <button onClick={handleSend} style={buttonStyle}>
        Send
      </button>
    </div>
  );
}

//CSS
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

const buttonStyle: React.CSSProperties = {
  padding: "10px 18px",

  border: "none",
  borderRadius: "999px",

  backgroundColor: "#1d9bf0",
  color: "white",

  fontWeight: "bold",

  cursor: "pointer",
};