// lib/ai/aiGenerator.ts
import { loadBots } from "@/lib/data/dataManager";
import { Bot, BotType, Language } from "@/lib/types/bot";
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
// Reflection-Texte je Bot-Typ (für Reveal-Screen) — zweisprachig
// ─────────────────────────────────────────────

const REFLECTIONS: Record<BotType, Record<Language, Omit<BotReflection, "userId" | "botType">>> = {
    supportive: {
        de: {
            title: "Der Schmeichler",
            explanation:
                "Dieser Bot stimmt dir bei allem zu — egal was du schreibst. Er erzeugt ein künstliches Gefühl von Zustimmung und Beliebtheit. In echten sozialen Netzwerken verstärken solche Bots Echokammern: Du siehst nur noch Bestätigung und glaubst, alle teilen deine Meinung.",
        },
        en: {
            title: "The Flatterer",
            explanation:
                "This bot agrees with you on everything — no matter what you write. It creates an artificial sense of approval and popularity. In real social networks, bots like this reinforce echo chambers: you only see validation and start believing everyone shares your opinion.",
        },
    },
    toxic: {
        de: {
            title: "Der Troll",
            explanation:
                "Dieser Bot provoziert gezielt ohne sachlichen Grund. Toxische Kommentare vergiften Diskussionen, schrecken echte Nutzer ab und sorgen dafür, dass konstruktiver Austausch unmöglich wird. Oft werden solche Bots eingesetzt, um Themen zu sabotieren oder Nutzer einzuschüchtern.",
        },
        en: {
            title: "The Troll",
            explanation:
                "This bot provokes deliberately, without any real reason. Toxic comments poison discussions, scare off genuine users, and make constructive exchange impossible. Bots like this are often used to sabotage topics or intimidate users.",
        },
    },
    misinformation: {
        de: {
            title: "Der Falschinformant",
            explanation:
                "Dieser Bot klingt seriös — aber seine Quellen sind erfunden. Er sät Zweifel an echten Fakten und verwirrt durch akademisch klingende Sprache. Das Gefährliche: Falschinformationen, die professionell wirken, werden viel häufiger geglaubt und geteilt als offensichtliche Lügen.",
        },
        en: {
            title: "The Misinformer",
            explanation:
                "This bot sounds credible — but its sources are made up. It sows doubt about real facts and confuses people with academic-sounding language. The dangerous part: misinformation that looks professional gets believed and shared far more often than obvious lies.",
        },
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
        console.error("Gemini Rohantwort (kein JSON gefunden):\n", raw);
        throw new Error("Kein gültiges JSON-Array in Gemini-Antwort gefunden.");
    }

    return cleaned.slice(start, end + 1);
}

function parseRetryDelay(errorMessage: string): number | null {
    const match = errorMessage.match(/retry in ([\d.]+)s/i);
    if (!match) return null;
    return Math.ceil(parseFloat(match[1])) * 1000 + 1000;
}

// Prüft ob Gemini die Antwort aus Safety-Gründen blockiert hat
function isSafetyBlocked(data: any): boolean {
    const candidate = data?.candidates?.[0];
    if (!candidate) return true;
    const reason = candidate?.finishReason;
    return reason === "SAFETY" || reason === "RECITATION" || reason === "OTHER";
}

async function callGemini(prompt: string, retryCount = 0): Promise<string> {
    const MAX_RETRIES = 3;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 1.0,
                maxOutputTokens: 4096,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        const message: string = error?.error?.message ?? response.statusText;

        if (response.status === 429 && retryCount < MAX_RETRIES) {
            const delay = parseRetryDelay(message);
            if (delay) {
                console.warn(`Gemini Rate-Limit. Warte ${delay / 1000}s... (Versuch ${retryCount + 1}/${MAX_RETRIES})`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                return callGemini(prompt, retryCount + 1);
            }
        }

        throw new Error(`Gemini API Fehler: ${message}`);
    }

    const data = await response.json();

    if (isSafetyBlocked(data)) {
        console.warn(`Gemini Safety-Block (Versuch ${retryCount + 1}/${MAX_RETRIES}). finishReason:`, data?.candidates?.[0]?.finishReason);

        if (retryCount < MAX_RETRIES) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return callGemini(prompt, retryCount + 1);
        }

        throw new Error("Gemini hat die Antwort aus Safety-Gründen blockiert.");
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text.trim() && retryCount < MAX_RETRIES) {
        console.warn(`Gemini leere Antwort (Versuch ${retryCount + 1}/${MAX_RETRIES}). Erneuter Versuch...`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return callGemini(prompt, retryCount + 1);
    }

    return text;
}

function parseAndSave(raw: string, postId: string): BotResponse[] {
    const parsed: GeminiItem[] = JSON.parse(extractJSON(raw));

    return parsed.map((item) => {
        const botId = item.botId.replace(/^@/, "");

        createComment({
            postId,
            userId: botId,
            content: item.content,
            isBot: true,
            botType: item.botType,
        });

        return {
            userId: botId,
            content: item.content,
            botType: item.botType,
        };
    });
}

async function callGeminiAndParse(prompt: string, postId: string, retryCount = 0): Promise<BotResponse[]> {
    const MAX_PARSE_RETRIES = 2;
    const raw = await callGemini(prompt);

    try {
        return parseAndSave(raw, postId);
    } catch (err) {
        if (retryCount < MAX_PARSE_RETRIES) {
            console.warn(`JSON-Parse fehlgeschlagen (Versuch ${retryCount + 1}/${MAX_PARSE_RETRIES}). Erneuter Versuch...`);
            await new Promise((resolve) => setTimeout(resolve, 500));
            return callGeminiAndParse(prompt, postId, retryCount + 1);
        }
        throw err;
    }
}

function buildBotDescriptions(bots: Bot[], language: Language): string {
    const label = language === "en" ? "Person" : "Person";
    const typeLabel = language === "en" ? "Type" : "Typ";
    return bots
        .map(
            (bot, i) =>
                `${label} ${i + 1} (@${bot.botId}, ${typeLabel}: ${bot.botType}):\n${bot.systemPrompt[language] ?? bot.systemPrompt.de}`
        )
        .join("\n\n");
}

// Gemeinsamer Plattform-Kontext für alle Prompts — zweisprachig
const PLATFORM_CONTEXT: Record<Language, string> = {
    de: `Du bist auf LOGO, einer Social-Media-Platform ähnlich wie Twitter/X.
Hier gelten die ungeschriebenen Regeln des Internets:
- Kommentare sind kurz. Meist 1-2 Sätze, selten mehr.
- Niemand schreibt perfekte Grammatik oder vollständige Sätze.
- Man tippt so wie man redet — mit allem was dazugehört: Abkürzungen, Tippfehler, Slang.
- Wenn man auf einen anderen Kommentar antwortet, schreibt man @username davor.
- Manche liken einfach, manche schreiben einen Roman, die meisten irgendwas dazwischen.
- Jeder hat seine eigene Stimme — die muss sofort erkennbar sein.
Antworte auf Deutsch.`,
    en: `You are on LOGO, a social media platform similar to Twitter/X.
The unwritten rules of the internet apply here:
- Comments are short. Usually 1-2 sentences, rarely more.
- Nobody writes perfect grammar or complete sentences.
- People type the way they talk — abbreviations, typos, slang, all of it.
- When replying to another comment, you put @username in front.
- Some people just like, some write an essay, most are somewhere in between.
- Everyone has their own voice — it has to be instantly recognizable.
Respond in English.`,
};

// Textbausteine für den dynamisch zusammengebauten Teil des Prompts — zweisprachig
const PROMPT_PARTS: Record<
    Language,
    {
        posted: (userId: string) => string;
        commentersIntro: string;
        outputInstructions: string;
        threadHeader: string;
        threadEmpty: string;
        threadRules: string;
        threadExamples: string;
        singleBotCharacterIntro: (botId: string) => string;
        singleBotWriteComment: string;
    }
> = {
    de: {
        posted: (userId) => `@${userId} hat gepostet:`,
        commentersIntro:
            "Die folgenden Personen kommentieren diesen Post. Jede Person schreibt so wie sie ist — aus ihrem Charakter heraus, auf das Thema bezogen, auf dieser Platform.",
        outputInstructions: `Antworte NUR mit einem JSON-Array, kein Text davor oder danach, keine Backticks.
Keine Anführungszeichen innerhalb von "content" — Apostrophe stattdessen.`,
        threadHeader: "Bisherige Kommentare im Thread:",
        threadEmpty: "(Noch keine Kommentare)",
        threadRules: `Die folgenden Personen steigen jetzt in diesen Thread ein. Wichtig:
- Jede Person MUSS auf mindestens einen der bisherigen Kommentare eingehen — nicht nur auf den ursprünglichen Post.
- Wenn jemand auf einen Kommentar antwortet, nennt er den Verfasser mit @username am Anfang, z.B. "@alex stimmt doch gar nicht..." oder "@infoWatch_DE das hab ich auch gelesen!"
- Die Reaktionen sollen authentisch wirken — zustimmen, widersprechen, nachhaken, provozieren — je nach Charakter der Person.
- Wer nichts Passendes im Thread findet, darf auch nur auf den Post reagieren — aber das sollte die Ausnahme sein.
- Wenn es von einem Gleichnamingen Bot schon ein Kommentar existiert. Schreibe einen neuen und kopiere den Alten auf keinen Fall`,
        threadExamples: `Beispiele wie Antworten aussehen können:
- "@motivationsbro_kevin bro du hast so recht, genau das hab ich auch gedacht"
- "@g4nSoderKr4nich99 typisch wieder so ein Kommentar lol"
- "@infoWatch_DE hast du dafür auch eine Quelle? klingt komisch"`,
        singleBotCharacterIntro: (botId) => `Du bist @${botId} auf dieser Platform. Dein Charakter:`,
        singleBotWriteComment: "Schreib deinen Kommentar dazu — so wie du bist, auf dieser Platform.",
    },
    en: {
        posted: (userId) => `@${userId} posted:`,
        commentersIntro:
            "The following people are commenting on this post. Each person writes the way they truly are — staying in character, reacting to the actual topic, on this platform.",
        outputInstructions: `Respond ONLY with a JSON array, no text before or after, no backticks.
No quotation marks inside "content" — use apostrophes instead.`,
        threadHeader: "Previous comments in the thread:",
        threadEmpty: "(No comments yet)",
        threadRules: `The following people are now joining this thread. Important:
- Each person MUST react to at least one of the existing comments — not just to the original post.
- When someone replies to a comment, they mention the author with @username at the start, e.g. "@alex that's not even true..." or "@infoWatch_DE I read that too!"
- The reactions should feel authentic — agreeing, disagreeing, pushing back, provoking — depending on each person's character.
- If someone finds nothing relevant in the thread, they may react only to the post — but this should be the exception.
- If a comment from a bot with the same name already exists, write a new one and never copy the old one.`,
        threadExamples: `Examples of what replies could look like:
- "@motivationsbro_kevin bro you're so right, that's exactly what I thought"
- "@g4nSoderKr4nich99 typical, another comment like that lol"
- "@infoWatch_DE do you have a source for that? sounds off"`,
        singleBotCharacterIntro: (botId) => `You are @${botId} on this platform. Your character:`,
        singleBotWriteComment: "Write your comment on it — staying true to who you are, on this platform.",
    },
};

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

export async function getAllBotComments(
    userPost: Post,
    commentCount: number = 5,
    language: Language = "de"
): Promise<BotResponse[]> {
    if (!userPost.content.trim()) throw new Error("Der Post darf nicht leer sein.");

    const selectedBots = selectBots(loadBots(), Math.min(Math.max(commentCount, 3), 5));
    const t = PROMPT_PARTS[language];

    const prompt = `${PLATFORM_CONTEXT[language]}

${t.posted(userPost.userId)}
"${userPost.content}"

${t.commentersIntro}

${buildBotDescriptions(selectedBots, language)}

${t.outputInstructions}

[
  { "botId": "...", "botType": "...", "content": "..." }
]`;

    return callGeminiAndParse(prompt, userPost.postId);
}

export async function getCommentsForPostAndComments(
    userPost: Post,
    existingComments: PostComment[],
    commentCount: number = 3,
    language: Language = "de"
): Promise<BotResponse[]> {
    if (!userPost.content.trim()) throw new Error("Der Post darf nicht leer sein.");

    const selectedBots = selectBots(loadBots(), Math.min(Math.max(commentCount, 1), 5));
    const t = PROMPT_PARTS[language];

    const commentThread = existingComments
        .map((c) => `@${c.userId}: "${c.content}"`)
        .join("\n");

    const prompt = `${PLATFORM_CONTEXT[language]}

${t.posted(userPost.userId)}
"${userPost.content}"

${t.threadHeader}
${commentThread || t.threadEmpty}

${t.threadRules}

${t.threadExamples}

${buildBotDescriptions(selectedBots, language)}

${t.outputInstructions}

[
  { "botId": "...", "botType": "...", "content": "..." }
]`;

    return callGeminiAndParse(prompt, userPost.postId);
}

export async function getSingleBotComment(
    userPost: Post,
    botId: string,
    language: Language = "de"
): Promise<BotResponse> {
    if (!userPost.content.trim()) throw new Error("Der Post darf nicht leer sein.");

    const bot = loadBots().find((b) => b.botId === botId);
    if (!bot) throw new Error(`Kein Bot mit der ID "${botId}" in bots.json gefunden.`);

    const t = PROMPT_PARTS[language];

    const prompt = `${PLATFORM_CONTEXT[language]}

${t.singleBotCharacterIntro(bot.botId)} ${bot.systemPrompt[language] ?? bot.systemPrompt.de}

${t.posted(userPost.userId)}
"${userPost.content}"

${t.singleBotWriteComment}

${t.outputInstructions}

[
  { "botId": "${bot.botId}", "botType": "${bot.botType}", "content": "..." }
]`;

    const [response] = await callGeminiAndParse(prompt, userPost.postId);
    return response;
}

export async function getRandomSingleBot(userPost: Post, language: Language = "de"): Promise<BotResponse> {
    const randomBot = getRandomBot();
    if (!randomBot) throw new Error("Keine Bots gefunden.");
    return getSingleBotComment(userPost, randomBot.botId, language);
}

export function getBotReflections(comments: BotResponse[], language: Language = "de"): BotReflection[] {
    const seenTypes = new Set<BotType>();

    return comments.reduce<BotReflection[]>((acc, comment) => {
        if (!seenTypes.has(comment.botType)) {
            seenTypes.add(comment.botType);
            const text = REFLECTIONS[comment.botType][language];
            acc.push({ botType: comment.botType, userId: comment.userId, ...text });
        }
        return acc;
    }, []);
}