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
  ctx.fillStyle = "#b2b2b2";
  ctx.beginPath();
  ctx.roundRect(15, 15, canvas.width - 30, 50, 5);
  ctx.roundRect(15, 75, 130, 130, 5);
  ctx.roundRect(155, 75, 130, 130, 5);
  ctx.roundRect(15, 215, 130, 130, 5);
  ctx.roundRect(15, 360, 265, 130, 5);
  ctx.fill();

  // avatar
  const avatarImg = await loadImage(
    interaction.user.displayAvatarURL({ extension: "jpg" })
  );
  ctx.drawImage(avatarImg, 15, 15, 50, 50);

  // check if user exists
  return pb
    .collection("User" + interaction.user.id)
    .getFullList({
      expand: "MatchDetails",
      sort: "-MatchDetails.DateTime_UTC"
    })
    .then(async (historyList) => {
      // logger.info(`${JSON.stringify(historyList)}`);
      let totalPoints = 0;
      let totalWins = 0;
      let totalScoreWins = 0;
      let maxWins = 0;
      let blobOffset = 20
      for (var historyItem of historyList) {
        // @ts-ignore
        let matchDetails = historyItem.expand.MatchDetails
        logger.info(historyItem)
        logger.info(matchDetails)
        totalPoints += parseInt(historyItem.PointsRecieved);
        if (historyItem.PointsRecieved !== "0") {
          totalWins += 1;
        }
        if (
          historyItem.Picked ===
          matchDetails.Team1Score + "-" + matchDetails.Team2Score
        ) {
          totalScoreWins += 1;
        }
        maxWins += 1;

        if (
          historyItem.Picked ===
          matchDetails.Team1Score + "-" + matchDetails.Team2Score
        ) {
          //green
          ctx.fillStyle = "#64e3a1";
        } else if (historyItem.PointsRecieved === "0") {
          //red
          ctx.fillStyle = "#ff7f7f";
        } else {
          //yellow
          ctx.fillStyle = "#e3cc64";
        }
        
        ctx.beginPath()
        ctx.roundRect(blobOffset, 450 - parseInt(historyItem.PointsRecieved) * 10, 10, 10, 2);
        ctx.fill()
        blobOffset += 12
      }

      const winrate = Math.round(totalWins / maxWins * 100);
      const scoreWinrate = Math.round(totalScoreWins / maxWins * 100);
      ctx.fillStyle = "#000000";
      ctx.font = "25px Roboto";
      ctx.fillText(`${interaction.user.username}`, 70, 55);
      ctx.fillText(`Winrate%`, 20, 100);
      ctx.fillText(`Score WR%`, 160, 100);
      ctx.fillText(`Total Points`, 20, 240);
      ctx.fillText(`LP graph lol`, 20, 390);
      ctx.font = "50px Roboto";
      ctx.fillText(`${winrate}%`, 40, 160);
      ctx.fillText(`${scoreWinrate}%`, 180, 160);
      ctx.fillText(`${totalPoints}`, 40, 300);

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
