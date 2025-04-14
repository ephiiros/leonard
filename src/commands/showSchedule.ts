import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../config";
import PocketBase from "pocketbase";
import { DateTime } from "luxon";
import { AsciiTable3 } from "ascii-table3";
const pb = new PocketBase(config.DB_IP);

export const data = new SlashCommandBuilder()
  .setName("showschedule")
  .setDescription("shows the cached schedule");

export async function execute(interaction: CommandInteraction) {
  if (interaction.guildId === null) return;
  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);
  const result = await pb
    .collection(`${interaction.guildId}ActiveTimers`)
    .getList(1, 50, {});

  let output = "```\n";
  const table = new AsciiTable3("Saved Timers");
  let overflow = false;
  let extraRows = 0;
  result.items.forEach((item) => {
    if (overflow === false) {
      table.addRow(
        DateTime.fromISO(item.DateTime_UTC).toRelative()?.replace("in ", ""),
        item.Team1,
        item.Team2,
        item.BestOf
      );
      if (table.toString().length > 1500) {
        overflow = true;
      }
    } else {
      extraRows += 1;
    }
  });
  output += table.toString();
  if (extraRows > 0) {
    output += "\n..." + extraRows.toString() + "extra rows" + "\n```";
  }
  return interaction.reply(output);
}
