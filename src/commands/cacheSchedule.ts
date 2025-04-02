import {
  ActionRowBuilder,
  ChannelType,
  CommandInteraction,
  SlashCommandBuilder,
  Team,
  TextChannel,
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
    return interaction.reply("interaction.guildId is null")
  }
  const guildId = interaction.guildId

  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);

  const idResult = await pb.collection(guildId).getFullList({
    fields: "id"
  });
  const idList = idResult.map((item) => {
    return item.id
  })
  console.log(idList.length)

  console.log("BEFORE CLEARED ARRAY", activeTimers);
  activeTimers.forEach((timer) => {
    clearTimeout(timer);
  });
  activeTimers.length = 0;
  console.log("CLEARED ARRAY", activeTimers);

  const batch = pb.createBatch();

  idList.forEach((item) => {
      batch.collection(guildId).delete(item)
  })

  const lolFandomData = await getFutureLeagueGames("LEC");
  const channelResult = await interaction.channel?.fetch();
  console.log(lolFandomData.length)
  if (channelResult?.type === ChannelType.GuildText) {
    lolFandomData.forEach((item) => {
      batch.collection(guildId).create({
        MatchId: item.MatchId,
        DateTime_UTC: item.DateTime_UTC.toISO(),
        Team1: item.Team1,
        Team2: item.Team2,
        BestOf: item.BestOf,
      });
      const now = DateTime.utc();
      const delayToGame = item.DateTime_UTC.diff(now).toObject().milliseconds;
      const myNewTimer = setTimeout(console.log, delayToGame, item.MatchId);
      activeTimers.push(myNewTimer);
      //sendGameMessage(interaction.client, channelResult, {
        //team1: item.Team1,
        //team2: item.Team2,
      //});
    });
  }
  console.log(activeTimers.length);

  const result = await batch.send()
  console.log(result)
  return interaction.reply("Finished!");
}
