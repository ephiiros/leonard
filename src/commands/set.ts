import {
  CommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { doAuth, logger } from "../libs/common";
import cronFunction from "../libs/cronFunc";

export const data = new SlashCommandBuilder()
  .setName("set")
  .setDescription("Set the channel where the bot sends polls")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("channel")
      .setDescription("set channel")
      .addStringOption((option) =>
        option
          .setName("channelid")
          .setDescription("channel id")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("leagues")
      .setDescription("set leagues")
      .addStringOption((option) =>
        option
          .setName("leagueslist")
          .setDescription("leagueslist")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("leaderboard")
      .setDescription("set leaderboard")
      .addStringOption((option) =>
        option
          .setName("leaderboardstring")
          .setDescription("leaderboardstring")
          .setRequired(true)
      )
  );

export async function execute(interaction: CommandInteraction) {
  if (!interaction.isChatInputCommand()) return;
  const pb = await doAuth();
  const serverData = await pb
    .collection("servers")
    .getFirstListItem(`discordServerID="${interaction.guildId}"`, {});

  switch (interaction.options.getSubcommand()) {
    case "channel":
      const channelID = interaction.options.get("channelid", true);
      logger.info(channelID);
      if (interaction.guild === null) return;
      if (typeof channelID.value !== "string") return;
      const channel = await interaction.guild.channels.fetch(channelID.value);
      if (channel === null) return interaction.reply("error");

      await pb
        .collection(`${interaction.guildId}ActiveTimers`)
        .getList(1, 1)
        .catch(async () => {
          await pb.collections.create({
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
        });

      await pb
        .collection("servers")
        .update(serverData.id, { channelID: channelID.value });

      return interaction.reply(
        "channel set to " + channel.name + " now do /setleagues"
      );

    case "leagues":
      const leagues = interaction.options.get("leagueslist", true);
      if (typeof leagues.value !== "string") {
        return interaction.reply("this should never happen");
      }

      const fetchRecord = await pb
        .collection("servers")
        .getFirstListItem(`discordServerID="${interaction.guildId}"`, {});
      const record = await pb
        .collection("servers")
        .update(fetchRecord.id, { leagues: leagues.value });

      if (interaction.guildId === null) return;

      cronFunction(
        interaction.guildId,
        interaction.client,
        interaction.channel as TextChannel
      );
      return interaction.reply(record.leagues.toString());
    
    case "leaderboard":
      // rename this 
      const leaderboardstring = interaction.options.get("leaderboardstring", true);
      if (typeof(leaderboardstring.value) !== 'string' ) return

      await pb
        .collection(`${interaction.guildId}Leaderboards`)
        .getList(1, 1)
        .catch(async () => {
          await pb.collections.create({
            name: `${interaction.guildId}Leaderboards`,
            type: "base",
            fields: [
              { name: "String", type: "text" },
              { name: "Data", type: "text" },
            ],
          });
        });

      await pb
        .collection("servers")
        .update(serverData.id, { leaderboard: leaderboardstring.value });

      return interaction.reply(leaderboardstring.value)
    default:
      return interaction.reply("default");
  }
}
