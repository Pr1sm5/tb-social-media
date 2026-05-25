"use client";

import "./globals.css";
import { useState } from "react";

import Texteingabefeld from "./components/TextInputComponent";
import TextOutputComponent from "./components/TextOutputComponent";

export default function Page() {
  const [posts, setPosts] = useState<string[]>([]);

  function addPost(text: string) {
    setPosts([text, ...posts]);
  }

  function deletePost(index: number) {
    setPosts(posts.filter((_, i) => i !== index));
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
            <TextOutputComponent 
              key={i} 
              text={post}
              name="Kinky"
              username="Samed123"
              onDelete={() => deletePost(i)}  
            />
          ))}
        </section>
       </div>
      </main>
    </>
  );
}