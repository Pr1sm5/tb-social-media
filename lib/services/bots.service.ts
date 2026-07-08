import {loadBots as getBots} from "@/lib/data/dataManager";
import {Bot} from "@/lib/types/bot";




export function getBotByType(botType :string ) : Bot | undefined{
    return getBots().find(b => b.botType === botType)
}


export function getBotById(botId : string) : Bot | undefined{
    return getBots().find(b => b.botId === botId)
}


export function getRandomBotByType(botType : string) : Bot | undefined{
    const data = getBots()
    const filtered = data.filter(b => b.botType === botType)

    if (filtered.length === 0) return undefined

    const randomIndex = Math.floor(Math.random() * filtered.length)
    return filtered[randomIndex]
}


export function getRandomBot() : Bot | undefined{
    const data = getBots()

    if (data.length === 0) return undefined

    const randomIndex = Math.floor(Math.random() * data.length)
    return data[randomIndex]
}

