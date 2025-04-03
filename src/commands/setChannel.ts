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
  const channelID = interaction.options.get("channelid", true);
  console.log(channelID.value);
  if (interaction.guild && channelID.value) {
    const channel = await interaction.guild.channels.fetch(
      channelID.value as string
    );
    console.log(channel);
    if (channel) {
      await pb
        .collection("_superusers")
        .authWithPassword(config.DB_USER, config.DB_PASSWORD);
      const fetchRecord = await pb
        .collection("servers")
        .getFirstListItem(`discordServerID="${interaction.guildId}"`, {});
      console.log("TEST HERE", fetchRecord.channelID)
      if (fetchRecord.channelID === "null") {
        // first time channel set
        // TODO: create serverActiveTimers collection
        pb.collections.create({
          name: `${interaction.guildId}ActiveTimers`,
          type: "base",
          fields: [
            { name: "MatchId", type: "text" },
            { name: "DateTime_UTC", type: "text" },
            { name: "Team1", type: "text" }, 
            { name: "Team2", type: "text" },
            { name: "BestOf", type: "text" }
          ]
        })
      }
      const record = await pb
        .collection("servers")
        .update(fetchRecord.id, { channelID: channelID.value });
      console.log(record);
      return interaction.reply(channel.name);
    }
  }
  return interaction.reply("error");
}
