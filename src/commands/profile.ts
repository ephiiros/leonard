import { Canvas, createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import {
  AttachmentBuilder,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { doAuth, logger } from "../libs/common";
import { join } from "path";

GlobalFonts.registerFromPath(
  join(__dirname, "..", "libs", "Roboto-Medium.ttf"),
  "Roboto Medium"
);

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription(" all commands");

export async function execute(interaction: CommandInteraction) {
  const canvas = createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const avatarImg = await loadImage(
    interaction.user.displayAvatarURL({ extension: "jpg" })
  );
  ctx.drawImage(avatarImg, 25, 25, 200, 200);

  ctx.font = "50px Roboto";
  ctx.fillStyle = "#000000";
  ctx.fillText(interaction.user.username, 300, 50);

  const pb = await doAuth();

  return pb.collection("User" + interaction.user.id).getFullList()
  .then(async (historyList) => {
    let totalPoints = 0
    let offset = 120
    logger.info(`${JSON.stringify(historyList)}`)
    for (var historyItem of historyList) {
      totalPoints += parseInt(historyItem.PointsRecieved)
      ctx.font = "20px Roboto";
      ctx.fillStyle = "#000000";
      ctx.fillText(`${historyItem.MatchId} pts: ${historyItem.PointsRecieved}`, 250, offset);
      offset += 20
    }
    ctx.font = "20px Roboto";
    ctx.fillStyle = "#000000";
    ctx.fillText(`total points: ${totalPoints}`, 300, 80);

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
