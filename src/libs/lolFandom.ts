import { DateTime } from "luxon";
import { lolFandomResponse, loadGames } from "./lolFandomTypes";
import { config } from "../config";

const baseUrl: string = "https://lol.fandom.com/api.php?";

export async function getFutureLeagueGames(league: string) {
  let leagueQuery = ` AND (MatchId LIKE '${league}/%'` + ")";
  const now = DateTime.utc();
  const withVoteDelay = now.minus({hours: parseInt(config.VOTE_OFFSET)})
  const twentyDays = now.plus({ days: 20 })
  const params = new URLSearchParams({
    action: "cargoquery",
    format: "json",
    origin: "*",
    limit: "max",
    tables: "MatchSchedule",
    fields: "MatchId,DateTime_UTC,Team1,Team2,BestOf",
    where:
      `DateTime_UTC ` + 
      `BETWEEN '${withVoteDelay.toFormat("yyyy-MM-dd HH:mm:ss")}' ` +
      `AND '${twentyDays.toFormat("yyyy-MM-dd HH:mm:ss")}' ` + 
      leagueQuery,
    order_by: "DateTime_UTC ASC",
  });

  const url: string = baseUrl + params.toString();
  const response = await fetch(url);

  const responseJson: lolFandomResponse = await response.json();

  let result: loadGames[] = [];
  for (var key in responseJson.cargoquery) {
    result.push({
      MatchId: responseJson.cargoquery[key].title.MatchId,
      DateTime_UTC: DateTime.fromSQL(
        responseJson.cargoquery[key].title["DateTime UTC"],
        { zone: "UTC" }
      ),
      Team1: responseJson.cargoquery[key].title.Team1,
      Team2: responseJson.cargoquery[key].title.Team2,
      BestOf: responseJson.cargoquery[key].title.BestOf,
    });
  }

  return result;
}
