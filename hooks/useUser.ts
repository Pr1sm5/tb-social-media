// hooks/useUser.ts
"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types/user";
import {router} from "next/client";

const SESSION_KEY = "logo_user";

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false); // verhindert kurzes Aufflackern des Overlays

    // Beim Mount: User aus sessionStorage laden
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(SESSION_KEY);
            if (stored) setUser(JSON.parse(stored));
        } catch {
            // sessionStorage nicht verfügbar (SSR, private mode etc.)
        }
        setReady(true);
    }, []);

    function login(newUser: User) {
        setUser(newUser);
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
            window.location.reload();
        } catch {}
    }

    function logout() {
        setUser(null);
        try {
            sessionStorage.removeItem(SESSION_KEY);
            window.location.reload();
        } catch {}
    }

    return { user, login, logout, ready };
}