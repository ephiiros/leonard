import pino from "pino";

export const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
      {
        target: "pino/file",
        options: { destination: `${__dirname}/../../logs/app.log` },
      },
    ],
  },
});

export const activeTimers: NodeJS.Timeout[] = [];

export function getShortMatchId(MatchId: string) {
  return MatchId.replaceAll(" Season", "")
    .replaceAll("Season_", "")
    .replaceAll("Week ", "");
}

