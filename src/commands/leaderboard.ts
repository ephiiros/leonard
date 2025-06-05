import {
  AttachmentBuilder,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { logger } from "../libs/common";
import { RecordModel } from "pocketbase";
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { getSuperuser } from "../api/database/getSuperuser";
import { join } from "path"

GlobalFonts.registerFromPath(
  join(__dirname, "..", "libs", "Roboto-Medium.ttf"),
  "Roboto Medium"
);

GlobalFonts.registerFromPath(
  join(__dirname, "..", "..", "assets", "fonts", "Minecraftia-Regular.ttf"),
  "Minecraft"
);

console.log(GlobalFonts.families)

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("leaderboard!");

export async function execute(interaction: CommandInteraction) {
  const pb = await getSuperuser();
  const leaderboard: any = {};

  const serverData = await pb
    .collection(`servers`)
    .getFirstListItem(`discordServerID='${interaction.guildId}'`);
  
  logger.info(interaction.guildId)

  const cache: RecordModel | "INVALID" = await pb
    .collection(`${interaction.guildId}Leaderboards`)
    .getFirstListItem(`LeaderboardString='${serverData.leaderboard}'`)
    .then((cacheData) => {
      return cacheData;
    })
    .catch(() => {
      // doesnt have cache
      return "INVALID";
    });

  let leaderboardSorted: any[] = []
  await interaction.deferReply();

  if (cache !== "INVALID") {
    // leaderboard will be stored in the form of sorted list of jsons
    leaderboardSorted = cache.Leaderboard
  } else {
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
    let longestname = 0;
    for (const [key, value] of Object.entries(leaderboard)) {
      const user = await interaction.client.users.fetch(key);
      if (user.username.length > longestname) {
        longestname = user.username.length;
      }
      leaderboardSorted.push({
        userid: user.id,
        username: user.username,
        //@ts-ignore
        score: value,
      });
    }
    // i cba
    //@ts-ignore
    leaderboardSorted.sort((a, b) => b.score - a.score);
  }

  logger.info(leaderboardSorted)

  const canvas = createCanvas(400, 600);
  const ctx = canvas.getContext("2d");
  let offset = 120;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "40px Minecraft";
  ctx.fillStyle = "#000000";
  ctx.fillText(serverData.leaderboard, 15, 70);

  const users = await interaction.guild?.members.fetch({
    user: leaderboardSorted.map((leaderboardItem) => leaderboardItem.userid),
  });
  if (users === undefined) return;
  logger.info(JSON.stringify(users));

  let counter = 1;
  for (var leaderboardItem of leaderboardSorted) {
    const user = users.find((user) => user.id === leaderboardItem.userid);
    if (user === undefined) continue;
    logger.info(leaderboardItem)
    logger.info(leaderboardItem.score)
    logger.info(leaderboardItem.username)

    const avatarImg = await loadImage(
      user.displayAvatarURL({ extension: "jpg" })
    );
    ctx.font = "30px Minecraft";
    ctx.fillText(`${counter}.`, 5, offset);
    ctx.drawImage(avatarImg, 45, offset - 60, 50, 50);
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
