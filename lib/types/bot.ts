export interface Bot {
    botType: BotType;
    botId: string;
    name: string;
    systemPrompt: {
        de: string;
        en: string;
    };
}

export type BotType = "supportive" | "toxic" | "misinformation";

export type Language = "de" | "en";