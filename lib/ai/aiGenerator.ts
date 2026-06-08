// aiGenerator.ts
// Liest Bot-Charaktere aus bots.json und gibt Antworten im Format von botResponseFormat.json zurück

import bots from "./bots.json";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// ─────────────────────────────────────────────
// Typen — gespiegelt aus den JSON-Dateien
// ─────────────────────────────────────────────

export type BotType = "supportive" | "toxic" | "misinformation";

export interface Bot {
    botId: string;
    botType: BotType;
    name: string;
    systemPrompt: string;
}

// Response-Format aus botResponseFormat.json
export interface BotResponse {
    botId: string;
    content: string;
    botType: BotType;
}

// ─────────────────────────────────────────────
// Kern-Funktion: Einen Bot antworten lassen
// ─────────────────────────────────────────────

async function getBotComment(
    userPost: string,
    bot: Bot
): Promise<BotResponse> {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            system_instruction: {
                parts: [{ text: bot.systemPrompt }],
            },
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Hier ist der Post auf den du reagieren sollst:\n\n"${userPost}"`,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 200,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(
            `Gemini API Fehler (${bot.botId}): ${error?.error?.message ?? response.statusText}`
        );
    }

    const data = await response.json();
    const content: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(Keine Antwort)";

    // Gibt exakt das Format aus botResponseFormat.json zurück
    return {
        botId: bot.botId,
        content: content.trim(),
        botType: bot.botType,
    };
}

// ─────────────────────────────────────────────
// Haupt-Export: Alle Bots aus bots.json antworten lassen
// ─────────────────────────────────────────────

export async function getAllBotComments(
    userPost: string
): Promise<BotResponse[]> {
    if (!userPost.trim()) {
        throw new Error("Der Post darf nicht leer sein.");
    }

    const results = await Promise.allSettled(
        (bots as Bot[]).map((bot) => getBotComment(userPost, bot))
    );

    const responses: BotResponse[] = [];

    for (const result of results) {
        if (result.status === "fulfilled") {
            responses.push(result.value);
        } else {
            console.error("Bot-Fehler:", result.reason);
        }
    }

    if (responses.length === 0) {
        throw new Error("Alle Bot-Anfragen sind fehlgeschlagen.");
    }

    return responses;
}

// ─────────────────────────────────────────────
// Optional: Nur einen einzelnen Bot per botId anfragen
// ─────────────────────────────────────────────

export async function getSingleBotComment(
    userPost: string,
    botId: string
): Promise<BotResponse> {
    if (!userPost.trim()) {
        throw new Error("Der Post darf nicht leer sein.");
    }

    const bot = (bots as Bot[]).find((b) => b.botId === botId);

    if (!bot) {
        throw new Error(`Kein Bot mit der ID "${botId}" in bots.json gefunden.`);
    }

    return getBotComment(userPost, bot);
}