"use client";

import "../globals.css";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Header from "../components/Header";
import { READ_MORE_CONTENT, ReadMoreBlock } from "@/lib/content/readMoreContent";

function renderBlock(block: ReadMoreBlock, index: number) {
    switch (block.type) {
        case "heading":
            return (
                <h2 key={index} style={headingStyle}>
                    {block.text}
                </h2>
            );
        case "paragraph":
            return (
                <p key={index} style={paragraphStyle}>
                    {block.text}
                </p>
            );
        case "list":
            return (
                <ul key={index} style={listStyle}>
                    {block.items.map((item, i) => (
                        <li key={i} style={listItemStyle}>{item}</li>
                    ))}
                </ul>
            );
        case "quote":
            return (
                <blockquote key={index} style={quoteStyle}>
                    {block.text}
                </blockquote>
            );
    }
}

export default function ReadMorePage() {
    const router = useRouter();
    const { user, setLanguage } = useUser();

    const lang = user?.language === "en" ? "en" : "de";
    const content = READ_MORE_CONTENT[lang];

    return (
        <>
            <Header showBack />

            <main style={{ paddingBottom: "60px" }}>
                <div className="feed">
                    <article style={articleStyle}>

                        <div style={topBarStyle}>
                            <button
                                className="send-btn"
                                style={pillBtnStyle}
                                onClick={() => router.back()}
                            >
                                {lang === "en" ? "← Back" : "← Zurück"}
                            </button>

                            {setLanguage && (
                                <div style={langSwitchStyle}>
                                    <button
                                        style={langBtnStyle(lang === "de")}
                                        onClick={() => setLanguage("de")}
                                    >
                                        DE
                                    </button>
                                    <button
                                        style={langBtnStyle(lang === "en")}
                                        onClick={() => setLanguage("en")}
                                    >
                                        EN
                                    </button>
                                </div>
                            )}
                        </div>

                        <h1 style={titleStyle}>{content.pageTitle}</h1>

                        {content.blocks.map(renderBlock)}

                        <div style={referencesBoxStyle}>
                            <h3 style={referencesHeadingStyle}>
                                {lang === "en" ? "References" : "Quellen"}
                            </h3>
                            <ol style={referencesListStyle}>
                                {content.references.map((ref, i) => (
                                    <li key={i} style={referenceItemStyle}>{ref}</li>
                                ))}
                            </ol>
                        </div>

                    </article>
                </div>
            </main>
        </>
    );
}

const articleStyle: React.CSSProperties = {
    padding: "28px 24px 60px",
    color: "white",
};

const topBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
};

const langSwitchStyle: React.CSSProperties = {
    display: "flex",
    border: "1px solid #333",
    borderRadius: "999px",
    overflow: "hidden",
};

const langBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    background: active ? "#1d9bf0" : "transparent",
    color: "white",
});

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

const titleStyle: React.CSSProperties = {
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: 800,
    marginBottom: "20px",
    lineHeight: 1.25,
};

const headingStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1d9bf0",
    marginTop: "36px",
    marginBottom: "12px",
};

const paragraphStyle: React.CSSProperties = {
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#d8d8d8",
    marginBottom: "14px",
};

const listStyle: React.CSSProperties = {
    margin: "0 0 14px 0",
    paddingLeft: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
};

const listItemStyle: React.CSSProperties = {
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#d8d8d8",
};

const quoteStyle: React.CSSProperties = {
    margin: "18px 0",
    padding: "14px 18px",
    borderLeft: "4px solid #1d9bf0",
    background: "rgba(29,155,240,0.08)",
    borderRadius: "0 12px 12px 0",
    fontStyle: "italic",
    fontSize: "16px",
    color: "white",
};

const referencesBoxStyle: React.CSSProperties = {
    marginTop: "44px",
    paddingTop: "20px",
    borderTop: "1px solid #2f2f2f",
};

const referencesHeadingStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 700,
    color: "#888",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
};

const referencesListStyle: React.CSSProperties = {
    paddingLeft: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
};

const referenceItemStyle: React.CSSProperties = {
    fontSize: "12px",
    lineHeight: 1.6,
    color: "#777",
};