import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../config";
import PocketBase from "pocketbase";
const pb = new PocketBase(config.DB_IP);

export const data = new SlashCommandBuilder()
  .setName("showschedule")
  .setDescription("shows the cached schedule");

export async function execute(interaction: CommandInteraction) {
  let output = "```\n";
  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);
  if (interaction.guildId) {
    const result = await pb.collection(interaction.guildId).getList(1, 50, {});
    console.log(result);
    result.items.forEach((item) => {
      output += 
        item.DateTime_UTC + "\t" + 
        item.Team1 + "\t" +
        item.Team2 + "\t" +
        item.BestOf + "\n";
    });
  }
  output += "\n```";

  return interaction.reply(output);
}
