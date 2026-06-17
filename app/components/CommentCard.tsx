"use client";

import { PostComment } from "@/lib/types/postComment";
import { FaHeart, FaRegHeart, FaRegComment, FaTrash } from 'react-icons/fa';
import { useState } from "react";

type Props = {
    comment: PostComment;
    onDelete?: () => void;
};

export default function CommentCard({ comment, onDelete }: Props) {
    const [liked, setLiked] = useState(false);

    return (
        <div style={containerStyle}>
            <div style={topRow}>
                <div style={avatar}>👤</div>

                <div>
                    <div style={name}>@{comment.userId}</div>
                    <div style={handle}>@{comment.userId}</div>
                </div>
            </div>

            <p style={text}>{comment.content}</p>

            <div style={actions}>
                <button style={btn}>
                    <FaRegComment />
                </button>

                <button
                    style={{ ...btn, color: liked ? "#f91880" : "#888" }}
                    onClick={() => setLiked(!liked)}
                >
                    {liked ? <FaHeart /> : <FaRegHeart />}
                </button>

                <button
                    style={{ ...btn, color: "#888" }}
                    onClick={onDelete}
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
}

const containerStyle: React.CSSProperties = {
    padding: "12px",
    borderBottom: "1px solid #2a2a2a",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginLeft: "40px", // 👈 wichtig: Kommentar eingerückt
};

const topRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
};

const avatar: React.CSSProperties = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const name: React.CSSProperties = {
    fontWeight: 600,
    color: "white",
};

const handle: React.CSSProperties = {
    fontSize: "12px",
    color: "#888",
};

const text: React.CSSProperties = {
    color: "#ddd",
    margin: 0,
};

const actions: React.CSSProperties = {
    display: "flex",
    gap: "20px",
    marginTop: "5px",
};

const btn: React.CSSProperties = {
    background: "transparent",
    border: "none",
    color: "#888",
    cursor: "pointer",
};