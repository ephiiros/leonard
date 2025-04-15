import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("shows all commands");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("NOT DONE");
}