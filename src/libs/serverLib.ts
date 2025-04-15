import { Poll } from "discord.js";
import { lolFandomResponse } from "./lolFandomTypes";
import { config } from "../config";
import PocketBase from "pocketbase";
const pb = new PocketBase(config.DB_IP);

export async function addPoints(matchData: any, pollData: Poll) {
  console.log("POLL DATA")
  await pb.collection("_superusers")
    .authWithPassword(config.DB_USER, config.DB_PASSWORD)
  console.log(pollData)
  if (matchData.BestOf === "1") {
    pollData.answers.each(async (pollItem, id) => {
      const voters = await pollItem.fetchVoters()
      voters.forEach(async (voterUser) => {
        pb.collection("users")
          .getFirstListItem(`discordUserID=${voterUser.id}`)
          .then(() => {
            pb.collection("user" + voterUser.id)
              .create({
                "MatchId": matchData.matchId,
                "Vote": "-1"
              })
          })
          .catch(() => {
            pb.collection("users")
              .create({
                "discordUserID": voterUser.id,
                "username": voterUser.username
              })
            pb.collections.create({
              name: "user" + voterUser.id,
              type: "base",
              fields : [
                { name: "MatchId", type: "text" },
                { name: "Vote", type: "text"}
              ]
            })
            .then(() => {
              pb.collection("user" + voterUser.id)
                .create({
                  "MatchId": matchData.matchId,
                  "Vote": "-1"
                })
            })
          })
      })
    })
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

    pollData.answers.each(async (pollItem, id) => {
      const voters = await pollItem.fetchVoters()
      voters.forEach(async (voterUser) => {
        pb.collection("users")
          .getFirstListItem(`discordUserID='${voterUser.id}'`)
          .then(() => {

          })
          .catch(() => {
            // assuming user not found 
            pb.collection("users")
              .create({
                "discordUserID": voterUser.id,
                "username": voterUser.username
              })
            pb.collections.create({
              name: "user" + voterUser.id,
              type: "base",
              fields : [
                { name: "MatchId", type: "text" },
                { name: "Vote", type: "text"}
              ]
            })
          })
        
        pb.collection("user" + voterUser.id) 
          .create({
            "MatchId": matchData.matchId,
            "Vote": "-1"
          })
        console.log("ADD TO USER = ", voterUser)
        console.log("THIS AMOUNT OF POINTS = ", pointsList[id-1])
      })
    })
  }
  if (matchData.BestOf === "5") {
  }
}
