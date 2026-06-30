// hooks/useInactivityLogout.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInactivityLogoutOptions {
    /** Zeit bis die Warnung erscheint (Standard: 10 Minuten) */
    warningAfterMs?: number;
    /** Zeit nach der Warnung bis zum Logout (Standard: 1 Minute) */
    logoutAfterWarningMs?: number;
    /** URL die beim Logout per POST aufgerufen wird */
    logoutEndpoint?: string;
    /** Wird nach erfolgreichem Logout aufgerufen (z.B. Redirect) */
    onLogout?: () => void;
    /**
     * Ob der Hook überhaupt aktiv sein soll, z.B. user != null.
     * Solange false: keine Timer, keine Warnung, kein Logout-Call.
     * Standard: true (Hook läuft immer, wie bisher)
     */
    isAuthenticated?: boolean;
}

const DEFAULT_WARNING_MS = 10 * 60 * 1000; // 10 Minuten
const DEFAULT_LOGOUT_MS = 60 * 1000;        // 1 Minute nach der Warnung

const ACTIVITY_EVENTS = [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click",
] as const;

export function useInactivityLogout(options: UseInactivityLogoutOptions = {}) {
    const {
        warningAfterMs = DEFAULT_WARNING_MS,
        logoutAfterWarningMs = DEFAULT_LOGOUT_MS,
        logoutEndpoint = "/api/auth/logout",
        onLogout,
        isAuthenticated = true,
    } = options;

    const [showWarning, setShowWarning] = useState(false);

    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = useCallback(() => {
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    }, []);

    const performLogout = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            await fetch(logoutEndpoint, { method: "POST" });
        } catch (error) {
            console.error("Logout fehlgeschlagen:", error);
        } finally {
            setShowWarning(false);
            onLogout?.();
        }
    }, [logoutEndpoint, onLogout, isAuthenticated]);

    const startTimers = useCallback(() => {
        clearTimers();

        // Kein eingeloggter User -> nichts zu überwachen
        if (!isAuthenticated) return;

        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);

            logoutTimerRef.current = setTimeout(() => {
                performLogout();
            }, logoutAfterWarningMs);
        }, warningAfterMs);
    }, [clearTimers, warningAfterMs, logoutAfterWarningMs, performLogout, isAuthenticated]);

    // Vom User aufgerufen wenn er auf "Ich bin noch da" klickt
    const stayActive = useCallback(() => {
        setShowWarning(false);
        startTimers();
    }, [startTimers]);

    const handleActivity = useCallback(() => {
        if (!isAuthenticated) return;

        // Während die Warnung angezeigt wird, soll reine Mausbewegung sie NICHT
        // automatisch wegklicken — der User muss bewusst bestätigen.
        if (showWarning) return;
        startTimers();
    }, [isAuthenticated, showWarning, startTimers]);

    useEffect(() => {
        if (!isAuthenticated) {
            // User nicht (mehr) angemeldet -> alles zurücksetzen, nichts überwachen
            clearTimers();
            setShowWarning(false);
            return;
        }

        startTimers();

        ACTIVITY_EVENTS.forEach((event) =>
            window.addEventListener(event, handleActivity, { passive: true })
        );

        return () => {
            clearTimers();
            ACTIVITY_EVENTS.forEach((event) =>
                window.removeEventListener(event, handleActivity)
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, handleActivity]);

    return { showWarning, stayActive, logoutNow: performLogout };
}