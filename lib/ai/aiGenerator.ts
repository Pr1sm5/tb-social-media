// lib/ai/aiGenerator.ts
import { loadBots } from "@/lib/data/dataManager";
import { Bot, BotType } from "@/lib/types/bot";
import { Post } from "@/lib/types/post";
import { PostComment } from "@/lib/types/postComment";
import { createComment } from "@/lib/services/comment.service";
import { getRandomBot } from "@/lib/services/bots.service";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

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

function selectBots(botList: Bot[], count: number): Bot[] {
    const selected = [...shuffleArray(botList)];
    while (selected.length < count) {
        selected.push(botList[Math.floor(Math.random() * botList.length)]);
    }
    return selected.slice(0, count);
}

function extractJSON(raw: string): string {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");

    if (start === -1 || end === -1 || end < start) {
        throw new Error("Kein gültiges JSON-Array in Gemini-Antwort gefunden.");
    }

    return cleaned.slice(start, end + 1);
}

function parseRetryDelay(errorMessage: string): number | null {
    const match = errorMessage.match(/retry in ([\d.]+)s/i);
    if (!match) return null;
    return Math.ceil(parseFloat(match[1])) * 1000 + 1000;
}

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

        if (response.status === 429 && retryCount < MAX_RETRIES) {
            const delay = parseRetryDelay(message);
            if (delay) {
                console.warn(`Gemini Rate-Limit erreicht. Warte ${delay / 1000}s... (Versuch ${retryCount + 1}/${MAX_RETRIES})`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                return callGemini(prompt, retryCount + 1);
            }
        }

        throw new Error(`Gemini API Fehler: ${message}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

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

function buildBotDescriptions(bots: Bot[]): string {
    return bots
        .map(
            (bot, i) =>
                `Person ${i + 1} (@${bot.botId}, Typ: ${bot.botType}):\n${bot.systemPrompt}`
        )
        .join("\n\n");
}

// Gemeinsamer Plattform-Kontext für alle Prompts
const PLATFORM_CONTEXT = `Du bist auf LOGO, einer Social-Media-Platform ähnlich wie Twitter/X.
Hier gelten die ungeschriebenen Regeln des Internets:
- Kommentare sind kurz. Meist 1-2 Sätze, selten mehr.
- Niemand schreibt perfekte Grammatik oder vollständige Sätze.
- Man tippt so wie man redet — mit allem was dazugehört: Abkürzungen, Tippfehler, Slang.
- Wenn man auf einen anderen Kommentar antwortet, schreibt man @username davor.
- Manche liken einfach, manche schreiben einen Roman, die meisten irgendwas dazwischen.
- Jeder hat seine eigene Stimme — die muss sofort erkennbar sein.`;

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

export async function getAllBotComments(
    userPost: Post,
    commentCount: number = 5
): Promise<BotResponse[]> {
    if (!userPost.content.trim()) throw new Error("Der Post darf nicht leer sein.");

    const selectedBots = selectBots(loadBots(), Math.min(Math.max(commentCount, 3), 5));

    const prompt = `${PLATFORM_CONTEXT}

@${userPost.userId} hat gepostet:
"${userPost.content}"

Die folgenden Personen kommentieren diesen Post. Jede Person schreibt so wie sie ist — aus ihrem Charakter heraus, auf das Thema bezogen, auf dieser Platform.

${buildBotDescriptions(selectedBots)}

Antworte NUR mit einem JSON-Array, kein Text davor oder danach, keine Backticks.
Keine Anführungszeichen innerhalb von "content" — Apostrophe stattdessen.

[
  { "botId": "...", "botType": "...", "content": "..." }
]`;

    return parseAndSave(await callGemini(prompt), userPost.postId);
}

export async function getCommentsForPostAndComments(
    userPost: Post,
    existingComments: PostComment[],
    commentCount: number = 3
): Promise<BotResponse[]> {
    if (!userPost.content.trim()) throw new Error("Der Post darf nicht leer sein.");

    const selectedBots = selectBots(loadBots(), Math.min(Math.max(commentCount, 1), 5));

    const commentThread = existingComments
        .map((c) => `@${c.userId}: "${c.content}"`)
        .join("\n");

    const prompt = `${PLATFORM_CONTEXT}

@${userPost.userId} hat gepostet:
"${userPost.content}"

Bisherige Kommentare im Thread:
${commentThread || "(Noch keine Kommentare)"}

Die folgenden Personen steigen jetzt in den Thread ein. Sie haben den Post gelesen und auch die anderen Kommentare gesehen — sie können darauf eingehen, andere Nutzer mit @username ansprechen, oder einfach ihre eigene Meinung zum Post sagen. Jeder reagiert so wie er ist.

${buildBotDescriptions(selectedBots)}

Antworte NUR mit einem JSON-Array, kein Text davor oder danach, keine Backticks.
Keine Anführungszeichen innerhalb von "content" — Apostrophe stattdessen.

[
  { "botId": "...", "botType": "...", "content": "..." }
]`;

    return parseAndSave(await callGemini(prompt), userPost.postId);
}

export async function getSingleBotComment(
    userPost: Post,
    botId: string
): Promise<BotResponse> {
    if (!userPost.content.trim()) throw new Error("Der Post darf nicht leer sein.");

    const bot = loadBots().find((b) => b.botId === botId);
    if (!bot) throw new Error(`Kein Bot mit der ID "${botId}" in bots.json gefunden.`);

    const prompt = `${PLATFORM_CONTEXT}

Du bist @${bot.botId} auf dieser Platform. Dein Charakter: ${bot.systemPrompt}

@${userPost.userId} hat gepostet:
"${userPost.content}"

Schreib deinen Kommentar dazu — so wie du bist, auf dieser Platform.

Antworte NUR mit einem JSON-Array, keine Backticks.

[
  { "botId": "${bot.botId}", "botType": "${bot.botType}", "content": "..." }
]`;

    const [response] = parseAndSave(await callGemini(prompt), userPost.postId);
    return response;
}

export async function getRandomSingleBot(userPost: Post): Promise<BotResponse> {
    const randomBot = getRandomBot();
    if (!randomBot) throw new Error("Keine Bots gefunden.");
    return getSingleBotComment(userPost, randomBot.botId);
}

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