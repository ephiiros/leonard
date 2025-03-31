import { DateTime } from "luxon"

export interface lolFandomResponse {
  limits: number,
  cargoquery: {
    title: {
      BestOf: string,
      "DateTime UTC" : string,
      "DateTime UTC__precision" : string,
      MatchId: string,
      Team1: string,
      Team2: string
    }
  }[]
}

export interface loadGames {
  MatchId: string,
  DateTime_UTC: DateTime,
  Team1: string,
  Team2: string,
  BestOf: string
}