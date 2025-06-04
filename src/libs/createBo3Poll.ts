import { PollLayoutType } from "discord.js";
import { MatchData } from "../types/lolFandomTypes";
import { getShortMatchId } from "./common";

export function createBo3Poll(gameData: MatchData, pollDelay: number) {
  return {
    poll: {
      question: { text: getShortMatchId(gameData.MatchId) },
      answers: [
        {
          text:
            "(" + gameData.Team1Short + ")" + " [2 - 0] " + gameData.Team2Short,
          emoji: "🟦",
        },
        {
          text:
            "(" + gameData.Team1Short + ")" + " [2 - 1] " + gameData.Team2Short,
          emoji: "🟦",
        },
        {
          text:
            gameData.Team1Short + " [1 - 2] " + "(" + gameData.Team2Short + ")",
          emoji: "🟥",
        },
        {
          text:
            gameData.Team1Short + " [0 - 2] " + "(" + gameData.Team2Short + ")",
          emoji: "🟥",
        },
      ],
      allowMultiselect: false,
      duration: pollDelay,
      layoutType: PollLayoutType.Default,
    },
  };
}