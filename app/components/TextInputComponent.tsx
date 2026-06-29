"use client";

import { useState, useEffect, useRef } from "react";

export default function Texteingabefeld({ onSend }: { onSend: (text: string) => void }) {
    const [text, setText] = useState("");
    const [glowing, setGlowing] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setGlowing(false), 100000);
        return () => clearTimeout(timer);
    }, []);

    // Höhe automatisch anpassen
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [text]);

    function handleSend() {
        if (!text.trim()) return;
        onSend(text);
        setText("");
        // Höhe zurücksetzen
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    }

    return (
        <div style={containerStyle} className={glowing ? "post-input-glow" : ""}>
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    // Enter ohne Shift schickt ab, Shift+Enter macht Zeilenumbruch
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                onFocus={() => setGlowing(true)}
                placeholder="What's up?"
                rows={1}
                style={textareaStyle}
                className="text-input"
            />
            <button
                onClick={handleSend}
                className="send-btn"
                style = {pillBtnStyle}
            >
                Send
            </button>
        </div>
    );
}

const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "20px",
    borderBottom: "1px solid #2f2f2f",
    width: "100%",
    borderRadius: "4px",
    transition: "box-shadow 0.3s ease",
};

const textareaStyle: React.CSSProperties = {
    flex: 1,
    background: "transparent",
    color: "white",
    border: "none",
    fontSize: "20px",
    outline: "none",
    resize: "none",
    overflow: "hidden",
    lineHeight: "1.5",
    fontFamily: "inherit",
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