import { Client, PollLayoutType, TextChannel } from "discord.js";
import { DateTime } from "luxon";
import PocketBase from "pocketbase";
import { config } from "../config";
const pb = new PocketBase(config.DB_IP);

export type gameData = {
  team1: string;
  team2: string;
  gameStart: string;
  MatchId: string;
};

export async function sendGameMessage(
  channel: TextChannel,
  gameData: gameData
) {
  await pb.collection("_superusers")
  .authWithPassword(config.DB_USER, config.DB_PASSWORD)
  const serverData = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID='${channel.guildId}'`)
  const activePolls = serverData.messageIDList.map((item: any) => item.gameID)
  if (activePolls.includes(gameData.MatchId)) {
    const poll = serverData.messageIDList.find((item:any) => item.gameID === gameData.MatchId)
    console.log("game is already in messages")
  } else {
    channel.send("HELLO");
    const gameTime = DateTime.fromISO(gameData.gameStart);
    const timeToGame = gameTime.diff(DateTime.utc())
    console.log(timeToGame)
    let pollDelay = parseInt(config.VOTE_OFFSET);
    if (timeToGame.milliseconds < pollDelay * 3600000) {
      pollDelay = timeToGame.milliseconds / 3600000;
    }
    console.log("POLL DELAY", pollDelay)
    // get message id
    const sentPoll = await channel.send({
      poll: {
        question: { text: "Who wins?" },
        answers: [{ text: gameData.team1 }, { text: gameData.team2 }],
        allowMultiselect: false,
        duration: pollDelay,
        layoutType: PollLayoutType.Default,
      },
    });

    pb.collection("_superusers")
      .authWithPassword(config.DB_USER, config.DB_PASSWORD)
      .then(() => {
        pb.collection("servers")
          .getFirstListItem(`discordServerID='${channel.guildId}'`)
          .then((serverData) => {
            pb.collection("servers")
              .update(serverData.id, {
                "messageIDList": [...serverData.messageIDList, {
                  "messageID": sentPoll.id,
                  "gameID": gameData.MatchId
                }]
              })
          })
      });

  }
}
