import { PollLayoutType } from "discord.js";
import { MatchData } from "../types/lolFandomTypes";
import { getShortMatchId } from "./common";
export function createBo5Poll(gameData: MatchData, pollDelay: number) {
  return {
      poll: {
        question: { text: getShortMatchId(gameData.MatchId) },
        answers: [
          {
            text: gameData.Team1 + " WINS 3 - 0",
            emoji: "🟦",
          },
          {
            text: gameData.Team1 + " WINS 3 - 1",
            emoji: "🟦",
          },
          {
            text: gameData.Team1 + " WINS 3 - 2",
            emoji: "🟦",
          },
          {
            text: gameData.Team2 + " WINS 2 - 3",
            emoji: "🟥",
          },
          {
            text: gameData.Team2 + " WINS 1 - 3",
            emoji: "🟥",
          },
          {
            text: gameData.Team2 + " WINS 0 - 3",
            emoji: "🟥",
          },
        ],
        allowMultiselect: false,
        duration: pollDelay,
        layoutType: PollLayoutType.Default,
      },
    };
}