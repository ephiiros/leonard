import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../config";
import PocketBase from "pocketbase";
import { cacheScheduleLib } from "../libs/cache";
const pb = new PocketBase(config.DB_IP);

export const data = new SlashCommandBuilder()
  .setName("cacheschedule")
  .setDescription("refreshes all games scheduled on lol fandom");

export async function execute(interaction: CommandInteraction) {
  if (interaction.guildId === null) {
    return interaction.reply("interaction.guildId is null");
  }

  if (interaction.guild) {
    cacheScheduleLib(interaction.guild);
    return interaction.reply("Finished!");
  }
}
