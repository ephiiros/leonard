import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../config";
import PocketBase from "pocketbase";
import { DateTime } from "luxon";
import { activeTimers } from "../libs/activeTimers";
import { getInfoPanel } from "./infoPanel";
const pb = new PocketBase(config.DB_IP);

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Displays Info");

export async function execute(interaction: CommandInteraction) {

  if (interaction.guild) {
    const output = await getInfoPanel(interaction.guild)
    return interaction.reply(output)
  } else {
    return interaction.reply("this shouldnt happen")
  }
}
