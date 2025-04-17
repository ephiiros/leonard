import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../config";
import { DateTime } from "luxon";
import { AsciiTable3 } from "ascii-table3";
import { doAuth } from "../libs/common";

export const data = new SlashCommandBuilder()
  .setName("showschedule")
  .setDescription("shows the cached schedule");

export async function execute(interaction: CommandInteraction) {
  if (interaction.guildId === null) return;
  const pb = await doAuth()
  const result = await pb
    .collection(`${interaction.guildId}ActiveTimers`)
    .getList(1, 50, {});

  let output = "```\n";
  const table = new AsciiTable3("Saved Timers").setHeading(
    "Time (UTC)",
    "Team1",
    "Team2",
    "BoX"
  );
  let overflow = false;
  let extraRows = 0;
  console.log(result);
  for (var match of result.items) {
    if (overflow === false) {
      table.addRow(
        DateTime.fromISO(match.DateTime_UTC, { zone: 'utc' }).toFormat("dd/MM HH:mm"),
        match.Team1Short !== "" ? match.Team1Short : match.Team1.slice(0, 5),
        match.Team2Short !== "" ? match.Team2Short : match.Team2.slice(0, 5),
        match.BestOf
      );
      if (table.toString().length > 1500) {
        overflow = true;
      }
    } else {
      extraRows += 1;
    }
  }
  output += table.toString();
  if (extraRows > 0) {
    output += "\n..." + extraRows.toString() + "extra rows";
  }
  output += "\n```"
  return interaction.reply(output);
}
