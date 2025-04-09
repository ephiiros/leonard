import { Client, PollLayoutType, TextChannel } from "discord.js";
import { config } from "../config";

export type gameData = {
    team1: string,
    team2: string,
    gameStart: string
}

export async function sendGameMessage(channel: TextChannel, gameData: gameData) {
    channel.send("HELLO")
    // get message id 
    channel.send({
        poll: {
            question: { text: "Who wins?" },
            answers: [
                { text: gameData.team1 },
                { text: gameData.team2 }
            ],
            allowMultiselect: false,
            duration: parseInt(config.VOTE_OFFSET),
            layoutType: PollLayoutType.Default
        }
    })

    // post message id to active polls 
    // list should be maybe 
    // [ 
    //   {
    //      messageID,
    //      gameid
    //   }
    // ]

    // refresh cash 
}