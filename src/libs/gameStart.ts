import { Client, PollLayoutType, TextChannel } from "discord.js";

export type gameData = {
    team1: string,
    team2: string,
}

export async function sendGameMessage(client: Client, channel: TextChannel, gameData: gameData) {
    channel.send("HELLO")
    channel.send({
        poll: {
            question: { text: "Who wins?" },
            answers: [
                { text: gameData.team1 },
                { text: gameData.team2 }
            ],
            allowMultiselect: false,
            duration: 6,
            layoutType: PollLayoutType.Default
        }
    })
}