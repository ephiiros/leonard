import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getFutureLeagueGames } from "../libs/lolFandom";
import { config } from "../config";
import PocketBase from "pocketbase";
const pb = new PocketBase(config.DB_IP);

export const data = new SlashCommandBuilder()
  .setName("cacheschedule")
  .setDescription("refreshes all games scheduled on lol fandom");

export async function execute(interaction: CommandInteraction) {
  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);
  const batch = pb.createBatch()

  const lolFandomData = await getFutureLeagueGames("LEC");
  lolFandomData.forEach((item) => {
    if (interaction.guildId) {
      batch.collection(interaction.guildId)
        .create({
        "MatchId": item.MatchId,
        "DateTime_UTC": item.DateTime_UTC.toISO(),
        "Team1": item.Team1,
        "Team2": item.Team2,
        "BestOf": item.BestOf
      })
    }
  })
  const result = await batch.send()
  console.log(result)
  return interaction.reply("Finished!");
}
