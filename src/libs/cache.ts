import { ChannelType, Guild } from "discord.js";
import { getFutureLeagueGames } from "../libs/lolFandom";
import { config } from "../config";
import { activeTimers } from "../libs/activeTimers";
import PocketBase from "pocketbase";
import { DateTime } from "luxon";
import { sendPoll } from "../libs/gameStart";
const pb = new PocketBase(config.DB_IP);

export async function cacheScheduleLib(guild: Guild) {
  const guildId = guild.id;
  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);
  const serverData = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID='${guildId}'`);

  // Clear pocketbase cache
  const idTimersResult = await pb
    .collection(`${guildId}ActiveTimers`)
    .getFullList({
      fields: "id",
    });
  const idTimersList = idTimersResult.map((item) => item.id);
  if (idTimersList.length > 0) {
    const deleteBatch = pb.createBatch();
    idTimersList.forEach((item) => {
      deleteBatch.collection(`${guildId}ActiveTimers`).delete(item);
    });
    deleteBatch.send();
  }

  // Clear local timers
  activeTimers.forEach((timer) => {
    clearTimeout(timer);
  });
  activeTimers.length = 0;

  // Cache games for each league
  for (const league of serverData.leagues) {
    const cacheBatch = pb.createBatch();
    // this has a chance to return nothing if
    // league is wrong and then bot complains coz empty batch
    const lolFandomData = await getFutureLeagueGames(league);
    const channelResult = await guild.channels.fetch(serverData.channelID);

    if (channelResult?.type === ChannelType.GuildText) {
      lolFandomData.forEach((item) => {
        cacheBatch.collection(`${guildId}ActiveTimers`).create({
          MatchId: item.MatchId,
          DateTime_UTC: item.DateTime_UTC.toISO(),
          BestOf: item.BestOf,
          Team1: item.Team1,
          Team2: item.Team2,
          Team1Short: item.Team1Short,
          Team2Short: item.Team2Short
        });
        const delayToGame = item.DateTime_UTC.diff(DateTime.utc()).toObject()
          .milliseconds;

        let isoGameData = item.DateTime_UTC.toISO();
        if (isoGameData === null) {
          isoGameData = "gg";
        }

        if (delayToGame !== undefined) {
          const myNewTimer = setTimeout(() => {
            sendPoll(channelResult, {
              team1: item.Team1,
              team2: item.Team2,
              gameStart: isoGameData,
              MatchId: item.MatchId,
              bestOf: item.BestOf,
            });
          }, Math.max(0, delayToGame - parseInt(config.VOTE_OFFSET) * 3600000));
          activeTimers.push(myNewTimer);
        }
      });
    }
    console.log("batching")
    await cacheBatch.send({ requestKey: null });
  }
  return `[${DateTime.utc()}] Cache Complete`;
}
