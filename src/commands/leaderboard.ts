import {
  AttachmentBuilder,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { doAuth, logger } from "../libs/common";
import { RecordModel } from "pocketbase";
import { createCanvas, loadImage } from "@napi-rs/canvas";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("leaderboard!");

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();
  const pb = await doAuth();
  const leaderboard: any = {};
  // pb.collection(`${serverid}Leaderboards)
  // check if item like leaderboardstring exists
  // check if leaderboard is valid

  const serverData = await pb
    .collection(`servers`)
    .getFirstListItem(`discordServerID='${interaction.guildId}'`);
  
  logger.info(interaction.guildId)

  const cache: RecordModel | "INVALID" = await pb
    .collection(`${interaction.guildId}Leaderboards`)
    .getFirstListItem(`LeaderboardString='${serverData.leaderboard}'`)
    .then((cacheData) => {
      return cacheData.LeaderboardString;
    })
    .catch(() => {
      // doesnt have cache
      return "INVALID";
    });

  logger.info(cache);

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
            expand: "MatchDetails",
            filter: `MatchDetails.MatchId~'${serverData.leaderboard}'`,
          })
          .then((historyList) => {
            for (var historyItem of historyList) {
              //@ts-ignore
              if (historyItem.expand.MatchDetails.MatchId)
                leaderboard[userItem.discordUserID] += parseInt(
                  historyItem.PointsRecieved
                );
            }
          });
      }
    })
    .catch((e) => {
      logger.error(e);
    })
    .then((res) => {
      logger.info(res);
    });
  let leaderboardSorted = [];
  let longestname = 0;
  for (const [key, value] of Object.entries(leaderboard)) {
    const user = await interaction.client.users.fetch(key);
    if (user.username.length > longestname) {
      longestname = user.username.length;
    }
    leaderboardSorted.push({
      userid: user.id,
      username: user.username,
      score: value,
    });
  }
  // i cba
  //@ts-ignore
  leaderboardSorted.sort((a, b) => b.score - a.score);

  const canvas = createCanvas(400, 500);
  const ctx = canvas.getContext("2d");
  let offset = 100;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "40px Roboto";
  ctx.fillStyle = "#000000";
  ctx.fillText(serverData.leaderboard, 0, 50);

  const users = await interaction.guild?.members.fetch({
    user: leaderboardSorted.map((leaderboardItem) => leaderboardItem.userid),
  });
  if (users === undefined) return;
  logger.info(JSON.stringify(users));

  let counter = 1;
  for (var leaderboardItem of leaderboardSorted) {
    const user = users.find((user) => user.id === leaderboardItem.userid);
    if (user === undefined) continue;

    const avatarImg = await loadImage(
      user.displayAvatarURL({ extension: "jpg" })
    );
    ctx.fillText(`${counter}.`, 5, offset);
    ctx.drawImage(avatarImg, 45, offset - 45, 50, 50);
    ctx.fillText(leaderboardItem.username, 100, offset);
    ctx.fillText(leaderboardItem.score as string, 350, offset);
    offset += 55;
    counter += 1;
  }

  const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
    name: "leaderboard.png",
  });

  await pb.collection(`${interaction.guildId}Leaderboards`).create(
    {
      LeaderboardString: serverData.leaderboard,
      Leaderboard: leaderboardSorted
    }
  )
  return interaction.editReply({ files: [attachment] });
}
