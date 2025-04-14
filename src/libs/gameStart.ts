import { PollLayoutType, TextChannel } from "discord.js";
import { DateTime } from "luxon";
import PocketBase from "pocketbase";
import { config } from "../config";
const pb = new PocketBase(config.DB_IP);

export type gameData = {
  team1: string;
  team2: string;
  gameStart: string;
  MatchId: string;
  bestOf: string;
};

export async function sendPoll(channel: TextChannel, gameData: gameData) {
  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD, { requestKey: null });
  const serverData = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID='${channel.guildId}'`, {
      requestKey: null,
    });
  const activePolls = serverData.messageIDList.map((item: any) => item.gameID);
  if (activePolls.includes(gameData.MatchId)) return;
  const gameTime = DateTime.fromISO(gameData.gameStart);
  const timeToGame = gameTime.diff(DateTime.utc());
  let pollDelay = parseInt(config.VOTE_OFFSET);
  if (timeToGame.milliseconds < pollDelay * 3600000) {
    pollDelay = timeToGame.milliseconds / 3600000;
  }
  if (pollDelay < 1) return; // discord cant do polls under an hour and i dont care enough
  let pollData = {
    poll: {
      question: { text: gameData.MatchId },
      answers: [{ text: gameData.team1 }, { text: gameData.team2 }],
      allowMultiselect: false,
      duration: pollDelay,
      layoutType: PollLayoutType.Default,
    },
  };
  if (gameData.bestOf === "3") {
    pollData = {
      poll: {
        question: { text: "Pick Score?" },
        answers: [
          { text: "*" + gameData.team1 + "*" + "2 - 0" + gameData.team2 },
          { text: "*" + gameData.team1 + "*" + "2 - 1" + gameData.team2 },
          { text: gameData.team1 + "1 - 2" + "*" + gameData.team2 + "*" },
          { text: gameData.team1 + "0 - 2" + "*" + gameData.team2 + "*" },
        ],
        allowMultiselect: false,
        duration: pollDelay,
        layoutType: PollLayoutType.Default,
      },
    };
  }
  if (gameData.bestOf === "5") {
    pollData = {
      poll: {
        question: { text: "Who wins?" },
        answers: [
          { text: gameData.team1 + "3 - 0" + gameData.team2 },
          { text: gameData.team1 + "3 - 1" + gameData.team2 },
          { text: gameData.team1 + "3 - 2" + gameData.team2 },
          { text: gameData.team1 + "2 - 3" + gameData.team2 },
          { text: gameData.team1 + "1 - 3" + gameData.team2 },
          { text: gameData.team1 + "0 - 3" + gameData.team2 },
        ],
        allowMultiselect: false,
        duration: pollDelay,
        layoutType: PollLayoutType.Default,
      },
    };
  }
  const sentPoll = await channel.send(pollData);

  pb.collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD)
    .then(() => {
      pb.collection("servers")
        .getFirstListItem(`discordServerID='${channel.guildId}'`)
        .then((serverData) => {
          pb.collection("servers").update(serverData.id, {
            messageIDList: [
              ...serverData.messageIDList,
              {
                messageID: sentPoll.id,
                gameID: gameData.MatchId,
              },
            ],
          });
        });
    });
}
