import { CommandInteraction, Guild, SlashCommandBuilder, TextChannel } from "discord.js";
import { config } from "../config";
import PocketBase from "pocketbase";
import cronFunction from "../libs/cronFunc";
const pb = new PocketBase(config.DB_IP);

export const data = new SlashCommandBuilder()
  .setName("setleagues")
  .setDescription("Set the matching tournament names")
  .addStringOption(option => 
    option.setName("leagues")
      .setDescription("leagues list")
      .setRequired(true));

export async function execute(interaction: CommandInteraction) {
  if (interaction.guildId === null) return
  if (interaction.guild === null) return
  if (interaction.channel === null) return
  //this needs to recache 
  const leagues = interaction.options.get('leagues', true)
  if (typeof(leagues.value) !== 'string') {
    return interaction.reply("this should never happen")
  }

  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);
  const fetchRecord = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID="${interaction.guildId}"`, {});
  const record = await pb.collection('servers').update(fetchRecord.id, {"leagues": leagues.value})
  console.log(record)

  cronFunction(interaction.guildId, interaction.guild, interaction.channel as TextChannel)
  return interaction.reply(record.leagues.toString());
}
