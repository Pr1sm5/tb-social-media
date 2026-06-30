// components/InactivityWarning.tsx
"use client";

import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import {useUser} from "@/hooks/useUser"

const TEXT = {
    de: {
        title: "Bist du noch da?",
        body: "Du wirst in 1 Minute automatisch ausgeloggt, falls du nicht reagierst.",
        button: "Ich bin noch da",
    },
    en: {
        title: "Are you still there?",
        body: "You will be automatically logged out in 1 minute if you don't respond.",
        button: "I'm still here",
    },
} as const;

export function InactivityWarning() {
    const { user, ready, logout, setLanguage } = useUser();

    const lang = user?.language === "en" ? "en" : "de";
    const t = TEXT[lang];

    const { showWarning, stayActive } = useInactivityLogout({
        warningAfterMs: 1 * 60 * 1000, // 10 Minuten
        logoutAfterWarningMs: 1 * 60 * 1000, // + 1 Minute
        logoutEndpoint: "/api/auth/logout",
        isAuthenticated: ready && !!user,
        onLogout: () => {
            logout()
        },
    });

    if (!showWarning) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    background: "linear-gradient(135deg, rgba(25,25,25,0.98), rgba(40,40,40,0.98))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderTop: "4px solid #1d9bf0",
                    borderRadius: "16px",
                    padding: "28px 32px",
                    maxWidth: "360px",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.45), 0 0 20px rgba(29,155,240,0.15)",
                    backdropFilter: "blur(10px)",
                }}
            >
                <h2 style={{ marginBottom: "10px", fontSize: "20px", fontWeight: 800, color: "white" }}>
                    {t.title}
                </h2>
                <p style={{ marginBottom: "22px", color: "#d8d8d8", fontSize: "14px", lineHeight: 1.5 }}>
                    {t.body}
                </p>
                <button
                    onClick={stayActive}
                    className="post-input-glow"
                    style={{
                        padding: "10px 28px",
                        borderRadius: "999px",
                        border: "1px solid #333",
                        backgroundColor: "#1d9bf0",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "14px",
                        transition: "background 0.15s ease, border-color 0.15s ease",
                    }}
                >
                    {t.button}
                </button>
            </div>
        </div>
    );
}