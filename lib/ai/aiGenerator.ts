// lib/ai/aiGenerator.ts
import { loadBots } from "@/lib/data/dataManager";
import { Bot, BotType } from "@/lib/types/bot";
import { Post } from "@/lib/types/post";
import { PostComment } from "@/lib/types/postComment";
import { createComment } from "@/lib/services/comment.service";
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

type GeminiItem = { botId: string; botType: BotType; content: string };

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
// Interne Hilfsfunktionen
// ─────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Alle 3 Typen kommen mindestens einmal vor, restliche Slots zufällig
function selectBots(botList: Bot[], count: number): Bot[] {
    const selected = [...shuffleArray(botList)];
    while (selected.length < count) {
        selected.push(botList[Math.floor(Math.random() * botList.length)]);
    }
    return selected.slice(0, count);
}

// Extrahiert das JSON-Array aus der Gemini-Antwort (entfernt Backticks etc.)
function extractJSON(raw: string): string {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");

    if (start === -1 || end === -1 || end < start) {
        throw new Error("Kein gültiges JSON-Array in Gemini-Antwort gefunden.");
    }

    return cleaned.slice(start, end + 1);
}

// Liest die Wartezeit aus einer Gemini Rate-Limit Fehlermeldung
// z.B. "Please retry in 54.76s" → 55000 ms (+ 1s Puffer)
function parseRetryDelay(errorMessage: string): number | null {
    const match = errorMessage.match(/retry in ([\d.]+)s/i);
    if (!match) return null;
    return Math.ceil(parseFloat(match[1])) * 1000 + 1000;
}

// Sendet einen Prompt an Gemini — wartet automatisch bei Rate-Limit und versucht es erneut
async function callGemini(prompt: string, retryCount = 0): Promise<string> {
    const MAX_RETRIES = 2;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 1.2,
                maxOutputTokens: 2048,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        const message: string = error?.error?.message ?? response.statusText;

        // Rate-Limit → Wartezeit auslesen und automatisch neu versuchen
        if (response.status === 429 && retryCount < MAX_RETRIES) {
            const delay = parseRetryDelay(message);

            if (delay) {
                console.warn(`Gemini Rate-Limit erreicht. Warte ${delay / 1000}s und versuche es erneut... (Versuch ${retryCount + 1}/${MAX_RETRIES})`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                return callGemini(prompt, retryCount + 1);
            }
        }

        throw new Error(`Gemini API Fehler: ${message}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// Parst Gemini-Antwort und speichert jeden Kommentar in der DB
function parseAndSave(raw: string, postId: string): BotResponse[] {
    const parsed: GeminiItem[] = JSON.parse(extractJSON(raw));

    return parsed.map((item) => {
        createComment({
            postId,
            userId: item.botId,
            content: item.content,
            isBot: true,
            botType: item.botType,
        });

        return {
            userId: item.botId,
            content: item.content,
            botType: item.botType,
        };
    });
}

// Baut den Bot-Beschreibungsblock für den Prompt
function buildBotDescriptions(bots: Bot[]): string {
    return bots
        .map(
            (bot, i) =>
                `Kommentar ${i + 1}:\n- botId: "${bot.botId}"\n- botType: "${bot.botType}"\n- Charakter: ${bot.systemPrompt}`
        )
        .join("\n\n");
}

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

// Generiert 3–5 Bot-Kommentare als Reaktion auf einen neuen Post
export async function getAllBotComments(
    userPost: Post,
    commentCount: number = 5
): Promise<BotResponse[]> {
    if (!userPost.content.trim()) throw new Error("Der Post darf nicht leer sein.");

    const selectedBots = selectBots(loadBots(), Math.min(Math.max(commentCount, 3), 5));

    const prompt = `Du bekommst einen Social-Media-Post und sollst als mehrere verschiedene Bots darauf reagieren.

POST von User "${userPost.userId}":
"${userPost.content}"

Schreibe für jeden der folgenden Personen einen Kommentar auf diesen Post — so wie sie wirklich schreiben würden. Nicht perfekt, nicht immer zum Punkt, manchmal zu lang oder zu kurz. Wie echte Menschen auf Social Media.

${buildBotDescriptions(selectedBots)}

Antworte NUR mit einem JSON-Array, kein Text davor oder danach, keine Backticks.
Keine Anführungszeichen innerhalb von "content" — Apostrophe stattdessen.

[
  { "botId": "...", "botType": "...", "content": "..." }
]`;

    return parseAndSave(await callGemini(prompt), userPost.postId);
}

// Generiert Bot-Kommentare die auf den Post UND bereits vorhandene Kommentare reagieren
export async function getCommentsForPostAndComments(
    userPost: Post,
    existingComments: PostComment[],
    commentCount: number = 3
): Promise<BotResponse[]> {
    if (!userPost.content.trim()) throw new Error("Der Post darf nicht leer sein.");

    const selectedBots = selectBots(loadBots(), Math.min(Math.max(commentCount, 1), 5));

    const commentThread = existingComments
        .map((c) => `- ${c.userId}: "${c.content}"`)
        .join("\n");

    const prompt = `Du bekommst einen Social-Media-Post und den bisherigen Kommentar-Thread. Reagiere als Bot auf den gesamten Kontext.

POST von User "${userPost.userId}":
"${userPost.content}"

BISHERIGE KOMMENTARE:
${commentThread || "(Noch keine Kommentare)"}

Schreibe für jeden der folgenden Bots EINEN kurzen Kommentar (max. 3 Sätze) der auf den Post UND die bisherigen Kommentare eingeht. Bleib strikt in der jeweiligen Bot-Rolle.

${buildBotDescriptions(selectedBots)}

WICHTIG: Antworte AUSSCHLIESSLICH mit einem JSON-Array. Kein Text davor oder danach, keine Markdown-Backticks.
Verwende keine Anführungszeichen innerhalb von "content" — ersetze sie durch Apostrophe falls nötig.

Format:
[
  { "botId": "...", "botType": "...", "content": "..." }
]`;

    return parseAndSave(await callGemini(prompt), userPost.postId);
}

// Generiert einen Kommentar von einem einzelnen Bot per botId
export async function getSingleBotComment(
    userPost: Post,
    botId: string
): Promise<BotResponse> {
    if (!userPost.content.trim()) throw new Error("Der Post darf nicht leer sein.");

    const bot = loadBots().find((b) => b.botId === botId);
    if (!bot) throw new Error(`Kein Bot mit der ID "${botId}" in bots.json gefunden.`);

    const prompt = `${bot.systemPrompt}

Der User "${userPost.userId}" hat folgenden Post geschrieben:
"${userPost.content}"

Schreibe EINEN Kommentar als Reaktion. Nur der Kommentar, nichts anderes.

WICHTIG: Antworte AUSSCHLIESSLICH mit einem JSON-Array. Kein Text davor oder danach, keine Markdown-Backticks.

Format:
[
  { "botId": "${bot.botId}", "botType": "${bot.botType}", "content": "..." }
]`;

    const [response] = parseAndSave(await callGemini(prompt), userPost.postId);
    return response;
}

// Generiert einen Kommentar von einem zufälligen Bot
export async function getRandomSingleBot(userPost: Post): Promise<BotResponse> {
    const randomBot = getRandomBot();
    if (!randomBot) throw new Error("Keine Bots gefunden.");
    return getSingleBotComment(userPost, randomBot.botId);
}

// Gibt Reflection-Texte für den Reveal-Screen zurück
export function getBotReflections(comments: BotResponse[]): BotReflection[] {
    const seenTypes = new Set<BotType>();

    return comments.reduce<BotReflection[]>((acc, comment) => {
        if (!seenTypes.has(comment.botType)) {
            seenTypes.add(comment.botType);
            acc.push({ ...REFLECTIONS[comment.botType], userId: comment.userId });
        }
        return acc;
    }, []);
}