import { Client } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import PocketBase from "pocketbase";
import { DateTime } from "luxon";
const pb = new PocketBase(config.DB_IP);

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once("ready", async () => {
  console.log(`[${DateTime.utc()}] Ready`);
  await pb
    .collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD);

  const serverObjects = await client.guilds.fetch();
  const botServerList: Set<string> = new Set(
    serverObjects.map((server) => server.id)
  );
  const pbServerList = new Set(
    (await pb.collection("servers").getFullList()).map(
      (record) => record.discordServerID
    )
  );
  const newServers = botServerList.difference(pbServerList);
  serverObjects.forEach((serverObject) => {
    console.log(serverObject);
  });
  console.log(botServerList);
  botServerList.forEach(async (serverID) => {
    console.log("deploying commands to ", serverID)
    await deployCommands({ guildId: serverID });

    if (false) {

    const record2 = await pb
      .collections.create({
        name: serverID,
        type: "base",
        fields: [
          {name: "MatchId", type: "text"},
          {name: "DateTime_UTC", type: "text"},
          {name: "Team1", type: "text"},
          {name: "Team2", type: "text"},
          {name: "BestOf", type: "text"}
        ]
      })
      console.log("bah")
    console.log(record2)
    }

  })
  console.log(pbServerList);
  console.log(newServers);
  if (newServers.size === 0) {
    console.log(`[${DateTime.utc()}] No unaccounted servers`);
  }
  newServers.forEach(async (serverID) => {
    console.log("adding new server ", serverID);
  });
});

client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
  const records = await pb.collection("users").getFullList({
    sort: "id",
  });
  console.log(records);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.DISCORD_TOKEN);
