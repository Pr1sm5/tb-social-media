"use client";

import "./globals.css";
import { useEffect, useState } from "react";

import Texteingabefeld from "./components/TextInputComponent";
import TextOutputComponent from "./components/TextOutputComponent";
import CommentComponent from "./components/CommentComponent";

import { Post, CreatePostInput } from "../lib/types/post";
import {PostComment, CreateCommentInput} from "@/lib/types/postComment";

export default function Page() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [comments, setComments] = useState<Record<string, PostComment[]>>({});
    const [openComments, setOpenComments] = useState<string | null>(null);

    // POSTS LADEN
    async function fetchPosts() {
        try {
            const res = await fetch("/api/posts");
            const data = await res.json();

            if (data.success) {
                setPosts(data.data);
            }
        } catch (err) {
            console.error("Fehler beim Laden der Posts:", err);
        }
    }

    // Beim ersten Render laden
    useEffect(() => {
        fetchPosts();
    }, []);

    // POST ERSTELLEN
    async function addPost(content: string) {
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: "123", // später aus Auth/User holen
                    content,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setPosts((prev) => [data.data, ...prev]);
            }
        } catch (err) {
            console.error("Fehler beim Erstellen:", err);
        }
    }

    // POST LÖSCHEN
    async function deletePost(postId: string) {
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (data.success) {
                setPosts((prev) =>
                    prev.filter((post) => post.postId !== postId)
                );
            }
        } catch (err) {
            console.error("Fehler beim Löschen:", err);
        }
    }

    // COMMENTS LADEN
    async function fetchComments(postId: string) {
        try {
            const res = await fetch(`/api/posts/${postId}/comments`);
            const data = await res.json();

            if (data.success) {
                setComments((prev) => ({
                    ...prev,
                    [postId]: data.data,
                }));
            }
        } catch (err) {
            console.error("Fehler beim Laden der Kommentare:", err);
        }
    }

    // COMMENT HINZUFÜGEN
    async function addComment(postId: string, content: string) {
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: "123",
                    content,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setComments((prev) => ({
                    ...prev,
                    [postId]: [data.data, ...(prev[postId] || [])],
                }));
            }
        } catch (err) {
            console.error("Fehler beim Kommentieren:", err);
        }
    }

    // COMMENTS TOGGLE
    async function toggleComments(postId: string) {
        if (openComments === postId) {
            setOpenComments(null);
            return;
        }

        setOpenComments(postId);

        if (!comments[postId]) {
            const res = await fetch(`/api/posts/${postId}/comments`);
            const data = await res.json();

            if (data.success) {
                setComments((prev) => ({
                    ...prev,
                    [postId]: data.data,
                }));
            }
        }
    }

    return (
        <>
            <header className="header">
                <div className="logo">
                    <h1>LOGO</h1>
                </div>

                <div className="header-nav">
                    <button>For you</button>
                    <button>Following</button>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search"
                        className="searchbar"
                    />
                </div>
            </header>

            <main>
                <div className="feed">

                    <section>
                        <Texteingabefeld onSend={addPost} />
                    </section>

                    <section>
                        {posts.map((post) => (
                            <div key={post.postId}>

                                <div
                                    onClick={() => toggleComments(post.postId)}
                                >
                                    <TextOutputComponent
                                        text={post.content}
                                        name="Kinky"
                                        username="Samed123"
                                        onDelete={() => deletePost(post.postId)}
                                    />
                                </div>

                                {openComments === post.postId && (
                                    <CommentComponent
                                        comments={comments[post.postId] || []}
                                        onAddComment={(text) =>
                                            addComment(post.postId, text)
                                        }
                                    />
                                )}

                            </div>
                        ))}
                    </section>

                </div>
            </main>
        </>
    );
}