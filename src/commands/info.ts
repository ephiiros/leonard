import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../config";
import PocketBase from "pocketbase";
import { DateTime } from "luxon";
import { activeTimers } from "../libs/activeTimers";
const pb = new PocketBase(config.DB_IP);

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Displays Info");

export async function execute(interaction: CommandInteraction) {
  pb.collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD)
    .then(async () => {
      if (interaction.guildId) {
        const nextGamePromise = pb
          .collection(`${interaction.guildId}ActiveTimers`)
          .getFullList({
            sort: "+DateTime_UTC",
          })
          .then((records) => {
            return records[0];
          });

        const serverPromise = pb
          .collection("servers")
          .getFirstListItem(`discordServerID="${interaction.guildId}"`, {});

        Promise.all([nextGamePromise, serverPromise]).then(
          ([nextGame, serverData]) => {
            const nextTime =
              DateTime.fromISO(nextGame["DateTime_UTC"]).toUTC().toMillis() /
              1000;
            return interaction.reply(
              `Server ID: ${interaction.guildId}\n` +
                `Channel ID: ${serverData.channelID}\n` +
                `Leagues: ${serverData.leagues}\n` +
                `Timers: ${activeTimers.length}\n` +
                `Next Game: ${"<t:" + nextTime + ":R>"}`
            );
          }
        );
      } else {
        return interaction.reply("interaction.guildid is null");
      }
    })
    .catch((error) => {
      return interaction.reply(error.toString());
    });
}
