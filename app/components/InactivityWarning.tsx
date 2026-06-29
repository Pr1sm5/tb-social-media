// components/InactivityWarning.tsx
"use client";

import { useInactivityLogout } from "@/hooks/useInactivityLogout";

export function InactivityWarning() {
    const { showWarning, stayActive } = useInactivityLogout({
        warningAfterMs: 10 * 60 * 1000, // 10 Minuten
        logoutAfterWarningMs: 60 * 1000, // + 1 Minute
        logoutEndpoint: "/api/auth/logout",
        onLogout: () => {
            window.location.href = "/login";
        },
    });

    if (!showWarning) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "24px 32px",
                    maxWidth: "360px",
                    textAlign: "center",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                }}
            >
                <h2 style={{ marginBottom: "8px" }}>Bist du noch da?</h2>
                <p style={{ marginBottom: "20px", color: "#555" }}>
                    Du wirst in 1 Minute automatisch ausgeloggt, falls du nicht reagierst.
                </p>
                <button
                    onClick={stayActive}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#2563eb",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Ich bin noch da
                </button>
            </div>
        </div>
    );
}