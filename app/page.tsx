"use client";

import "./globals.css";
import { useState } from "react";

import Texteingabefeld from "./components/TextInputComponent";
import TextOutputComponent from "./components/TextOutputComponent";
import CommentComponent from "./components/CommentComponent";


export default function Page() {
    type Post = {
    text: string;
    comments: string[];
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [openComments, setOpenComments] = useState<number | null>(null);

  function addPost(text: string) {
  setPosts([{ text, comments: [] }, ...posts]);
}

  function deletePost(index: number) {
    setPosts(posts.filter((_, i) => i !== index));
  }

  function addComment(index: number, text: string) {
  setPosts((prev) =>
    prev.map((p, i) =>
      i === index
        ? { ...p, comments: [text, ...p.comments] }
        : p
    )
  );
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
          {posts.map((post, i) => (
            <div key={i}>
              <div
                onClick={() =>
                  setOpenComments(openComments === i ? null : i)
                }
              >
                <TextOutputComponent
                  text={post.text}
                  name="Kinky"
                  username="Samed123"
                  onDelete={() => deletePost(i)}
                />
              </div>

              {openComments === i && (
                <CommentComponent
                  comments={post.comments}
                  onAddComment={(text) => addComment(i, text)}
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