import { config } from "../config";
import PocketBase from "pocketbase";
import pino from "pino";
import { MatchData } from "./lolFandomTypes";
import { Guild, PollLayoutType } from "discord.js";
import { DateTime } from "luxon";
import { messageData } from "./cronFunc";

export const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
      {
        target: "pino/file",
        options: { destination: `${__dirname}/../../logs/app.log` },
      },
    ],
  },
});

export let authpb: PocketBase | null = null;

export async function doAuth() {
  if (authpb === null) {
    logger.info("doing auth first time");
    const pb = new PocketBase(config.DB_IP);
    await pb
      .collection("_superusers")
      .authWithPassword(config.DB_USER, config.DB_PASSWORD);
    pb.autoCancellation(false);
    authpb = pb;
  }
  return authpb;
}

export const activeTimers: NodeJS.Timeout[] = [];

export function getShortMatchId(MatchId: string) {
  return MatchId.replaceAll(" Season", "")
    .replaceAll("Season_", "")
    .replaceAll("Week ", "");
}

export function createBo3Poll(gameData: MatchData, pollDelay: number) {
  return {
    poll: {
      question: { text: getShortMatchId(gameData.MatchId) },
      answers: [
        {
          text:
            "(" + gameData.Team1Short + ")" + " [2 - 0] " + gameData.Team2Short,
          emoji: "🟦",
        },
        {
          text:
            "(" + gameData.Team1Short + ")" + " [2 - 1] " + gameData.Team2Short,
          emoji: "🟦",
        },
        {
          text:
            gameData.Team1Short + " [1 - 2] " + "(" + gameData.Team2Short + ")",
          emoji: "🟥",
        },
        {
          text:
            gameData.Team1Short + " [0 - 2] " + "(" + gameData.Team2Short + ")",
          emoji: "🟥",
        },
      ],
      allowMultiselect: false,
      duration: pollDelay,
      layoutType: PollLayoutType.Default,
    },
  };
}

export function createBo5Poll(gameData: MatchData, pollDelay: number) {
  return {
      poll: {
        question: { text: getShortMatchId(gameData.MatchId) },
        answers: [
          {
            text: gameData.Team1 + " WINS 3 - 0",
            emoji: "🟦",
          },
          {
            text: gameData.Team1 + " WINS 3 - 1",
            emoji: "🟦",
          },
          {
            text: gameData.Team1 + " WINS 3 - 2",
            emoji: "🟦",
          },
          {
            text: gameData.Team2 + " WINS 2 - 3",
            emoji: "🟥",
          },
          {
            text: gameData.Team2 + " WINS 1 - 3",
            emoji: "🟥",
          },
          {
            text: gameData.Team2 + " WINS 0 - 3",
            emoji: "🟥",
          },
        ],
        allowMultiselect: false,
        duration: pollDelay,
        layoutType: PollLayoutType.Default,
      },
    };
}

export async function getInfoPanel(guild: Guild) {
  const pb = await doAuth();
  const nextGamePromise = pb
    .collection(`${guild.id}ActiveTimers`)
    .getFullList({
      sort: "+DateTime_UTC",
    })
    .then((records) => {
      return records[0];
    });

  const serverPromise = pb
    .collection("servers")
    .getFirstListItem(`discordServerID="${guild.id}"`, {});

  return Promise.all([nextGamePromise, serverPromise]).then(
    ([nextGame, serverData]) => {
      const nextTime =
        DateTime.fromISO(nextGame["DateTime_UTC"], { zone: "utc" }).toMillis() /
        1000;
      let activePolls = "\n ";
      if (serverData.messageIDList.length > 0) {
        serverData.messageIDList.forEach((item: messageData) => {
          activePolls +=
            `  1. ${getShortMatchId(item.MatchData.MatchId)}` +
            ` https://discord.com/channels/` +
            `${serverData.discordServerID}/` +
            `${serverData.channelID}/` +
            `${item.messageID}  \n`;
        });
      }
      return (
        `- Server ID: ${guild.id} Channel ID: ${serverData.channelID}\n` +
        `- Timers: ${activeTimers.length}\n` +
        `- Leagues: ${serverData.leagues}\n` +
        `- Active Polls: ${activePolls}` +
        `- Next Game: ${"<t:" + nextTime + ":R>"}`
      );
    }
  );
}
