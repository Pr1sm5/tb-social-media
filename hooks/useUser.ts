// hooks/useUser.ts
"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types/user";

const SESSION_KEY = "logo_user";

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(SESSION_KEY);
            if (stored) setUser(JSON.parse(stored));
        } catch {}
        setReady(true);
    }, []);

    function login(newUser: User) {
        setUser(newUser);
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        } catch {}
    }

    function logout() {
        setUser(null);
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch {}
        window.location.reload()
    }

    // Sprache während der Session wechseln
    function setLanguage(lang: "de" | "en") {
        if (!user) return;
        const updated: User = { ...user, language: lang };
        setUser(updated);
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        } catch {}
    }

    return { user, login, logout, ready, setLanguage };
}