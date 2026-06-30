import { ReactNode } from "react";

type TextOutputProps = {
    text: string;
    name: string;
    username: string;
    onDelete: () => void;
    avatarComponent?: ReactNode;
    commentCount?: number;
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

function highlightMentions(text: string) {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) =>
        part.startsWith("@")
            ? <span key={i} style={{ color: "#1d9bf0", fontWeight: 600 }}>{part}</span>
            : part
    );
}

function InitialsAvatar({ username }: { username: string }) {
    return (
        <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: generateColor(username),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            fontWeight: 700,
            color: "white",
            flexShrink: 0,
        }}>
            {username.slice(0, 2).toUpperCase()}
        </div>
    );
}

export default function TextOutputComponent({ text, name, username, onDelete, avatarComponent, commentCount = 0 }: TextOutputProps) {
    return (
        <div style={containerStyle} className="post-card">

            <div style={topRowStyle}>
                {avatarComponent ?? <InitialsAvatar username={username} />}
                <div style={userBlockStyle}>
                    <div style={nameStyle}>{name}</div>
                    <div style={handleStyle}>@{username}</div>
                </div>
            </div>

            <p style={textStyle}>{highlightMentions(text)}</p>

            <div style={actionsStyle}>
                <button className="icon-btn comment">
                    💬 {commentCount > 0 && <span style={countStyle}>{commentCount}</span>}
                </button>
            </div>

        </div>
    );
}

const containerStyle: React.CSSProperties = {
    width: "100%",
    padding: "18px 20px",
    borderBottom: "1px solid #2f2f2f",
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
};

const topRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
};

const userBlockStyle: React.CSSProperties = { display: "flex", flexDirection: "column" };
const nameStyle: React.CSSProperties      = { color: "white", fontWeight: 600 };
const handleStyle: React.CSSProperties    = { color: "#888", fontSize: "13px" };
const textStyle: React.CSSProperties      = { margin: 0 };

const actionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "4px",
    marginTop: "10px",
};

const countStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#888",
    marginLeft: "2px",
};