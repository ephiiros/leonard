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

  const canvas = createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // avatar background
    ctx.fillStyle = "#dedede";
    ctx.beginPath()
    ctx.roundRect(15, 15, canvas.width - 30, 50, 10);
    ctx.fill()

  // avatar
  const avatarImg = await loadImage(
    interaction.user.displayAvatarURL({ extension: "jpg" })
  );
  ctx.drawImage(avatarImg, 15, 15, 50, 50);

  // check if user exists
  return pb.collection("User" + interaction.user.id).getFullList()
  .then(async (historyList) => {
    let totalPoints = 0
    let offset = 120
    logger.info(`${JSON.stringify(historyList)}`)

    //table header 
    ctx.fillStyle = "#dedede";
    ctx.beginPath()
    ctx.roundRect(15, offset - 25 - 18, canvas.width - 30, 22, 10);
    ctx.fill()

    ctx.fillStyle = "#a0a0a0";
    ctx.beginPath()
    ctx.roundRect(canvas.width - 60, offset - 25 - 18, 45, 22, 10);
    ctx.fill()

    ctx.font = "18px Roboto";
    ctx.fillStyle = "#000000";
    ctx.fillText("Match", 20, offset - 25)
    ctx.fillText("Pts", canvas.width - 50, offset - 25)


    for (var historyItem of historyList) {
      totalPoints += parseInt(historyItem.PointsRecieved)

      if (historyItem.PointsRecieved !== "0") {
        ctx.fillStyle = "#64e3a1";
      } else {
        ctx.fillStyle = "#ff7f7f"
      }
      ctx.beginPath()
      ctx.roundRect(15, offset - 18, canvas.width - 30, 22, 10);
      ctx.fill()

      if (historyItem.PointsRecieved !== "0") {
        ctx.fillStyle = "#43996c";
      } else {
        ctx.fillStyle = "#ba7070"
      }
      ctx.beginPath()
      ctx.roundRect(canvas.width - 60, offset - 18, 45, 22, 10);
      ctx.fill()

      ctx.fillStyle = "#000000";
      ctx.fillText(`${getShortMatchId(historyItem.MatchId)}`, 20, offset); 
      ctx.fillText(`+${historyItem.PointsRecieved}`, canvas.width - 50, offset); 

      offset += 25
    }
    ctx.font = "50px Roboto";
    ctx.fillStyle = "#000000";
    ctx.fillText(`${interaction.user.username} total pts: ${totalPoints}`, 70, 55);

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
  })
}
