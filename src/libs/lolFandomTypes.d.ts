import { DateTime } from "luxon";

export type lolFandomResponse = {
  limits: {
    cargoquery: number;
  };
  cargoquery: cargoQueryItem[];
};

export type cargoQueryItem = {
  title: {
    MatchId: string;
    "DateTime UTC": string;
    BestOf: string;
    Winner: string | null;
    Team1: string;
    Team2: string;
    Team1Short: string;
    Team2Short: string;
    Team1Score: string | null;
    Team2Score: string | null;
    "DateTime UTC__precision": string;
  };
};

export type MatchData = {
  MatchId: string;
  DateTime_UTC: DateTime;
  BestOf: string;
  Winner: string | null;
  Team1: string;
  Team2: string;
  Team1Short: string;
  Team2Short: string;
  Team1Score: string | null;
  Team2Score: string | null;
};
