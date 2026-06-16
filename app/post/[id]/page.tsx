"use client";

import { useEffect, useState } from "react";
import { Post } from "@/lib/types/post";
import { PostComment } from "@/lib/types/postComment";
import TextOutputComponent from "@/app/components/TextOutputComponent";
import CommentComponent from "@/app/components/CommentComponent";
import { useParams, useRouter } from "next/navigation";

export default function PostPage() {
    const params = useParams();
    const router = useRouter();

    const id = params?.id as string | undefined;

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        loadData(id);
    }, [id]);

    async function loadData(postId: string) {
        setLoading(true);

        try {
            const [postRes, commentRes] = await Promise.all([
                fetch(`/api/posts/${postId}`),
                fetch(`/api/posts/${postId}/comments`)
            ]);

            const postData = await postRes.json();
            const commentData = await commentRes.json();

            console.log("POST RESPONSE:", postData);
            console.log("COMMENT RESPONSE:", commentData);

            if (postData.success) {
                setPost(postData.data);
            }

            if (commentData.success) {
                setComments(commentData.data);
            }

        } catch (err) {
            console.error("ERROR loading post:", err);
        } finally {
            setLoading(false);
        }
    }

    async function addComment(text: string) {
        const res = await fetch(`/api/posts/${id}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: "123",
                content: text,
            }),
        });

        const data = await res.json();

        if (data.success) {
            setComments((prev) => [data.data, ...prev]);
        }
    }

    async function deleteComment(commentId: string) {
        const res = await fetch(`/api/posts/comments/${commentId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            console.error("DELETE FAILED");
            return;
        }

        
        setComments((prev) =>
            prev.filter((c) => c.commentId !== commentId)
        );
    }

    if (loading || !post) {
        return <div>Loading...</div>;
    }

    return (
        <main>
            <button onClick={() => router.back()}>
                ← Back
            </button>

            <TextOutputComponent
                text={post.content}
                name="Kinky"
                username="Samed123"
                onDelete={() => {}}
            />

            <CommentComponent
                comments={comments}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
            />
        </main>
    );
}