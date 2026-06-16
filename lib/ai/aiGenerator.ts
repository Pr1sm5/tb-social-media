// aiGenerator.ts
// Liest Bot-Charaktere aus bots.json und gibt Antworten im Format von botFormat.json zurück

import bots from "../../../data/bots.json";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// ─────────────────────────────────────────────
// Typen
// ─────────────────────────────────────────────

export type BotType = "supportive" | "toxic" | "misinformation";

export interface Bot {
    botId: string;
    botType: BotType;
    name: string;
    systemPrompt: string;
}

// Rückgabeformat gemäß botFormat.json
export interface BotResponse {
    userId: string;   // botId des Bots der kommentiert
    content: string;  // generierter Kommentar
    botType: BotType; // typ des Bots
}

// Reflection-Text für den Reveal-Screen
export interface BotReflection {
    botType: BotType;
    userId: string;
    title: string;
    explanation: string;
}


// Reflection-Texte je Bot-Typ (für Reveal-Screen)


const REFLECTIONS: Record<BotType, Omit<BotReflection, "userId">> = {
    supportive: {
        botType: "supportive",
        title: "Der Schmeichler",
        explanation:
            "Dieser Bot stimmt dir bei allem zu — egal was du schreibst. Er erzeugt ein künstliches Gefühl von Zustimmung und Beliebtheit. In echten sozialen Netzwerken verstärken solche Bots Echokammern: Du siehst nur noch Bestätigung und glaubst, alle teilen deine Meinung.",
    },
    toxic: {
        botType: "toxic",
        title: "Der Troll",
        explanation:
            "Dieser Bot provoziert gezielt ohne sachlichen Grund. Toxische Kommentare vergiften Diskussionen, schrecken echte Nutzer ab und sorgen dafür, dass konstruktiver Austausch unmöglich wird. Oft werden solche Bots eingesetzt, um Themen zu sabotieren oder Nutzer einzuschüchtern.",
    },
    misinformation: {
        botType: "misinformation",
        title: "Der Falschinformant",
        explanation:
            "Dieser Bot klingt seriös — aber seine Quellen sind erfunden. Er sät Zweifel an echten Fakten und verwirrt durch akademisch klingende Sprache. Das Gefährliche: Falschinformationen, die professionell wirken, werden viel häufiger geglaubt und geteilt als offensichtliche Lügen.",
    },
};


// Kern-Funktion: Einen Bot einen Kommentar generieren lassen


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
                            text: `Hier ist der Post auf den du reagieren sollst:\n\n"${userPost}"\n\nSchreibe EINEN Kommentar als Reaktion. Nur der Kommentar, nichts anderes.`,
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

    return {
        userId: bot.botId,
        content: content.trim(),
        botType: bot.botType,
    };
}


// Haupt-Export: 3–5 Kommentare pro Post generieren


export async function getAllBotComments(
    userPost: string,
    commentCount: number = 5
): Promise<BotResponse[]> {
    if (!userPost.trim()) {
        throw new Error("Der Post darf nicht leer sein.");
    }

    // Sicherstellen dass commentCount zwischen 3 und 5 liegt
    const count = Math.min(Math.max(commentCount, 3), 5);
    const botList = bots as Bot[];

    // Bots zufällig auf die gewünschte Anzahl verteilen
    // Bei 3 Bots und z.B. 5 Kommentaren: manche Bots kommentieren mehrfach
    const selectedBots: Bot[] = [];
    for (let i = 0; i < count; i++) {
        selectedBots.push(botList[i % botList.length]);
    }

    // Alle parallel anfragen
    const results = await Promise.allSettled(
        selectedBots.map((bot) => getBotComment(userPost, bot))
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


// Export: Reflection-Texte für Reveal-Screen


export function getBotReflections(comments: BotResponse[]): BotReflection[] {
    // Nur Reflection für Bot-Typen die tatsächlich kommentiert haben
    const seenTypes = new Set<BotType>();
    const reflections: BotReflection[] = [];

    for (const comment of comments) {
        if (!seenTypes.has(comment.botType)) {
            seenTypes.add(comment.botType);
            reflections.push({
                ...REFLECTIONS[comment.botType],
                userId: comment.userId,
            });
        }
    }

    return reflections;
}


// Optional: Nur einen einzelnen Bot per botId anfragen


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