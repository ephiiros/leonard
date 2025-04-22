import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("shows all commands");

export async function execute(interaction: CommandInteraction) {
  let output = "" +
  "- `/ping` \n" +
  "- `/info` \n" +
  "- `/schedule` \n" +
  "- `/leaderboard` \n" +
  "- `/profile` \n"

  return interaction.reply(output);
}