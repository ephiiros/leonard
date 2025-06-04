import { Guild } from "discord.js";
import { getSuperuser } from "../api/database/getSuperuser";
import { DateTime } from "luxon";
import { activeTimers, getShortMatchId } from "./common";
import { messageData } from "../types/messageData";

export async function getInfoPanel(guild: Guild) {
  const pb = await getSuperuser();
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