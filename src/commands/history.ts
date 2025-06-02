import {
  AttachmentBuilder,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { doAuth, getShortMatchId, logger } from "../libs/common";
import { createCanvas } from "@napi-rs/canvas";
import { DateTime } from "luxon";

export const data = new SlashCommandBuilder()
  .setName("history")
  .setDescription("history");

export async function execute(interaction: CommandInteraction) {
  const pb = await doAuth();

  const canvas = createCanvas(620, 250);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // check if user exists
  return pb
    .collection("User" + interaction.user.id)
    .getFullList({ 
      expand: "MatchDetails",
      sort: "-MatchDetails.DateTime_UTC" })
    .then(async (historyList) => {
      let offset = 70;
      logger.info(`${JSON.stringify(historyList)}`);

      // banner
      ctx.font = "20px Roboto";
      ctx.fillStyle = "#000000";
      ctx.fillText(`${interaction.user.username} history`, 70, 20);

      //table bg
      ctx.fillStyle = "#dedede";
      ctx.beginPath();
      ctx.roundRect(10, offset - 30 - 18, 600, canvas.height, 10);
      ctx.fill();

      ctx.font = "18px Roboto";
      ctx.fillStyle = "#000000";
      ctx.fillText("Match", 25, offset - 25);
      ctx.fillText("DateTime", 215, offset - 25);
      ctx.fillText("Blue", 330, offset - 25);
      ctx.fillText("Red", 390, offset - 25);
      ctx.fillText("Score", 450, offset - 25);
      ctx.fillText("Pick", 500, offset - 25);
      ctx.fillText("Pts", 550, offset - 25);

      for (var historyItem of historyList) {

        //@ts-ignore
        let matchDetails = historyItem.expand.MatchDetails
        // item bg
        if (historyItem.PointsRecieved === "0") {
          ctx.fillStyle = "#ff7f7f";
        } else if (
          historyItem.Picked ===
          matchDetails.Team1Score + "-" + matchDetails.Team2Score
        ) {
          ctx.fillStyle = "#64e3a1";
        } else {
          ctx.fillStyle = "#e3cc64";
        }

        ctx.beginPath();
        ctx.roundRect(25, offset - 18, 185, 22, 5);
        ctx.roundRect(215, offset - 18, 110, 22, 5);
        ctx.roundRect(330, offset - 18, 55, 22, 5);
        ctx.roundRect(390, offset - 18, 55, 22, 5);
        ctx.roundRect(450, offset - 18, 45, 22, 5);
        ctx.roundRect(500, offset - 18, 45, 22, 5);
        ctx.roundRect(550, offset - 18, 45, 22, 5);
        ctx.fill();

        // match id
        ctx.fillStyle = "#000000";
        ctx.fillText(`${getShortMatchId(matchDetails.MatchId)}`, 30, offset);

        // datetime
        const date = DateTime.fromISO(matchDetails.DateTime_UTC);
        if (date) {
          ctx.fillText(`${date.toFormat("dd/MM HH:mm")}`, 220, offset);
        }

        // teams
        ctx.fillText(`${matchDetails.Team1Short} `, 335, offset);
        ctx.fillText(`${matchDetails.Team2Short} `, 395, offset);

        // score
        ctx.fillText(
          `${matchDetails.Team1Score} - ${matchDetails.Team2Score}`,
          455,
          offset
        );

        // pick
        ctx.fillText(`${historyItem.Picked.replace("-", " - ")}`, 505, offset);

        // points
        ctx.fillText(`+${historyItem.PointsRecieved}`, 555, offset);

        offset += 25;
      }

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
