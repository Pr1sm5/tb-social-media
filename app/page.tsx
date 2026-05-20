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

  return (
    <>
      <header> 
        <h1>Prototyp Webseite HEADER</h1>
      </header>

      <main>
        <section>
          <Texteingabefeld onSend={addPost} />
        </section>

        <section>
          {posts.map((post, i) => (
            <TextOutputComponent key={i} text={post} />
          ))}
        </section>
      </main>
    </>
  );
}