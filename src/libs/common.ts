import { config } from "../config";
import PocketBase from "pocketbase";
import pino, { destination } from "pino";
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
        options: { destination: `${__dirname}/../../logs/app.log`}
      }
    ]
  },
});

export let authpb: PocketBase | null = null;

export async function doAuth() {
  if (authpb === null) {
    logger.info("doing auth first time");
    const pb = new PocketBase(config.DB_IP);
    await pb
      .collection("_superusers")
      .authWithPassword(config.DB_USER, config.DB_PASSWORD);
    pb.autoCancellation(false);
    authpb = pb;
  }
  return authpb;
}

export const activeTimers: NodeJS.Timeout[] = [];

export function getShortMatchId(MatchId: string) {
  return MatchId.replaceAll(" Season", "")
    .replaceAll("Season_", "")
    .replaceAll("Week ", "");
}
