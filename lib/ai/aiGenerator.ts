// lib/ai/aiGenerator.ts
import { loadBots } from "@/lib/data/dataManager";
import { Bot, BotType } from "@/lib/types/bot";
import { Post } from "@/lib/types/post";
import { createComment } from "@/lib/services/comment.service";
import { CreateCommentInput } from "@/lib/types/postComment";
import { getRandomBot } from "@/lib/services/bots.service";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

// ─────────────────────────────────────────────
// Typen
// ─────────────────────────────────────────────

export interface BotResponse {
    userId: string;
    content: string;
    botType: BotType;
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
// Hilfsfunktion: Bot-Liste zufällig mischen (Fisher-Yates)
// ─────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ─────────────────────────────────────────────
// Hilfsfunktion: Bots für einen Durchlauf auswählen
// Alle 3 Typen kommen mindestens einmal vor,
// restliche Slots werden zufällig aufgefüllt
// ─────────────────────────────────────────────

function selectBots(botList: Bot[], count: number): Bot[] {
    const shuffled = shuffleArray(botList);
    const selected: Bot[] = [...shuffled];

    while (selected.length < count) {
        const randomBot = botList[Math.floor(Math.random() * botList.length)];
        selected.push(randomBot);
    }

    return selected.slice(0, count);
}

// ─────────────────────────────────────────────
// Hilfsfunktion: JSON sicher aus Gemini-Antwort extrahieren
// Gemini schreibt manchmal Backticks oder Text davor/danach
// ─────────────────────────────────────────────

function extractJSON(raw: string): string {
    // Backticks und "json"-Label entfernen
    let cleaned = raw.replace(/```json|```/g, "").trim();

    // Nur den Teil zwischen [ und ] extrahieren
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");

    if (start === -1 || end === -1 || end < start) {
        throw new Error("Kein gültiges JSON-Array in Gemini-Antwort gefunden.");
    }

    return cleaned.slice(start, end + 1);
}

// ─────────────────────────────────────────────
// Haupt-Export: Alle Bot-Kommentare in EINEM Gemini Call generieren
// ─────────────────────────────────────────────

export async function getAllBotComments(
    userPost: Post,
    commentCount: number = 5
): Promise<BotResponse[]> {
    if (!userPost.content.trim()) {
        throw new Error("Der Post darf nicht leer sein.");
    }

    const count = Math.min(Math.max(commentCount, 3), 5);
    const botList = loadBots();
    const selectedBots = selectBots(botList, count);

    const botDescriptions = selectedBots
        .map(
            (bot, i) =>
                `Kommentar ${i + 1}:\n- botId: "${bot.botId}"\n- botType: "${bot.botType}"\n- Charakter: ${bot.systemPrompt}`
        )
        .join("\n\n");

    const prompt = `Du bekommst einen Social-Media-Post und sollst als mehrere verschiedene Bots darauf reagieren.

POST von User "${userPost.userId}":
"${userPost.content}"

Schreibe für jeden der folgenden Bots EINEN kurzen Kommentar (max. 3 Sätze) als Reaktion auf diesen Post und auf mögliche vorherige von dir generierte kommentare. Bleib strikt in der jeweiligen Bot-Rolle.

${botDescriptions}

WICHTIG: Antworte AUSSCHLIESSLICH mit einem JSON-Array. Kein Text davor oder danach, keine Markdown-Backticks, keine Erklärungen.
Verwende keine Anführungszeichen innerhalb von "content" — ersetze sie durch einfache Apostrophe falls nötig.

Format:
[
  { "botId": "...", "botType": "...", "content": "..." },
  { "botId": "...", "botType": "...", "content": "..." }
]`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 2048, // erhöht damit JSON nie abgeschnitten wird
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(
            `Gemini API Fehler: ${error?.error?.message ?? response.statusText}`
        );
    }

    const data = await response.json();
    const rawText: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // JSON extrahieren und parsen
    const jsonString = extractJSON(rawText);
    const parsed: { botId: string; botType: BotType; content: string }[] =
        JSON.parse(jsonString);

    // Jeden Kommentar einzeln speichern
    const responses: BotResponse[] = [];

    for (const item of parsed) {
        const commentInput: CreateCommentInput = {
            postId: userPost.postId,
            userId: item.botId,
            content: item.content,
            isBot: true,
            botType: item.botType,
        };

        createComment(commentInput);

        responses.push({
            userId: item.botId,
            content: item.content,
            botType: item.botType,
        });
    }

    return responses;
}

// ─────────────────────────────────────────────
// Einzelnen Bot per botId anfragen
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
                            text: `Der User "${userPost.userId}" hat folgenden Post geschrieben:\n\n"${userPost.content}"\n\nSchreibe EINEN Kommentar als Reaktion. Nur der Kommentar, nichts anderes.`,
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

export async function getSingleBotComment(
    userPost: Post,
    botId: string
): Promise<BotResponse> {
    if (!userPost.content.trim()) {
        throw new Error("Der Post darf nicht leer sein.");
    }

    const bot = loadBots().find((b) => b.botId === botId);

    if (!bot) {
        throw new Error(`Kein Bot mit der ID "${botId}" in bots.json gefunden.`);
    }

    const botResponse = await getBotComment(userPost, bot);

    const commentInput: CreateCommentInput = {
        postId: userPost.postId,
        userId: botResponse.userId,
        content: botResponse.content,
        isBot: true,
        botType: botResponse.botType,
    };

    createComment(commentInput);
    return botResponse;
}

export async function getRandomSingleBot(userPost: Post): Promise<BotResponse> {
    const randomBot = getRandomBot();
    if (!randomBot) throw new Error("Keine Bots gefunden.");
    return getSingleBotComment(userPost, randomBot.botId);
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