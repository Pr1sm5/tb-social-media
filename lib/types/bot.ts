export interface Bot{
    botType: BotType
    botId: string
    name: string
    systemPrompt: string
}

export type BotType = "supportive" | "toxic" | "misinformation";