import { ChannelType, Client, TextChannel } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { DateTime } from "luxon";
import { CronJob } from "cron";
import cronFunction from "./libs/cronFunc";
import { authpb, doAuth, logger } from "./libs/common";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once("ready", async () => {
  logger.info("Client Ready");
  const pb = await doAuth();
  if (authpb === null) return;

  // check server list exists
  await authpb
    .collection("servers")
    .getList(1, 1)
    .catch(async () => {
      logger.warn('"servers" collection missing');
      logger.warn('creating "servers" collection');
      await pb.collections.create(
        {
          name: "servers",
          type: "base",
          fields: [
            { name: "discordServerID", type: "text" },
            { name: "channelID", type: "text" },
            { name: "messageIDList", type: "json" },
            { name: "leagues", type: "json" },
          ],
        },
        { requestKey: null }
      );
      console.log(`[${DateTime.utc()}] "servers" collection created`);
    });

  logger.info("Comparing server lists");
  // All servers that the discord client is in
  const botGuildIdSet: Set<string> = new Set(
    (await client.guilds.fetch()).map((guild) => guild.id)
  );

  botGuildIdSet.delete("207209418906009602");

  // All servers in pocketbase
  const pbServerIdSet: Set<string> = new Set(
    (await pb.collection("servers").getFullList()).map(
      (record) => record.discordServerID
    )
  );

  // Fix the difference if there is any
  const newServers = botGuildIdSet.difference(pbServerIdSet);
  const serverBatch = pb.createBatch();
  if (newServers.size > 0) {
    newServers.forEach((serverID) => {
      logger.warn(`UNNACOUNTED SERVER ${serverID}`);
      serverBatch.collection("servers").create({
        discordServerID: serverID,
        channelID: "null",
        messageIDList: [],
        leagues: [],
      });
    });
  }
  await serverBatch.send().catch(() => logger.info("All servers good"));

  // deploy commands + channel setting
  botGuildIdSet.forEach(async (serverID) => {
    await deployCommands({ guildId: serverID });

    const guild = await client.guilds.fetch(serverID);
    const helloChannel = guild.channels.cache.find(
      (channel) =>
        channel.type === ChannelType.GuildText && channel.isSendable()
    );
    // not a single typable channel
    if (helloChannel === undefined) return;

    const serverData = await pb
      .collection("servers")
      .getFirstListItem(`discordServerID='${serverID}'`);

    if (serverData.channelID === "null") {
      console.log(`[${DateTime.utc()}] [${serverID}] no channelID`);
      //helloChannel.send("Pick a channel for the bot using /setchannel");
    } else {
      // channel setup complete, send restart message
      const channel = guild.channels.cache.find(
        (channel) => channel.id === serverData.channelID
      ) as TextChannel | undefined;

      if (channel === undefined) return;

      await cronFunction(serverID, client, channel);

      new CronJob(
        "0 */5 * * * *",
        function () {
          cronFunction(serverID, client, channel);
        }, // onTick
        null, //onComplete
        true, // start
        "UTC"
      );
    }
  });
});

client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
  const pb = await doAuth();
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
