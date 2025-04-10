import { ChannelType, Client, TextChannel } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import PocketBase from "pocketbase";
import { DateTime } from "luxon";
import { cacheScheduleLib } from "./libs/cache";
import { CronJob } from "cron";
import { getMatchResult } from "./libs/lolFandom";
import { addPoints } from "./libs/serverLib";
const pb = new PocketBase(config.DB_IP);

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once("ready", async () => {
  console.log(`[${DateTime.utc()}] Ready`);
  pb.collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD)
    .then(async () => {
      console.log(`[${DateTime.utc()}] Pocketbase auth success`);

      const serverPromise = pb
        .collection("servers")
        .getList(1, 1)
        .catch(async () => {
          console.log(`[${DateTime.utc()}] "servers" collection missing`);
          console.log(`[${DateTime.utc()}] creating "servers" collection`);
          await pb.collections.create({
            name: "servers",
            type: "base",
            fields: [
              { name: "discordServerID", type: "text" },
              { name: "channelID", type: "text" },
              { name: "messageIDList", type: "json" },
              { name: "leagues", type: "json" },
            ],
          });
          console.log(`[${DateTime.utc()}] "servers" collection created`);
        });

      const usersPromise = pb
        .collection("users")
        .getList(1, 1)
        .catch(async () => {
          console.log(`[${DateTime.utc()}] "users" collection missing`);
          console.log(`[${DateTime.utc()}] creating "users" collection`);
          await pb.collections.create({
            name: "users",
            type: "base",
            fields: [
              { name: "discordUserID", type: "text" },
              { name: "username", type: "text" },
            ],
          });
          console.log(`[${DateTime.utc()}] "users" collection created`);
        });

      Promise.all([serverPromise, usersPromise]).then(async () => {
        console.log(`[${DateTime.utc()}] All database checks complete`);

        console.log(`[${DateTime.utc()}] Comparing server lists`);
        // All servers that the discord client is in
        const botServerSet: Set<string> = new Set(
          (await client.guilds.fetch()).map((server) => server.id)
        );

        // All servers in pocketbase
        const pbServetSet: Set<string> = new Set(
          (await pb.collection("servers").getFullList()).map(
            (record) => record.discordServerID
          )
        );

        // Fix the difference if there is any
        const newServers = botServerSet.difference(pbServetSet);
        if (newServers.size === 0) {
          console.log(`[${DateTime.utc()}] No unaccounted servers`);
        } else {
          const serverBatch = pb.createBatch();
          newServers.forEach((serverID) => {
            console.log(`[${DateTime.utc()}] UNNACOUNTED SERVER ${serverID}`);
            // TODO: add server to pocketbase with batch
            serverBatch.collection("servers").create({
              discordServerID: serverID,
              channelID: "null",
              messageIDList: [],
              leagues: [],
            });
          });
          serverBatch.send();
        }

        // deploy commands + channel setting
        botServerSet.forEach(async (serverID) => {
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
            helloChannel.send("Pick a channel for the bot using /setchannel");
          } else {
            // channel setup complete, send restart message
            const channel = guild.channels.cache.find(
              (channel) => channel.id === serverData.channelID
            ) as TextChannel | undefined;

            if (channel === undefined) return;

            channel.send("bot restarted, channelID exists");

            console.log(`[${DateTime.utc()}] Caching games`);
            console.log(await cacheScheduleLib(guild));

            const job = new CronJob(
              "0 */1 * * * *",
              async function () {
                console.log(`[${DateTime.utc()}] Cron tick`);
                console.log(await cacheScheduleLib(guild));
                // check all active timers games
                const serverDataCron = await pb
                  .collection("servers")
                  .getFirstListItem(`discordServerID='${serverID}'`);

                serverDataCron.messageIDList.forEach(async (element: any) => {
                  const pollClosed = (
                    await channel.messages.fetch(element.messageID)
                  ).poll?.resultsFinalized;
                  console.log("poll closed?", pollClosed);
                  if (pollClosed === false) return;
                  const pollData = (
                    await channel.messages.fetch(element.messageID)
                  ).poll;
                  if (pollData === null) return;
                  const lolFandomData = await getMatchResult(element.gameID);
                  if (lolFandomData === null) return;
                  console.log("lol fandom match result", lolFandomData);
                  if (lolFandomData.Winner === null) return;

                  addPoints(lolFandomData, pollData);
                  // remove active message ?
                  // removeActiveMessage(pollData)
                  //console.log("regular", serverData.messageIDList);
                  //const filteredData = serverData.messageIDList.filter(
                  //(messageItem: any) =>
                  //messageItem.gameID !== lolFandomData.MatchId
                  //);
                  //pb.collection("servers").update(serverData.id, {
                  //messageIDList: filteredData,
                  //});
                });
              }, // onTick
              null, //onComplete
              true, // start
              "UTC"
            );
          }
        });
      });
    })
    .catch((error) => {
      console.log(`[${DateTime.utc()}] ERROR`);
      console.log(error);
      console.log(`[${DateTime.utc()}] Bot won't function without pocketbase`);
      client.destroy();
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
