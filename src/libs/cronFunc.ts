import { Channel, Guild, TextChannel } from "discord.js";
import { cacheScheduleLib } from "./cache";
import { config } from "../config";
import PocketBase from "pocketbase";
import { getSingleMatchData } from "./lolFandom";
const pb = new PocketBase(config.DB_IP);
import { DateTime } from "luxon";
import { addPoints } from "./serverLib";

export default async function cronFunction(
  serverID: string,
  guild: Guild,
  channel: TextChannel
) {
  console.log(`[${DateTime.utc()}] Cron tick`);
  console.log(await cacheScheduleLib(guild));
  // check all active timers games

  // TEST 
  console.log(await getSingleMatchData("LCK/2025 Season/Rounds 1-2_Week 3_1"))
  // END TEST 

  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);
  const serverDataCron = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID='${serverID}'`);

  serverDataCron.messageIDList.forEach(async (element: any) => {
    const message = await channel.messages.fetch(element.messageID);
    if (message.poll === null) return;

    const pollClosed = message.poll.resultsFinalized;
    console.log(
      `[${DateTime.utc()}] [${serverID}] ${element.gameID} ${pollClosed}`
    );
    if (pollClosed === false) return;

    const lolFandomData = await getSingleMatchData(element.gameID);

    console.log("lol fandom match result", lolFandomData);
    if (lolFandomData.Winner === null) return;

    addPoints(lolFandomData, message.poll);

    // removeActiveMessage(pollData)
    console.log("regular", serverDataCron.messageIDList);
    const filteredData = serverDataCron.messageIDList.filter(
      (messageItem: any) => messageItem.gameID !== lolFandomData.MatchId
    );
    pb.collection("servers").update(serverDataCron.id, {
      messageIDList: filteredData,
    });
  });
}
