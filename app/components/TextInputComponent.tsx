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
        placeholder="Was passiert?"
        style={inputStyle}
      />

      <button onClick={handleSend} style={buttonStyle}>
        Senden
      </button>
    </div>
  );
}

//CSS
const containerStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  justifyContent: "center",
  marginTop: "20px",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "16px",
  border: "2px solid #ccc",
  borderRadius: "10px",
  outline: "none",
  width: "300px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#1d9bf0",
  color: "white",
  fontWeight: "bold",
};