import { Poll } from "discord.js";
import { lolFandomResponse } from "./lolFandomTypes";

export async function addPoints(matchData: any, pollData: Poll) {
  console.log("POLL DATA")
  console.log(pollData)
  if (matchData.BestOf === "1") {
    const voters10 = await pollData.answers.at(0)?.fetchVoters();
    const voters01 = await pollData.answers.at(1)?.fetchVoters();
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
      console.log(pollItem)
      const voters = await pollItem.fetchVoters()
      voters.forEach((voterUser) => {
        console.log("ADD TO USER = ", voterUser)
        console.log("THIS AMOUNT OF POINTS = ", pointsList[id-1])
      })
    })
  }
  if (matchData.BestOf === "5") {
  }
}
