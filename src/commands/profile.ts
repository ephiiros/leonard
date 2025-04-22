import { Canvas, createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import {
  AttachmentBuilder,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { doAuth, getShortMatchId, logger } from "../libs/common";
import { join } from "path";

GlobalFonts.registerFromPath(
  join(__dirname, "..", "libs", "Roboto-Medium.ttf"),
  "Roboto Medium"
);

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription(" all commands");

export async function execute(interaction: CommandInteraction) {
  const pb = await doAuth();

  const canvas = createCanvas(300, 500);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // boxes
  ctx.fillStyle = "#dedede";
  ctx.beginPath();
  ctx.roundRect(15, 15, canvas.width - 30, 50, 5);
  ctx.roundRect(15, 75, 130, 130, 5);
  ctx.roundRect(155, 75, 130, 130, 5);
  ctx.fill();

  // avatar
  const avatarImg = await loadImage(
    interaction.user.displayAvatarURL({ extension: "jpg" })
  );
  ctx.drawImage(avatarImg, 15, 15, 50, 50);

  // check if user exists
  return pb
    .collection("User" + interaction.user.id)
    .getFullList()
    .then(async (historyList) => {
      logger.info(`${JSON.stringify(historyList)}`);
      let totalPoints = 0;
      let totalWins = 0;
      let totalScoreWins = 0;
      let maxWins = 0;
      for (var historyItem of historyList) {
        totalPoints += parseInt(historyItem.PointsRecieved);
        if (historyItem.PointsRecieved !== "0") {
          totalWins += 1;
        }
        if (
          historyItem.Picked ===
          historyItem.Team1Score + "-" + historyItem.Team2Score
        ) {
          totalScoreWins += 1;
        }
        maxWins += 1;
      }

      const winrate = Math.round(totalWins / maxWins * 100);
      const scoreWinrate = Math.round(totalScoreWins / maxWins * 100);
      ctx.fillStyle = "#000000";
      ctx.font = "25px Roboto";
      ctx.fillText(`${interaction.user.username}`, 70, 55);
      ctx.fillText(`Winrate%`, 20, 100);
      ctx.fillText(`Score WR%`, 160, 100);
      ctx.font = "50px Roboto";
      ctx.fillText(`${winrate}%`, 40, 160);
      ctx.fillText(`${scoreWinrate}%`, 180, 160);

      const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
        name: "profile-image.png",
      });
      return interaction.reply({ files: [attachment] });
    })
    .catch(() => {
      ctx.font = "50px Roboto";
      ctx.fillStyle = "#000000";
      ctx.fillText("no voting history", 300, 100);

      const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
        name: "profile-image.png",
      });
      return interaction.reply({ files: [attachment] });
    });
}
