import { DateTime } from "luxon";
import { lolFandomResponse } from "./lolFandomTypes";
import { data } from "../commands/ping";
import { logger } from "./common";
const baseUrl: string = "https://lol.fandom.com/api.php?";

export async function getFutureLeagueGames(league: string) {
  let leagueQuery = ` AND (MS.MatchId LIKE '${league}/%'` + ")";
  const now = DateTime.utc();
  const twentyDays = now.plus({ days: 20 });
  const params = new URLSearchParams({
    action: "cargoquery",
    format: "json",
    origin: "*",
    limit: "max",
    tables: "MatchSchedule=MS,Teams=T1,Teams=T2",
    fields:
      "MS.MatchId," +
      "MS.DateTime_UTC," +
      "MS.BestOf," +
      "MS.Winner," +
      "MS.Team1Final=Team1, MS.Team2Final=Team2," +
      "T1.Short=Team1Short, T2.Short=Team2Short," +
      "MS.Team1Score, MS.Team2Score",
    join_on: "MS.Team1Final=T1.Name,MS.Team2Final=T2.Name",
    where:
      `MS.DateTime_UTC ` +
      `BETWEEN '${now.toFormat("yyyy-MM-dd HH:mm:ss")}' ` +
      `AND '${twentyDays.toFormat("yyyy-MM-dd HH:mm:ss")}' ` +
      leagueQuery,
    order_by: "MS.DateTime_UTC ASC",
  });

  // this fetch failed
  const response = await fetch(baseUrl + params.toString());
  const responseJson: lolFandomResponse = await response.json();
  //console.log(JSON.stringify(responseJson, null, 2));
  return responseJson.cargoquery.map((item) => {
    return {
      MatchId: item.title.MatchId,
      DateTime_UTC: DateTime.fromSQL(item.title["DateTime UTC"], {
        zone: "UTC",
      }),
      BestOf: item.title.BestOf,
      Winner: item.title.Winner,
      Team1: item.title.Team1,
      Team2: item.title.Team2,
      Team1Short: item.title.Team1Short,
      Team2Short: item.title.Team2Short,
      Team1Score: item.title.Team1Score,
      Team2Score: item.title.Team2Score
    };
  });
}

export async function getSingleMatchData(matchId: string) {
  const params = new URLSearchParams({
    action: "cargoquery",
    format: "json",
    origin: "*",
    limit: "max",
    tables: "MatchSchedule=MS,Teams=T1,Teams=T2",
    fields:
      "MS.MatchId," +
      "MS.DateTime_UTC," +
      "MS.BestOf," +
      "MS.Winner," +
      "MS.Team1Final=Team1, MS.Team2Final=Team2," +
      "T1.Short=Team1Short, T2.Short=Team2Short," +
      "MS.Team1Score, MS.Team2Score",
    join_on: "MS.Team1Final=T1.Name,MS.Team2Final=T2.Name",
    where: `MatchId="${matchId}"`,
  });

  const response = await fetch(baseUrl + params.toString());
  const responseJson: lolFandomResponse = await response.json();

  logger.info(responseJson)
  const singleMatch = responseJson.cargoquery[0].title
  return {
    MatchId: singleMatch.MatchId,
    DateTime_UTC: DateTime.fromSQL(singleMatch["DateTime UTC"], {
      zone: "UTC",
    }),
    BestOf: singleMatch.BestOf,
    Winner: singleMatch.Winner,
    Team1: singleMatch.Team1,
    Team2: singleMatch.Team2,
    Team1Short: singleMatch.Team1Short,
    Team2Short: singleMatch.Team2Short,
    Team1Score: singleMatch.Team1Score,
    Team2Score: singleMatch.Team2Score
  };
}
