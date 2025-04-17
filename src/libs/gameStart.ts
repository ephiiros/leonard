import { PollLayoutType, TextChannel } from "discord.js";
import { DateTime } from "luxon";
import { config } from "../config";
import { MatchData } from "./lolFandomTypes";
import { doAuth, logger } from "./common";
import { messageData } from "./cronFunc";

export async function sendPoll(channel: TextChannel, gameData: MatchData) {
  const pb = await doAuth()
  const serverData = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID='${channel.guildId}'`, {
      requestKey: null,
    });
  const activePolls = serverData.messageIDList.map(
    (item: messageData) => item.MatchData.MatchId
  );
  if (activePolls.includes(gameData.MatchId)) return;
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
    pollData = {
      poll: {
        question: { text: gameData.MatchId },
        answers: [
          {
            text: "(" + gameData.Team1 + ")" + " [2 - 0] " + gameData.Team2,
            emoji: "🟦",
          },
          {
            text: "(" + gameData.Team1 + ")" + " [2 - 1] " + gameData.Team2,
            emoji: "🟦",
          },
          {
            text: gameData.Team1 + " [1 - 2] " + "(" + gameData.Team2 + ")",
            emoji: "🟥",
          },
          {
            text: gameData.Team1 + " [0 - 2] " + "(" + gameData.Team2 + ")",
            emoji: "🟥",
          },
        ],
        allowMultiselect: false,
        duration: pollDelay,
        layoutType: PollLayoutType.Default,
      },
    };
  }
  if (gameData.BestOf === "5") {
    pollData = {
      poll: {
        question: { text: "Who wins?" },
        answers: [
          {
            text: gameData.Team1 + "3 - 0" + gameData.Team2,
            emoji: "",
          },
          {
            text: gameData.Team1 + "3 - 1" + gameData.Team2,
            emoji: "",
          },
          {
            text: gameData.Team1 + "3 - 2" + gameData.Team2,
            emoji: "",
          },
          {
            text: gameData.Team1 + "2 - 3" + gameData.Team2,
            emoji: "",
          },
          {
            text: gameData.Team1 + "1 - 3" + gameData.Team2,
            emoji: "",
          },
          {
            text: gameData.Team1 + "0 - 3" + gameData.Team2,
            emoji: "",
          },
        ],
        allowMultiselect: false,
        duration: pollDelay,
        layoutType: PollLayoutType.Default,
      },
    };
  }
  const sentPoll = await channel.send(pollData);

  pb.collection("servers")
    .getFirstListItem(`discordServerID='${channel.guildId}'`)
    .then((serverData) => {
      if (typeof gameData.DateTime_UTC !== "string") {
        const isoString = gameData.DateTime_UTC.toISO();
        if (isoString !== null) {
          gameData.DateTime_UTC = isoString;
        } else {
          gameData.DateTime_UTC = "INVALID TIME";
        }
      }
      pb.collection("servers").update(serverData.id, {
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
