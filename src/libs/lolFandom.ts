import { DateTime } from "luxon";
import { lolFandomResponse, loadGames } from "./lolFandomTypes";

const baseUrl: string = "https://lol.fandom.com/api.php?";

export async function getFutureLeagueGames(league: string) {
  let leagueQuery = ` AND (MatchId LIKE '${league}/%'` + ")";
  const now = DateTime.now();
  const params = new URLSearchParams({
    action: "cargoquery",
    format: "json",
    origin: "*",
    limit: "max",
    tables: "MatchSchedule",
    fields: "MatchId,DateTime_UTC,Team1,Team2,BestOf",
    where:
      `DateTime_UTC > '${now.toFormat("yyyy-MM-dd HH:mm:ss")}'` +
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

export async function getDayGames(leagues: string[], day: DateTime) {
  let leagueQuery = ` AND (MatchId LIKE '${leagues[0]}/%'`;
  if (leagues.length > 1) {
    for (let i = 1; i < leagues.length; i++) {
      leagueQuery += `OR MatchId LIKE '${leagues[i]}%'`;
    }
  }
  leagueQuery += ")";

  const before = day.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const after = day.plus({ days: 1 });
  const params = new URLSearchParams({
    action: "cargoquery",
    format: "json",
    origin: "*",
    limit: "max",
    tables: "MatchSchedule",
    fields: "MatchId,DateTime_UTC,Team1,Team2,BestOf",
    where:
      `DateTime_UTC BETWEEN '${before.toFormat("yyyy-MM-dd HH:mm:ss")}'` +
      ` AND '${after.toFormat("yyyy-MM-dd")}'` +
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

export async function getNextGame(leagues: string[], date: DateTime) {
  let leagueQuery = ` AND (MatchId LIKE '${leagues[0]}/%'`;
  if (leagues.length > 1) {
    for (let i = 1; i < leagues.length; i++) {
      leagueQuery += `OR MatchId LIKE '${leagues[i]}%'`;
    }
  }
  leagueQuery += ")";

  const after = date;
  const params = new URLSearchParams({
    action: "cargoquery",
    format: "json",
    origin: "*",
    limit: "max",
    tables: "MatchSchedule",
    fields: "MatchId,DateTime_UTC,Team1,Team2,BestOf",
    where:
      `DateTime_UTC > '${after.toFormat("yyyy-MM-dd HH:mm:ss")}'` + leagueQuery,
    order_by: "DateTime_UTC ASC",
  });

  const url: string = baseUrl + params.toString();
  const response = await fetch(url);
  const responseJson: lolFandomResponse = await response.json();

  if (responseJson.cargoquery.length > 0) {
    let result: loadGames;
    result = {
      MatchId: responseJson.cargoquery[0].title.MatchId,
      DateTime_UTC: DateTime.fromSQL(
        responseJson.cargoquery[0].title["DateTime UTC"]
      ),
      Team1: responseJson.cargoquery[0].title.Team1,
      Team2: responseJson.cargoquery[0].title.Team2,
      BestOf: responseJson.cargoquery[0].title.BestOf,
    };

    return result;
  } else {
    return null;
  }
}

export async function getMatchResult(matchId: string) {
  const params = new URLSearchParams({
    action: "cargoquery",
    format: "json",
    origin: "*",
    limit: "max",
    tables: "MatchSchedule",
    fields:
      "MatchId,DateTime_UTC,Team1,Team2,BestOf,Winner,Team1Score,Team2Score",
    where: `MatchId="${matchId}"`,
  });

  const url: string = baseUrl + params.toString();
  const response = await fetch(url);
  const responseJson: lolFandomResponse = await response.json();

  let result = null;

  if (responseJson != null) {
    if (responseJson.cargoquery != null) {
      if (responseJson.cargoquery[0].title != null) {
        result = {
          MatchId: responseJson.cargoquery[0].title.MatchId,
          DateTime_UTC: DateTime.fromSQL(
            responseJson.cargoquery[0].title["DateTime UTC"]
          ),
          Team1: responseJson.cargoquery[0].title.Team1,
          Team2: responseJson.cargoquery[0].title.Team2,
          BestOf: responseJson.cargoquery[0].title.BestOf,
          //@ts-ignore
          Winner: responseJson.cargoquery[0].title.Winner,
          //@ts-ignore
          Team1Score: responseJson.cargoquery[0].title.Team1Score,
          //@ts-ignore
          Team2Score: responseJson.cargoquery[0].title.Team2Score,
        };
      }
    }
  }

  return result;
}
