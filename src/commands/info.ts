import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getInfoPanel } from "../libs/common"

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Displays Info");

export async function execute(interaction: CommandInteraction) {
  if (interaction.guild === null) return interaction.reply("oopsie")
  const output = await getInfoPanel(interaction.guild)
  return interaction.reply(output)
}
