"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

type HeaderProps = {
    showBack?: boolean;
};

export default function Header({ showBack = false }: HeaderProps) {
    const { user, logout } = useUser();
    const router = useRouter();

    function handleLogout() {
        logout();
        router.push("/");  // ← immer zur Main Page
    }


    return (
        <header className="header">
            {showBack ? (
                <button
                    onClick={() => router.back()}
                    style={pillBtnStyle}
                >
                    ← Back
                </button>
            ) : (
                <div className="logo"><h1>LOGO</h1></div>
            )}

            {/* For you / Following als Pill-Buttons */}
            <div style={navStyle}>
                <button style={pillBtnStyle}>For you</button>
                <button style={pillBtnStyle}>Following</button>
            </div>

            {user && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
                    <div style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        background: user.color, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "13px", fontWeight: 700,
                        color: "white", flexShrink: 0,
                    }}>
                        {user.initials}
                    </div>
                    <button style={pillBtnStyle} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
}

const pillBtnStyle: React.CSSProperties = {
    padding: "6px 18px",
    borderRadius: "999px",
    border: "1px solid #333",
    background: "transparent",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
    boxShadow: "0 0 20px rgba(230,0,0,0.2)",
};

const navStyle: React.CSSProperties = {
    justifySelf: "center",
    display: "flex",
    gap: "8px",
};