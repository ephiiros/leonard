import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { doAuth, logger } from "../libs/common";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("leaderboard!");

export async function execute(interaction: CommandInteraction) {
  const pb = await doAuth();
  const leaderboard: any = {};
  pb.collection(`${interaction.guildId}Users`)
    .getFullList()
    .then((userList) => {
      userList.forEach((userItem) => {
        leaderboard[userItem.discordUserID] = 0
        pb.collection(`User${userItem.discordUserID}`)
          .getFullList()
          .then((historyList) => {
            historyList.forEach((historyItem) => {
              leaderboard[userItem.discordUserID] += historyItem.PointsRecieved
            })
          });
      });
    })
    .catch((e) => {
      logger.error(e);
    });
  return interaction.reply("Pong!");
}
