import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../config";
import PocketBase from "pocketbase";
const pb = new PocketBase(config.DB_IP);

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Displays Info");

export async function execute(interaction: CommandInteraction) {
  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);
  const record = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID="${interaction.guildId}"`, {});
  console.log(record)
  return interaction.reply(`Server ID: ${interaction.guildId}
Channel ID: ${record.channelID}
Leagues: ${record.leagues}`);
}
