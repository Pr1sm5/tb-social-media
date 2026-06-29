"use client";

import { useState } from "react";
import { User } from "@/lib/types/user";

type Props = {
    onLogin: (user: User) => void;
};

function generateColor(username: string): string {
    const colors = [
        "#1d9bf0", "#7856ff", "#ff6b6b", "#00ba7c",
        "#ff9f1c", "#e040fb", "#00bcd4", "#ff5722",
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function getInitials(username: string): string {
    return username.slice(0, 2).toUpperCase();
}

const LABELS = {
    de: {
        tagline: "Live Opinion Generated Online",
        introText: "Willkommen bei LOGO — einer Social-Media-Platform wie jede andere. Erstell einen Post, sieh wie andere reagieren, und entdecke was wirklich hinter den Kommentaren steckt.",
        hint: "⚠️ Was du hier erlebst, ist kein normales soziales Netzwerk.",
        next: "Weiter",
        chooseUsername: "Wähle einen Benutzernamen",
        placeholder: "z.B. MaxMustermann",
        chooseLanguage: "Wähle deine Sprache",
        start: "Los geht's",
        errorEmpty: "Bitte gib einen Benutzernamen ein.",
        errorShort: "Mindestens 2 Zeichen.",
    },
    en: {
        tagline: "Live Opinion Generated Online",
        introText: "Welcome to LOGO — a social media platform like any other. Create a post, see how others react, and discover what's really behind the comments.",
        hint: "⚠️ What you experience here is not a normal social network.",
        next: "Continue",
        chooseUsername: "Choose a username",
        placeholder: "e.g. JohnDoe",
        chooseLanguage: "Choose your language",
        start: "Let's go",
        errorEmpty: "Please enter a username.",
        errorShort: "At least 2 characters.",
    },
};

export default function LoginOverlay({ onLogin }: Props) {
    const [step, setStep] = useState<"intro" | "username">("intro");
    const [username, setUsername] = useState("");
    const [language, setLanguage] = useState<"de" | "en">("de");
    const [error, setError] = useState("");

    const t = LABELS[language];

    function handleSubmit() {
        const trimmed = username.trim();
        if (!trimmed) { setError(t.errorEmpty); return; }
        if (trimmed.length < 2) { setError(t.errorShort); return; }

        onLogin({
            username: trimmed,
            initials: getInitials(trimmed),
            color: generateColor(trimmed),
            language,
        });
        window.location.reload();
    }

    return (
        <div style={overlayStyle}>
            <div style={cardStyle}>

                {/* Logo + Sprache */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                    <div style={logoStyle}>LOGO</div>
                    <div style={flagRowStyle}>
                        <button
                            style={{ ...flagBtnStyle, opacity: language === "de" ? 1 : 0.35 }}
                            onClick={() => setLanguage("de")}
                            title="Deutsch"
                        >
                            🇩🇪
                        </button>
                        <button
                            style={{ ...flagBtnStyle, opacity: language === "en" ? 1 : 0.35 }}
                            onClick={() => setLanguage("en")}
                            title="English"
                        >
                            🇬🇧
                        </button>
                    </div>
                </div>

                <div style={taglineStyle}>{t.tagline}</div>

                {step === "intro" && (
                    <>
                        <p style={introTextStyle}>{t.introText}</p>
                        <p style={hintStyle}>{t.hint}</p>
                        <button
                            className="send-btn"
                            style={{ width: "100%", marginTop: "8px" }}
                            onClick={() => setStep("username")}
                        >
                            {t.next}
                        </button>
                    </>
                )}

                {step === "username" && (
                    <>
                        <p style={labelStyle}>{t.chooseUsername}</p>

                        {username.trim().length >= 2 && (
                            <div style={{
                                ...avatarPreviewStyle,
                                background: generateColor(username.trim()),
                            }}>
                                {getInitials(username.trim())}
                            </div>
                        )}

                        <input
                            autoFocus
                            type="text"
                            placeholder={t.placeholder}
                            value={username}
                            maxLength={20}
                            onChange={(e) => { setUsername(e.target.value); setError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            style={inputStyle}
                            className="text-input"
                        />

                        {error && <p style={errorStyle}>{error}</p>}

                        <button
                            className="send-btn"
                            style={{ width: "100%", marginTop: "8px" }}
                            onClick={handleSubmit}
                        >
                            {t.start}
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}

const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0,
    background: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
};

const cardStyle: React.CSSProperties = {
    background: "#0f0f0f",
    border: "1px solid #2f2f2f",
    borderRadius: "16px",
    padding: "40px 36px",
    width: "100%", maxWidth: "420px",
    display: "flex", flexDirection: "column", gap: "16px",
};

const logoStyle: React.CSSProperties = {
    fontSize: "32px", fontWeight: 700, color: "white",
    letterSpacing: "-1px", textAlign: "center",
};

const flagRowStyle: React.CSSProperties = {
    display: "flex", gap: "6px", alignItems: "center",
};

const flagBtnStyle: React.CSSProperties = {
    background: "none", border: "none", cursor: "pointer",
    fontSize: "22px", padding: "2px",
    transition: "opacity 0.15s ease",
    lineHeight: 1,
};

const taglineStyle: React.CSSProperties = {
    fontSize: "11px", color: "#555", letterSpacing: "2px",
    textAlign: "center", textTransform: "uppercase", marginTop: "-8px",
};

const introTextStyle: React.CSSProperties = {
    color: "#ccc", fontSize: "15px", lineHeight: "1.6", margin: 0,
};

const hintStyle: React.CSSProperties = {
    color: "#888", fontSize: "13px",
    background: "#1a1a1a", border: "1px solid #2f2f2f",
    borderRadius: "8px", padding: "10px 14px", margin: 0,
};

const labelStyle: React.CSSProperties = {
    color: "#aaa", fontSize: "14px", margin: 0,
};

const avatarPreviewStyle: React.CSSProperties = {
    width: "64px", height: "64px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "22px", fontWeight: 700, color: "white",
    alignSelf: "center", transition: "background 0.3s ease",
};

const inputStyle: React.CSSProperties = {
    padding: "12px 14px", background: "#1a1a1a",
    border: "1px solid #333", borderRadius: "8px",
    color: "white", fontSize: "16px", outline: "none",
    width: "100%", boxSizing: "border-box",
};

const errorStyle: React.CSSProperties = {
    color: "#ff6b6b", fontSize: "13px", margin: 0,
};