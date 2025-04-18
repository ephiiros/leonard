import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("suyog")
  .setDescription("guh");

export async function execute(interaction: CommandInteraction) {
  const lines = [
    "suy🤓g",
    "g🤓yus",
    "b🤓gus",
    "s🤓ggy",
    "s🤓ug"
  ]
  return interaction.reply(lines[Math.floor(Math.random()*lines.length)]);
}