import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../config";
import PocketBase from "pocketbase";
const pb = new PocketBase(config.DB_IP);

export const data = new SlashCommandBuilder()
  .setName("setchannel")
  .setDescription("Set the channel where the bot sends polls")
  .addStringOption((option) =>
    option.setName("channelid").setDescription("channel id").setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  // this needs to retrigger starting checks and welcome msg
  const channelID = interaction.options.get("channelid", true);
  if (interaction.guild === null) return;
  const channel = await interaction.guild.channels.fetch(
    // fix "as" later
    channelID.value as string
  );
  if (channel === null) return interaction.reply("error");
  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);
  const serverData = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID="${interaction.guildId}"`, {});
  if (serverData.channelID === "null") {
    pb.collections.create({
      name: `${interaction.guildId}ActiveTimers`,
      type: "base",
      fields: [
        { name: "MatchId", type: "text" },
        { name: "DateTime_UTC", type: "text" },
        { name: "BestOf", type: "text" },
        { name: "Team1", type: "text" },
        { name: "Team2", type: "text" },
        { name: "Team1Short", type: "text" },
        { name: "Team2Short", type: "text" },
      ],
    });
  }
  const record = await pb
    .collection("servers")
    .update(serverData.id, { channelID: channelID.value });
  console.log(record);
  return interaction.reply(
    "channel set to " + channel.name + " now do /setleagues"
  );
}
