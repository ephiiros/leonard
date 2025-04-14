import { Guild } from "discord.js";
import { config } from "../config";
import PocketBase from "pocketbase";
import { DateTime } from "luxon";
import { activeTimers } from "./activeTimers";
const pb = new PocketBase(config.DB_IP);

export async function getInfoPanel(guild: Guild) {
  return pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD)
    .then(async () => {
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
            DateTime.fromISO(nextGame["DateTime_UTC"], {zone: 'utc'}).toMillis() /
            1000;
          let activePolls = "\n "
          if (serverData.messageIDList.length > 0) {
            serverData.messageIDList.forEach((item: any) => {
              activePolls += `  1. ${item.gameID} https://discord.com/channels/${serverData.discordServerID}/${serverData.channelID}/${item.messageID}  \n`
            })
          }
          return (
            `- Server ID: ${guild.id}\n` +
            `- Channel ID: ${serverData.channelID}\n` +
            `- Leagues: ${serverData.leagues}\n` +
            `- Timers: ${activeTimers.length}\n` +
            `- Active Polls: ${activePolls}` +
            `- Next Game: ${"<t:" + nextTime + ":R>"}`
          );
        }
      );
    })
    .catch((error) => {
      return error.toString();
    });
}
