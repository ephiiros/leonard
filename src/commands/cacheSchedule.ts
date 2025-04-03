import {
  ChannelType,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { getFutureLeagueGames } from "../libs/lolFandom";
import { config } from "../config";
import { activeTimers } from "../libs/activeTimers";
import PocketBase from "pocketbase";
import { DateTime } from "luxon";
import { sendGameMessage } from "../libs/gameStart";
const pb = new PocketBase(config.DB_IP);

export const data = new SlashCommandBuilder()
  .setName("cacheschedule")
  .setDescription("refreshes all games scheduled on lol fandom");

export async function execute(interaction: CommandInteraction) {
  if (interaction.guildId === null) {
    return interaction.reply("interaction.guildId is null");
  }

  const guildId = interaction.guildId;
  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);
  const serverData = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID='${interaction.guildId}'`);

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
  serverData.leagues.forEach(async (league: string) => {
    const cacheBatch = pb.createBatch();
    const lolFandomData = await getFutureLeagueGames(league);
    const channelResult = await interaction.guild?.channels.fetch(serverData.channelID)

    if (channelResult?.type === ChannelType.GuildText) {
      lolFandomData.forEach((item) => {
        cacheBatch.collection(`${guildId}ActiveTimers`).create({
          MatchId: item.MatchId,
          DateTime_UTC: item.DateTime_UTC.toISO(),
          Team1: item.Team1,
          Team2: item.Team2,
          BestOf: item.BestOf,
        });
        const delayToGame = item.DateTime_UTC.diff(DateTime.utc()).toObject()
          .milliseconds;



        // TODO: idk wtf
        //const myNewTimer = setTimeout(sendGameMessage, delayToGame, channelResult);
        const myNewTimer = setTimeout(console.log, delayToGame, channelResult)

        activeTimers.push(myNewTimer);
      });
    }

    const result = await cacheBatch.send();
    console.log(result);
  });
  console.log(activeTimers.length);
  return interaction.reply("Finished!");
}
