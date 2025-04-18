import { Poll } from "discord.js";
import { MatchData } from "./lolFandomTypes";
import { doAuth, logger } from "./common";

export async function addPoints(matchData: MatchData, pollData: Poll) {
  logger.info(`addPoints ${matchData.MatchId}`)
  const pb = await doAuth()

  if (matchData.BestOf === "1") {

    // check if users collection exists for server
    await pb
      .collection(`${pollData.message.guildId}Users`)
      .getList(1, 1)
      .catch(async () => {
        await pb.collections.create({
          name: pollData.message.guildId + "Users",
          type: "base",
          fields: [
            { name: "discordUserID", type: "text" },
            { name: "username", type: "text" },
          ],
        }).catch((e) => {
          logger.info("ERRORR")
          logger.info(e)});
      });

    pollData.answers.each(async (pollItem, id) => {
      // is user in server users list
      const voters = await pollItem.fetchVoters();
      voters.forEach(async (voterUser) => {
        await pb
          .collection(`${pollData.message.guildId}Users`)
          .getFirstListItem(`discordUserID=${voterUser.id}`)
          .catch(async () => {
            // user is not in users list of server
            await pb.collection(`${pollData.message.guildId}Users`).create({
              discordUserID: voterUser.id,
              username: voterUser.username,
            });
          });
        // user guaranteed in server

        // check that user history is created
        await pb
          .collection(`User${voterUser.id}`)
          .getList(1, 1)
          .catch(async () => {
            await pb.collections.create({
              name: "User" + voterUser.id,
              type: "base",
              fields: [
                { name: "MatchId", type: "text" },
                { name: "PointsRecieved", type: "text" },
              ],
            });
          });

        await pb.collection(`User${voterUser.id}`).create({
          MatchId: matchData.MatchId,
          PointsRecieved: 1,
        });
      });
    });

  }
  if (matchData.BestOf === "3") {
    let pointsList: number[] = [0, 0, 0, 0];

    if (matchData.Team1Score === "2" && matchData.Team2Score === "0") {
      pointsList = [3, 1, 0, 0];
    }
    if (matchData.Team1Score === "2" && matchData.Team2Score === "1") {
      pointsList = [1, 3, 0, 0];
    }
    if (matchData.Team1Score === "1" && matchData.Team2Score === "2") {
      pointsList = [0, 0, 3, 1];
    }
    if (matchData.Team1Score === "0" && matchData.Team2Score === "2") {
      pointsList = [0, 0, 1, 3];
    }

    // check if users collection exists for server
    await pb
      .collection(`${pollData.message.guildId}Users`)
      .getList(1, 1)
      .catch(async () => {
        await pb.collections.create({
          name: pollData.message.guildId + "Users",
          type: "base",
          fields: [
            { name: "discordUserID", type: "text" },
            { name: "username", type: "text" },
          ],
        }).catch((e) => {
          logger.info("ERRORR")
          logger.info(e)});
      });

    pollData.answers.each(async (pollItem, id) => {
      // is user in server users list
      const voters = await pollItem.fetchVoters();
      voters.forEach(async (voterUser) => {
        await pb
          .collection(`${pollData.message.guildId}Users`)
          .getFirstListItem(`discordUserID=${voterUser.id}`)
          .catch(async () => {
            // user is not in users list of server
            await pb.collection(`${pollData.message.guildId}Users`).create({
              discordUserID: voterUser.id,
              username: voterUser.username,
            });
          });
        // user guaranteed in server

        // check that user history is created
        await pb
          .collection(`User${voterUser.id}`)
          .getList(1, 1)
          .catch(async () => {
            await pb.collections.create({
              name: "User" + voterUser.id,
              type: "base",
              fields: [
                { name: "MatchId", type: "text" },
                { name: "PointsRecieved", type: "text" },
              ],
            });
          });

        await pb.collection(`User${voterUser.id}`).create({
          MatchId: matchData.MatchId,
          PointsRecieved: pointsList[id - 1],
        });
      });
    });
  }
  if (matchData.BestOf === "5") {
  }
}
