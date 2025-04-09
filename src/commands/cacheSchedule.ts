import {
  ChannelType,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { getFutureLeagueGames } from "../libs/lolFandom";
import { config } from "../config";
import { activeTimers } from "../libs/activeTimers";
import PocketBase from "pocketbase";
import { DateTime } from "luxon";
import { sendGameMessage } from "../libs/gameStart";
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
    cacheScheduleLib(interaction.guild)
    return interaction.reply("Finished!");
  }
}
