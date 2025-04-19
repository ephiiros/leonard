import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { doAuth, logger } from "../libs/common";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("leaderboard!");

export async function execute(interaction: CommandInteraction) {
  const pb = await doAuth();
  const leaderboard: any = {};
  // get the preset leaderboard string
  // pb serverData
  // pb.collection(`${serverid}Leaderboards)
  // check if item like leaderboardstring exists
  // check if leaderboard is valid

  const serverData = await pb
    .collection(`servers`)
    .getFirstListItem(`discordServerID='${interaction.guildId}'`);
  await pb
    .collection(`${interaction.guildId}Users`)
    .getFullList()
    .then(async (userList) => {
      for (var userItem of userList) {
        leaderboard[userItem.discordUserID] = 0;
        await pb
          .collection(`User${userItem.discordUserID}`)
          .getFullList({
            filter: `MatchId~'${serverData.leaderboard}'`,
          })
          .then((historyList) => {
            for (var historyItem of historyList) {
              if (historyItem.MatchId)
                leaderboard[userItem.discordUserID] += parseInt(
                  historyItem.PointsRecieved
                );
            }
          });
      }
    })
    .catch((e) => {
      logger.error(e);
    });
  let leaderboardSorted = [];
  let longestname = 0;
  for (const [key, value] of Object.entries(leaderboard)) {
    const user = await interaction.client.users.fetch(key);
    if (user.username.length > longestname) {
      longestname = user.username.length;
    }
    leaderboardSorted.push({ username: user.username, score: value });
  }
  // i cba
  //@ts-ignore
  leaderboardSorted.sort((a, b) => b.score - a.score);

  let counter = 1
  let output = "```\n";
  output += `leaderboard: "${serverData.leaderboard}"\n`
  for (var item of leaderboardSorted) {
    output += `${counter}. ${item.username}${".".repeat(
      3 + longestname - item.username.length
    )}${item.score}\n`;
    counter += 1;
  }
  output += "```";
  return interaction.reply(output)
}
