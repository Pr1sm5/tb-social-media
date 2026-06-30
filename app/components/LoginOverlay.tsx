"use client";

import { useState } from "react";
import { User } from "@/lib/types/user";
import TutorialOverlay from "@/app/components/TutorialOverlay";

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
        chooseLanguage: "Sprache ändern",
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
        chooseLanguage: "Change language",
        start: "Let's go",
        errorEmpty: "Please enter a username.",
        errorShort: "At least 2 characters.",
    },
};

export default function LoginOverlay({ onLogin }: Props) {
    const [step, setStep] = useState<"intro" | "tutorial" | "username">("intro");
    const [username, setUsername] = useState("");
    const [language, setLanguage] = useState<"de" | "en">("de");
    const [error, setError] = useState("");

    const t = LABELS[language];

    function handleSubmit() {
        const trimmed = username.trim();

        if (!trimmed) {
            setError(t.errorEmpty);
            return;
        }

        if (trimmed.length < 2) {
            setError(t.errorShort);
            return;
        }

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
            {step === "intro" && (
                <div style={welcomeScreenStyle}>
                    <div style={welcomeHeaderStyle}>
                        <div style={welcomeLogoStyle}>LOGO</div>

                        <LanguageSelector
                            language={language}
                            setLanguage={setLanguage}
                            label={t.chooseLanguage}
                            large
                        />
                    </div>

                    <div style={taglineStyle}>{t.tagline}</div>

                    <p style={welcomeTextStyle}>{t.introText}</p>

                    <p style={welcomeHintStyle}>{t.hint}</p>

                    <button
                        className="send-btn"
                        style={welcomeButtonStyle}
                        onClick={() => setStep("tutorial")}
                    >
                        {t.next}
                    </button>
                </div>
            )}

            {step === "tutorial" && (
                <TutorialOverlay
                    language={language}
                    setLanguage={setLanguage}
                    onBack={() => setStep("intro")}
                    onNext={() => setStep("username")}
                />
            )}

            {step === "username" && (
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <div style={logoStyle}>LOGO</div>

                        <LanguageSelector
                            language={language}
                            setLanguage={setLanguage}
                            label={t.chooseLanguage}
                        />
                    </div>

                    <div style={taglineStyle}>{t.tagline}</div>

                    <p style={labelStyle}>{t.chooseUsername}</p>

                    {username.trim().length >= 2 && (
                        <div
                            style={{
                                ...avatarPreviewStyle,
                                background: generateColor(username.trim()),
                            }}
                        >
                            {getInitials(username.trim())}
                        </div>
                    )}

                    <input
                        autoFocus
                        type="text"
                        placeholder={t.placeholder}
                        value={username}
                        maxLength={20}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError("");
                        }}
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
                </div>
            )}
        </div>
    );
}

function LanguageSelector({
                              language,
                              setLanguage,
                              label,
                              large = false,
                          }: {
    language: "de" | "en";
    setLanguage: (language: "de" | "en") => void;
    label: string;
    large?: boolean;
}) {
    return (
        <div style={large ? languageBoxStyle : languageBoxSmallStyle}>
            <div style={large ? languageLabelStyle : languageLabelSmallStyle}>{label}</div>

            <div style={languageButtonsStyle}>
                <button
                    style={{
                        ...(large ? languageButtonStyle : languageButtonSmallStyle),
                        ...(language === "de" ? languageButtonActiveStyle : {}),
                    }}
                    onClick={() => setLanguage("de")}
                    title="Deutsch"
                >
                    🇩🇪 Deutsch
                </button>

                <button
                    style={{
                        ...(large ? languageButtonStyle : languageButtonSmallStyle),
                        ...(language === "en" ? languageButtonActiveStyle : {}),
                    }}
                    onClick={() => setLanguage("en")}
                    title="English"
                >
                    🇬🇧 English
                </button>
            </div>
        </div>
    );
}

const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "#000",
    zIndex: 1000,
};

const welcomeScreenStyle: React.CSSProperties = {
    width: "100vw",
    minHeight: "100vh",
    background: "#000",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    textAlign: "center",
    padding: "48px",
};

const welcomeHeaderStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
};

const welcomeLogoStyle: React.CSSProperties = {
    fontSize: "72px",
    fontWeight: 800,
    color: "white",
    letterSpacing: "-3px",
    textAlign: "center",
};

const taglineStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#666",
    letterSpacing: "3px",
    textAlign: "center",
    textTransform: "uppercase",
};

const welcomeTextStyle: React.CSSProperties = {
    color: "#e5e5e5",
    fontSize: "24px",
    lineHeight: "1.55",
    margin: 0,
    maxWidth: "850px",
};

const welcomeHintStyle: React.CSSProperties = {
    color: "#cfcfcf",
    fontSize: "18px",
    background: "#111",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#333",
    borderRadius: "14px",
    padding: "18px 24px",
    margin: 0,
    maxWidth: "760px",
};

const welcomeButtonStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "320px",
    marginTop: "14px",
    fontSize: "18px",
    padding: "14px 24px",
    cursor: "pointer",
};

const languageBoxStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#333",
    borderRadius: "16px",
    background: "#111",
};

const languageBoxSmallStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
};

const languageLabelStyle: React.CSSProperties = {
    color: "#f2f2f2",
    fontSize: "16px",
    fontWeight: 700,
};

const languageLabelSmallStyle: React.CSSProperties = {
    color: "#bbb",
    fontSize: "13px",
    fontWeight: 600,
};

const languageButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
};

const languageButtonStyle: React.CSSProperties = {
    background: "transparent",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#444",
    borderRadius: "999px",
    cursor: "pointer",
    color: "#aaa",
    fontSize: "16px",
    padding: "10px 16px",
    transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
};

const languageButtonSmallStyle: React.CSSProperties = {
    background: "transparent",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#444",
    borderRadius: "999px",
    cursor: "pointer",
    color: "#aaa",
    fontSize: "13px",
    padding: "7px 10px",
    transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
};

const languageButtonActiveStyle: React.CSSProperties = {
    background: "#1d9bf0",
    borderColor: "#1d9bf0",
    color: "white",
};

const cardStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#0f0f0f",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#2f2f2f",
    borderRadius: "16px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
};

const cardHeaderStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
};

const logoStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: 700,
    color: "white",
    letterSpacing: "-1px",
    textAlign: "center",
};

const labelStyle: React.CSSProperties = {
    color: "#aaa",
    fontSize: "14px",
    margin: 0,
};

const avatarPreviewStyle: React.CSSProperties = {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: 700,
    color: "white",
    alignSelf: "center",
    transition: "background 0.3s ease",
};

const inputStyle: React.CSSProperties = {
    padding: "12px 14px",
    background: "#1a1a1a",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#333",
    borderRadius: "8px",
    color: "white",
    fontSize: "16px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
};

const errorStyle: React.CSSProperties = {
    color: "#ff6b6b",
    fontSize: "13px",
    margin: 0,
};
