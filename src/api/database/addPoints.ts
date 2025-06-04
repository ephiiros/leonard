import { Poll } from "discord.js";
import { MatchData } from "../../types/lolFandomTypes";
import { logger } from "../../libs/common";
import { getSuperuser } from "./getSuperuser";

export async function addPoints(matchData: MatchData, pollData: Poll) {
  logger.info(`addPoints ${matchData.MatchId}`);
  const pb = await getSuperuser();

  const currentMatch = await pb
    .collection("matches")
    .create({
      MatchId: matchData.MatchId,
      DateTime_UTC:
        typeof matchData.DateTime_UTC === "string"
          ? matchData.DateTime_UTC
          : matchData.DateTime_UTC.toISO(),
      BestOf: matchData.BestOf,
      Winner: matchData.Winner,
      Team1: matchData.Team1,
      Team2: matchData.Team2,
      Team1Short: matchData.Team1Short,
      Team2Short: matchData.Team2Short,
      Team1Score: matchData.Team1Score,
      Team2Score: matchData.Team2Score,
    })
    .catch(async (e) => {
      logger.warn(`attempt to create failed, fetching ${e}`);
      return await pb
        .collection("matches")
        .getFirstListItem(`MatchId="${matchData.MatchId}"`)
    });

  pollData.answers.each(async (pollItem, id) => {
    // is user in server users list
    const voters = await pollItem.fetchVoters();
    voters.forEach(async (voterUser) => {
      logger.info(`creating user ${voterUser.id} as test`);
      await pb
        .collection(`${pollData.message.guildId}Users`)
        .create({
          discordUserID: voterUser.id,
          username: voterUser.username,
        })
        .catch((e) => {
          logger.warn(`failed to create user ${e}`);
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
              { name: "MatchDetails", type: "relation" },
              { name: "Picked", type: "text" },
              { name: "PointsRecieved", type: "text" },
            ],
          });
        });

      if (matchData.BestOf === "1") {
        const pickList = ["1-0", "0-1"];
        await pb.collection(`User${voterUser.id}`).create({
          MatchDetails: currentMatch.id,
          Picked: pickList[id - 1],
          PointsRecieved: 1,
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

        const pickList = ["2-0", "2-1", "1-2", "0-2"];

        await pb.collection(`User${voterUser.id}`).create({
          MatchDetails: currentMatch.id,
          Picked: pickList[id - 1],
          PointsRecieved: pointsList[id - 1],
        });
      }

      if (matchData.BestOf === "5") {
        let pointsList: number[] = [0, 0, 0, 0, 0, 0];

        if (matchData.Team1Score === "3" && matchData.Team2Score === "0") {
          pointsList = [5, 3, 3, 0, 0, 0];
        }
        if (matchData.Team1Score === "3" && matchData.Team2Score === "1") {
          pointsList = [3, 5, 3, 0, 0, 0];
        }
        if (matchData.Team1Score === "3" && matchData.Team2Score === "2") {
          pointsList = [3, 3, 5, 0, 0, 0];
        }
        if (matchData.Team1Score === "2" && matchData.Team2Score === "3") {
          pointsList = [0, 0, 0, 5, 3, 3];
        }
        if (matchData.Team1Score === "1" && matchData.Team2Score === "3") {
          pointsList = [0, 0, 0, 3, 5, 3];
        }
        if (matchData.Team1Score === "0" && matchData.Team2Score === "3") {
          pointsList = [0, 0, 0, 3, 3, 5];
        }

        const pickList = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];

        await pb.collection(`User${voterUser.id}`).create({
          MatchDetails: currentMatch.id,
          Picked: pickList[id - 1],
          PointsRecieved: pointsList[id - 1],
        });
      }
    });
  });
}
