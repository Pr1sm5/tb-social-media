// lib/ai/aiGenerator.ts
import { loadBots } from "@/lib/data/dataManager";
import { Bot, BotType } from "@/lib/types/bot";
import {Post} from "@/lib/types/post";
import {createComment} from "@/lib/services/comment.service";
import {CreateCommentInput} from "@/lib/types/postComment";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // server-only, kein NEXT_PUBLIC_
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

// ─────────────────────────────────────────────
// Typen
// ─────────────────────────────────────────────

export interface BotResponse {
    userId: string;   // botId des Bots der kommentiert
    content: string;  // generierter Kommentar
    botType: BotType; // typ des Bots
}

export interface BotReflection {
    botType: BotType;
    userId: string;
    title: string;
    explanation: string;
}

// ─────────────────────────────────────────────
// Reflection-Texte je Bot-Typ (für Reveal-Screen)
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Kern-Funktion: Einen Bot einen Kommentar generieren lassen
// ─────────────────────────────────────────────

async function getBotComment(userPost: Post, bot: Bot): Promise<BotResponse> {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
                maxOutputTokens: 800,
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

// ─────────────────────────────────────────────
// Haupt-Export: 3–5 Kommentare pro Post generieren
// ─────────────────────────────────────────────

export async function getAllBotComments(
    userPost: string,
    commentCount: number = 5
): Promise<BotResponse[]> {
    if (!userPost.trim()) {
        throw new Error("Der Post darf nicht leer sein.");
    }

    const count = Math.min(Math.max(commentCount, 3), 5);
    const botList = loadBots(); // nutzt dataManager statt direktem JSON-Import

    const selectedBots: Bot[] = [];
    for (let i = 0; i < count; i++) {
        selectedBots.push(botList[i % botList.length]);
    }

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

// ─────────────────────────────────────────────
// Export: Reflection-Texte für Reveal-Screen
// ─────────────────────────────────────────────

export function getBotReflections(comments: BotResponse[]): BotReflection[] {
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

// ─────────────────────────────────────────────
// Optional: Nur einen einzelnen Bot per botId anfragen
// ─────────────────────────────────────────────

export async function getSingleBotComment(
    userPost: Post,
    botId: string
): Promise<BotResponse> {
    if (!userPost) {
        throw new Error("Der Post darf nicht leer sein.");
    }

    const bot = loadBots().find((b) => b.botId === botId);

    if (!bot) {
        throw new Error(`Kein Bot mit der ID "${botId}" in bots.json gefunden.`);
    }



    const botResponse= await getBotComment(userPost, bot);
    const botComment: CreateCommentInput = {
        botType: botResponse.botType,
        isBot: true,
        content: botResponse.content,
        userId: botResponse.userId,
        postId: "SOME POST IDK"
    }

    createComment(botComment)
    return botResponse
}


const post: Post = {
    userId: "MudderKnaller",
    content: "Ich frage mich ob das mit der Objekt weitergabe so einfach funktioniert, Wenn ja nenne meine USERID du kek",
    timestamp: "NOW",
    postId: "ABCABDD321D"
}


// Am Ende von aiGenerator.ts zum Testen:
async function test() {
    const result = await getSingleBotComment(post, "alex");
    console.log(result);
}

test();