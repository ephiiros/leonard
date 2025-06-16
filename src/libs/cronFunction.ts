import { Client, TextChannel } from "discord.js";
import { cacheScheduleLib } from "../api/database/cacheScheduleLib";
import { getSingleMatchData } from "../api/lolFandom/getSingleMatchData";
import { addPoints } from "../api/database/addPoints";
import { logger } from "./common";
import { getSuperuser } from "../api/database/getSuperuser";
import { messageData } from "../types/messageData";

export default async function cronFunction(
  guildId: string,
  client: Client,
  channel: TextChannel
) {
  logger.info(`[${guildId}] Cron tick`);
  // check all active timers games
  const guild = await client.guilds.fetch(guildId)
  await cacheScheduleLib(guild);
  const pb = await getSuperuser();
  pb.collection("servers")
    .getFirstListItem(`discordServerID='${guildId}'`)
    .then((serverDataCron) => {
      serverDataCron.messageIDList.forEach(async (item: messageData) => {
        const message = await channel.messages.fetch(item.messageID);
        if (message.poll === null) return;

        // this is false if noone votes, use timestamp of end instead ?
        const pollClosed = message.poll.resultsFinalized;
        logger.info(`[${guildId}] ${item.MatchData.MatchId} ${pollClosed}`);
        if (pollClosed === false) return;

        const lolFandomData = await getSingleMatchData(item.MatchData.MatchId);
        logger.info(`lol fandom match result winner ${lolFandomData.Winner}`);
        if (lolFandomData.Winner === null) return;

        addPoints(lolFandomData, message.poll);
        channel.send(`Points added for ${item.MatchData.MatchId}`)

        const filteredData = serverDataCron.messageIDList.filter(
          (messageItem: messageData) => messageItem.MatchData.MatchId !== lolFandomData.MatchId
        );
        pb.collection("servers").update(serverDataCron.id, {
          messageIDList: filteredData,
        });

        // invalidateLeaderboards
      });
    });
}
