import { PollLayoutType, TextChannel } from "discord.js";
import { DateTime } from "luxon";
import { config } from "../../config";
import { MatchData } from "../../types/lolFandomTypes";
import { logger } from "../../libs/common";
import { messageData } from "../../types/messageData";
import { getSuperuser } from "../../api/database/getSuperuser";
import { createBo3Poll } from "../../libs/createBo3Poll";
import { createBo5Poll } from "../../libs/createBo5Poll";

export async function sendPoll(channel: TextChannel, gameData: MatchData) {
  logger.info(`sendPoll(${channel.id}, ${JSON.stringify(gameData)}`)
  const pb = await getSuperuser()
  const serverData = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID='${channel.guildId}'`, {
      requestKey: null,
    });

  // has poll already been sent
  const activePolls = serverData.messageIDList.map(
    (item: messageData) => item.MatchData.MatchId
  );
  if (activePolls.includes(gameData.MatchId)) return;

  // getting poll delay
  if (typeof gameData.DateTime_UTC === "string") {
    gameData.DateTime_UTC = DateTime.fromISO(gameData.DateTime_UTC);
  }
  const timeToGame = gameData.DateTime_UTC.diff(DateTime.utc());
  const hoursTimeDiff = timeToGame.shiftTo("hours").toObject();
  if (hoursTimeDiff.hours === undefined) return;
  let pollDelay = parseInt(config.VOTE_OFFSET);
  if (timeToGame.shiftTo("hours").hours < pollDelay) {
    pollDelay = hoursTimeDiff.hours;
  }

  // discord cant do polls under an hour and i dont care enough
  if (pollDelay < 1) return;

  let pollData = {
    poll: {
      question: { text: gameData.MatchId },
      answers: [
        { text: gameData.Team1, emoji: "🟦" },
        { text: gameData.Team2, emoji: "🟥" },
      ],
      allowMultiselect: false,
      duration: pollDelay,
      layoutType: PollLayoutType.Default,
    },
  };
  if (gameData.BestOf === "3") {
    pollData = createBo3Poll(gameData, pollDelay)
  }
  if (gameData.BestOf === "5") {
    pollData = createBo5Poll(gameData, pollDelay)
  }
  const sentPoll = await channel.send(pollData);

  await pb.collection("servers")
    .getFirstListItem(`discordServerID='${channel.guildId}'`)
    .then(async (serverData) => {
      if (typeof gameData.DateTime_UTC !== "string") {
        const isoString = gameData.DateTime_UTC.toISO();
        if (isoString !== null) {
          gameData.DateTime_UTC = isoString;
        } else {
          gameData.DateTime_UTC = "INVALID TIME";
        }
      }
      await pb.collection("servers").update(serverData.id, {
        messageIDList: [
          ...serverData.messageIDList,
          {
            messageID: sentPoll.id,
            MatchData: {
              MatchId: gameData.MatchId,
              DateTime_UTC: gameData.DateTime_UTC,
              BestOf: gameData.BestOf,
              Winner: gameData.Winner,
              Team1: gameData.Team1,
              Team2: gameData.Team2,
              Team1Short: gameData.Team1Short,
              Team2Short: gameData.Team2Short,
              Team1Score: gameData.Team1Score,
              Team2Score: gameData.Team2Score,
            }
          },
        ],
      });
    });
}