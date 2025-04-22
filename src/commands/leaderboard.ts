import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { doAuth, logger } from "../libs/common";
import { RecordModel } from "pocketbase";

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

  const cache: RecordModel | "INVALID" = await pb
    .collection(`${interaction.guildId}Leaderboards`)
    .getFirstListItem(`leaderboardString='${serverData.leaderboard}'`)
    .then((cacheData) => {
      // has cache,
      // could be invalid
      if (cacheData.valid === true) {
        return cacheData;
      } else {
        return "INVALID";
      }
    })
    .catch(() => {
      // doesnt have cache
      return "INVALID";
    });

  if (cache !== "INVALID") {
    // leaderboard will be stored in the form of sorted list of jsons
    let counter = 1;
    let output = "```\n";
    output += `leaderboard: "${serverData.leaderboard}"\n`;
    for (var item of cache.leaderboard) {
      output += `${counter}. ${item.username}${".".repeat(3)}${item.score}\n`;
      counter += 1;
    }
    output += "```";
    return interaction.reply(output);
  }

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

  let counter = 1;
  let output = "```\n";
  output += `leaderboard: "${serverData.leaderboard}"\n`;
  for (var leaderboardItem of leaderboardSorted) {
    output += `${counter}. ${leaderboardItem.username}${".".repeat(
      3 + longestname - leaderboardItem.username.length
    )}${leaderboardItem.score}\n`;
    counter += 1;
  }
  output += "```";
  return interaction.reply(output);
}
